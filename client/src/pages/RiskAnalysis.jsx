import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BrainCircuit, TrendingUp, Info, Sparkles } from "lucide-react";
import { api } from "../services/api.js";
import RiskBadge from "../components/RiskBadge.jsx";
import SeverityBadge from "../components/SeverityBadge.jsx";
import LoadingState from "../components/LoadingState.jsx";
import AnalyzeRiskModal from "../components/AnalyzeRiskModal.jsx";

export default function RiskAnalysis() {
  const [risks, setRisks] = useState([]);
  const [mines, setMines] = useState([]);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [analyzing, setAnalyzing] = useState(null);

  useEffect(() => {
    Promise.all([api.getRisk(), api.getMines(), api.getTrendInsights()]).then(([r, m, i]) => {
      setRisks(r); setMines(m); setInsights(i); setLoading(false);
    });
  }, []);

  const mineOf = (id) => mines.find((m) => m.id === id);

  if (loading) return <LoadingState label="Running AI risk engine..." />;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <BrainCircuit size={22} className="text-brand-400" />
        <div>
          <h1 className="text-xl font-bold text-white">AI Risk Analysis</h1>
          <p className="text-sm text-slate-400">Explainable, deterministic scoring — same inputs always produce the same score.</p>
        </div>
      </div>

      <div className="card p-4 bg-brand-500/10 border-brand-500/20 flex items-start gap-2">
        <Info size={16} className="text-brand-400 mt-0.5 shrink-0" />
        <p className="text-xs text-slate-300 leading-relaxed">
          Risk Score = Violation Risk (0–30) + Compliance Risk (0–25) + Incident Risk (0–20) + Inspection Risk (0–15) + Corrective Action Delay Risk (0–10), normalized to 0–100.
          Classification: 0–30 Low · 31–60 Medium · 61–80 High · 81–100 Critical. This is a rule-based, AI-inspired engine — structured so a trained ML model can later replace it without changing the interface.
        </p>
      </div>

      <div className="space-y-3">
        {risks.map((r) => {
          const mine = mineOf(r.mineId);
          if (!mine) return null;
          const isOpen = expanded === r.mineId;
          return (
            <div key={r.mineId} className="card p-4">
              <div className="flex items-center justify-between gap-3 cursor-pointer" onClick={() => setExpanded(isOpen ? null : r.mineId)}>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm" style={{ background: riskBg(r.level), color: riskFg(r.level) }}>
                    {r.score}
                  </div>
                  <div>
                    <p className="font-semibold text-white">{mine.name}</p>
                    <p className="text-xs text-slate-500">{mine.state} · {mine.code}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <RiskBadge level={r.level} size="lg" />
                  <button onClick={(e) => { e.stopPropagation(); setAnalyzing(mine); }} className="btn-primary text-xs py-1.5">
                    <Sparkles size={12} /> Analyze Risk
                  </button>
                  <Link to={`/mines/${mine.id}`} onClick={(e) => e.stopPropagation()} className="btn-secondary text-xs py-1.5 hidden sm:inline-flex">Mine Details</Link>
                </div>
              </div>

              {isOpen && (
                <div className="mt-4 pt-4 border-t border-white/[0.06] grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase mb-2">Risk Factors</p>
                    <div className="space-y-1.5">
                      {r.factors.map((f) => (
                        <div key={f.label} className="flex items-center justify-between text-sm bg-white/[0.03] rounded-lg px-3 py-2">
                          <span className="text-slate-300">{f.label}</span>
                          <span className="flex items-center gap-2">
                            <span className="text-xs text-slate-500">+{f.points} pts</span>
                            <SeverityBadge severity={f.severity} />
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase mb-2">AI Recommendation</p>
                    <p className="text-sm text-slate-200 bg-brand-500/10 border border-brand-500/20 rounded-lg p-3">{r.recommendation}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="card p-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp size={16} className="text-accent-500" />
          <p className="font-semibold text-slate-200">AI Anomaly & Trend Detection</p>
        </div>
        {insights.length === 0 ? (
          <p className="text-sm text-slate-500 py-4 text-center">No unusual trends detected in the current dataset.</p>
        ) : (
          <div className="space-y-2">
            {insights.map((i, idx) => (
              <div key={idx} className="flex items-start justify-between gap-3 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2.5">
                <div>
                  <p className="text-sm font-medium text-slate-200">{i.message}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{i.recommendation}</p>
                </div>
                <span className="badge bg-amber-500/15 text-amber-400 shrink-0">{i.type}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <AnalyzeRiskModal mine={analyzing} onClose={() => setAnalyzing(null)} />
    </div>
  );
}

function riskBg(level) {
  return { LOW: "#d1fae5", MEDIUM: "#fef3c7", HIGH: "#ffedd5", CRITICAL: "#fee2e2" }[level];
}
function riskFg(level) {
  return { LOW: "#047857", MEDIUM: "#b45309", HIGH: "#c2410c", CRITICAL: "#b91c1c" }[level];
}
