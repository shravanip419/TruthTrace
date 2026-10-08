# TruthLens — Fake News Detection using NLP with Explainable AI

![TruthLens Banner](https://img.shields.io/badge/TruthLens-Explainable%20AI-green?style=for-the-badge&logo=shield)
![Python](https://img.shields.io/badge/Python-3.10%2B-blue?style=for-the-badge&logo=python)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)
![FastAPI](https://img.shields.io/badge/FastAPI-0.110-009688?style=for-the-badge&logo=fastapi)

---

## 📌 Project Overview

**TruthLens** is an end-to-end academic NLP mini-project that detects whether a given news article is **REAL** or **FAKE** using:

- Traditional NLP preprocessing (lowercasing → HTML/URL removal → tokenization → stopword removal → lemmatization)
- TF-IDF vectorization (unigrams + bigrams)
- Three trained ML classifiers (Logistic Regression, Multinomial Naive Bayes, Linear SVM)
- Explainable AI (XAI) feature attribution showing *which words* influenced the decision

The project includes a polished academic-grade React + Tailwind CSS frontend and a FastAPI backend.

---

## 🌟 Features

| Feature | Description |
|---|---|
| 🔍 **News Analysis** | Paste any article and get REAL/FAKE prediction |
| 📊 **Probability Scores** | Calibrated probability values for both classes |
| 🧠 **Explainable AI** | Instance-level token contributions (TF-IDF × model weight) |
| 🔬 **NLP Pipeline Viewer** | Step-by-step preprocessing visualization |
| 📈 **Model Comparison** | Accuracy, Precision, Recall, F1 for all 3 models |
| 🟦 **Confusion Matrices** | Visual confusion matrices for every model |
| 📂 **Dataset Dashboard** | Corpus statistics, class distribution donut chart |
| 📋 **Prediction History** | Session-based audit log with JSON export |
| 📤 **File Upload** | Analyze `.txt` articles directly |
| ⚠️ **Academic Disclaimers** | Proper limitation notices throughout the UI |

---

## 🏗 Architecture

```
User ─→ React SPA (Vite)
           │
           │  HTTP (proxied /api → :8000)
           ↓
      FastAPI Backend (Uvicorn)
           │
           ├── /predict       ← Lightweight classification
           ├── /analyze       ← Full NLP pipeline + XAI
           ├── /model-performance ← Training metrics
           ├── /dataset-statistics ← Corpus stats
           ├── /feature-importance ← Global vocabulary weights
           └── /upload-analyze ← .txt file ingestion
           │
           ├── preprocessing.py  ← Text cleaning & lemmatization
           ├── model.py          ← Model inference service
           └── explainability.py ← Feature attribution (XAI)
                    │
                    └── backend/models/
                           ├── best_model.joblib         (Linear SVM)
                           ├── tfidf_vectorizer.joblib
                           ├── model_metadata.json
                           ├── logistic_regression.joblib
                           ├── multinomial_naive_bayes.joblib
                           └── raw_linear_svm.joblib
```

---

## 🛠 Tech Stack

### Frontend
| Library | Version | Purpose |
|---|---|---|
| React | 19 | UI framework |
| Vite | 8.x | Build tool & HMR dev server |
| Tailwind CSS | 4.x | Utility-first styling |
| React Router DOM | 7.x | Client-side navigation |
| Recharts | 3.x | Interactive bar & pie charts |
| Lucide React | 1.x | Clean icons |

### Backend
| Library | Version | Purpose |
|---|---|---|
| FastAPI | 0.110+ | REST API framework |
| Uvicorn | 0.28+ | ASGI server |
| Pydantic | 2.x | Request/response models |
| scikit-learn | 1.4+ | TF-IDF, ML models, metrics |
| NLTK | 3.8+ | Stopwords, tokenization, lemmatization |
| Pandas | 2.x | CSV ingestion & data manipulation |
| Joblib | 1.3+ | Model serialization |

---

## 📁 Folder Structure

```
TruthTrace/
│
├── data/
│   ├── Fake.csv                     ← Fake news corpus (23,481 rows)
│   └── True.csv                     ← Real news corpus (21,417 rows)
│
├── backend/
│   ├── app.py                       ← FastAPI app & all endpoints
│   ├── train_model.py               ← Training pipeline
│   ├── preprocessing.py             ← NLP preprocessing functions
│   ├── model.py                     ← ModelService: predict & analyze
│   ├── explainability.py            ← XAI feature attribution
│   ├── requirements.txt
│   └── models/
│       ├── best_model.joblib
│       ├── tfidf_vectorizer.joblib
│       ├── model_metadata.json
│       ├── logistic_regression.joblib
│       ├── multinomial_naive_bayes.joblib
│       ├── raw_linear_svm.joblib
│       └── linear_svm.joblib
│
├── frontend/
│   ├── package.json
│   ├── vite.config.js               ← Vite + Tailwind + API proxy
│   ├── index.html
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── index.css
│       ├── components/
│       │   ├── Navbar.jsx
│       │   └── Footer.jsx
│       ├── pages/
│       │   ├── Home.jsx             ← Detector + Results + XAI
│       │   ├── Models.jsx           ← Model comparison + matrices
│       │   ├── Dataset.jsx          ← Corpus stats + features
│       │   ├── History.jsx          ← Session prediction log
│       │   └── About.jsx            ← Methodology + Limitations
│       └── services/
│           └── api.js               ← All backend API calls
│
└── README.md
```

---

## 📊 Dataset Setup

> **IMPORTANT:** You must provide the dataset files yourself.

1. Place `Fake.csv` and `True.csv` into the `data/` directory:
   ```
   data/
   ├── Fake.csv
   └── True.csv
   ```
2. Expected columns: `title`, `text`, `subject`, `date`
3. The pipeline automatically assigns labels (`Fake.csv → FAKE`, `True.csv → REAL`)

If either file is missing, the training pipeline will print a clear setup error.

### Dataset Statistics (after training)
| Metric | Value |
|---|---|
| Raw Fake Articles | 23,481 |
| Raw Real Articles | 21,417 |
| Duplicates Removed | 5,793 |
| Final Cleaned Corpus | 39,105 |
| Training Samples (80%) | 31,280 |
| Test Samples (20%) | 7,820 |
| TF-IDF Features | 10,000 |

---

## 🚀 Installation & Setup

### 1. Install Backend Dependencies

```powershell
# Create virtual environment (recommended)
python -m venv .venv
.venv\Scripts\Activate.ps1

# Install dependencies
pip install -r backend/requirements.txt
```

### 2. Train the Models

```powershell
python backend/train_model.py
```

This will:
- Load and validate `data/Fake.csv` and `data/True.csv`
- Deduplicate and preprocess 39,105 articles (multi-process, ~1–3 minutes)
- Fit TF-IDF vectorizer and train all 3 models
- Evaluate and select best model by F1 score
- Save all artifacts to `backend/models/`

Expected output:
```
Best Model Selected: Linear SVM (F1 Score: 0.9958)
```

### 3. Start the FastAPI Backend

```powershell
python -m uvicorn backend.app:app --host 127.0.0.1 --port 8000
```

Backend runs at: `http://127.0.0.1:8000`
API docs available at: `http://127.0.0.1:8000/docs`

### 4. Install Frontend Dependencies

```powershell
cd frontend
npm install
```

### 5. Start the React Frontend

```powershell
# From the frontend/ directory
npx vite --host 127.0.0.1 --port 5173
```

Frontend runs at: `http://127.0.0.1:5173`

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | System health check |
| `POST` | `/predict` | Lightweight FAKE/REAL classification |
| `POST` | `/analyze` | Full NLP pipeline + XAI + article stats |
| `POST` | `/upload-analyze` | Analyze uploaded `.txt` file |
| `GET` | `/model-performance` | All model metrics & confusion matrices |
| `GET` | `/dataset-statistics` | Corpus statistics |
| `GET` | `/feature-importance` | Top global vocabulary weights |
| `GET` | `/samples` | Sample REAL and FAKE articles |

### Example `/predict` Request

```json
POST /predict
{
  "text": "BREAKING: Secret underground tunnels exposed by whistleblower!"
}
```

### Example `/predict` Response

```json
{
  "prediction": "FAKE",
  "confidence": 0.9983,
  "fake_probability": 0.9983,
  "real_probability": 0.0017,
  "model": "Linear SVM"
}
```

---

## 📈 Model Evaluation Results

| Model | Accuracy | Precision | Recall | F1 Score |
|---|---|---|---|---|
| **Linear SVM** ⭐ | **99.62%** | **99.89%** | **99.27%** | **99.58%** |
| Logistic Regression | 99.08% | 99.66% | 98.32% | 98.99% |
| Multinomial Naive Bayes | 96.15% | 95.89% | 95.70% | 95.79% |

> ⭐ **Linear SVM** selected as the best model (highest F1 score)

### NLP Configuration

| Parameter | Value |
|---|---|
| Vectorizer | TF-IDF |
| Max Features | 10,000 |
| N-gram Range | (1, 2) — unigrams + bigrams |
| min_df | 2 |
| max_df | 0.9 |
| sublinear_tf | True |
| Random State | 42 |
| Test Split | 20% (stratified) |

### Linear SVM Probability Calibration

`LinearSVC` does not natively output class probabilities. TruthLens uses **`CalibratedClassifierCV` with Platt Sigmoid Scaling (cv=3)** on the training data to convert decision scores into genuine posterior probabilities — no values are faked or hardcoded.

---

## 🔬 Explainable AI (XAI)

For every article analyzed, TruthLens computes:

**Global Features** (from the best model's learned weights across all 39,105 training articles):
- Top 20 vocabulary tokens pushing toward FAKE
- Top 20 vocabulary tokens pushing toward REAL

**Instance-Level Attribution** (specific to each article):
```
Contribution(token) = TF_IDF_Weight(token) × Model_Coefficient(token)
```

### Disclaimer (displayed in UI)
> *"These features indicate linguistic patterns learned by the model. They do not independently verify the factual accuracy of the article."*

---

## 🖥 Demo Flow (Presentation)

1. Open `http://127.0.0.1:5173/`
2. Click **"Flagged Fake"** to load sample article → **Analyze News**
3. View: **FAKE NEWS** verdict + 99.8% confidence
4. Switch tabs: **Linguistic Feature Attribution** → see token contributions
5. Switch tabs: **NLP Preprocessing Pipeline** → see original → cleaned → tokens → lemmatized
6. Navigate to `/models` → see comparison table + charts + confusion matrices
7. Navigate to `/dataset` → see corpus stats + donut chart + global vocabulary features
8. Navigate to `/history` → see session audit log
9. Navigate to `/about` → see full methodology, limitations, and future scope

---

## ⚠️ Limitations

- Predictions are derived solely from statistical linguistic patterns in the training corpus
- **FAKE prediction ≠ factually false** article
- **REAL prediction ≠ factually true** article  
- Sophisticated misinformation in formal journalistic prose may evade detection
- Model is not updated in real-time and reflects patterns from the original dataset

---

## 🔭 Future Scope

- BERT / RoBERTa contextual embeddings
- Multilingual support (Hindi, Marathi, English)
- Real-time claim fact-checking via Wikipedia API
- Publisher domain reputation scoring
- Knowledge Graph entity consistency checking
- SHAP & LIME deep explainability visualizers
- Marathi/Hindi regional language support
- External fact-checking API integration (FactCheck.org, PolitiFact)

---

## 📝 Reproducibility

| Parameter | Value |
|---|---|
| Python | 3.13.2 |
| Random Seed | 42 |
| Train/Test Split | 80/20 stratified |
| NLTK Corpora | punkt, stopwords, wordnet, omw-1.4 |

All experiments are fully deterministic with `random_state=42` set everywhere.
