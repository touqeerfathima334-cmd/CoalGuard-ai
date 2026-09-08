import React, { useEffect, useState } from "react";
import { Plus, X, Users, Eye } from "lucide-react";
import { api } from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../components/Toast.jsx";
import RiskBadge from "../components/RiskBadge.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import LoadingState from "../components/LoadingState.jsx";
import EmptyState from "../components/EmptyState.jsx";
import { mineName } from "../utils/format.js";

export default function Contractors() {
  const { user } = useAuth();
  const toast = useToast();
  const [contractors, setContractors] = useState([]);
  const [mines, setMines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewing, setViewing] = useState(null);
  const [form, setForm] = useState({ name: "", mineId: "", workers: "", compliancePct: "", safetyTrainingPct: "" });

  const load = async () => {
    setLoading(true);
    const [c, m] = await Promise.all([api.getContractors(), api.getMines()]);
    setContractors(c); setMines(m); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    const compliancePct = Number(form.compliancePct);
    const risk = compliancePct >= 85 ? "LOW" : compliancePct >= 70 ? "MEDIUM" : "HIGH";
    try {
      const created = await api.createContractor({
        ...form, workers: Number(form.workers), compliancePct, safetyTrainingPct: Number(form.safetyTrainingPct),
        risk, actor: user.name, actorRole: user.role,
      });
      setContractors((cs) => [created, ...cs]);
      toast.push("Contractor added.");
      setModalOpen(false);
      setForm({ name: "", mineId: "", workers: "", compliancePct: "", safetyTrainingPct: "" });
    } catch (e2) { toast.push(e2.message, "error"); }
  };

  if (loading) return <LoadingState label="Loading contractors..." />;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">Contractor Management</h1>
          <p className="text-sm text-slate-400">{contractors.length} registered contractors</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary"><Plus size={16} /> Add Contractor</button>
      </div>

      {contractors.length === 0 ? (
        <div className="card"><EmptyState icon={Users} title="No contractors yet" /></div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {contractors.map((c) => (
            <div key={c.id} className="card p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-white">{c.name}</p>
                  <p className="text-xs text-slate-500">{mineName(mines, c.mineId)}</p>
                </div>
                <RiskBadge level={c.risk} />
              </div>
              <div className="mt-3 space-y-1.5 text-sm">
                <div className="flex justify-between"><span className="text-slate-400">Workers</span><span className="font-medium">{c.workers}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Compliance</span><span className="font-medium">{c.compliancePct}%</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Safety Training</span><span className="font-medium">{c.safetyTrainingPct}%</span></div>
                <div className="flex justify-between items-center"><span className="text-slate-400">Status</span><StatusBadge status={c.contractStatus} /></div>
              </div>
              <button onClick={() => setViewing(c)} className="btn-secondary text-xs w-full mt-3 justify-center"><Eye size={13} /> View Details</button>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="card w-full max-w-md p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="font-semibold text-white">Add Contractor</p>
              <button onClick={() => setModalOpen(false)}><X size={18} className="text-slate-500" /></button>
            </div>
            <form onSubmit={submit} className="space-y-3">
              <div><label className="label">Contractor Name</label><input required className="input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></div>
              <div>
                <label className="label">Mine</label>
                <select required className="input" value={form.mineId} onChange={(e) => setForm((f) => ({ ...f, mineId: e.target.value }))}>
                  <option value="">Select mine</option>
                  {mines.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div><label className="label">Workers</label><input type="number" required className="input" value={form.workers} onChange={(e) => setForm((f) => ({ ...f, workers: e.target.value }))} /></div>
                <div><label className="label">Compliance %</label><input type="number" min="0" max="100" required className="input" value={form.compliancePct} onChange={(e) => setForm((f) => ({ ...f, compliancePct: e.target.value }))} /></div>
                <div><label className="label">Training %</label><input type="number" min="0" max="100" required className="input" value={form.safetyTrainingPct} onChange={(e) => setForm((f) => ({ ...f, safetyTrainingPct: e.target.value }))} /></div>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Add Contractor</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewing && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setViewing(null)}>
          <div className="card w-full max-w-sm p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <p className="font-semibold text-white">{viewing.name}</p>
              <button onClick={() => setViewing(null)}><X size={18} className="text-slate-500" /></button>
            </div>
            <dl className="text-sm space-y-2">
              <div className="flex justify-between"><dt className="text-slate-400">Mine</dt><dd className="font-medium">{mineName(mines, viewing.mineId)}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-400">Workers</dt><dd className="font-medium">{viewing.workers}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-400">Compliance</dt><dd className="font-medium">{viewing.compliancePct}%</dd></div>
              <div className="flex justify-between"><dt className="text-slate-400">Safety Training</dt><dd className="font-medium">{viewing.safetyTrainingPct}%</dd></div>
              <div className="flex justify-between"><dt className="text-slate-400">Contract Status</dt><dd><StatusBadge status={viewing.contractStatus} /></dd></div>
              <div className="flex justify-between"><dt className="text-slate-400">Risk</dt><dd><RiskBadge level={viewing.risk} /></dd></div>
            </dl>
          </div>
        </div>
      )}
    </div>
  );
}
