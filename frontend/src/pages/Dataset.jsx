import React, { useState, useEffect } from 'react';
import {
  Database,
  FileSpreadsheet,
  PieChart as PieIcon,
  Columns,
  Trash2,
  Sliders,
  Layers,
  Sparkles,
  HelpCircle,
  Hash
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { getDatasetStatistics, getFeatureImportance } from '../services/api';

export default function Dataset() {
  const [stats, setStats] = useState(null);
  const [features, setFeatures] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([getDatasetStatistics(), getFeatureImportance()])
      .then(([statsRes, featsRes]) => {
        setStats(statsRes);
        setFeatures(featsRes);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center">
        <div className="w-8 h-8 border-3 border-[#0F291E]/30 border-t-[#0F291E] rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-medium text-[#526058]">Loading dataset statistics from backend...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="p-6 rounded-2xl bg-red-50 border border-red-200 text-center">
          <p className="text-sm font-semibold text-red-800">
            {error || 'Unable to load dataset statistics.'}
          </p>
        </div>
      </div>
    );
  }

  const pieData = [
    { name: 'REAL Articles', value: stats.real_articles || 0, color: '#16A34A' },
    { name: 'FAKE Articles', value: stats.fake_articles || 0, color: '#DC2626' },
  ];

  const topFake = features?.features?.top_fake_indicators || [];
  const topReal = features?.features?.top_real_indicators || [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#EAE4D7] text-[#0F291E] text-xs font-semibold uppercase mb-3">
          <Database className="w-3.5 h-3.5 text-emerald-800" />
          <span>Corpus Provenance & Ingestion</span>
        </div>
        <h1 className="font-serif-heading text-4xl sm:text-5xl font-bold tracking-tight text-[#0F291E]">
          Dataset & Feature Space
        </h1>
        <p className="mt-3 text-sm sm:text-base text-[#556960] leading-relaxed">
          Detailed breakdown of the raw news CSV ingestion, deduplication, partition sizing, and learned vocabulary feature representations.
        </p>
      </div>

      {/* Dataset Overview Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Articles */}
        <div className="bg-white rounded-2xl border border-[#E7E2D9] p-5 shadow-xs">
          <div className="flex items-center justify-between text-[#64748B] text-xs mb-2">
            <span>Total Cleaned Articles</span>
            <Database className="w-4 h-4 text-emerald-800" />
          </div>
          <span className="text-2xl font-bold font-mono-code text-[#0F291E]">
            {stats.total_articles?.toLocaleString()}
          </span>
          <span className="block text-[11px] text-[#718096] mt-1">
            Raw ingested: {stats.raw_total?.toLocaleString()}
          </span>
        </div>

        {/* Duplicates Removed */}
        <div className="bg-white rounded-2xl border border-[#E7E2D9] p-5 shadow-xs">
          <div className="flex items-center justify-between text-[#64748B] text-xs mb-2">
            <span>Duplicates Removed</span>
            <Trash2 className="w-4 h-4 text-amber-700" />
          </div>
          <span className="text-2xl font-bold font-mono-code text-amber-900">
            {stats.duplicates_removed?.toLocaleString()}
          </span>
          <span className="block text-[11px] text-[#718096] mt-1">
            Exact text match deduplication
          </span>
        </div>

        {/* Training Samples */}
        <div className="bg-white rounded-2xl border border-[#E7E2D9] p-5 shadow-xs">
          <div className="flex items-center justify-between text-[#64748B] text-xs mb-2">
            <span>Training Samples (80%)</span>
            <Layers className="w-4 h-4 text-blue-800" />
          </div>
          <span className="text-2xl font-bold font-mono-code text-blue-950">
            {stats.train_samples?.toLocaleString()}
          </span>
          <span className="block text-[11px] text-[#718096] mt-1">
            Test partition: {stats.test_samples?.toLocaleString()}
          </span>
        </div>

        {/* TF-IDF Features */}
        <div className="bg-white rounded-2xl border border-[#E7E2D9] p-5 shadow-xs">
          <div className="flex items-center justify-between text-[#64748B] text-xs mb-2">
            <span>TF-IDF Features</span>
            <Hash className="w-4 h-4 text-emerald-800" />
          </div>
          <span className="text-2xl font-bold font-mono-code text-[#166534]">
            {stats.tfidf_features?.toLocaleString()}
          </span>
          <span className="block text-[11px] text-[#718096] mt-1">
            Unigrams & Bigrams (1-2)
          </span>
        </div>
      </div>

      {/* Distribution & Schema Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Class Distribution Donut Chart */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-[#E7E2D9] p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-[#0F291E] flex items-center space-x-2">
              <PieIcon className="w-4 h-4 text-emerald-800" />
              <span>Dataset Class Distribution (Donut Chart)</span>
            </h2>
            <p className="text-xs text-[#64748B] mt-1">
              Balanced split between verified news sources and flagged disinformation records.
            </p>
          </div>

          <div className="h-64 my-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [`${value.toLocaleString()} articles`]}
                  contentStyle={{ backgroundColor: '#FAF8F5', borderColor: '#E7E2D9', borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs pt-3 border-t border-[#F0ECE1]">
            <div className="p-3 bg-[#F4FAF6] rounded-xl border border-emerald-100 text-center">
              <span className="text-[11px] text-emerald-800 font-semibold uppercase block">REAL News</span>
              <span className="font-mono-code font-bold text-lg text-emerald-950">
                {stats.real_articles?.toLocaleString()}
              </span>
              <span className="text-[10px] text-emerald-700 block mt-0.5">
                {((stats.real_articles / (stats.total_articles || 1)) * 100).toFixed(1)}% of dataset
              </span>
            </div>

            <div className="p-3 bg-[#FFF5F5] rounded-xl border border-red-100 text-center">
              <span className="text-[11px] text-red-800 font-semibold uppercase block">FAKE News</span>
              <span className="font-mono-code font-bold text-lg text-red-950">
                {stats.fake_articles?.toLocaleString()}
              </span>
              <span className="text-[10px] text-red-700 block mt-0.5">
                {((stats.fake_articles / (stats.total_articles || 1)) * 100).toFixed(1)}% of dataset
              </span>
            </div>
          </div>
        </div>

        {/* Dataset Schema & File Ingestion Info */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-[#E7E2D9] p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-[#0F291E] flex items-center space-x-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-800" />
              <span>Detected Schema & Ingestion Mapping</span>
            </h2>
            <p className="text-xs text-[#64748B] mt-1">
              Source files automatically discovered from local <code className="bg-[#FAF8F5] px-1 py-0.5 rounded">data/</code> directory.
            </p>

            <div className="mt-4 space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE5DA]">
                <span className="font-semibold text-[#0F291E] block mb-1">Source CSV Files:</span>
                <div className="flex space-x-2 font-mono-code text-[11px]">
                  <span className="px-2 py-1 bg-white border border-[#D5CEBE] rounded text-emerald-900">
                    data/True.csv ({stats.raw_true?.toLocaleString()} rows)
                  </span>
                  <span className="px-2 py-1 bg-white border border-[#D5CEBE] rounded text-red-900">
                    data/Fake.csv ({stats.raw_fake?.toLocaleString()} rows)
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE5DA]">
                <span className="font-semibold text-[#0F291E] block mb-1">Detected Columns:</span>
                <div className="flex flex-wrap gap-1.5 font-mono-code text-[11px]">
                  {stats.detected_columns?.map((col, i) => (
                    <span key={i} className="px-2 py-0.5 bg-white border border-[#E0D9CB] rounded text-stone-700">
                      {col}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE5DA]">
                <span className="font-semibold text-[#0F291E] block mb-1">Text Field Combination Rule:</span>
                <p className="text-stone-600 leading-relaxed text-[11px]">
                  The training pipeline dynamically detected both <code className="bg-white px-1 py-0.5 rounded border">title</code> and <code className="bg-white px-1 py-0.5 rounded border">text</code> columns and concatenated them (<code className="bg-white px-1 py-0.5 rounded border">title + &quot; &quot; + text</code>) to preserve headline cues alongside journalistic reportage.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 rounded-xl bg-[#F0FDF4] border border-emerald-200 text-xs text-emerald-800 flex items-center space-x-2">
            <Sliders className="w-4 h-4 shrink-0 text-emerald-700" />
            <span>TF-IDF Configuration: sublinear_tf=True, min_df=2, max_df=0.9, n-grams=(1,2)</span>
          </div>
        </div>
      </div>

      {/* Top 20 Global Feature Importance Tables */}
      <div className="bg-white rounded-2xl border border-[#E7E2D9] p-6 sm:p-8 shadow-xs">
        <div className="mb-6">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-amber-600" />
            <h2 className="text-base font-bold text-[#0F291E]">
              Global Top 20 Linguistic Indicator Features
            </h2>
          </div>
          <p className="text-xs text-[#64748B] mt-1">
            Top mathematical weights extracted from the best classifier ({features?.model || 'Linear SVM'}).
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          {/* Top FAKE indicators */}
          <div className="border border-red-200 rounded-xl overflow-hidden">
            <div className="bg-[#FFF5F5] px-4 py-3 border-b border-red-200 font-bold text-red-900 flex justify-between items-center">
              <span>Top FAKE News Vocabulary Indicators</span>
              <span className="text-[11px] font-mono-code bg-red-100 text-red-800 px-2 py-0.5 rounded">
                Positive Weight
              </span>
            </div>
            <div className="divide-y divide-red-100 max-h-96 overflow-y-auto">
              {topFake.map((item, idx) => (
                <div key={idx} className="px-4 py-2 flex items-center justify-between hover:bg-red-50/50">
                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] font-mono-code text-stone-400 w-5">#{idx + 1}</span>
                    <span className="font-mono-code font-bold text-red-950">&ldquo;{item.word}&rdquo;</span>
                  </div>
                  <span className="font-mono-code font-semibold text-red-700 bg-red-50 px-2 py-0.5 rounded">
                    +{item.weight}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Top REAL indicators */}
          <div className="border border-emerald-200 rounded-xl overflow-hidden">
            <div className="bg-[#F2FBF5] px-4 py-3 border-b border-emerald-200 font-bold text-emerald-900 flex justify-between items-center">
              <span>Top REAL News Vocabulary Indicators</span>
              <span className="text-[11px] font-mono-code bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                Negative / Real Weight
              </span>
            </div>
            <div className="divide-y divide-emerald-100 max-h-96 overflow-y-auto">
              {topReal.map((item, idx) => (
                <div key={idx} className="px-4 py-2 flex items-center justify-between hover:bg-emerald-50/50">
                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] font-mono-code text-stone-400 w-5">#{idx + 1}</span>
                    <span className="font-mono-code font-bold text-emerald-950">&ldquo;{item.word}&rdquo;</span>
                  </div>
                  <span className="font-mono-code font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    -{item.weight}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-6 p-3 rounded-xl bg-[#FAF8F5] border border-[#E7E2D9] text-xs text-[#526058] flex items-center space-x-2">
          <HelpCircle className="w-4 h-4 shrink-0 text-[#6B7280]" />
          <span>
            {features?.disclaimer ||
              'These features indicate linguistic patterns learned by the model. They do not independently verify the factual accuracy of the article.'}
          </span>
        </div>
      </div>
    </div>
  );
}
