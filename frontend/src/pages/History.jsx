import React, { useState, useEffect } from 'react';
import {
  History as HistoryIcon,
  Trash2,
  FileText,
  AlertTriangle,
  ShieldCheck,
  Calendar,
  ExternalLink,
  Download
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function History() {
  const [historyItems, setHistoryItems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('truthlens_history') || '[]');
      setHistoryItems(stored);
    } catch (e) {
      setHistoryItems([]);
    }
  }, []);

  const handleClearHistory = () => {
    localStorage.removeItem('truthlens_history');
    setHistoryItems([]);
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(historyItems, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `truthlens_predictions_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#E7E2D9]">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#EAE4D7] text-[#0F291E] text-xs font-semibold uppercase mb-2">
            <HistoryIcon className="w-3.5 h-3.5 text-emerald-800" />
            <span>Session Audit Log</span>
          </div>
          <h1 className="font-serif-heading text-3xl sm:text-4xl font-bold tracking-tight text-[#0F291E]">
            Prediction History
          </h1>
          <p className="text-xs sm:text-sm text-[#556960] mt-1">
            Articles evaluated during your active browser session (stored locally).
          </p>
        </div>

        {historyItems.length > 0 && (
          <div className="flex items-center space-x-3">
            <button
              onClick={handleExportJSON}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl border border-[#D5CEBE] bg-white text-xs font-medium text-[#334155] hover:bg-[#F9F7F2] transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>
            <button
              onClick={handleClearHistory}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-red-50 text-red-700 hover:bg-red-100 text-xs font-medium transition-colors cursor-pointer border border-red-200"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          </div>
        )}
      </div>

      {/* History Table */}
      {historyItems.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E7E2D9] p-12 text-center shadow-xs">
          <FileText className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-[#1F2937]">No predictions logged yet</h3>
          <p className="text-xs text-[#64748B] mt-1 max-w-sm mx-auto">
            Analyze a news article on the Detector page to build your session audit history.
          </p>
          <button
            onClick={() => navigate('/')}
            className="mt-5 px-4 py-2 rounded-xl bg-[#0F291E] text-white text-xs font-semibold hover:bg-[#1A4232] transition-colors cursor-pointer"
          >
            Go to Detector
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E7E2D9] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-[#FAF8F5] border-b border-[#E7E2D9] text-[#475569] text-xs font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-6">Timestamp</th>
                  <th className="py-3.5 px-6">Article Preview</th>
                  <th className="py-3.5 px-6">Prediction</th>
                  <th className="py-3.5 px-6">Confidence</th>
                  <th className="py-3.5 px-6">Model</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0ECE1] text-xs sm:text-sm">
                {historyItems.map((item) => {
                  const isFake = item.prediction === 'FAKE';
                  const dateStr = new Date(item.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  });

                  return (
                    <tr key={item.id} className="hover:bg-[#FAF8F5] transition-colors">
                      <td className="py-4 px-6 text-[#64748B] font-mono-code text-xs whitespace-nowrap">
                        <span className="flex items-center space-x-1.5">
                          <Calendar className="w-3 h-3 opacity-60" />
                          <span>{dateStr}</span>
                        </span>
                      </td>

                      <td className="py-4 px-6 text-[#1F2937] max-w-md">
                        <p className="truncate line-clamp-2 text-xs leading-relaxed">
                          {item.preview}
                        </p>
                      </td>

                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                            isFake
                              ? 'bg-red-100 text-red-800 border border-red-200'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          {isFake ? <AlertTriangle className="w-3 h-3" /> : <ShieldCheck className="w-3 h-3" />}
                          <span>{item.prediction}</span>
                        </span>
                      </td>

                      <td className="py-4 px-6 font-mono-code font-bold text-xs text-[#0F291E]">
                        {(item.confidence * 100).toFixed(1)}%
                      </td>

                      <td className="py-4 px-6 text-xs text-[#64748B] font-mono-code">
                        {item.model}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
