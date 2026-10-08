import React, { useState, useEffect } from 'react';
import {
  BrainCircuit,
  Award,
  BarChart2,
  CheckCircle,
  HelpCircle,
  Clock,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { getModelPerformance } from '../services/api';

export default function Models() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeModelTab, setActiveModelTab] = useState(null);

  useEffect(() => {
    getModelPerformance()
      .then((res) => {
        setData(res);
        if (res.best_model_name) {
          setActiveModelTab(res.best_model_name);
        } else if (res.models_evaluated) {
          setActiveModelTab(Object.keys(res.models_evaluated)[0]);
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center">
        <div className="w-8 h-8 border-3 border-[#0F291E]/30 border-t-[#0F291E] rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-medium text-[#526058]">Loading model evaluation metrics from backend...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="p-6 rounded-2xl bg-red-50 border border-red-200 text-center">
          <p className="text-sm font-semibold text-red-800">
            {error || 'Unable to load model performance data.'}
          </p>
          <p className="text-xs text-red-600 mt-2">
            Make sure you have executed the training pipeline: <code className="bg-red-100 px-1 py-0.5 rounded">python backend/train_model.py</code>
          </p>
        </div>
      </div>
    );
  }

  const modelsList = Object.values(data.models_evaluated || {});
  const bestModelName = data.best_model_name;

  // Chart data formatting
  const chartData = modelsList.map((m) => ({
    name: m.name,
    Accuracy: +(m.accuracy * 100).toFixed(2),
    Precision: +(m.precision * 100).toFixed(2),
    Recall: +(m.recall * 100).toFixed(2),
    F1: +(m.f1_score * 100).toFixed(2),
    isBest: m.name === bestModelName,
  }));

  const activeModel = data.models_evaluated?.[activeModelTab];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#EAE4D7] text-[#0F291E] text-xs font-semibold uppercase mb-3">
          <BrainCircuit className="w-3.5 h-3.5 text-emerald-800" />
          <span>Machine Learning Benchmarks</span>
        </div>
        <h1 className="font-serif-heading text-4xl sm:text-5xl font-bold tracking-tight text-[#0F291E]">
          Model Comparison & Evaluation
        </h1>
        <p className="mt-3 text-sm sm:text-base text-[#556960] leading-relaxed">
          Comprehensive empirical comparison of three classic NLP classifiers trained on the stratified ISOT dataset with TF-IDF vectorization.
        </p>
      </div>

      {/* Best Model Banner */}
      <div className="bg-[#F2FBF5] border border-[#B7EB8F] rounded-2xl p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-[#0F291E] text-emerald-300 flex items-center justify-center shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#166534]">
                  Best Performing Classifier
                </span>
                <span className="text-[11px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  Selected Model
                </span>
              </div>
              <h2 className="font-serif-heading text-2xl sm:text-3xl font-bold text-[#0F291E]">
                {bestModelName}
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-6 text-sm">
            <div>
              <span className="text-[11px] text-[#556960] block">Top F1 Score</span>
              <span className="text-xl font-bold font-mono-code text-[#166534]">
                {((data.models_evaluated?.[bestModelName]?.f1_score || 0) * 100).toFixed(2)}%
              </span>
            </div>
            <div>
              <span className="text-[11px] text-[#556960] block">Overall Accuracy</span>
              <span className="text-xl font-bold font-mono-code text-[#0F291E]">
                {((data.models_evaluated?.[bestModelName]?.accuracy || 0) * 100).toFixed(2)}%
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-emerald-200/60 flex items-center space-x-2 text-xs text-[#166534]">
          <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{data.explanation}</span>
        </div>
      </div>

      {/* Metrics Comparison Table */}
      <div className="bg-white rounded-2xl border border-[#E7E2D9] shadow-xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-[#F0ECE1]">
          <h2 className="text-base font-bold text-[#0F291E] flex items-center space-x-2">
            <BarChart2 className="w-4 h-4 text-emerald-800" />
            <span>Empirical Test Metrics Table</span>
          </h2>
          <p className="text-xs text-[#64748B] mt-1">
            Evaluated on holdout test set (7,820 samples, 20% stratified test partition).
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-[#FAF8F5] border-b border-[#E7E2D9] text-[#475569] text-xs font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-6">Model</th>
                <th className="py-3.5 px-6">Accuracy</th>
                <th className="py-3.5 px-6">Precision</th>
                <th className="py-3.5 px-6">Recall</th>
                <th className="py-3.5 px-6">F1 Score</th>
                <th className="py-3.5 px-6">Train Time</th>
                <th className="py-3.5 px-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0ECE1] text-xs sm:text-sm">
              {modelsList.map((m) => {
                const isBest = m.name === bestModelName;
                return (
                  <tr
                    key={m.name}
                    className={`transition-colors ${
                      isBest ? 'bg-[#F4FAF6] font-medium' : 'hover:bg-[#FAF8F5]'
                    }`}
                  >
                    <td className="py-4 px-6 text-[#0F291E] font-semibold flex items-center space-x-2">
                      <span>{m.name}</span>
                      {isBest && (
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                          Best
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 font-mono-code">
                      {(m.accuracy * 100).toFixed(2)}%
                    </td>
                    <td className="py-4 px-6 font-mono-code">
                      {(m.precision * 100).toFixed(2)}%
                    </td>
                    <td className="py-4 px-6 font-mono-code">
                      {(m.recall * 100).toFixed(2)}%
                    </td>
                    <td className="py-4 px-6 font-mono-code font-bold text-[#166534]">
                      {(m.f1_score * 100).toFixed(2)}%
                    </td>
                    <td className="py-4 px-6 font-mono-code text-[#64748B]">
                      {m.train_time_seconds}s
                    </td>
                    <td className="py-4 px-6">
                      <button
                        onClick={() => setActiveModelTab(m.name)}
                        className={`text-xs px-2.5 py-1 rounded-lg font-medium cursor-pointer transition-colors ${
                          activeModelTab === m.name
                            ? 'bg-[#0F291E] text-white'
                            : 'bg-[#F2ECE0] text-[#0F291E] hover:bg-[#EAE4D7]'
                        }`}
                      >
                        Inspect Matrix
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Visual Charts Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Accuracy & F1 Bar Chart */}
        <div className="bg-white rounded-2xl border border-[#E7E2D9] p-6 shadow-xs">
          <h2 className="text-sm font-bold text-[#0F291E] mb-1">
            Performance Metrics Comparison (%)
          </h2>
          <p className="text-xs text-[#64748B] mb-6">
            Direct comparison of Accuracy and F1 Score across all three algorithms.
          </p>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0ECE1" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#475569' }} />
                <YAxis domain={[90, 100]} tick={{ fontSize: 11, fill: '#475569' }} />
                <Tooltip
                  formatter={(value) => [`${value}%`]}
                  contentStyle={{ backgroundColor: '#FAF8F5', borderColor: '#E7E2D9', borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="Accuracy" fill="#2563EB" radius={[4, 4, 0, 0]} />
                <Bar dataKey="F1" fill="#16A34A" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Precision vs Recall Bar Chart */}
        <div className="bg-white rounded-2xl border border-[#E7E2D9] p-6 shadow-xs">
          <h2 className="text-sm font-bold text-[#0F291E] mb-1">
            Precision vs. Recall Comparison (%)
          </h2>
          <p className="text-xs text-[#64748B] mb-6">
            Evaluating false positive prevention (Precision) vs. false negative prevention (Recall).
          </p>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0ECE1" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#475569' }} />
                <YAxis domain={[90, 100]} tick={{ fontSize: 11, fill: '#475569' }} />
                <Tooltip
                  formatter={(value) => [`${value}%`]}
                  contentStyle={{ backgroundColor: '#FAF8F5', borderColor: '#E7E2D9', borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="Precision" fill="#D97706" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Recall" fill="#0D9488" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Visual Confusion Matrix Section */}
      {activeModel && (
        <div className="bg-white rounded-2xl border border-[#E7E2D9] p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-[#F0ECE1] gap-3">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                Confusion Matrix Analysis
              </span>
              <h2 className="text-lg font-bold text-[#0F291E]">
                Test Set Confusion Matrix: {activeModel.name}
              </h2>
            </div>

            {/* Model Switcher Pills */}
            <div className="flex space-x-1.5 bg-[#FAF8F5] p-1 rounded-xl border border-[#E7E2D9]">
              {modelsList.map((m) => (
                <button
                  key={m.name}
                  onClick={() => setActiveModelTab(m.name)}
                  className={`px-3 py-1 text-xs rounded-lg font-medium cursor-pointer transition-all ${
                    activeModelTab === m.name
                      ? 'bg-[#0F291E] text-white shadow-2xs'
                      : 'text-[#4A5568] hover:text-[#0F291E]'
                  }`}
                >
                  {m.name}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            {/* Visual Matrix Grid */}
            <div className="md:col-span-7">
              <div className="max-w-md mx-auto">
                {/* Header labels */}
                <div className="text-center font-semibold text-xs text-[#64748B] mb-2 uppercase tracking-wider">
                  Predicted Class
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs font-semibold mb-1">
                  <div />
                  <div className="py-1 text-red-800 bg-red-50 rounded">Predicted FAKE</div>
                  <div className="py-1 text-emerald-800 bg-emerald-50 rounded">Predicted REAL</div>
                </div>

                {/* Row 1: Actual FAKE */}
                <div className="grid grid-cols-3 gap-2 items-center mb-2">
                  <div className="text-xs font-semibold text-red-800 text-right pr-2">
                    Actual FAKE
                  </div>
                  {/* TP */}
                  <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-center">
                    <span className="block text-[10px] text-red-700 uppercase font-bold">
                      True Positive (TP)
                    </span>
                    <span className="text-xl font-bold font-mono-code text-red-950">
                      {activeModel.confusion_matrix?.TP?.toLocaleString()}
                    </span>
                    <span className="block text-[10px] text-red-600 mt-0.5">Correctly caught Fake</span>
                  </div>
                  {/* FN */}
                  <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 text-center">
                    <span className="block text-[10px] text-stone-600 uppercase font-bold">
                      False Negative (FN)
                    </span>
                    <span className="text-xl font-bold font-mono-code text-stone-900">
                      {activeModel.confusion_matrix?.FN?.toLocaleString()}
                    </span>
                    <span className="block text-[10px] text-stone-500 mt-0.5">Fake missed</span>
                  </div>
                </div>

                {/* Row 2: Actual REAL */}
                <div className="grid grid-cols-3 gap-2 items-center">
                  <div className="text-xs font-semibold text-emerald-800 text-right pr-2">
                    Actual REAL
                  </div>
                  {/* FP */}
                  <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 text-center">
                    <span className="block text-[10px] text-stone-600 uppercase font-bold">
                      False Positive (FP)
                    </span>
                    <span className="text-xl font-bold font-mono-code text-stone-900">
                      {activeModel.confusion_matrix?.FP?.toLocaleString()}
                    </span>
                    <span className="block text-[10px] text-stone-500 mt-0.5">Real misflagged</span>
                  </div>
                  {/* TN */}
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                    <span className="block text-[10px] text-emerald-700 uppercase font-bold">
                      True Negative (TN)
                    </span>
                    <span className="text-xl font-bold font-mono-code text-emerald-950">
                      {activeModel.confusion_matrix?.TN?.toLocaleString()}
                    </span>
                    <span className="block text-[10px] text-emerald-600 mt-0.5">Correctly recognized Real</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Matrix Insights & Rates */}
            <div className="md:col-span-5 bg-[#FAF8F5] rounded-xl p-5 border border-[#E7E2D9] text-xs space-y-3">
              <h3 className="font-bold text-[#0F291E] text-sm">
                Statistical Summary ({activeModel.name})
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between py-1 border-b border-[#EAE5DA]">
                  <span className="text-[#64748B]">Total Test Samples:</span>
                  <span className="font-mono-code font-bold text-[#0F291E]">
                    {(
                      (activeModel.confusion_matrix?.TP || 0) +
                      (activeModel.confusion_matrix?.FN || 0) +
                      (activeModel.confusion_matrix?.FP || 0) +
                      (activeModel.confusion_matrix?.TN || 0)
                    ).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#EAE5DA]">
                  <span className="text-[#64748B]">Probability Calibration:</span>
                  <span className="font-semibold text-[#0F291E]">{activeModel.probability_method}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#EAE5DA]">
                  <span className="text-[#64748B]">False Alarm Rate (FPR):</span>
                  <span className="font-mono-code font-bold text-stone-800">
                    {(
                      ((activeModel.confusion_matrix?.FP || 0) /
                        ((activeModel.confusion_matrix?.FP || 0) + (activeModel.confusion_matrix?.TN || 1))) *
                      100
                    ).toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[#64748B]">Missed Fake Rate (FNR):</span>
                  <span className="font-mono-code font-bold text-stone-800">
                    {(
                      ((activeModel.confusion_matrix?.FN || 0) /
                        ((activeModel.confusion_matrix?.TP || 0) + (activeModel.confusion_matrix?.FN || 1))) *
                      100
                    ).toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
