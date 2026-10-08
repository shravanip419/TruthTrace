import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Upload,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  FileText,
  ChevronDown,
  ChevronUp,
  Cpu,
  Flame,
  ShieldCheck,
  TrendingUp,
  Sparkles,
  BarChart2
} from 'lucide-react';
import { analyzeText, uploadAndAnalyzeFile, getSamples } from '../services/api';

export default function Home() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [samples, setSamples] = useState(null);
  const [expandedSection, setExpandedSection] = useState('features'); // 'features', 'pipeline', 'stats'
  const fileInputRef = useRef(null);
  const resultsRef = useRef(null);

  useEffect(() => {
    // Load sample articles
    getSamples().then((data) => {
      if (data) setSamples(data);
    });
  }, []);

  const handleAnalyze = async () => {
    if (!text.trim()) {
      setError('Please paste or type an article before analyzing.');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const data = await analyzeText(text);
      setResult(data);
      saveToHistory(data);

      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      setError(err.message || 'An error occurred during analysis.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setText('');
    setResult(null);
    setError(null);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.txt')) {
      setError('Invalid file type. Please upload a plain text (.txt) file.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const data = await uploadAndAnalyzeFile(file);
      setText(data.original_text);
      setResult(data);
      saveToHistory(data);

      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      setError(err.message || 'Error processing uploaded file.');
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const loadSample = (type) => {
    if (!samples || !samples[type]) return;
    const sample = samples[type];
    const fullText = `${sample.title}\n\n${sample.text}`;
    setText(fullText);
    setError(null);
  };

  const saveToHistory = (analysisResult) => {
    try {
      const historyItem = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        preview: analysisResult.original_text.slice(0, 140) + '...',
        prediction: analysisResult.prediction,
        confidence: analysisResult.confidence,
        fake_probability: analysisResult.fake_probability,
        real_probability: analysisResult.real_probability,
        model: analysisResult.model,
      };

      const existing = JSON.parse(localStorage.getItem('truthlens_history') || '[]');
      const updated = [historyItem, ...existing.slice(0, 49)];
      localStorage.setItem('truthlens_history', JSON.stringify(updated));
    } catch (e) {
      console.warn('Unable to save history item:', e);
    }
  };

  const isFake = result?.prediction === 'FAKE';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Academic Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#EAE4D7] text-[#0F291E] text-xs font-semibold tracking-wide uppercase mb-3">
          <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
          <span>Explainable Natural Language Processing</span>
        </div>
        <h1 className="font-serif-heading text-5xl sm:text-6xl font-bold tracking-tight text-[#0F291E]">
          TruthLens
        </h1>
        <p className="mt-2 text-xl font-medium text-[#4A5D4E] italic font-serif-heading">
          &ldquo;See beyond the headline.&rdquo;
        </p>
        <p className="mt-4 text-sm sm:text-base text-[#556960] leading-relaxed">
          An explainable NLP system that analyzes linguistic patterns in news articles and predicts whether they resemble real or fake news based on patterns learned from the training dataset.
        </p>
      </div>

      {/* Main Analysis Card */}
      <div className="bg-white rounded-2xl border border-[#E7E2D9] shadow-sm p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-[#F0ECE1] gap-3">
          <label htmlFor="article-input" className="text-sm font-semibold text-[#1A2E26] flex items-center space-x-2">
            <FileText className="w-4 h-4 text-emerald-800" />
            <span>Article Text Corpus</span>
          </label>

          {/* Quick Sample Loaders */}
          {samples && (
            <div className="flex items-center space-x-2 text-xs">
              <span className="text-[#78887F]">Load sample:</span>
              <button
                type="button"
                onClick={() => loadSample('real')}
                className="px-2.5 py-1 rounded bg-[#EAF5EC] text-[#14532D] hover:bg-[#D7EEDC] font-medium transition-colors"
              >
                Verified Real
              </button>
              <button
                type="button"
                onClick={() => loadSample('fake')}
                className="px-2.5 py-1 rounded bg-[#FEE2E2] text-[#991B1B] hover:bg-[#FED1D1] font-medium transition-colors"
              >
                Flagged Fake
              </button>
            </div>
          )}
        </div>

        {/* Text Input Area */}
        <div className="mt-4 relative">
          <textarea
            id="article-input"
            rows={8}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste a news article here (title, body, or full report)..."
            className="w-full p-4 rounded-xl border border-[#DCD6C9] bg-[#FAF8F5]/60 text-[#1F2937] placeholder-[#9CA3AF] text-sm leading-relaxed focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#234E3F] focus:border-transparent transition-all resize-y"
          />
          <div className="absolute bottom-3 right-4 text-[11px] text-[#86958C] font-mono-code">
            {text.length} characters • {text.trim() ? text.trim().split(/\s+/).length : 0} words
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mt-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start space-x-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Action Controls */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <button
              type="button"
              id="analyze-btn"
              onClick={handleAnalyze}
              disabled={loading}
              className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-[#0F291E] text-white hover:bg-[#1A4232] font-semibold text-sm shadow-xs transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Analyzing NLP Features...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Analyze News</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleClear}
              disabled={loading || (!text && !result)}
              className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-[#F4EFE6] text-[#4A5D4E] hover:bg-[#EAE4D7] font-medium text-sm transition-colors cursor-pointer disabled:opacity-40"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          </div>

          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".txt"
              className="hidden"
              id="file-upload-input"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl border border-[#D5CEBE] bg-white text-[#334155] hover:bg-[#F9F7F2] font-medium text-sm transition-colors cursor-pointer shadow-2xs"
            >
              <Upload className="w-4 h-4 text-emerald-800" />
              <span>Upload .txt</span>
            </button>
          </div>
        </div>
      </div>

      {/* Analysis Results Display */}
      {result && (
        <div ref={resultsRef} className="mt-10 space-y-8 animate-fadeIn">
          {/* Top Prediction Summary Banner */}
          <div
            className={`rounded-2xl border p-6 sm:p-8 transition-all ${
              isFake
                ? 'bg-[#FFF5F5] border-[#FED7D7]'
                : 'bg-[#F2FBF5] border-[#C6F6D5]'
            }`}
          >
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              {/* Classification Label */}
              <div className="md:col-span-5 flex items-start space-x-4">
                <div
                  className={`p-3.5 rounded-2xl shrink-0 ${
                    isFake ? 'bg-[#FED7D7] text-[#991B1B]' : 'bg-[#C6F6D5] text-[#166534]'
                  }`}
                >
                  {isFake ? <AlertTriangle className="w-8 h-8" /> : <ShieldCheck className="w-8 h-8" />}
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                    Classification Verdict
                  </span>
                  <h2
                    className={`font-serif-heading text-3xl sm:text-4xl font-bold tracking-tight ${
                      isFake ? 'text-[#991B1B]' : 'text-[#166534]'
                    }`}
                  >
                    {isFake ? 'FAKE NEWS' : 'REAL NEWS'}
                  </h2>
                  <p className="text-xs text-[#526058] mt-1 font-medium">
                    Evaluated by <span className="font-semibold">{result.model}</span>
                  </p>
                </div>
              </div>

              {/* Confidence & Probabilities Gauges */}
              <div className="md:col-span-7 grid grid-cols-3 gap-3">
                {/* Confidence Card */}
                <div className="bg-white/90 rounded-xl p-3.5 border border-[#E7E2D9] text-center shadow-2xs">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B] block">
                    Confidence
                  </span>
                  <span className="text-2xl font-bold font-mono-code text-[#0F291E]">
                    {(result.confidence * 100).toFixed(1)}%
                  </span>
                  <span className="block text-[10px] text-[#718096] mt-0.5">Top class confidence</span>
                </div>

                {/* Fake Probability Card */}
                <div
                  className={`rounded-xl p-3.5 border text-center shadow-2xs ${
                    isFake ? 'bg-red-50 border-red-200' : 'bg-white/90 border-[#E7E2D9]'
                  }`}
                >
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#991B1B] block">
                    Fake Probability
                  </span>
                  <span className="text-2xl font-bold font-mono-code text-[#991B1B]">
                    {(result.fake_probability * 100).toFixed(1)}%
                  </span>
                  <div className="w-full bg-red-100 h-1.5 rounded-full mt-1.5 overflow-hidden">
                    <div
                      className="bg-[#DC2626] h-full rounded-full transition-all duration-500"
                      style={{ width: `${result.fake_probability * 100}%` }}
                    />
                  </div>
                </div>

                {/* Real Probability Card */}
                <div
                  className={`rounded-xl p-3.5 border text-center shadow-2xs ${
                    !isFake ? 'bg-emerald-50 border-emerald-200' : 'bg-white/90 border-[#E7E2D9]'
                  }`}
                >
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#166534] block">
                    Real Probability
                  </span>
                  <span className="text-2xl font-bold font-mono-code text-[#166534]">
                    {(result.real_probability * 100).toFixed(1)}%
                  </span>
                  <div className="w-full bg-emerald-100 h-1.5 rounded-full mt-1.5 overflow-hidden">
                    <div
                      className="bg-[#16A34A] h-full rounded-full transition-all duration-500"
                      style={{ width: `${result.real_probability * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Academic Disclaimer Banner */}
            <div className="mt-5 pt-4 border-t border-black/5 flex items-start space-x-2 text-xs text-[#526058] bg-black/2 rounded-lg p-3">
              <HelpCircle className="w-4 h-4 shrink-0 text-[#6B7280] mt-0.5" />
              <p className="leading-relaxed">
                <span className="font-semibold text-[#1F2937]">Academic Disclaimer: </span>
                {result.disclaimer}
              </p>
            </div>
          </div>

          {/* Section Navigation Tabs for Deep Inspection */}
          <div className="flex border-b border-[#E2DDD3] space-x-2 sm:space-x-4">
            <button
              onClick={() => setExpandedSection('features')}
              className={`pb-3 px-3 text-sm font-semibold transition-all border-b-2 cursor-pointer ${
                expandedSection === 'features'
                  ? 'border-[#0F291E] text-[#0F291E]'
                  : 'border-transparent text-[#64748B] hover:text-[#0F291E]'
              }`}
            >
              Linguistic Feature Attribution
            </button>
            <button
              onClick={() => setExpandedSection('pipeline')}
              className={`pb-3 px-3 text-sm font-semibold transition-all border-b-2 cursor-pointer ${
                expandedSection === 'pipeline'
                  ? 'border-[#0F291E] text-[#0F291E]'
                  : 'border-transparent text-[#64748B] hover:text-[#0F291E]'
              }`}
            >
              NLP Preprocessing Pipeline
            </button>
            <button
              onClick={() => setExpandedSection('stats')}
              className={`pb-3 px-3 text-sm font-semibold transition-all border-b-2 cursor-pointer ${
                expandedSection === 'stats'
                  ? 'border-[#0F291E] text-[#0F291E]'
                  : 'border-transparent text-[#64748B] hover:text-[#0F291E]'
              }`}
            >
              Article Statistics & Model Info
            </button>
          </div>

          {/* TAB 1: Linguistic Feature Attribution (Explainability Core) */}
          {expandedSection === 'features' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-[#E7E2D9] p-6 shadow-xs">
                <div className="mb-4">
                  <h3 className="text-base font-bold text-[#0F291E] flex items-center space-x-2">
                    <Flame className="w-5 h-5 text-amber-600" />
                    <span>Instance-Level Feature Contributions (In This Article)</span>
                  </h3>
                  <p className="text-xs text-[#526058] mt-1">
                    Features present in this article weighted by their TF-IDF score and trained model coefficient:
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Features pushing toward FAKE */}
                  <div className="bg-[#FFF8F8] rounded-xl border border-red-200 p-4">
                    <div className="flex items-center justify-between pb-2 mb-3 border-b border-red-100">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#991B1B]">
                        Tokens Pushing Toward FAKE
                      </span>
                      <span className="text-[11px] font-mono-code text-red-600 bg-red-100 px-2 py-0.5 rounded">
                        +{result.article_fake_indicators?.length || 0} terms
                      </span>
                    </div>

                    {result.article_fake_indicators?.length > 0 ? (
                      <div className="space-y-2">
                        {result.article_fake_indicators.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-red-100 text-xs shadow-2xs"
                          >
                            <span className="font-mono-code font-semibold text-red-950">
                              &ldquo;{item.word}&rdquo;
                            </span>
                            <div className="flex items-center space-x-2">
                              <span className="text-[10px] text-gray-500">
                                TF-IDF: {item.tfidf}
                              </span>
                              <span className="font-mono-code font-bold text-red-700 bg-red-50 px-1.5 py-0.5 rounded text-[11px]">
                                +{item.contribution}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-stone-500 italic py-4 text-center">
                        No strong FAKE indicator keywords detected in this article.
                      </p>
                    )}
                  </div>

                  {/* Features pushing toward REAL */}
                  <div className="bg-[#F6FCF7] rounded-xl border border-emerald-200 p-4">
                    <div className="flex items-center justify-between pb-2 mb-3 border-b border-emerald-100">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#166534]">
                        Tokens Pushing Toward REAL
                      </span>
                      <span className="text-[11px] font-mono-code text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                        +{result.article_real_indicators?.length || 0} terms
                      </span>
                    </div>

                    {result.article_real_indicators?.length > 0 ? (
                      <div className="space-y-2">
                        {result.article_real_indicators.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-emerald-100 text-xs shadow-2xs"
                          >
                            <span className="font-mono-code font-semibold text-emerald-950">
                              &ldquo;{item.word}&rdquo;
                            </span>
                            <div className="flex items-center space-x-2">
                              <span className="text-[10px] text-gray-500">
                                TF-IDF: {item.tfidf}
                              </span>
                              <span className="font-mono-code font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[11px]">
                                -{item.contribution}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-stone-500 italic py-4 text-center">
                        No strong REAL indicator keywords detected in this article.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Global Dataset Indicators */}
              <div className="bg-white rounded-2xl border border-[#E7E2D9] p-6 shadow-xs">
                <h3 className="text-sm font-bold text-[#0F291E] mb-3">
                  Benchmark: Top Global Vocabulary Indicators (Learned Across 39,105 Articles)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="font-semibold text-red-900 block mb-2">Global FAKE Indicators:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {result.top_global_fake_indicators?.slice(0, 10).map((f, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 rounded bg-red-50 border border-red-200 text-red-800 font-mono-code text-[11px]"
                        >
                          {f.word} <span className="opacity-60 text-[10px]">({f.weight})</span>
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="font-semibold text-emerald-900 block mb-2">Global REAL Indicators:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {result.top_global_real_indicators?.slice(0, 10).map((f, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 font-mono-code text-[11px]"
                        >
                          {f.word} <span className="opacity-60 text-[10px]">({f.weight})</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: NLP Preprocessing Pipeline Breakdown */}
          {expandedSection === 'pipeline' && (
            <div className="bg-white rounded-2xl border border-[#E7E2D9] p-6 shadow-xs space-y-5">
              <div>
                <h3 className="text-base font-bold text-[#0F291E]">NLP Preprocessing Step-by-Step Transformation</h3>
                <p className="text-xs text-[#526058] mt-1">
                  Examine how raw input text is converted into clean linguistic tokens for TF-IDF vectorization:
                </p>
              </div>

              {/* Step 1: Original */}
              <div className="border border-[#EAE5DA] rounded-xl p-4 bg-[#FCFBF8]">
                <div className="flex items-center justify-between text-xs font-bold text-[#0F291E] mb-2">
                  <span className="flex items-center space-x-2">
                    <span className="w-5 h-5 rounded-full bg-[#EAE5DA] flex items-center justify-center text-[10px]">1</span>
                    <span>Original Raw Text</span>
                  </span>
                  <span className="text-[11px] font-mono-code text-[#7A8A80]">
                    {result.original_text.length} chars
                  </span>
                </div>
                <p className="text-xs font-mono-code bg-white p-3 rounded-lg border border-[#EFECE6] text-[#334155] max-h-32 overflow-y-auto whitespace-pre-wrap">
                  {result.original_text}
                </p>
              </div>

              {/* Step 2: Cleaned Text */}
              <div className="border border-[#EAE5DA] rounded-xl p-4 bg-[#FCFBF8]">
                <div className="flex items-center justify-between text-xs font-bold text-[#0F291E] mb-2">
                  <span className="flex items-center space-x-2">
                    <span className="w-5 h-5 rounded-full bg-[#EAE5DA] flex items-center justify-center text-[10px]">2</span>
                    <span>Cleaned Text (HTML, URLs & Special Characters Removed, Lowercased)</span>
                  </span>
                  <span className="text-[11px] font-mono-code text-[#7A8A80]">
                    {result.cleaned_text.length} chars
                  </span>
                </div>
                <p className="text-xs font-mono-code bg-white p-3 rounded-lg border border-[#EFECE6] text-[#334155] max-h-32 overflow-y-auto whitespace-pre-wrap">
                  {result.cleaned_text}
                </p>
              </div>

              {/* Step 3: Tokens */}
              <div className="border border-[#EAE5DA] rounded-xl p-4 bg-[#FCFBF8]">
                <div className="flex items-center justify-between text-xs font-bold text-[#0F291E] mb-2">
                  <span className="flex items-center space-x-2">
                    <span className="w-5 h-5 rounded-full bg-[#EAE5DA] flex items-center justify-center text-[10px]">3</span>
                    <span>Extracted Tokens ({result.tokens.length} total)</span>
                  </span>
                </div>
                <div className="bg-white p-3 rounded-lg border border-[#EFECE6] max-h-32 overflow-y-auto flex flex-wrap gap-1">
                  {result.tokens.slice(0, 80).map((tok, i) => (
                    <span key={i} className="px-1.5 py-0.5 rounded bg-stone-100 text-stone-700 text-[10px] font-mono-code">
                      {tok}
                    </span>
                  ))}
                  {result.tokens.length > 80 && (
                    <span className="text-[10px] text-stone-400 self-center">
                      +{result.tokens.length - 80} more...
                    </span>
                  )}
                </div>
              </div>

              {/* Step 4: Lemmatized & Stopwords Removed */}
              <div className="border border-[#EAE5DA] rounded-xl p-4 bg-[#FCFBF8]">
                <div className="flex items-center justify-between text-xs font-bold text-[#0F291E] mb-2">
                  <span className="flex items-center space-x-2">
                    <span className="w-5 h-5 rounded-full bg-[#EAE5DA] flex items-center justify-center text-[10px]">4</span>
                    <span>Lemmatized & Stopword-Filtered Tokens ({result.lemmatized_tokens.length} terms)</span>
                  </span>
                </div>
                <div className="bg-white p-3 rounded-lg border border-[#EFECE6] max-h-32 overflow-y-auto flex flex-wrap gap-1">
                  {result.lemmatized_tokens.slice(0, 80).map((lem, i) => (
                    <span key={i} className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[10px] font-mono-code border border-emerald-100">
                      {lem}
                    </span>
                  ))}
                  {result.lemmatized_tokens.length > 80 && (
                    <span className="text-[10px] text-emerald-600 self-center">
                      +{result.lemmatized_tokens.length - 80} more...
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Article Statistics & Model Info */}
          {expandedSection === 'stats' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Statistics Card */}
              <div className="bg-white rounded-2xl border border-[#E7E2D9] p-6 shadow-xs">
                <h3 className="text-base font-bold text-[#0F291E] mb-4">Linguistic Corpus Statistics</h3>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#EAE5DA]">
                    <span className="text-[#64748B] block">Total Characters</span>
                    <span className="text-lg font-bold font-mono-code text-[#0F291E]">
                      {result.article_statistics?.char_count?.toLocaleString()}
                    </span>
                  </div>
                  <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#EAE5DA]">
                    <span className="text-[#64748B] block">Total Words</span>
                    <span className="text-lg font-bold font-mono-code text-[#0F291E]">
                      {result.article_statistics?.word_count?.toLocaleString()}
                    </span>
                  </div>
                  <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#EAE5DA]">
                    <span className="text-[#64748B] block">Extracted Tokens</span>
                    <span className="text-lg font-bold font-mono-code text-[#0F291E]">
                      {result.article_statistics?.token_count?.toLocaleString()}
                    </span>
                  </div>
                  <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#EAE5DA]">
                    <span className="text-[#64748B] block">Unique Words</span>
                    <span className="text-lg font-bold font-mono-code text-[#0F291E]">
                      {result.article_statistics?.unique_word_count?.toLocaleString()}
                    </span>
                  </div>
                  <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#EAE5DA]">
                    <span className="text-[#64748B] block">Stopwords Filtered</span>
                    <span className="text-lg font-bold font-mono-code text-[#0F291E]">
                      {result.article_statistics?.stopwords_removed_count?.toLocaleString()}
                    </span>
                  </div>
                  <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#EAE5DA]">
                    <span className="text-[#64748B] block">Vocabulary Density</span>
                    <span className="text-lg font-bold font-mono-code text-[#0F291E]">
                      {result.article_statistics?.vocabulary_size?.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Model Info Card */}
              <div className="bg-white rounded-2xl border border-[#E7E2D9] p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-[#0F291E] mb-4">Inference Model Details</h3>
                  <div className="space-y-3 text-xs text-[#475569]">
                    <div className="flex justify-between py-1.5 border-b border-[#F0ECE1]">
                      <span className="font-medium text-[#1E293B]">Architecture:</span>
                      <span className="font-semibold text-[#0F291E]">{result.model}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-[#F0ECE1]">
                      <span className="font-medium text-[#1E293B]">Feature Extraction:</span>
                      <span>TF-IDF (10,000 features, n-grams 1-2)</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-[#F0ECE1]">
                      <span className="font-medium text-[#1E293B]">Probability Method:</span>
                      <span>Calibrated Platt Scaling / Sigmoid</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-[#F0ECE1]">
                      <span className="font-medium text-[#1E293B]">Training Corpus:</span>
                      <span>39,105 news articles (ISOT benchmark)</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-3 rounded-xl bg-[#FAF8F5] border border-[#E7E2D9] text-[11px] text-[#556960]">
                  Model selected based on superior F1 score across test partitions. To see comparative metrics for all 3 trained algorithms, visit the Models tab.
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
