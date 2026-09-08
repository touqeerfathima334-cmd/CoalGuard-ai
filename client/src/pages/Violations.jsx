import React, { useEffect, useMemo, useState } from "react";
import { Plus, X } from "lucide-react";
import { api } from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../components/Toast.jsx";
import SeverityBadge from "../components/SeverityBadge.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import LoadingState from "../components/LoadingState.jsx";
import EmptyState from "../components/EmptyState.jsx";
import { formatDate, mineName } from "../utils/format.js";

const STATUSES = ["OPEN", "IN PROGRESS", "RESOLVED", "VERIFIED", "CLOSED"];
const CATEGORIES = ["Safety", "Environment", "Labour", "Production", "Statutory", "Equipment"];
const SEVERITIES = ["Low", "Medium", "High", "Critical"];

export default function Violations() {
  const { user } = useAuth();
  const toast = useToast();
  const [violations, setViolations] = useState([]);
  const [mines, setMines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ mineId: "", status: "" });
  const [modalOpen, setModalOpen] = useState(false);
  const [caModal, setCaModal] = useState(null);
  const [form, setForm] = useState({ mineId: "", category: "Safety", description: "", severity: "Medium", responsiblePerson: "" });

  const load = async () => {
    setLoading(true);
    const [v, m] = await Promise.all([api.getViolations(), api.getMines()]);
    setViolations(v); setMines(m); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => violations.filter((v) =>
    (!filters.mineId || v.mineId === filters.mineId) && (!filters.status || v.status === filters.status)
  ), [violations, filters]);

  const updateStatus = async (v, status) => {
    try {
      const updated = await api.updateViolation(v.id, { status, actor: user.name, actorRole: user.role });
      setViolations((vs) => vs.map((x) => (x.id === v.id ? updated : x)));
      const m = await api.getMines(); setMines(m);
      toast.push(`Violation status updated to ${status}.`);
    } catch (e) { toast.push(e.message, "error"); }
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      const created = await api.createViolation({ ...form, actor: user.name, actorRole: user.role });
      setViolations((vs) => [created, ...vs]);
      const m = await api.getMines(); setMines(m);
      toast.push("Violation created.");
      setModalOpen(false);
      setForm({ mineId: "", category: "Safety", description: "", severity: "Medium", responsiblePerson: "" });
    } catch (e2) { toast.push(e2.message, "error"); }
  };

  const createCorrectiveAction = async (v) => {
    try {
      await api.createCorrectiveAction({
        mineId: v.mineId, violationId: v.id, title: `Address: ${v.description}`,
        priority: v.severity.toUpperCase(), assignedTo: v.responsiblePerson,
        deadline: new Date(Date.now() + 7 * 86400000).toISOString(),
        actor: user.name, actorRole: user.role,
      });
      toast.push("Corrective action created.");
      setCaModal(null);
    } catch (e) { toast.push(e.message, "error"); }
  };

  if (loading) return <LoadingState label="Loading violations..." />;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">Violation Management</h1>
          <p className="text-sm text-slate-400">{filtered.length} of {violations.length} violations</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary"><Plus size={16} /> Create Violation</button>
      </div>

      <div className="card p-3 grid sm:grid-cols-2 gap-2">
        <select className="input" value={filters.mineId} onChange={(e) => setFilters((f) => ({ ...f, mineId: e.target.value }))}>
          <option value="">All Mines</option>
          {mines.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
        <select className="input" value={filters.status} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}>
          <option value="">All Statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="card"><EmptyState title="No violations found" /></div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-xs text-slate-500 uppercase border-b border-white/[0.06]">
              <th className="px-4 py-3 font-medium">Violation</th><th className="px-4 py-3 font-medium">Mine</th>
              <th className="px-4 py-3 font-medium">Category</th><th className="px-4 py-3 font-medium">Severity</th>
              <th className="px-4 py-3 font-medium">Reported</th><th className="px-4 py-3 font-medium">Status</th><th className="px-4 py-3 font-medium">Actions</th>
            </tr></thead>
            <tbody>
              {filtered.map((v) => (
                <tr key={v.id} className="border-b border-slate-50 last:border-0 hover:bg-white/[0.03]">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-200 max-w-xs">{v.description}</p>
                    <p className="text-xs text-slate-500">{v.id.toUpperCase()} · {v.responsiblePerson}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-400">{mineName(mines, v.mineId)}</td>
                  <td className="px-4 py-3 text-slate-400">{v.category}</td>
                  <td className="px-4 py-3"><SeverityBadge severity={v.severity} /></td>
                  <td className="px-4 py-3 text-slate-400">{formatDate(v.reportedDate)}</td>
                  <td className="px-4 py-3">
                    <select value={v.status} onChange={(e) => updateStatus(v, e.target.value)} className="text-xs border-none bg-transparent font-medium cursor-pointer">
                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => setCaModal(v)} className="text-xs text-brand-400 font-medium hover:underline">+ Corrective Action</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="card w-full max-w-md p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="font-semibold text-white">Create Violation</p>
              <button onClick={() => setModalOpen(false)}><X size={18} className="text-slate-500" /></button>
            </div>
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
                  <label className="label">Category</label>
                  <select className="input" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Severity</label>
                  <select className="input" value={form.severity} onChange={(e) => setForm((f) => ({ ...f, severity: e.target.value }))}>
                    {SEVERITIES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Description</label>
                <textarea required rows={3} className="input" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
              </div>
              <div>
                <label className="label">Responsible Person</label>
                <input required className="input" value={form.responsiblePerson} onChange={(e) => setForm((f) => ({ ...f, responsiblePerson: e.target.value }))} />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Create Violation</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {caModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="card w-full max-w-sm p-5">
            <p className="font-semibold text-white mb-2">Create Corrective Action</p>
            <p className="text-sm text-slate-400 mb-4">For: {caModal.description}</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setCaModal(null)} className="btn-secondary">Cancel</button>
              <button onClick={() => createCorrectiveAction(caModal)} className="btn-primary">Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
