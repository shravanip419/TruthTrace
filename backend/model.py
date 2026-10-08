import os
import sys
import json
import logging
from pathlib import Path
from typing import Dict, Any, Optional
import joblib

CURRENT_DIR = Path(__file__).resolve().parent
MODELS_DIR = CURRENT_DIR / "models"

# Ensure local imports work
if str(CURRENT_DIR) not in sys.path:
    sys.path.insert(0, str(CURRENT_DIR))

from preprocessing import clean_text, preprocess_pipeline
from explainability import explain_instance, DISCLAIMER_TEXT

logger = logging.getLogger(__name__)

class ModelService:
    def __init__(self):
        self.model = None
        self.vectorizer = None
        self.raw_svm = None
        self.metadata = None
        self.is_loaded = False
        self._load_models()

    def _load_models(self):
        best_model_path = MODELS_DIR / "best_model.joblib"
        vectorizer_path = MODELS_DIR / "tfidf_vectorizer.joblib"
        metadata_path = MODELS_DIR / "model_metadata.json"
        raw_svm_path = MODELS_DIR / "raw_linear_svm.joblib"

        if not best_model_path.exists() or not vectorizer_path.exists():
            logger.warning(
                f"Model files not found in {MODELS_DIR}. "
                f"Please run 'python backend/train_model.py' to train and save the models."
            )
            self.is_loaded = False
            return

        try:
            self.model = joblib.load(best_model_path)
            self.vectorizer = joblib.load(vectorizer_path)
            if raw_svm_path.exists():
                self.raw_svm = joblib.load(raw_svm_path)

            if metadata_path.exists():
                with open(metadata_path, "r", encoding="utf-8") as f:
                    self.metadata = json.load(f)
            else:
                self.metadata = {}

            self.is_loaded = True
            logger.info("TruthLens model and vectorizer loaded successfully.")
        except Exception as e:
            logger.error(f"Error loading model files: {e}")
            self.is_loaded = False

    def check_loaded(self):
        if not self.is_loaded or self.model is None or self.vectorizer is None:
            self._load_models()
        if not self.is_loaded or self.model is None or self.vectorizer is None:
            raise RuntimeError(
                "Trained models not found. Please train models first by running: "
                "python backend/train_model.py"
            )

    def _get_probabilities(self, tfidf_vec):
        classes = list(getattr(self.model, "classes_", ["FAKE", "REAL"]))
        fake_idx = classes.index("FAKE") if "FAKE" in classes else 1
        real_idx = classes.index("REAL") if "REAL" in classes else 0

        if hasattr(self.model, "predict_proba"):
            probs = self.model.predict_proba(tfidf_vec)[0]
            fake_prob = float(probs[fake_idx])
            real_prob = float(probs[real_idx])
        elif hasattr(self.model, "decision_function"):
            df = float(self.model.decision_function(tfidf_vec)[0])
            # Sigmoid conversion
            import math
            p = 1.0 / (1.0 + math.exp(-df))
            fake_prob = p if fake_idx == 1 else (1.0 - p)
            real_prob = 1.0 - fake_prob
        else:
            pred = self.model.predict(tfidf_vec)[0]
            fake_prob = 1.0 if pred == "FAKE" else 0.0
            real_prob = 1.0 - fake_prob

        prediction = "FAKE" if fake_prob >= 0.5 else "REAL"
        confidence = fake_prob if prediction == "FAKE" else real_prob

        return prediction, round(confidence, 4), round(fake_prob, 4), round(real_prob, 4)

    def predict(self, text: str) -> Dict[str, Any]:
        self.check_loaded()
        cleaned = clean_text(text)
        if not cleaned.strip():
            raise ValueError("Input text contains no valid words after preprocessing.")

        tfidf_vec = self.vectorizer.transform([cleaned])
        prediction, confidence, fake_prob, real_prob = self._get_probabilities(tfidf_vec)

        model_name = self.metadata.get("best_model_name", "Trained ML Model") if self.metadata else "Trained ML Model"

        return {
            "prediction": prediction,
            "confidence": confidence,
            "fake_probability": fake_prob,
            "real_probability": real_prob,
            "model": model_name
        }

    def analyze(self, text: str) -> Dict[str, Any]:
        self.check_loaded()
        pipe_result = preprocess_pipeline(text)
        final_processed_text = pipe_result["final_processed_text"]

        if not final_processed_text.strip():
            raise ValueError("Input text contains no valid words after preprocessing.")

        tfidf_vec = self.vectorizer.transform([final_processed_text])
        prediction, confidence, fake_prob, real_prob = self._get_probabilities(tfidf_vec)

        # Instance-level explanation
        explain_model = self.raw_svm if (self.raw_svm is not None and "SVM" in str(self.model)) else self.model
        instance_exp = explain_instance(explain_model, self.vectorizer, tfidf_vec, top_n=12)

        # Global features from metadata or explainability
        global_features = {}
        if self.metadata and "best_model_metrics" in self.metadata:
            global_features = self.metadata["best_model_metrics"].get("feature_importance", {})

        model_name = self.metadata.get("best_model_name", "Trained ML Model") if self.metadata else "Trained ML Model"

        return {
            "prediction": prediction,
            "confidence": confidence,
            "fake_probability": fake_prob,
            "real_probability": real_prob,
            "model": model_name,
            "original_text": pipe_result["original_text"],
            "cleaned_text": pipe_result["cleaned_text"],
            "tokens": pipe_result["tokens"],
            "lemmatized_tokens": pipe_result["lemmatized_tokens"],
            "article_statistics": pipe_result["article_statistics"],
            "article_fake_indicators": instance_exp["article_fake_features"],
            "article_real_indicators": instance_exp["article_real_features"],
            "top_global_fake_indicators": global_features.get("top_fake_indicators", []),
            "top_global_real_indicators": global_features.get("top_real_indicators", []),
            "disclaimer": DISCLAIMER_TEXT
        }

# Global singleton instance
model_service = ModelService()
