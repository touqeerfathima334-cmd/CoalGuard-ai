import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, BrainCircuit, Gauge, Sparkles, Loader2 } from "lucide-react";
import { api } from "../services/api.js";
import RiskBadge from "./RiskBadge.jsx";
import SeverityBadge from "./SeverityBadge.jsx";

/**
 * Explainable AI panel: shown when the user clicks "Analyze Risk" on a mine.
 * Fetches the live, deterministic risk breakdown (score, per-factor point
 * contribution, plain-language explanation, recommendation, and a
 * confidence score) from GET /api/risk/:mineId.
 */
export default function AnalyzeRiskModal({ mine, onClose }) {
  const [risk, setRisk] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!mine) return;
    setLoading(true);
    // Small artificial delay so the "AI is analyzing" state is visible in the demo.
    const t = setTimeout(() => {
      api.getMineRisk(mine.id).then((r) => { setRisk(r); setLoading(false); });
    }, 550);
    return () => clearTimeout(t);
  }, [mine]);

  const maxPoints = { violationRisk: 30, complianceRisk: 25, incidentRisk: 20, inspectionRisk: 15, correctiveDelayRisk: 10 };
  const maxByIndex = [30, 25, 20, 15, 10];

  return (
    <AnimatePresence>
      {mine && (
        <motion.div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start sm:items-center justify-center p-4 overflow-y-auto"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="card w-full max-w-xl p-6 my-6"
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.97 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-brand-500/15 flex items-center justify-center text-brand-400">
                  <BrainCircuit size={18} />
                </div>
                <div>
                  <p className="font-semibold text-white">AI Risk Analysis</p>
                  <p className="text-xs text-slate-500">{mine.name}</p>
                </div>
              </div>
              <button onClick={onClose}><X size={18} className="text-slate-500" /></button>
            </div>

            {loading || !risk ? (
              <div className="py-14 flex flex-col items-center text-slate-400 gap-2">
                <Loader2 size={22} className="animate-spin text-brand-400" />
                <p className="text-sm">Running explainable risk model...</p>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="flex items-center gap-4">
                  <div
                    className="w-20 h-20 rounded-full flex flex-col items-center justify-center border-4"
                    style={{ borderColor: riskColor(risk.level) }}
                  >
                    <span className="text-xl font-extrabold text-white">{risk.score}</span>
                    <span className="text-[10px] text-slate-500">/ 100</span>
                  </div>
                  <div>
                    <RiskBadge level={risk.level} size="lg" />
                    <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-400">
                      <Gauge size={13} /> Confidence: <span className="font-semibold text-slate-200">{risk.confidence}%</span>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Factor Contribution</p>
                  <div className="space-y-2">
                    {risk.factors.map((f, idx) => (
                      <div key={f.label}>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-slate-300">{f.label}</span>
                          <span className="flex items-center gap-2">
                            <SeverityBadge severity={f.severity} />
                            <span className="text-slate-500">+{f.points} pts</span>
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                          <motion.div
                            className="h-full rounded-full"
                            style={{ background: riskColor(f.severity === "High" ? "CRITICAL" : f.severity === "Medium" ? "HIGH" : "LOW") }}
                            initial={{ width: 0 }}
                            animate={{ width: `${(f.points / maxByIndex[idx]) * 100}%` }}
                            transition={{ duration: 0.5, delay: idx * 0.05 }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Why this mine is risky</p>
                  <p className="text-sm text-slate-300 leading-relaxed bg-white/[0.03] border border-white/10 rounded-xl p-3">{risk.explanation}</p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                    <Sparkles size={12} className="text-accent-500" /> AI Recommendation
                  </p>
                  <p className="text-sm text-slate-100 bg-brand-500/10 border border-brand-500/20 rounded-xl p-3">{risk.recommendation}</p>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function riskColor(level) {
  return { LOW: "#34d399", MEDIUM: "#fbbf24", HIGH: "#fb923c", CRITICAL: "#f87171" }[level] || "#94a3b8";
}
