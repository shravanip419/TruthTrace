import React from 'react';
import { Shield, Sparkles, BookOpen } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-[#E7E2D9] bg-[#F5F2EB]/80 text-[#5C6E64] text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center space-x-2 text-[#0F291E] font-semibold text-sm mb-2">
              <Shield className="w-4 h-4 text-emerald-700" />
              <span className="font-serif-heading text-base">TruthLens</span>
            </div>
            <p className="leading-relaxed text-[#64748B]">
              An Explainable Artificial Intelligence (XAI) NLP research mini-project for detecting stylistic and linguistic disinformation signatures in news media.
            </p>
          </div>

          <div>
            <div className="flex items-center space-x-2 text-[#0F291E] font-semibold text-sm mb-2">
              <BookOpen className="w-4 h-4 text-emerald-700" />
              <span>Academic Architecture</span>
            </div>
            <ul className="space-y-1 text-[#64748B]">
              <li>Dataset: 39,105 de-duplicated news articles</li>
              <li>Vectorization: TF-IDF (10,000 max features, n-grams 1-2)</li>
              <li>Models: Linear SVM, Logistic Regression, Naive Bayes</li>
              <li>Validation: Stratified 80/20 train-test split</li>
            </ul>
          </div>

          <div>
            <div className="flex items-center space-x-2 text-[#0F291E] font-semibold text-sm mb-2">
              <Sparkles className="w-4 h-4 text-amber-700" />
              <span>Academic Notice</span>
            </div>
            <p className="leading-relaxed text-[#64748B]">
              Predictions are derived solely from mathematical linguistic pattern recognition in the training corpus. They do not constitute factual verification against ground-truth external knowledge bases.
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-[#E7E2D9] flex flex-col sm:flex-row items-center justify-between text-[#78887F]">
          <p>© {new Date().getFullYear()} TruthLens — NLP with Explainable AI.</p>
          <p className="mt-2 sm:mt-0 font-mono-code text-[11px]">
            FastAPI Engine • React 19 • Scikit-learn
          </p>
        </div>
      </div>
    </footer>
  );
}
