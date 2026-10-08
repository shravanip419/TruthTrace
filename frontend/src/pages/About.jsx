import React from 'react';
import {
  BookOpen,
  Target,
  Workflow,
  Cpu,
  Database,
  BarChart2,
  Sparkles,
  AlertOctagon,
  Compass,
  CheckCircle2,
  FileCode2
} from 'lucide-react';

export default function About() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#EAE4D7] text-[#0F291E] text-xs font-semibold uppercase mb-3">
          <BookOpen className="w-3.5 h-3.5 text-emerald-800" />
          <span>Academic Project Documentation</span>
        </div>
        <h1 className="font-serif-heading text-4xl sm:text-5xl font-bold tracking-tight text-[#0F291E]">
          Methodology & Project Architecture
        </h1>
        <p className="mt-3 text-base text-[#556960] font-serif-heading italic">
          TruthLens — Fake News Detection using NLP with Explainable AI
        </p>
      </div>

      {/* 1. Problem Statement & Objectives */}
      <div className="bg-white rounded-2xl border border-[#E7E2D9] p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <h2 className="text-lg font-bold text-[#0F291E] flex items-center space-x-2">
            <Target className="w-5 h-5 text-emerald-800" />
            <span>Problem Statement & Objectives</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#475569] mt-3 leading-relaxed">
            The proliferation of digital misinformation presents severe risks to democratic governance, public health discourse, and market stability. Traditional black-box neural networks often yield high classification scores without providing actionable interpretability for end users or journalists.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE5DA]">
            <span className="font-bold text-[#0F291E] block mb-1">Primary Objective</span>
            <p className="text-stone-600 leading-relaxed">
              Construct an end-to-end NLP classification system that categorizes raw news articles into REAL or FAKE using statistical linguistic features, TF-IDF vectorization, and scikit-learn ML models.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE5DA]">
            <span className="font-bold text-[#0F291E] block mb-1">Explainability Objective</span>
            <p className="text-stone-600 leading-relaxed">
              Deliver transparent Explainable AI (XAI) feature attribution, allowing users to inspect exact tokens and weights that steered the model toward its classification decision.
            </p>
          </div>
        </div>
      </div>

      {/* 2. End-to-End NLP Pipeline */}
      <div className="bg-white rounded-2xl border border-[#E7E2D9] p-6 sm:p-8 shadow-xs space-y-4">
        <h2 className="text-lg font-bold text-[#0F291E] flex items-center space-x-2">
          <Workflow className="w-5 h-5 text-emerald-800" />
          <span>NLP Preprocessing Pipeline</span>
        </h2>
        <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
          Raw articles undergo rigorous multi-stage normalization before mathematical transformation:
        </p>

        <div className="space-y-3 text-xs">
          <div className="flex items-start space-x-3 p-3 rounded-lg bg-[#FAF8F5] border border-[#EAE5DA]">
            <span className="w-5 h-5 rounded-full bg-[#0F291E] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">1</span>
            <div>
              <span className="font-bold text-[#0F291E]">Corpus Ingestion & Dynamic Concatenation:</span>
              <p className="text-stone-600 mt-0.5">Loads Fake.csv and True.csv. Dynamically combines headline (<code className="bg-white px-1 py-0.5 rounded border">title</code>) with article body (<code className="bg-white px-1 py-0.5 rounded border">text</code>).</p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-3 rounded-lg bg-[#FAF8F5] border border-[#EAE5DA]">
            <span className="w-5 h-5 rounded-full bg-[#0F291E] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">2</span>
            <div>
              <span className="font-bold text-[#0F291E]">Deduplication & Sanitization:</span>
              <p className="text-stone-600 mt-0.5">Strips exact duplicate news dispatches, removes HTML tags, web URLs, and non-alphabetic symbols.</p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-3 rounded-lg bg-[#FAF8F5] border border-[#EAE5DA]">
            <span className="w-5 h-5 rounded-full bg-[#0F291E] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">3</span>
            <div>
              <span className="font-bold text-[#0F291E]">Tokenization & Lemmatization:</span>
              <p className="text-stone-600 mt-0.5">Splits text into alphabetic tokens, purges English stopwords using NLTK, and reduces word variants to their canonical lemma via WordNetLemmatizer.</p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-3 rounded-lg bg-[#FAF8F5] border border-[#EAE5DA]">
            <span className="w-5 h-5 rounded-full bg-[#0F291E] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">4</span>
            <div>
              <span className="font-bold text-[#0F291E]">TF-IDF Feature Space Representation:</span>
              <p className="text-stone-600 mt-0.5">Extracts top 10,000 unigrams and bigrams with sublinear term-frequency scaling (<code className="bg-white px-1 py-0.5 rounded border">sublinear_tf=True</code>, <code className="bg-white px-1 py-0.5 rounded border">min_df=2</code>, <code className="bg-white px-1 py-0.5 rounded border">max_df=0.9</code>).</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Machine Learning Algorithms & Probability Calibration */}
      <div className="bg-white rounded-2xl border border-[#E7E2D9] p-6 sm:p-8 shadow-xs space-y-4">
        <h2 className="text-lg font-bold text-[#0F291E] flex items-center space-x-2">
          <Cpu className="w-5 h-5 text-emerald-800" />
          <span>Machine Learning Models & Probability Calibration</span>
        </h2>
        <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
          We train and empirically evaluate three diverse statistical machine learning paradigms:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE5DA]">
            <span className="font-bold text-[#0F291E] block mb-1">Logistic Regression</span>
            <p className="text-stone-600">
              L2-regularized linear model producing direct Bernoulli probability outputs via the logistic sigmoid function.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE5DA]">
            <span className="font-bold text-[#0F291E] block mb-1">Multinomial Naive Bayes</span>
            <p className="text-stone-600">
              Probabilistic classifier computing posterior class distributions from word token counts with Laplace smoothing (α=0.1).
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE5DA]">
            <span className="font-bold text-[#0F291E] block mb-1">Linear SVM (Calibrated)</span>
            <p className="text-stone-600">
              Maximum-margin hyperplane classifier calibrated via Platt Sigmoid Scaling (<code className="bg-white px-1 py-0.5 rounded border">CalibratedClassifierCV</code>) to generate genuine posterior probabilities.
            </p>
          </div>
        </div>
      </div>

      {/* 4. Explainable AI (XAI) Feature Attribution */}
      <div className="bg-white rounded-2xl border border-[#E7E2D9] p-6 sm:p-8 shadow-xs space-y-4">
        <h2 className="text-lg font-bold text-[#0F291E] flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-amber-600" />
          <span>Explainable AI (XAI) Feature Attribution</span>
        </h2>
        <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
          Rather than relying on opaque predictions, TruthLens calculates instance-specific and global mathematical contributions:
        </p>
        <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE5DA] font-mono-code text-xs text-[#0F291E]">
          Contribution(token) = TF_IDF_Weight(token) × Model_Coefficient(token)
        </div>
        <p className="text-xs text-[#475569] leading-relaxed">
          Tokens with large positive contributions push the article toward the FAKE classification boundary, whereas negative/reputable journalistic terms pull it toward REAL.
        </p>
      </div>

      {/* 5. Critical Academic Limitations */}
      <div className="bg-[#FFF8F8] rounded-2xl border border-red-200 p-6 sm:p-8 shadow-xs space-y-4">
        <h2 className="text-lg font-bold text-red-950 flex items-center space-x-2">
          <AlertOctagon className="w-5 h-5 text-red-700" />
          <span>Academic & Operational Limitations</span>
        </h2>
        <div className="space-y-3 text-xs sm:text-sm text-red-900 leading-relaxed">
          <p>
            The model identifies <strong>linguistic and statistical patterns</strong> learned strictly from the training dataset. It does <strong>NOT</strong> independently fact-check claims, access live real-time knowledge graphs, or verify information against authoritative news agencies.
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-red-800">
            <li>A prediction of <strong>&ldquo;FAKE&rdquo;</strong> does not necessarily mean the article is factually false; it signifies that its linguistic style strongly mimics fake news patterns in the corpus.</li>
            <li>A prediction of <strong>&ldquo;REAL&rdquo;</strong> does not guarantee that the article is factually true; sophisticated misinformation written in sober journalistic prose may deceive statistical bag-of-words classifiers.</li>
            <li>Sensational or emotional headlines in legitimate investigative journalism may trigger false positives.</li>
          </ul>
        </div>
      </div>

      {/* 6. Future Scope */}
      <div className="bg-white rounded-2xl border border-[#E7E2D9] p-6 sm:p-8 shadow-xs space-y-4">
        <h2 className="text-lg font-bold text-[#0F291E] flex items-center space-x-2">
          <Compass className="w-5 h-5 text-emerald-800" />
          <span>Future Scope & Extensions</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#EAE5DA] flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>BERT / RoBERTa contextual transformer embeddings</span>
          </div>
          <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#EAE5DA] flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>Multilingual support (Hindi, Marathi, English)</span>
          </div>
          <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#EAE5DA] flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>Real-time claim fact-checking via Wikipedia API</span>
          </div>
          <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#EAE5DA] flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>Publisher domain reputation & source scoring</span>
          </div>
          <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#EAE5DA] flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>Knowledge Graph entity consistency checking</span>
          </div>
          <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#EAE5DA] flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>SHAP & LIME deep explainability visualizers</span>
          </div>
        </div>
      </div>
    </div>
  );
}
