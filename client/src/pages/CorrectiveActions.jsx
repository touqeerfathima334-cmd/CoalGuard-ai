import React, { useEffect, useMemo, useState } from "react";
import { ArrowRight, AlertTriangle } from "lucide-react";
import { api } from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../components/Toast.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import SeverityBadge from "../components/SeverityBadge.jsx";
import LoadingState from "../components/LoadingState.jsx";
import EmptyState from "../components/EmptyState.jsx";
import { formatDate, mineName } from "../utils/format.js";

const STAGES = ["Pending", "In Progress", "Completed", "Closed"];

export default function CorrectiveActions() {
  const { user } = useAuth();
  const toast = useToast();
  const [actions, setActions] = useState([]);
  const [mines, setMines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  const load = async () => {
    setLoading(true);
    const [a, m] = await Promise.all([api.getCorrectiveActions(), api.getMines()]);
    setActions(a); setMines(m); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const overdue = useMemo(() => actions.filter((a) => a.status !== "Closed" && a.status !== "Completed" && new Date(a.deadline) < new Date("2026-08-28")), [actions]);
  const filtered = filter === "ALL" ? actions : filter === "OVERDUE" ? overdue : actions.filter((a) => a.status === filter);

  const advance = async (a) => {
    const idx = STAGES.indexOf(a.status);
    const next = STAGES[Math.min(idx + 1, STAGES.length - 1)];
    try {
      const updated = await api.updateCorrectiveAction(a.id, { status: next, actor: user.name, actorRole: user.role });
      setActions((as) => as.map((x) => (x.id === a.id ? updated : x)));
      const m = await api.getMines(); setMines(m);
      toast.push(`Corrective action moved to "${next}".`);
    } catch (e) { toast.push(e.message, "error"); }
  };

  if (loading) return <LoadingState label="Loading corrective actions..." />;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-white">Corrective Actions</h1>
        <p className="text-sm text-slate-400">{filtered.length} of {actions.length} actions</p>
      </div>

      <div className="card p-3 flex flex-wrap gap-2 text-sm">
        {["ALL", "OVERDUE", ...STAGES].map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg font-medium ${filter === f ? "bg-brand-700 text-white" : "bg-white/[0.05] text-slate-300"}`}>
            {f === "OVERDUE" ? `Overdue (${overdue.length})` : f}
          </button>
        ))}
      </div>

      <div className="card p-3 bg-white/[0.03] border-dashed">
        <p className="text-xs text-slate-400 flex items-center gap-4 flex-wrap">
          <span className="font-semibold text-slate-300">Workflow:</span>
          Violation <ArrowRight size={12} /> Corrective Action <ArrowRight size={12} /> Assigned <ArrowRight size={12} /> In Progress <ArrowRight size={12} /> Completed <ArrowRight size={12} /> Inspector Verification <ArrowRight size={12} /> Closed
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="card"><EmptyState title="No corrective actions found" /></div>
      ) : (
        <div className="space-y-2">
          {filtered.map((a) => {
            const isOverdue = a.status !== "Closed" && a.status !== "Completed" && new Date(a.deadline) < new Date("2026-08-28");
            return (
              <div key={a.id} className={`card p-4 flex items-center justify-between gap-3 ${isOverdue ? "border-l-4 border-l-red-500" : ""}`}>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-white">{a.title}</p>
                    <SeverityBadge severity={a.priority} />
                    {isOverdue && <span className="badge bg-red-500/15 text-red-400"><AlertTriangle size={11} /> Overdue</span>}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{mineName(mines, a.mineId)} · Assigned to {a.assignedTo} · Deadline {formatDate(a.deadline)}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <StatusBadge status={a.status} />
                  {a.status !== "Closed" && (
                    <button onClick={() => advance(a)} className="btn-secondary text-xs py-1.5">
                      Advance <ArrowRight size={12} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
