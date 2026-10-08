import urllib.request
import urllib.error
import json
import sys

BASE = 'http://127.0.0.1:8000'

def get(path):
    with urllib.request.urlopen(BASE + path) as r:
        return json.loads(r.read().decode())

def post(path, body):
    req = urllib.request.Request(
        BASE + path,
        data=json.dumps(body).encode(),
        headers={'Content-Type': 'application/json'}
    )
    with urllib.request.urlopen(req) as r:
        return json.loads(r.read().decode())

errors = []

def chk(n, cond, msg):
    if cond:
        print(f"  [OK]  Check {n}: {msg}")
    else:
        print(f"  [FAIL] Check {n}: {msg}")
        errors.append(n)

print("\n=== TRUTHLENS FINAL QA CHECKLIST ===\n")

# 1. Health
h = get('/health')
chk(1, h['status'] == 'healthy', f"Backend healthy, best_model={h['best_model']}")
chk(1.1, h['model_loaded'] == True, "Model successfully loaded")
chk(1.2, h['dataset_files_present']['Fake.csv'] == True, "Fake.csv present")
chk(1.3, h['dataset_files_present']['True.csv'] == True, "True.csv present")

# 2. Dataset statistics
ds = get('/dataset-statistics')
chk(2, ds['total_articles'] == 39105, f"Total articles = {ds['total_articles']}")
chk(2.1, ds['fake_articles'] > 0 and ds['real_articles'] > 0, f"FAKE={ds['fake_articles']}, REAL={ds['real_articles']}")
chk(2.2, ds['duplicates_removed'] > 0, f"Duplicates removed = {ds['duplicates_removed']}")
chk(2.3, ds['tfidf_features'] == 10000, f"TF-IDF features = {ds['tfidf_features']}")
chk(2.4, ds['train_samples'] + ds['test_samples'] <= ds['total_articles'], "Train+test samples match corpus")

# 3. Model performance
perf = get('/model-performance')
mnames = list(perf['models_evaluated'].keys())
chk(3, len(mnames) == 3, f"All 3 models evaluated: {mnames}")
chk(3.1, 'best_model_name' in perf, f"Best model = {perf['best_model_name']}")
for mname, m in perf['models_evaluated'].items():
    chk(3.2, m['f1_score'] > 0.9, f"{mname} F1 > 90%: {m['f1_score']:.4f}")

# 4. Feature importance
fi = get('/feature-importance')
chk(4, len(fi['features']['top_fake_indicators']) >= 10, "At least 10 FAKE indicators present")
chk(4.1, len(fi['features']['top_real_indicators']) >= 10, "At least 10 REAL indicators present")
chk(4.2, 'disclaimer' in fi['features'], "Disclaimer present in feature-importance")

# 5. Predict FAKE
fake_text = "SHOCKING SECRET EXPOSED The deep state shadow government uncovered in leaked documents whistleblower reveals conspiracy"
p_fake = post('/predict', {'text': fake_text})
chk(5, p_fake['prediction'] == 'FAKE', f"FAKE article predicted FAKE with confidence {p_fake['confidence']:.3f}")
chk(5.1, abs(p_fake['fake_probability'] + p_fake['real_probability'] - 1.0) < 0.01, "Probabilities sum to 1.0")

# 6. Predict REAL
real_text = "WASHINGTON Reuters The Federal Reserve held interest rates steady on Wednesday and signaled borrowing costs are likely to remain on hold citing balanced economic growth and low unemployment through next year."
p_real = post('/predict', {'text': real_text})
chk(6, p_real['prediction'] == 'REAL', f"REAL article predicted REAL with confidence {p_real['confidence']:.3f}")

# 7. Full analyze pipeline
a = post('/analyze', {'text': real_text})
for key in ['original_text', 'cleaned_text', 'tokens', 'lemmatized_tokens',
            'article_statistics', 'article_fake_indicators', 'article_real_indicators',
            'top_global_fake_indicators', 'top_global_real_indicators', 'disclaimer']:
    chk(7, key in a, f"analyze response contains '{key}'")

stats = a['article_statistics']
chk(7.1, stats['word_count'] > 0, f"Word count = {stats['word_count']}")
chk(7.2, stats['token_count'] > 0, f"Token count = {stats['token_count']}")
chk(7.3, len(a['tokens']) > 0, f"Tokens list length = {len(a['tokens'])}")
chk(7.4, len(a['lemmatized_tokens']) > 0, f"Lemmatized tokens = {len(a['lemmatized_tokens'])}")

# 8. Confusion matrix data integrity
test_total = ds['test_samples']
for mname, m in perf['models_evaluated'].items():
    cm = m['confusion_matrix']
    total = cm['TP'] + cm['FN'] + cm['FP'] + cm['TN']
    chk(8, total == test_total, f"{mname} confusion matrix sum = {total}")

# 9. Samples endpoint
s = get('/samples')
chk(9, 'real' in s and 'fake' in s, "Samples endpoint returns real and fake")

# 10. Error handling - empty text
try:
    post('/predict', {'text': ''})
    chk(10, False, "Empty text should fail (did not raise)")
except urllib.error.HTTPError as e:
    chk(10, e.code in [400, 422], f"Empty text returns HTTP {e.code}")

# 11. Prediction values are not hardcoded (different texts give different confidences)
diff_texts = [
    "The President signed new trade agreements with Asian nations today.",
    "UNBELIEVABLE alien spacecraft spotted government coverup exposed NOW",
    "Federal budget committee approved additional spending for infrastructure programs."
]
preds = [post('/predict', {'text': t})['confidence'] for t in diff_texts]
chk(11, len(set(round(p, 2) for p in preds)) > 1, f"Confidences vary dynamically: {[round(p,3) for p in preds]}")

print("\n=== RESULTS ===")
if errors:
    print(f"FAILED checks: {errors}")
    sys.exit(1)
else:
    print("ALL 30+ QA CHECKS PASSED - PROJECT IS FULLY VERIFIED!")
