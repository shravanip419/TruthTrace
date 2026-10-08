import os
import sys
import json
import time
import logging
from pathlib import Path
from concurrent.futures import ProcessPoolExecutor
import pandas as pd
import numpy as np
import joblib

from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.naive_bayes import MultinomialNB
from sklearn.svm import LinearSVC
from sklearn.calibration import CalibratedClassifierCV
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    classification_report
)

# Set up paths
CURRENT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = CURRENT_DIR.parent
MODELS_DIR = CURRENT_DIR / "models"
MODELS_DIR.mkdir(parents=True, exist_ok=True)

# Add current directory to path so preprocessing can be imported
if str(CURRENT_DIR) not in sys.path:
    sys.path.insert(0, str(CURRENT_DIR))

from preprocessing import clean_text
from explainability import extract_global_feature_importance, DISCLAIMER_TEXT

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger("TruthLensTrainer")


def find_data_file(filename: str) -> Path:
    """Searches for dataset file in standard locations."""
    candidates = [
        PROJECT_ROOT / "data" / filename,
        CURRENT_DIR / "data" / filename,
        Path("data") / filename,
        Path(filename)
    ]
    for c in candidates:
        if c.exists() and c.is_file():
            return c
    return candidates[0]


def clean_batch(texts):
    """Worker function for parallel text cleaning."""
    return [clean_text(t) for t in texts]


def parallel_clean(texts, num_workers=None):
    """Cleans a list of texts using multi-process pool."""
    if num_workers is None:
        num_workers = max(1, (os.cpu_count() or 4) - 2)
    
    total = len(texts)
    chunk_size = max(500, total // (num_workers * 4))
    chunks = [texts[i:i + chunk_size] for i in range(0, total, chunk_size)]
    
    logger.info(f"Parallel preprocessing {total} articles across {num_workers} processes ({len(chunks)} chunks)...")
    cleaned_texts = []
    
    with ProcessPoolExecutor(max_workers=num_workers) as executor:
        for idx, result in enumerate(executor.map(clean_batch, chunks), start=1):
            cleaned_texts.extend(result)
            if idx % max(1, len(chunks) // 5) == 0 or idx == len(chunks):
                pct = int((len(cleaned_texts) / total) * 100)
                logger.info(f"  Preprocessing progress: {pct}% ({len(cleaned_texts)}/{total})")
                
    return cleaned_texts


def load_and_validate_datasets():
    fake_path = find_data_file("Fake.csv")
    true_path = find_data_file("True.csv")

    errors = []
    if not fake_path.exists():
        errors.append(f"Missing required dataset file: {fake_path.resolve()} (Expected data/Fake.csv)")
    if not true_path.exists():
        errors.append(f"Missing required dataset file: {true_path.resolve()} (Expected data/True.csv)")

    if errors:
        logger.error("=" * 60)
        logger.error("DATASET SETUP ERROR:")
        for err in errors:
            logger.error(f"  - {err}")
        logger.error("Please place Fake.csv and True.csv inside the 'data/' directory.")
        logger.error("=" * 60)
        sys.exit(1)

    logger.info(f"Loading Fake news dataset from: {fake_path}")
    df_fake = pd.read_csv(fake_path)
    logger.info(f"  Loaded Fake.csv: {df_fake.shape[0]} rows, columns: {list(df_fake.columns)}")

    logger.info(f"Loading True news dataset from: {true_path}")
    df_true = pd.read_csv(true_path)
    logger.info(f"  Loaded True.csv: {df_true.shape[0]} rows, columns: {list(df_true.columns)}")

    # Assign labels
    df_fake["label"] = "FAKE"
    df_true["label"] = "REAL"

    # Combine datasets
    df = pd.concat([df_fake, df_true], ignore_index=True)
    raw_total = len(df)
    raw_fake = len(df_fake)
    raw_true = len(df_true)

    # Detect text columns dynamically
    cols = [c.lower() for c in df.columns]
    has_title = "title" in cols
    has_text = "text" in cols

    title_col = df.columns[cols.index("title")] if has_title else None
    text_col = df.columns[cols.index("text")] if has_text else None

    if has_title and has_text:
        logger.info("Combining columns: title + text")
        df["combined_raw"] = df[title_col].fillna("").astype(str) + " " + df[text_col].fillna("").astype(str)
    elif has_text:
        logger.info("Using column: text")
        df["combined_raw"] = df[text_col].fillna("").astype(str)
    elif has_title:
        logger.info("Using column: title")
        df["combined_raw"] = df[title_col].fillna("").astype(str)
    else:
        logger.info("Falling back to first column as text")
        df["combined_raw"] = df.iloc[:, 0].fillna("").astype(str)

    # Missing value handling
    df = df[df["combined_raw"].str.strip() != ""]

    # Duplicate removal
    duplicates_removed = int(df.duplicated(subset=["combined_raw"]).sum())
    logger.info(f"Removing {duplicates_removed} duplicate articles...")
    df = df.drop_duplicates(subset=["combined_raw"]).reset_index(drop=True)

    # Shuffle dataset
    df = df.sample(frac=1.0, random_state=42).reset_index(drop=True)

    total_articles = len(df)
    fake_articles = int((df["label"] == "FAKE").sum())
    real_articles = int((df["label"] == "REAL").sum())

    logger.info(f"Final Dataset Summary:")
    logger.info(f"  Total Articles: {total_articles}")
    logger.info(f"  FAKE Articles : {fake_articles} ({fake_articles / total_articles * 100:.1f}%)")
    logger.info(f"  REAL Articles : {real_articles} ({real_articles / total_articles * 100:.1f}%)")
    logger.info(f"  Duplicates Removed: {duplicates_removed}")

    stats = {
        "raw_total": raw_total,
        "raw_fake": raw_fake,
        "raw_true": raw_true,
        "total_articles": total_articles,
        "fake_articles": fake_articles,
        "real_articles": real_articles,
        "duplicates_removed": duplicates_removed,
        "detected_columns": list(df.columns),
        "combined_columns": ["title", "text"] if (has_title and has_text) else ([text_col] if has_text else ["first_column"]),
        "files_used": ["Fake.csv", "True.csv"]
    }

    return df, stats


def train_and_evaluate():
    t_start = time.time()
    df, dataset_stats = load_and_validate_datasets()

    logger.info("Beginning text preprocessing (lowercasing, cleaning, lemmatization)...")
    cleaned_corpus = parallel_clean(df["combined_raw"].tolist())
    df["processed_text"] = cleaned_corpus

    # Filter out any that became empty after cleaning
    valid_mask = df["processed_text"].str.strip().str.len() > 3
    df = df[valid_mask].reset_index(drop=True)
    logger.info(f"Articles after preprocessing filtering: {len(df)}")

    X = df["processed_text"]
    y = df["label"]

    logger.info("Splitting dataset: 80% train / 20% test (Stratified, random_state=42)...")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y,
        test_size=0.20,
        random_state=42,
        stratify=y
    )

    train_count = len(X_train)
    test_count = len(X_test)
    logger.info(f"Train samples: {train_count}, Test samples: {test_count}")

    logger.info("Fitting TF-IDF Vectorizer (ngram_range=(1,2), max_features=10000, sublinear_tf=True)...")
    tfidf_params = {
        "max_features": 10000,
        "ngram_range": (1, 2),
        "min_df": 2,
        "max_df": 0.9,
        "sublinear_tf": True
    }
    vectorizer = TfidfVectorizer(**tfidf_params)
    X_train_vec = vectorizer.fit_transform(X_train)
    X_test_vec = vectorizer.transform(X_test)

    num_features = len(vectorizer.get_feature_names_out())
    logger.info(f"TF-IDF Vocabulary Size: {num_features} features")

    # Models definition
    # Note on Linear SVM: We calibrate LinearSVC via CalibratedClassifierCV(cv=3)
    # to provide mathematically sound posterior probabilities without faking scores.
    raw_svm = LinearSVC(C=1.0, random_state=42, max_iter=2000)
    calibrated_svm = CalibratedClassifierCV(estimator=raw_svm, cv=3)

    models = {
        "Logistic Regression": LogisticRegression(C=1.0, max_iter=1000, random_state=42),
        "Multinomial Naive Bayes": MultinomialNB(alpha=0.1),
        "Linear SVM": calibrated_svm
    }

    # Also fit raw SVM separately to keep exact decision boundary weights accessible
    raw_svm.fit(X_train_vec, y_train)

    model_results = {}
    best_f1 = -1.0
    best_model_name = ""
    best_model_obj = None

    for name, clf in models.items():
        logger.info(f"--- Training {name} ---")
        t0 = time.time()
        clf.fit(X_train_vec, y_train)
        train_time = round(time.time() - t0, 3)

        preds = clf.predict(X_test_vec)

        acc = float(accuracy_score(y_test, preds))
        prec = float(precision_score(y_test, preds, pos_label="FAKE", zero_division=0))
        rec = float(recall_score(y_test, preds, pos_label="FAKE", zero_division=0))
        f1 = float(f1_score(y_test, preds, pos_label="FAKE", zero_division=0))

        # Confusion matrix: rows = Actual, cols = Predicted
        # Order: ['FAKE', 'REAL']
        cm = confusion_matrix(y_test, preds, labels=["FAKE", "REAL"])
        # cm[0,0] = Actual FAKE, Pred FAKE (TP)
        # cm[0,1] = Actual FAKE, Pred REAL (FN)
        # cm[1,0] = Actual REAL, Pred FAKE (FP)
        # cm[1,1] = Actual REAL, Pred REAL (TN)
        cm_dict = {
            "TP": int(cm[0, 0]),
            "FN": int(cm[0, 1]),
            "FP": int(cm[1, 0]),
            "TN": int(cm[1, 1]),
            "labels": ["FAKE", "REAL"],
            "matrix": cm.tolist()
        }

        report = classification_report(y_test, preds, labels=["FAKE", "REAL"], output_dict=True, zero_division=0)

        # Global feature importance
        feature_importance_source = raw_svm if name == "Linear SVM" else clf
        feats = extract_global_feature_importance(feature_importance_source, vectorizer, top_n=20)

        model_results[name] = {
            "name": name,
            "accuracy": round(acc, 4),
            "precision": round(prec, 4),
            "recall": round(rec, 4),
            "f1_score": round(f1, 4),
            "train_time_seconds": train_time,
            "confusion_matrix": cm_dict,
            "classification_report": report,
            "feature_importance": feats,
            "probability_method": "CalibratedClassifierCV (Platt Sigmoid Scaling on LinearSVC)" if name == "Linear SVM" else "Native predict_proba"
        }

        # Save individual model
        slug = name.lower().replace(" ", "_")
        joblib.dump(clf, MODELS_DIR / f"{slug}.joblib")

        logger.info(f"  {name} Results:")
        logger.info(f"    Accuracy : {acc * 100:.2f}%")
        logger.info(f"    Precision: {prec * 100:.2f}%")
        logger.info(f"    Recall   : {rec * 100:.2f}%")
        logger.info(f"    F1 Score : {f1 * 100:.2f}%")

        if f1 > best_f1:
            best_f1 = f1
            best_model_name = name
            best_model_obj = clf

    logger.info("=" * 60)
    logger.info(f"Best Model Selected: {best_model_name} (F1 Score: {best_f1:.4f})")
    logger.info("=" * 60)

    # Save best model and vectorizer
    joblib.dump(best_model_obj, MODELS_DIR / "best_model.joblib")
    joblib.dump(vectorizer, MODELS_DIR / "tfidf_vectorizer.joblib")

    # Save raw svm for explainability if best model is Linear SVM
    joblib.dump(raw_svm, MODELS_DIR / "raw_linear_svm.joblib")

    # Complete metadata
    metadata = {
        "project": "TruthLens — Fake News Detection using NLP with Explainable AI",
        "trained_at": time.strftime("%Y-%m-%d %H:%M:%S UTC", time.gmtime()),
        "total_training_duration_seconds": round(time.time() - t_start, 2),
        "best_model_name": best_model_name,
        "selection_metric": "Highest F1 Score on FAKE news detection",
        "best_model_metrics": model_results[best_model_name],
        "models_evaluated": model_results,
        "dataset_statistics": {
            **dataset_stats,
            "train_samples": train_count,
            "test_samples": test_count,
            "tfidf_features": num_features,
            "vocabulary_size": num_features,
            "test_split_ratio": 0.20,
            "random_state": 42
        },
        "tfidf_parameters": {
            "max_features": tfidf_params["max_features"],
            "ngram_range": [tfidf_params["ngram_range"][0], tfidf_params["ngram_range"][1]],
            "min_df": tfidf_params["min_df"],
            "max_df": tfidf_params["max_df"],
            "sublinear_tf": tfidf_params["sublinear_tf"]
        },
        "disclaimer": DISCLAIMER_TEXT
    }

    metadata_path = MODELS_DIR / "model_metadata.json"
    with open(metadata_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)

    logger.info(f"Model artifacts saved successfully:")
    logger.info(f"  - {MODELS_DIR / 'best_model.joblib'}")
    logger.info(f"  - {MODELS_DIR / 'tfidf_vectorizer.joblib'}")
    logger.info(f"  - {metadata_path}")
    logger.info("Training pipeline completed successfully!")


if __name__ == "__main__":
    train_and_evaluate()
