import re
import string
import logging
from typing import Dict, List, Any

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Ensure NLTK resources are available
import nltk

def ensure_nltk_resources():
    required_packages = ['punkt', 'stopwords', 'wordnet', 'omw-1.4']
    for pkg in required_packages:
        try:
            nltk.download(pkg, quiet=True)
        except Exception as e:
            logger.warning(f"Could not download NLTK resource '{pkg}': {e}")

ensure_nltk_resources()

from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer

try:
    STOP_WORDS = set(stopwords.words('english'))
except Exception:
    STOP_WORDS = {"the", "a", "an", "in", "and", "or", "of", "to", "at", "by", "for", "with", "about", "against", "between", "into", "through", "during", "before", "after", "above", "below", "to", "from", "up", "down", "in", "out", "on", "off", "over", "under", "again", "further", "then", "once", "here", "there", "when", "where", "why", "how", "all", "any", "both", "each", "few", "more", "most", "other", "some", "such", "no", "nor", "not", "only", "own", "same", "so", "than", "too", "very", "s", "t", "can", "will", "just", "don", "should", "now"}

try:
    LEMMATIZER = WordNetLemmatizer()
except Exception:
    class FallbackLemmatizer:
        def lemmatize(self, word):
            return word
    LEMMATIZER = FallbackLemmatizer()


def clean_text_basic(text: str) -> str:
    """
    Cleans raw text by stripping HTML, URLs, non-alphabetic chars,
    lowercasing, and normalizing whitespace.
    """
    if not isinstance(text, str):
        text = str(text or "")
    
    # Lowercase
    text = text.lower()
    
    # HTML tag removal
    text = re.sub(r'<.*?>', ' ', text)
    
    # URL removal
    text = re.sub(r'https?://\S+|www\.\S+', ' ', text)
    
    # Email removal
    text = re.sub(r'\S+@\S+', ' ', text)
    
    # Remove special characters / punctuation but keep words
    text = re.sub(r'[^a-z\s]', ' ', text)
    
    # Remove extra whitespace
    text = re.sub(r'\s+', ' ', text).strip()
    return text


def clean_text(text: str) -> str:
    """
    Full text cleaning pipeline for TF-IDF training & inference:
    Lowercasing -> Regex cleaning -> Tokenization -> Stopword removal -> Lemmatization.
    """
    cleaned = clean_text_basic(text)
    words = cleaned.split()
    lemmatized = [LEMMATIZER.lemmatize(w) for w in words if len(w) > 2 and w not in STOP_WORDS]
    return " ".join(lemmatized)


def preprocess_pipeline(text: str) -> Dict[str, Any]:
    """
    Comprehensive multi-stage preprocessing for Explainability & UI visualization.
    Returns every intermediate stage and rich article statistics.
    """
    raw_text = str(text or "")
    char_count = len(raw_text)
    raw_words = re.findall(r'\b\w+\b', raw_text)
    word_count = len(raw_words)

    # 1. Basic Cleaning
    cleaned_text = clean_text_basic(raw_text)

    # 2. Tokenization (All cleaned alpha tokens before stopword filter)
    all_tokens = [w for w in cleaned_text.split() if len(w) > 1]
    token_count = len(all_tokens)

    # 3. Stopword Removal & Lemmatization
    stopwords_removed = [w for w in all_tokens if w in STOP_WORDS or len(w) <= 2]
    lemmatized_tokens = [LEMMATIZER.lemmatize(w) for w in all_tokens if w not in STOP_WORDS and len(w) > 2]
    
    # Final preprocessed text representation
    final_processed_text = " ".join(lemmatized_tokens)

    # 4. Detailed Statistics
    unique_words = len(set(raw_words))
    vocab_size = len(set(lemmatized_tokens))
    stopwords_count = len(stopwords_removed)

    return {
        "original_text": raw_text,
        "cleaned_text": cleaned_text,
        "tokens": all_tokens,
        "lemmatized_tokens": lemmatized_tokens,
        "final_processed_text": final_processed_text,
        "article_statistics": {
            "char_count": char_count,
            "word_count": word_count,
            "token_count": token_count,
            "unique_word_count": unique_words,
            "stopwords_removed_count": stopwords_count,
            "vocabulary_size": vocab_size
        }
    }
