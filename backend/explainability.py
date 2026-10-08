import numpy as np
from typing import Dict, List, Any

DISCLAIMER_TEXT = (
    "These features indicate linguistic patterns learned by the model. "
    "They do not independently verify the factual accuracy of the article."
)

def extract_global_feature_importance(model, vectorizer, class_labels=None, top_n=20) -> Dict[str, Any]:
    """
    Extracts the highest-weighted linguistic features supporting FAKE and REAL
    globally for Logistic Regression, Linear SVM, or Naive Bayes.
    
    Assumes binary classification where label 1 is FAKE and label 0 is REAL
    (or according to model.classes_).
    """
    feature_names = np.array(vectorizer.get_feature_names_out())
    classes = getattr(model, 'classes_', ['REAL', 'FAKE'])
    
    # Determine which class index corresponds to FAKE
    fake_idx = 1
    real_idx = 0
    if len(classes) == 2:
        if classes[0] == 'FAKE' or classes[0] == 1:
            fake_idx = 0
            real_idx = 1
        else:
            fake_idx = 1
            real_idx = 0

    weights = None

    # Handle Logistic Regression and Linear SVM
    if hasattr(model, 'coef_'):
        weights = model.coef_[0]
        # If fake_idx == 0, invert weights so positive means FAKE
        if fake_idx == 0:
            weights = -weights
            
    # Handle CalibratedClassifierCV
    elif hasattr(model, 'calibrated_classifiers_'):
        # Average base estimator coefficients
        try:
            base_coefs = [clf.estimator.coef_[0] for clf in model.calibrated_classifiers_ if hasattr(clf.estimator, 'coef_')]
            if base_coefs:
                weights = np.mean(base_coefs, axis=0)
                if fake_idx == 0:
                    weights = -weights
        except Exception:
            pass

    # Handle Multinomial Naive Bayes
    elif hasattr(model, 'feature_log_prob_'):
        log_prob_fake = model.feature_log_prob_[fake_idx]
        log_prob_real = model.feature_log_prob_[real_idx]
        weights = log_prob_fake - log_prob_real

    if weights is None or len(weights) != len(feature_names):
        return {
            "top_fake_indicators": [],
            "top_real_indicators": [],
            "disclaimer": DISCLAIMER_TEXT
        }

    # Top features supporting FAKE (highest positive weights)
    fake_indices = np.argsort(weights)[::-1][:top_n]
    top_fake = [
        {"word": str(feature_names[i]), "weight": round(float(weights[i]), 4)}
        for i in fake_indices if weights[i] > 0
    ]

    # Top features supporting REAL (most negative weights / lowest)
    real_indices = np.argsort(weights)[:top_n]
    top_real = [
        {"word": str(feature_names[i]), "weight": round(float(abs(weights[i])), 4)}
        for i in real_indices if weights[i] < 0
    ]

    return {
        "top_fake_indicators": top_fake,
        "top_real_indicators": top_real,
        "disclaimer": DISCLAIMER_TEXT
    }


def explain_instance(model, vectorizer, tfidf_sparse_vec, top_n=10) -> Dict[str, Any]:
    """
    Computes local feature contributions for a specific article instance:
    contribution = tfidf_weight * model_feature_weight
    """
    feature_names = np.array(vectorizer.get_feature_names_out())
    classes = getattr(model, 'classes_', ['REAL', 'FAKE'])
    
    fake_idx = 1
    if len(classes) == 2 and (classes[0] == 'FAKE' or classes[0] == 1):
        fake_idx = 0

    weights = None
    if hasattr(model, 'coef_'):
        weights = model.coef_[0].copy()
        if fake_idx == 0:
            weights = -weights
    elif hasattr(model, 'calibrated_classifiers_'):
        try:
            base_coefs = [clf.estimator.coef_[0] for clf in model.calibrated_classifiers_ if hasattr(clf.estimator, 'coef_')]
            if base_coefs:
                weights = np.mean(base_coefs, axis=0)
                if fake_idx == 0:
                    weights = -weights
        except Exception:
            pass
    elif hasattr(model, 'feature_log_prob_'):
        real_idx = 0 if fake_idx == 1 else 1
        weights = model.feature_log_prob_[fake_idx] - model.feature_log_prob_[real_idx]

    if weights is None:
        return {
            "article_fake_features": [],
            "article_real_features": [],
            "disclaimer": DISCLAIMER_TEXT
        }

    # Extract non-zero features for this document
    coo = tfidf_sparse_vec.tocoo()
    doc_features = []
    for col_idx, tfidf_val in zip(coo.col, coo.data):
        word = feature_names[col_idx]
        w = weights[col_idx]
        score = tfidf_val * w
        doc_features.append({
            "word": str(word),
            "tfidf": round(float(tfidf_val), 4),
            "weight": round(float(w), 4),
            "contribution": round(float(score), 4)
        })

    # Sort positive contributions (toward FAKE)
    fake_feats = sorted([f for f in doc_features if f["contribution"] > 0], key=lambda x: x["contribution"], reverse=True)[:top_n]
    # Sort negative contributions (toward REAL)
    real_feats = sorted([f for f in doc_features if f["contribution"] < 0], key=lambda x: x["contribution"])[:top_n]
    for rf in real_feats:
        rf["contribution"] = round(abs(rf["contribution"]), 4)

    return {
        "article_fake_features": fake_feats,
        "article_real_features": real_feats,
        "disclaimer": DISCLAIMER_TEXT
    }
