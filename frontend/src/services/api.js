const API_BASE = '/api';

export async function checkHealth() {
  try {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error(`Health check failed: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Backend connection error:', err);
    return { status: 'offline', error: err.message };
  }
}

export async function predictText(text) {
  const res = await fetch(`${API_BASE}/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({ detail: 'Prediction request failed.' }));
    throw new Error(errData.detail || `Server error (${res.status})`);
  }
  return await res.json();
}

export async function analyzeText(text) {
  const res = await fetch(`${API_BASE}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({ detail: 'Analysis request failed.' }));
    throw new Error(errData.detail || `Server error (${res.status})`);
  }
  return await res.json();
}

export async function uploadAndAnalyzeFile(file) {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE}/upload-analyze`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({ detail: 'File upload failed.' }));
    throw new Error(errData.detail || `Upload error (${res.status})`);
  }
  return await res.json();
}

export async function getModelPerformance() {
  const res = await fetch(`${API_BASE}/model-performance`);
  if (!res.ok) {
    const errData = await res.json().catch(() => ({ detail: 'Failed to fetch performance data.' }));
    throw new Error(errData.detail || `Server error (${res.status})`);
  }
  return await res.json();
}

export async function getDatasetStatistics() {
  const res = await fetch(`${API_BASE}/dataset-statistics`);
  if (!res.ok) {
    const errData = await res.json().catch(() => ({ detail: 'Failed to fetch dataset statistics.' }));
    throw new Error(errData.detail || `Server error (${res.status})`);
  }
  return await res.json();
}

export async function getFeatureImportance() {
  const res = await fetch(`${API_BASE}/feature-importance`);
  if (!res.ok) {
    const errData = await res.json().catch(() => ({ detail: 'Failed to fetch feature importance.' }));
    throw new Error(errData.detail || `Server error (${res.status})`);
  }
  return await res.json();
}

export async function getSamples() {
  const res = await fetch(`${API_BASE}/samples`);
  if (!res.ok) {
    return null;
  }
  return await res.json();
}
