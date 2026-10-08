import os
import sys
import json
import logging
from pathlib import Path
from typing import List, Dict, Any, Optional

from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

CURRENT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = CURRENT_DIR.parent
MODELS_DIR = CURRENT_DIR / "models"
METADATA_PATH = MODELS_DIR / "model_metadata.json"

if str(CURRENT_DIR) not in sys.path:
    sys.path.insert(0, str(CURRENT_DIR))

from model import model_service
from preprocessing import clean_text
from explainability import DISCLAIMER_TEXT

logger = logging.getLogger(__name__)

app = FastAPI(
    title="TruthLens API",
    description="Explainable Fake News Detection API using NLP and Machine Learning",
    version="1.0.0"
)

# Enable CORS for React frontend (Vite default port 5173, 3000, etc.)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Pydantic Models
class TextPayload(BaseModel):
    text: str = Field(..., description="The raw news article text or headline")


class PredictResponse(BaseModel):
    prediction: str
    confidence: float
    fake_probability: float
    real_probability: float
    model: str


class ArticleStatistics(BaseModel):
    char_count: int
    word_count: int
    token_count: int
    unique_word_count: int
    stopwords_removed_count: int
    vocabulary_size: int


class FeatureItem(BaseModel):
    word: str
    weight: Optional[float] = None
    tfidf: Optional[float] = None
    contribution: Optional[float] = None


class AnalyzeResponse(BaseModel):
    prediction: str
    confidence: float
    fake_probability: float
    real_probability: float
    model: str
    original_text: str
    cleaned_text: str
    tokens: List[str]
    lemmatized_tokens: List[str]
    article_statistics: ArticleStatistics
    article_fake_indicators: List[Dict[str, Any]]
    article_real_indicators: List[Dict[str, Any]]
    top_global_fake_indicators: List[Dict[str, Any]]
    top_global_real_indicators: List[Dict[str, Any]]
    disclaimer: str


def get_metadata() -> Dict[str, Any]:
    if not METADATA_PATH.exists():
        return {}
    try:
        with open(METADATA_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"Error reading model_metadata.json: {e}")
        return {}


@app.get("/health")
def health_check():
    metadata = get_metadata()
    fake_csv = (PROJECT_ROOT / "data" / "Fake.csv").exists() or (Path("data/Fake.csv")).exists()
    true_csv = (PROJECT_ROOT / "data" / "True.csv").exists() or (Path("data/True.csv")).exists()

    return {
        "status": "healthy",
        "model_loaded": model_service.is_loaded,
        "dataset_files_present": {
            "Fake.csv": fake_csv,
            "True.csv": true_csv
        },
        "best_model": metadata.get("best_model_name", None),
        "trained_at": metadata.get("trained_at", None)
    }


@app.post("/predict", response_model=PredictResponse)
def predict(payload: TextPayload):
    text = payload.text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="Article text cannot be empty.")
    if len(text) > 200000:
        raise HTTPException(status_code=400, detail="Article exceeds maximum permitted length (200,000 characters).")

    try:
        res = model_service.predict(text)
        return res
    except RuntimeError as re:
        raise HTTPException(status_code=503, detail=str(re))
    except ValueError as ve:
        raise HTTPException(status_code=422, detail=str(ve))
    except Exception as e:
        logger.error(f"Prediction error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="An error occurred during prediction.")


@app.post("/analyze", response_model=AnalyzeResponse)
def analyze(payload: TextPayload):
    text = payload.text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="Article text cannot be empty.")
    if len(text) > 200000:
        raise HTTPException(status_code=400, detail="Article exceeds maximum permitted length (200,000 characters).")

    try:
        res = model_service.analyze(text)
        return res
    except RuntimeError as re:
        raise HTTPException(status_code=503, detail=str(re))
    except ValueError as ve:
        raise HTTPException(status_code=422, detail=str(ve))
    except Exception as e:
        logger.error(f"Analysis error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="An error occurred during text analysis.")


@app.post("/upload-analyze", response_model=AnalyzeResponse)
async def upload_analyze(file: UploadFile = File(...)):
    # Validate file type
    if not file.filename.lower().endswith(".txt"):
        raise HTTPException(
            status_code=400,
            detail="Invalid file format. Only plain text (.txt) files are supported."
        )

    # Read contents with size limit (e.g. 5 MB)
    content_bytes = await file.read()
    if len(content_bytes) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")
    if len(content_bytes) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File size exceeds the 5MB limit.")

    try:
        text = content_bytes.decode("utf-8")
    except UnicodeDecodeError:
        try:
            text = content_bytes.decode("latin-1")
        except Exception:
            raise HTTPException(status_code=400, detail="Unable to decode text file. Ensure it is UTF-8 or ASCII encoded.")

    text = text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="Uploaded file contains no readable text content.")

    try:
        res = model_service.analyze(text)
        return res
    except RuntimeError as re:
        raise HTTPException(status_code=503, detail=str(re))
    except ValueError as ve:
        raise HTTPException(status_code=422, detail=str(ve))
    except Exception as e:
        logger.error(f"Upload analysis error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Error analyzing uploaded document.")


@app.get("/model-performance")
def model_performance():
    metadata = get_metadata()
    if not metadata:
        raise HTTPException(
            status_code=503,
            detail="Model metadata is unavailable. Please run 'python backend/train_model.py' to train models."
        )
    return {
        "best_model_name": metadata.get("best_model_name"),
        "selection_metric": metadata.get("selection_metric"),
        "models_evaluated": metadata.get("models_evaluated", {}),
        "trained_at": metadata.get("trained_at"),
        "total_training_duration_seconds": metadata.get("total_training_duration_seconds"),
        "tfidf_parameters": metadata.get("tfidf_parameters", {}),
        "explanation": "The model with the highest F1 score was selected as the final prediction model."
    }


@app.get("/dataset-statistics")
def dataset_statistics():
    metadata = get_metadata()
    if not metadata:
        raise HTTPException(
            status_code=503,
            detail="Dataset statistics unavailable. Models must be trained first."
        )
    return metadata.get("dataset_statistics", {})


@app.get("/feature-importance")
def feature_importance():
    metadata = get_metadata()
    if not metadata:
        raise HTTPException(
            status_code=503,
            detail="Feature importance unavailable. Models must be trained first."
        )
    best_metrics = metadata.get("best_model_metrics", {})
    return {
        "model": metadata.get("best_model_name"),
        "features": best_metrics.get("feature_importance", {}),
        "disclaimer": DISCLAIMER_TEXT
    }


@app.get("/samples")
def get_sample_articles():
    """Provides verified sample articles for quick demo testing."""
    return {
        "real": {
            "title": "Federal Reserve signals steady interest rates amid balanced economic growth",
            "text": "WASHINGTON (Reuters) - The Federal Reserve held interest rates steady on Wednesday and signaled that borrowing costs are likely to remain on hold for the foreseeable future, with moderate economic growth and low unemployment expected through next year. Federal Reserve Chairman Jerome Powell noted that the U.S. economic outlook remains favorable despite global uncertainties, citing consistent consumer spending and stable labor market indicators."
        },
        "fake": {
            "title": "SHOCKING: Secret Government Vault Exposed Revealing Hidden Mind Control Documents",
            "text": "BREAKING NEWS: An explosive whistleblower document has just leaked from deep inside a classified underground bunker! You won't believe what the mainstream media is desperately hiding from the public. Shocking photographs and leaked memos confirm that global elites have been running an unbelievable covert scheme to manipulate elections and silence patriots. Spread this everywhere before it gets taken down!"
        }
    }


# Optional SPA Serving if frontend/dist exists
DIST_DIR = PROJECT_ROOT / "frontend" / "dist"
if DIST_DIR.exists():
    from fastapi.staticfiles import StaticFiles
    from fastapi.responses import FileResponse

    if (DIST_DIR / "assets").exists():
        app.mount("/assets", StaticFiles(directory=str(DIST_DIR / "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # Don't intercept API endpoints
        if full_path.startswith("api/"):
            raise HTTPException(status_code=404, detail="Endpoint not found")
        file_path = DIST_DIR / full_path
        if file_path.exists() and file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(DIST_DIR / "index.html")
