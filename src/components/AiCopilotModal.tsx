import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Send,
  PackageCheck,
  Clock,
  DollarSign,
  ShieldCheck,
  RefreshCw,
  X,
  HelpCircle,
  Lightbulb,
} from 'lucide-react';
import { ReorderRecommendation, ExpiryRisk, Branch } from '../types.ts';

interface AiCopilotModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBranch: Branch;
}

export const AiCopilotModal: React.FC<AiCopilotModalProps> = ({
  isOpen,
  onClose,
  currentBranch,
}) => {
  const [activeTab, setActiveTab] = useState<'REORDER' | 'EXPIRY' | 'CHAT'>('REORDER');
  const [reorders, setReorders] = useState<ReorderRecommendation[]>([]);
  const [expiryRisks, setExpiryRisks] = useState<ExpiryRisk[]>([]);
  const [loading, setLoading] = useState(false);

  // Chat State
  const [query, setQuery] = useState('');
  const [chatMessages, setChatMessages] = useState<
    { role: 'user' | 'assistant'; text: string; source?: string }[]
  >([
    {
      role: 'assistant',
      text: 'Hello! I am **PharmaCore AI Intelligence**. I analyze your live multi-branch inventory, batch FEFO expiry timelines, daily sales velocity, and profit margins. How can I assist your pharmacy operations today?',
    },
  ]);
  const [isAsking, setIsAsking] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchInsights();
    }
  }, [isOpen, currentBranch]);

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const branchParam = currentBranch?.id || 'branch-1';
      const [reorderRes, expiryRes] = await Promise.all([
        fetch(`/api/v1/ai/reorder-recommendations?branchId=${branchParam}`),
        fetch(`/api/v1/ai/expiry-risks?branchId=${branchParam}`),
      ]);
      const reorderData = await reorderRes.json();
      const expiryData = await expiryRes.json();
      setReorders(reorderData);
      setExpiryRisks(expiryData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSendQuery = async (customQuery?: string) => {
    const q = customQuery || query;
    if (!q.trim()) return;

    const userMessage = { role: 'user' as const, text: q };
    setChatMessages((prev) => [...prev, userMessage]);
    setQuery('');
    setIsAsking(true);

    try {
      const res = await fetch('/api/v1/ai/ask-analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: q,
          branchId: currentBranch?.id || 'branch-1',
        }),
      });
      const data = await res.json();
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: data.answer || 'Analysis complete.',
          source: data.source,
        },
      ]);
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: 'Unable to reach analytics engine. Please check system logs.',
        },
      ]);
    } finally {
      setIsAsking(false);
    }
  };

  const suggestedQuestions = [
    'What are my top medicines by velocity and profit margin?',
    'Which batches are at risk of expiring in the next 60 days?',
    'What is our current net operating profit and COGS?',
    'Suggest a reorder plan for low-stock antibiotics.',
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="flex h-[85vh] w-full max-w-4xl flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
              <Sparkles className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-800">PharmaCore AI Intelligence Copilot</h2>
                <span className="rounded bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700 border border-blue-200">
                  Gemini 3.7 Flash
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Predictive reorder recommendations, FEFO loss prevention, and natural language analytics.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchInsights}
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-slate-700 shadow-xs"
              title="Refresh AI Models"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-blue-600' : ''}`} />
            </button>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50/50 px-6 pt-2">
          <button
            onClick={() => setActiveTab('REORDER')}
            className={`px-4 py-2 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'REORDER'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <PackageCheck className="h-3.5 w-3.5" />
            <span>Smart Reorder Forecast ({reorders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('EXPIRY')}
            className={`px-4 py-2 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'EXPIRY'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>Expiry Risk Predictor ({expiryRisks.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('CHAT')}
            className={`px-4 py-2 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'CHAT'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Clinical & Business Q&A</span>
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* TAB 1: Smart Reorder */}
          {activeTab === 'REORDER' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-4 text-xs text-blue-900">
                <div className="font-bold flex items-center gap-1.5 text-blue-700">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  <span>Velocity-Based Automated Reorder Recommendations</span>
                </div>
                <p className="mt-1 text-slate-600">
                  Calculated based on 30-day dispensing consumption velocity, minimum safety thresholds, and 5-day supplier delivery lead time.
                </p>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold uppercase text-slate-500">
                    <tr>
                      <th className="py-3 px-4">Medicine & SKU</th>
                      <th className="py-3 px-4">Current Stock</th>
                      <th className="py-3 px-4">Daily Velocity</th>
                      <th className="py-3 px-4">Suggested Reorder</th>
                      <th className="py-3 px-4">Est. Investment</th>
                      <th className="py-3 px-4 text-right">Priority</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {reorders.map((r) => (
                      <tr key={r.productId} className="hover:bg-slate-50 transition">
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900">{r.productName}</div>
                          <div className="text-[10px] font-mono text-slate-400">SKU: {r.sku}</div>
                        </td>

                        <td className="py-3 px-4 font-mono font-bold text-red-600">{r.currentStock} units</td>

                        <td className="py-3 px-4 text-slate-600">{r.dailyVelocity.toFixed(1)} units/day</td>

                        <td className="py-3 px-4 font-bold text-green-700">{r.suggestedOrderQuantity} units</td>

                        <td className="py-3 px-4 font-mono text-slate-900">${r.estimatedCost.toFixed(2)}</td>

                        <td className="py-3 px-4 text-right">
                          <span
                            className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                              r.priority === 'HIGH'
                                ? 'bg-red-50 text-red-700 border border-red-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {r.priority} PRIORITY
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: Expiry Risk Predictor */}
          {activeTab === 'EXPIRY' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-xs text-amber-900">
                <div className="font-bold flex items-center gap-1.5 text-amber-700">
                  <Clock className="h-4 w-4 text-amber-600" />
                  <span>Proactive Expiry & Financial Loss Prevention</span>
                </div>
                <p className="mt-1 text-slate-600">
                  Batches nearing expiry threshold (&lt;90 days). Take proactive actions such as promotional discounts or inter-branch transfers to prevent write-offs.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {expiryRisks.map((risk) => (
                  <div
                    key={risk.batchId}
                    className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-bold text-slate-900 text-sm">{risk.productName}</div>
                        <div className="text-[11px] font-mono text-slate-400">Batch: {risk.batchNumber}</div>
                      </div>
                      <span className="rounded bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-200">
                        {risk.daysToExpiry} Days Left
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-700">
                      <div>
                        <span className="text-slate-500">Units in Stock:</span>{' '}
                        <span className="font-bold text-slate-900">{risk.quantity}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Value at Risk:</span>{' '}
                        <span className="font-bold text-red-600 font-mono">
                          ${risk.potentialLoss.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="rounded-lg bg-slate-50 p-2.5 text-xs border border-slate-200">
                      <div className="text-blue-700 font-semibold text-[11px] flex items-center gap-1">
                        <Lightbulb className="h-3 w-3 text-blue-600" /> Recommended Strategy:
                      </div>
                      <p className="text-slate-600 text-[11px] mt-0.5">{risk.recommendedAction}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: Natural Language Executive Chat */}
          {activeTab === 'CHAT' && (
            <div className="flex h-full flex-col justify-between space-y-4">
              {/* Message Feed */}
              <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                {chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-blue-600 text-white rounded-br-none shadow-xs'
                          : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-bl-none shadow-xs'
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{msg.text}</div>
                      {msg.source && (
                        <div className="mt-2 text-[10px] text-slate-400 font-mono">
                          Engine: {msg.source}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {isAsking && (
                  <div className="flex items-center gap-2 text-xs text-blue-600 animate-pulse">
                    <Sparkles className="h-4 w-4 animate-spin" />
                    <span>Analyzing live pharmacy database...</span>
                  </div>
                )}
              </div>

              {/* Suggested Questions */}
              <div className="space-y-2 pt-2">
                <div className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">
                  Suggested Analytics Prompts
                </div>
                <div className="flex flex-wrap gap-2">
                  {suggestedQuestions.map((sq, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendQuery(sq)}
                      className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] text-slate-700 hover:border-blue-400 hover:text-blue-600 shadow-xs transition"
                    >
                      {sq}
                    </button>
                  ))}
                </div>

                {/* Input form */}
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendQuery()}
                    placeholder="Ask about margins, batch expiry dates, demand forecasting, or suppliers..."
                    className="flex-1 rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-4 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none"
                  />
                  <button
                    onClick={() => handleSendQuery()}
                    disabled={isAsking || !query.trim()}
                    className="rounded-xl bg-blue-600 p-2.5 text-white hover:bg-blue-500 disabled:opacity-40 shadow-xs transition"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
