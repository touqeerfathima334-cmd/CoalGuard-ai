import React, { useEffect, useMemo, useState } from "react";
import { History } from "lucide-react";
import { api } from "../services/api.js";
import LoadingState from "../components/LoadingState.jsx";
import EmptyState from "../components/EmptyState.jsx";
import { formatDate } from "../utils/format.js";

export default function AuditTrail() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [moduleFilter, setModuleFilter] = useState("");

  useEffect(() => { api.getAudit().then((d) => { setLogs(d); setLoading(false); }); }, []);

  const modules = useMemo(() => [...new Set(logs.map((l) => l.module))], [logs]);
  const filtered = moduleFilter ? logs.filter((l) => l.module === moduleFilter) : logs;

  if (loading) return <LoadingState label="Loading audit trail..." />;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-white">Audit Trail</h1>
        <p className="text-sm text-slate-400">Full accountability and traceability across the platform</p>
      </div>

      <div className="card p-3 flex flex-wrap gap-2">
        <button onClick={() => setModuleFilter("")} className={`px-3 py-1.5 rounded-xl text-sm font-medium ${!moduleFilter ? "bg-brand-500 text-white" : "bg-white/[0.04] text-slate-300"}`}>All Modules</button>
        {modules.map((m) => (
          <button key={m} onClick={() => setModuleFilter(m)} className={`px-3 py-1.5 rounded-xl text-sm font-medium ${moduleFilter === m ? "bg-brand-500 text-white" : "bg-white/[0.04] text-slate-300"}`}>{m}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card"><EmptyState icon={History} title="No audit records found" /></div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-xs text-slate-500 uppercase border-b border-white/[0.06]">
              <th className="px-4 py-3 font-medium">Timestamp</th><th className="px-4 py-3 font-medium">User</th>
              <th className="px-4 py-3 font-medium">Role</th><th className="px-4 py-3 font-medium">Action</th>
              <th className="px-4 py-3 font-medium">Module</th><th className="px-4 py-3 font-medium">Record ID</th>
            </tr></thead>
            <tbody>
              {filtered.map((l) => (
                <tr key={l.id} className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02]">
                  <td className="px-4 py-3 text-slate-400 whitespace-nowrap">{formatDate(l.timestamp)} {new Date(l.timestamp).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</td>
                  <td className="px-4 py-3 text-slate-200 font-medium">{l.user}</td>
                  <td className="px-4 py-3 text-slate-400">{l.role}</td>
                  <td className="px-4 py-3 text-slate-300">{l.action}</td>
                  <td className="px-4 py-3"><span className="badge bg-white/[0.06] text-slate-300">{l.module}</span></td>
                  <td className="px-4 py-3 text-slate-500">{l.recordId}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
