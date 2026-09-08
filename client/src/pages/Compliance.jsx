import React, { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Upload, Eye, X } from "lucide-react";
import { api } from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../components/Toast.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import LoadingState from "../components/LoadingState.jsx";
import EmptyState from "../components/EmptyState.jsx";
import { formatDate, mineName } from "../utils/format.js";

const CATEGORIES = ["Safety", "Environment", "Labour", "Production", "Statutory"];
const STATUSES = ["COMPLIANT", "DUE SOON", "OVERDUE", "UNDER REVIEW"];

export default function Compliance() {
  const { user } = useAuth();
  const toast = useToast();
  const [records, setRecords] = useState([]);
  const [mines, setMines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ mineId: "", category: "", status: "" });
  const [viewing, setViewing] = useState(null);

  const load = async () => {
    setLoading(true);
    const [c, m] = await Promise.all([api.getCompliance(), api.getMines()]);
    setRecords(c); setMines(m); setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    return records.filter((r) =>
      (!filters.mineId || r.mineId === filters.mineId) &&
      (!filters.category || r.category === filters.category) &&
      (!filters.status || r.status === filters.status)
    );
  }, [records, filters]);

  const markComplete = async (record) => {
    try {
      const updated = await api.updateCompliance(record.id, { status: "COMPLIANT", actor: user.name, actorRole: user.role });
      setRecords((rs) => rs.map((r) => (r.id === record.id ? updated : r)));
      toast.push(`${record.requirement} marked as compliant.`);
    } catch (e) {
      toast.push(e.message, "error");
    }
  };

  const uploadEvidence = async (record) => {
    try {
      const updated = await api.updateCompliance(record.id, { evidenceDoc: `${record.requirement.replace(/\s+/g, "_")}_evidence.pdf`, status: "UNDER REVIEW", actor: user.name, actorRole: user.role });
      setRecords((rs) => rs.map((r) => (r.id === record.id ? updated : r)));
      toast.push("Evidence uploaded and sent for review.");
    } catch (e) {
      toast.push(e.message, "error");
    }
  };

  if (loading) return <LoadingState label="Loading compliance records..." />;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-white">Compliance Management</h1>
        <p className="text-sm text-slate-400">{filtered.length} of {records.length} requirements shown</p>
      </div>

      <div className="card p-3 grid sm:grid-cols-3 gap-2">
        <select className="input" value={filters.mineId} onChange={(e) => setFilters((f) => ({ ...f, mineId: e.target.value }))}>
          <option value="">All Mines</option>
          {mines.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
        <select className="input" value={filters.category} onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value }))}>
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className="input" value={filters.status} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}>
          <option value="">All Statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="card"><EmptyState title="No compliance records match your filters" /></div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-500 uppercase border-b border-white/[0.06]">
                <th className="px-4 py-3 font-medium">Requirement</th>
                <th className="px-4 py-3 font-medium">Mine</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Due Date</th>
                <th className="px-4 py-3 font-medium">Officer</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-b border-slate-50 last:border-0 hover:bg-white/[0.03]">
                  <td className="px-4 py-3 font-medium text-slate-200">{r.requirement}</td>
                  <td className="px-4 py-3 text-slate-400">{mineName(mines, r.mineId)}</td>
                  <td className="px-4 py-3 text-slate-400">{r.category}</td>
                  <td className="px-4 py-3 text-slate-400">{formatDate(r.dueDate)}</td>
                  <td className="px-4 py-3 text-slate-400">{r.responsibleOfficer}</td>
                  <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <button title="View" onClick={() => setViewing(r)} className="p-1.5 rounded-lg hover:bg-white/[0.05] text-slate-400"><Eye size={15} /></button>
                      <button title="Upload evidence" onClick={() => uploadEvidence(r)} className="p-1.5 rounded-lg hover:bg-white/[0.05] text-slate-400"><Upload size={15} /></button>
                      {r.status !== "COMPLIANT" && (
                        <button title="Mark complete" onClick={() => markComplete(r)} className="p-1.5 rounded-lg hover:bg-emerald-500/10 text-emerald-400"><CheckCircle2 size={15} /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {viewing && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setViewing(null)}>
          <div className="card w-full max-w-md p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <p className="font-semibold text-white">{viewing.requirement}</p>
              <button onClick={() => setViewing(null)}><X size={18} className="text-slate-500" /></button>
            </div>
            <dl className="text-sm space-y-2">
              <div className="flex justify-between"><dt className="text-slate-400">Mine</dt><dd className="font-medium">{mineName(mines, viewing.mineId)}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-400">Category</dt><dd className="font-medium">{viewing.category}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-400">Due Date</dt><dd className="font-medium">{formatDate(viewing.dueDate)}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-400">Responsible Officer</dt><dd className="font-medium">{viewing.responsibleOfficer}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-400">Status</dt><dd><StatusBadge status={viewing.status} /></dd></div>
              <div className="flex justify-between"><dt className="text-slate-400">Evidence</dt><dd className="font-medium">{viewing.evidenceDoc || "Not uploaded"}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-400">Last Updated</dt><dd className="font-medium">{formatDate(viewing.lastUpdated)}</dd></div>
            </dl>
          </div>
        </div>
      )}
    </div>
  );
}
