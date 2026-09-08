import React, { useEffect, useState } from "react";
import { Plus, X, Sparkles, CheckCircle2 } from "lucide-react";
import { api } from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../components/Toast.jsx";
import SeverityBadge from "../components/SeverityBadge.jsx";
import RiskBadge from "../components/RiskBadge.jsx";
import LoadingState from "../components/LoadingState.jsx";
import EmptyState from "../components/EmptyState.jsx";
import { formatDate, mineName } from "../utils/format.js";

const TYPES = ["Safety", "Environment", "Labour", "Equipment", "Operational", "Emergency"];
const SEVERITIES = ["Low", "Medium", "High", "Critical"];

const emptyForm = {
  mineId: "", type: "Safety", date: new Date().toISOString().slice(0, 10), time: "10:00",
  location: "", observation: "", severity: "Medium", comments: "",
};

export default function Inspections() {
  const { user } = useAuth();
  const toast = useToast();
  const [inspections, setInspections] = useState([]);
  const [mines, setMines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [typeFilter, setTypeFilter] = useState("");

  const load = async () => {
    setLoading(true);
    const [i, m] = await Promise.all([api.getInspections(), api.getMines()]);
    setInspections(i); setMines(m); setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = typeFilter ? inspections.filter((i) => i.type === typeFilter) : inspections;

  const submit = async (e) => {
    e.preventDefault();
    if (!form.mineId || !form.location || !form.observation) {
      toast.push("Please fill in mine, location and observation.", "error");
      return;
    }
    setSubmitting(true);
    try {
      const result = await api.createInspection({
        ...form,
        inspector: user.name,
        evidence: "field_evidence.jpg",
      });
      setAiResult(result);
      setInspections((prev) => [result.inspection, ...prev]);
      const updatedMines = await api.getMines();
      setMines(updatedMines);
      toast.push("Inspection submitted.");
    } catch (e2) {
      toast.push(e2.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setAiResult(null);
    setForm(emptyForm);
  };

  if (loading) return <LoadingState label="Loading inspections..." />;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">Inspection Management</h1>
          <p className="text-sm text-slate-400">{inspections.length} inspections recorded</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary"><Plus size={16} /> New Inspection</button>
      </div>

      <div className="card p-3">
        <select className="input sm:w-56" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="">All Inspection Types</option>
          {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="card"><EmptyState title="No inspections found" /></div>
      ) : (
        <div className="space-y-2">
          {filtered.map((i) => (
            <div key={i.id} className="card p-4 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium text-white">{i.type} Inspection · {mineName(mines, i.mineId)}</p>
                  <SeverityBadge severity={i.severity} />
                </div>
                <p className="text-sm text-slate-400 mt-1">{i.observation}</p>
                <p className="text-xs text-slate-500 mt-1">{i.inspector} · {i.location} · {formatDate(i.date)} {i.time}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-start sm:items-center justify-center p-4 overflow-y-auto">
          <div className="card w-full max-w-lg p-5 my-6">
            <div className="flex items-center justify-between mb-4">
              <p className="font-semibold text-white">{aiResult ? "Inspection Submitted" : "New Inspection"}</p>
              <button onClick={closeModal}><X size={18} className="text-slate-500" /></button>
            </div>

            {!aiResult ? (
              <form onSubmit={submit} className="space-y-3">
                <div>
                  <label className="label">Mine</label>
                  <select required className="input" value={form.mineId} onChange={(e) => setForm((f) => ({ ...f, mineId: e.target.value }))}>
                    <option value="">Select mine</option>
                    {mines.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Inspection Type</label>
                    <select className="input" value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
                      {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Severity</label>
                    <select className="input" value={form.severity} onChange={(e) => setForm((f) => ({ ...f, severity: e.target.value }))}>
                      {SEVERITIES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Date</label>
                    <input type="date" className="input" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
                  </div>
                  <div>
                    <label className="label">Time</label>
                    <input type="time" className="input" value={form.time} onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <label className="label">Location / GPS</label>
                  <input required className="input" placeholder="e.g. Shaft B-2" value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Observation</label>
                  <textarea required rows={3} className="input" placeholder="Describe the observation..." value={form.observation} onChange={(e) => setForm((f) => ({ ...f, observation: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Comments</label>
                  <input className="input" value={form.comments} onChange={(e) => setForm((f) => ({ ...f, comments: e.target.value }))} />
                </div>
                <div className="pt-2 flex justify-end gap-2">
                  <button type="button" onClick={closeModal} className="btn-secondary">Cancel</button>
                  <button type="submit" disabled={submitting} className="btn-primary">{submitting ? "Submitting..." : "Submit Inspection"}</button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle2 size={18} /> <span className="text-sm font-medium">Inspection recorded successfully.</span>
                </div>
                <div className="border border-brand-500/20 bg-brand-500/10 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles size={15} className="text-accent-500" />
                    <p className="text-sm font-semibold text-slate-200">AI Analysis</p>
                  </div>
                  <p className="text-sm text-slate-200 mb-2">
                    Risk Score changed from <span className="font-semibold">{aiResult.riskBefore}</span> to{" "}
                    <span className="font-semibold">{aiResult.riskAfter}</span>
                    {" "}<RiskBadge level={aiResult.riskLevel} />
                  </p>
                  <p className="text-sm text-slate-300 bg-white/[0.04] rounded-lg px-3 py-2 border border-white/[0.06]">
                    <span className="font-semibold text-brand-400">Recommended Action: </span>{aiResult.recommendation}
                  </p>
                  {aiResult.alert && (
                    <p className="text-xs text-red-400 mt-2 font-medium">⚠ A critical alert was generated for this mine.</p>
                  )}
                </div>
                <div className="flex justify-end gap-2">
                  <button onClick={closeModal} className="btn-secondary">Close</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
