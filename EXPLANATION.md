# TruthLens — Complete Project Explanation
### Fake News Detection using NLP with Explainable AI

---

## 1. WHAT IS THIS PROJECT?

TruthLens is an end-to-end web application that reads a news article and predicts whether it is **REAL** or **FAKE**.

It does this using:
- **NLP (Natural Language Processing)** to clean and understand the text
- **TF-IDF** to convert words into numbers the computer can understand
- **Machine Learning models** to classify the article
- **Explainable AI (XAI)** to show *which words* caused the prediction

---

## 2. WHY WAS THIS BUILT?

**Problem:** Fake news spreads rapidly online and misleads people. Most AI detection tools are "black boxes" — they give a result but never explain why.

**Solution:** TruthLens not only predicts REAL/FAKE but also shows the user exactly which linguistic patterns drove the decision — making it transparent and academically interpretable.

---

## 3. DATASET USED

| File | Content | Rows |
|---|---|---|
| `data/Fake.csv` | Fake news articles | 23,481 |
| `data/True.csv` | Real news articles (Reuters) | 21,417 |

**Columns in each file:** `title`, `text`, `subject`, `date`

**After preprocessing:**
- Combined: 44,898 raw articles
- After removing 5,793 duplicates: **39,105 clean articles**
- FAKE: 17,908 | REAL: 21,197
- Train set (80%): 31,280 | Test set (20%): 7,820

---

## 4. SYSTEM ARCHITECTURE

```
User types article
       ↓
React Frontend (browser)
       ↓  HTTP request
FastAPI Backend (Python)
       ↓
  preprocessing.py   →  Clean & lemmatize text
       ↓
  TF-IDF Vectorizer  →  Convert to numbers
       ↓
  Linear SVM Model   →  Predict REAL or FAKE
       ↓
  explainability.py  →  Find key words that decided it
       ↓
JSON response sent back to browser
       ↓
React shows result + charts + word highlights
```

---

## 5. NLP PREPROCESSING — STEP BY STEP

This is what happens to raw text before the ML model sees it:

### Step 1: Lowercase
```
"BREAKING NEWS: Government EXPOSED!" → "breaking news: government exposed!"
```

### Step 2: Remove HTML tags
```
"<p>Hello world</p>" → "Hello world"
```

### Step 3: Remove URLs
```
"Visit http://example.com for more" → "Visit  for more"
```

### Step 4: Remove special characters
```
"breaking!!! government..." → "breaking government"
```

### Step 5: Tokenization (split into words)
```
"breaking government exposed" → ["breaking", "government", "exposed"]
```

### Step 6: Remove Stopwords
Stopwords are common words that carry no meaning: *the, a, is, in, and, of, to...*
```
["the", "government", "has", "announced"] → ["government", "announced"]
```

### Step 7: Lemmatization
Reduce words to their root/base form:
```
["running", "announced", "policies"] → ["run", "announce", "policy"]
```

**Why Lemmatization over Stemming?**
- Stemming: "running" → "runn" (not a real word)
- Lemmatization: "running" → "run" (actual dictionary word)
- Lemmatization is more accurate and readable

---

## 6. TF-IDF VECTORIZATION

**Problem:** ML models only understand numbers, not words.
**Solution:** TF-IDF converts text into a matrix of numbers.

### What is TF-IDF?
**TF = Term Frequency** — How often a word appears in THIS article
**IDF = Inverse Document Frequency** — How rare the word is across ALL articles

```
TF-IDF Score = TF × IDF
```

**Example:**
- Word "the" → appears in every article → low IDF → low score (filtered out)
- Word "whistleblower" → rare in real news → high IDF → high score

### TF-IDF Settings Used:
| Parameter | Value | Why |
|---|---|---|
| max_features | 10,000 | Keep top 10,000 most useful words |
| ngram_range | (1, 2) | Use single words AND two-word phrases |
| min_df | 2 | Ignore words appearing in < 2 articles |
| max_df | 0.9 | Ignore words in > 90% of articles (too common) |
| sublinear_tf | True | Use log(TF) to reduce impact of very frequent words |

**N-grams Example:**
- Unigram (1-word): "fake", "news", "government"
- Bigram (2-word): "fake news", "government announced" ← more meaningful!

---

## 7. MACHINE LEARNING MODELS

Three models were trained and compared:

### Model 1: Logistic Regression
- A mathematical equation that separates REAL from FAKE using a boundary line
- Each word gets a positive or negative weight
- Positive weight → pushes toward FAKE
- Negative weight → pushes toward REAL
- Simple, fast, and very interpretable

### Model 2: Multinomial Naive Bayes
- Based on probability theory (Bayes' Theorem)
- Calculates: "Given this word appears, how likely is this article FAKE?"
- Works on word count distributions
- Very fast to train, works well for text

### Model 3: Linear SVM (Support Vector Machine)
- Finds the best possible "boundary" (hyperplane) that separates REAL and FAKE
- Maximizes the distance (margin) between the two classes
- More powerful than Logistic Regression for high-dimensional data
- **Selected as the best model** (highest F1 score)

---

## 8. MODEL EVALUATION RESULTS

Tested on **7,820 unseen articles** (20% of dataset):

| Model | Accuracy | Precision | Recall | F1 Score |
|---|---|---|---|---|
| **Linear SVM ⭐** | **99.62%** | **99.89%** | **99.27%** | **99.58%** |
| Logistic Regression | 99.08% | 99.66% | 98.32% | 98.99% |
| Multinomial Naive Bayes | 96.15% | 95.89% | 95.70% | 95.79% |

### Why was Linear SVM selected?
**Selection Criterion: Highest F1 Score**

F1 Score is the best single metric because it balances both Precision and Recall:
```
F1 = 2 × (Precision × Recall) / (Precision + Recall)
```

---

## 9. UNDERSTANDING THE METRICS

### Accuracy
"Out of all articles, what % did the model get right?"
```
Accuracy = (Correct Predictions) / (Total Predictions)
```

### Precision
"Out of all articles the model called FAKE, what % were actually FAKE?"
High precision = fewer false alarms (real news wrongly called fake)

### Recall
"Out of all actually FAKE articles, what % did the model catch?"
High recall = fewer missed fake articles

### F1 Score
Balance between Precision and Recall. Best overall metric.

---

## 10. CONFUSION MATRIX EXPLAINED

```
                    PREDICTED
                  FAKE      REAL
ACTUAL  FAKE  [  TP   |   FN  ]
        REAL  [  FP   |   TN  ]
```

| Cell | Name | Meaning |
|---|---|---|
| TP (True Positive) | Correct | Article IS fake, model said FAKE ✅ |
| TN (True Negative) | Correct | Article IS real, model said REAL ✅ |
| FP (False Positive) | Wrong | Article IS real, model said FAKE ❌ |
| FN (False Negative) | Wrong | Article IS fake, model said REAL ❌ |

**For Linear SVM on 7,820 test articles:**
- TP ≈ 3,523 (correctly caught fake)
- TN ≈ 4,243 (correctly recognized real)
- FP ≈ 4 (real articles wrongly flagged)
- FN ≈ 25 (fake articles missed)

---

## 11. PROBABILITY CALIBRATION (Important for SVM)

**Problem:** Linear SVM gives a "decision score" (e.g., +2.3 or -1.7), not a probability (0 to 1).

**Solution used:** `CalibratedClassifierCV` with **Platt Sigmoid Scaling**

```
Probability = 1 / (1 + e^(-decision_score))
```

This converts the SVM score into a genuine probability between 0 and 1.
For example: decision score of +3.5 → Fake probability = 97.1%

**Why this matters:** We never fake or hardcode probability values. All confidence scores are mathematically derived from the model.

---

## 12. EXPLAINABLE AI (XAI) — The Core Feature

Most ML models are "black boxes." TruthLens opens the box.

### How it works:

**For each article**, the contribution of every word is calculated as:

```
Contribution = TF-IDF Weight × Model Coefficient
```

- **TF-IDF Weight** = how important this word is in THIS article
- **Model Coefficient** = what the model learned about this word globally

### Example:
If the word **"whistleblower"** has:
- TF-IDF weight in article = 0.45
- Model coefficient (toward FAKE) = +2.3
- Contribution = 0.45 × 2.3 = **+1.035** (strongly pushes toward FAKE)

If the word **"reuters"** has:
- TF-IDF weight = 0.38
- Model coefficient (toward REAL) = -2.1
- Contribution = 0.38 × (-2.1) = **-0.798** (pushes toward REAL)

### Global vs Instance-Level Explanation:

| Type | What it shows |
|---|---|
| **Global** | Top 20 words the model always associates with FAKE/REAL across all 39,105 training articles |
| **Instance** | Words in THIS specific article that drove THIS specific prediction |

---

## 13. API ENDPOINTS (FastAPI Backend)

| Endpoint | Method | What it does |
|---|---|---|
| `/health` | GET | Check if backend is running + model loaded |
| `/predict` | POST | Fast prediction: REAL or FAKE + probabilities |
| `/analyze` | POST | Full analysis: prediction + NLP pipeline + XAI features |
| `/upload-analyze` | POST | Same as analyze but from a `.txt` file upload |
| `/model-performance` | GET | All 3 model metrics, confusion matrices |
| `/dataset-statistics` | GET | Corpus size, class counts, feature count |
| `/feature-importance` | GET | Top global vocabulary indicator words |
| `/samples` | GET | Pre-built sample REAL and FAKE articles |

---

## 14. FRONTEND PAGES

| Page | URL | Content |
|---|---|---|
| **Detector** | `/` | Paste article → get REAL/FAKE prediction + XAI |
| **Models** | `/models` | Compare all 3 models, confusion matrices, charts |
| **Dataset** | `/dataset` | Corpus statistics, donut chart, top vocabulary |
| **History** | `/history` | All predictions made in this browser session |
| **About** | `/about` | Methodology, limitations, future scope |

---

## 15. PROJECT FILE STRUCTURE

```
TruthTrace/
├── data/
│   ├── Fake.csv              ← Fake news corpus (23,481 articles)
│   └── True.csv              ← Real news corpus (21,417 articles)
│
├── backend/
│   ├── train_model.py        ← Trains all 3 models, saves them
│   ├── preprocessing.py      ← NLP cleaning + lemmatization functions
│   ├── model.py              ← Loads saved model, runs predictions
│   ├── explainability.py     ← Calculates word contribution scores
│   ├── app.py                ← FastAPI server with all 8 endpoints
│   ├── requirements.txt      ← Python libraries needed
│   └── models/               ← Saved trained models (joblib files)
│       ├── best_model.joblib
│       ├── tfidf_vectorizer.joblib
│       ├── logistic_regression.joblib
│       ├── multinomial_naive_bayes.joblib
│       └── model_metadata.json
│
├── frontend/
│   ├── src/
│   │   ├── pages/            ← Home, Models, Dataset, History, About
│   │   ├── components/       ← Navbar, Footer
│   │   ├── services/api.js   ← All HTTP calls to backend
│   │   └── App.jsx           ← Router and layout
│   └── vite.config.js        ← API proxy + build config
│
├── README.md                 ← Setup and run instructions
└── EXPLANATION.md            ← This file
```

---

## 16. HOW TO RUN THE PROJECT

**First time only:**
```powershell
pip install -r backend/requirements.txt
python backend/train_model.py
```

**Every time to start:**

Terminal 1 (Backend):
```powershell
python -m uvicorn backend.app:app --host 127.0.0.1 --port 8000
```

Terminal 2 (Frontend):
```powershell
cd frontend
npx vite --host 127.0.0.1 --port 5173
```

Open browser: `http://127.0.0.1:5173`

---

## 17. TECHNOLOGY STACK

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React 19 + Vite | User interface |
| Styling | Tailwind CSS v4 | Academic design |
| Charts | Recharts | Bar charts, donut charts |
| Icons | Lucide React | UI icons |
| Routing | React Router DOM | Page navigation |
| Backend | FastAPI + Uvicorn | REST API server |
| Data | Pandas + NumPy | CSV loading, data manipulation |
| NLP | NLTK | Stopwords, lemmatization |
| ML | Scikit-learn | TF-IDF, Logistic Regression, NB, SVM |
| Storage | Joblib | Save/load trained models |
| Validation | Pydantic | API request/response models |

---

## 18. LIMITATIONS (Important for Viva)

1. **Training data bias:** Trained on US/Western news (Reuters = REAL, American fake sites = FAKE). Does not generalize well to Indian news styles or regional languages.

2. **No real fact-checking:** The model does NOT access any external knowledge base, Wikipedia, or news database. It only identifies *statistical patterns* in text.

3. **Linguistic pattern ≠ Factual truth:**
   - A FAKE prediction means the article *writes like* fake news, NOT that its content is false
   - A REAL prediction means it *writes like* real news, NOT that it is factually true

4. **Sophisticated misinformation:** Well-written fake news in formal journalistic style may fool the model.

5. **Dataset age:** Training data is from 2016–2017. New slang, new propaganda styles may not be detected.

---

## 19. FUTURE SCOPE

| Enhancement | Description |
|---|---|
| BERT/Transformer | Use deep learning embeddings instead of TF-IDF |
| Multilingual | Add Hindi, Marathi, regional language support |
| Fact-checking API | Cross-reference claims against Wikipedia/FactCheck.org |
| Real-time news | Connect to live news feed APIs |
| Source credibility | Score publisher reputation alongside article content |
| SHAP/LIME | More advanced explainability methods |
| Knowledge Graph | Verify entity consistency (people, dates, places) |

---

## 20. KEY CONCEPTS SUMMARY (Quick Reference for Viva)

| Term | One-line Explanation |
|---|---|
| NLP | Teaching computers to understand human language |
| Tokenization | Splitting text into individual words |
| Stopwords | Common words removed because they add no meaning (the, a, is) |
| Lemmatization | Reducing words to their dictionary root form (running → run) |
| TF-IDF | Score showing how important a word is in a document vs all documents |
| N-gram | Sequence of N words treated as one feature (bigram = 2 words) |
| Logistic Regression | Linear model predicting probability using a sigmoid curve |
| Naive Bayes | Probabilistic classifier using Bayes' theorem |
| SVM | Finds the widest possible boundary between two classes |
| Precision | Of all FAKE predictions, how many were actually fake |
| Recall | Of all actual FAKE articles, how many did we catch |
| F1 Score | Harmonic mean of Precision and Recall |
| Confusion Matrix | Table showing TP, TN, FP, FN counts |
| XAI | Explaining AI decisions in human-understandable terms |
| Calibration | Converting SVM scores to proper probabilities (0–1) |
| Joblib | Python library to save/load trained ML models |
| FastAPI | Python web framework for building REST APIs |
| Vite | Fast build tool for React frontend |
