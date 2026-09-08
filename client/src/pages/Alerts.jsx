import React, { useEffect, useState } from "react";
import { BellRing, CheckCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "../services/api.js";
import { useToast } from "../components/Toast.jsx";
import LoadingState from "../components/LoadingState.jsx";
import EmptyState from "../components/EmptyState.jsx";
import { mineName, timeAgo } from "../utils/format.js";

const SEVERITY_STYLE = {
  CRITICAL: "border-l-red-500 bg-red-500/[0.04]",
  HIGH: "border-l-orange-500 bg-orange-500/[0.04]",
  MEDIUM: "border-l-amber-500 bg-amber-500/[0.04]",
  LOW: "border-l-emerald-500 bg-emerald-500/[0.04]",
};

export default function Alerts() {
  const toast = useToast();
  const [alerts, setAlerts] = useState([]);
  const [mines, setMines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  const load = async () => {
    setLoading(true);
    const [a, m] = await Promise.all([api.getAlerts(), api.getMines()]);
    setAlerts(a); setMines(m); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const markRead = async (a) => {
    try {
      await api.markAlertRead(a.id);
      setAlerts((as) => as.map((x) => (x.id === a.id ? { ...x, read: true } : x)));
    } catch (e) { toast.push(e.message, "error"); }
  };

  const filtered = filter === "ALL" ? alerts : filter === "UNREAD" ? alerts.filter((a) => !a.read) : alerts.filter((a) => a.severity === filter);

  if (loading) return <LoadingState label="Loading alerts..." />;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-white">Alerts & Escalations</h1>
        <p className="text-sm text-slate-400">{alerts.filter((a) => !a.read).length} unread of {alerts.length} total</p>
      </div>

      <div className="card p-3 flex flex-wrap gap-2 text-sm">
        {["ALL", "UNREAD", "CRITICAL", "HIGH", "MEDIUM", "LOW"].map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-xl font-medium ${filter === f ? "bg-brand-500 text-white" : "bg-white/[0.04] text-slate-300"}`}>{f}</button>
        ))}
      </div>

      <div className="card p-4 bg-white/[0.02] border-dashed">
        <p className="text-xs text-slate-500">
          <span className="font-semibold text-slate-300">Escalation workflow:</span> Compliance Due → Reminder → No Action → Manager Alert → Corporate Escalation
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="card"><EmptyState icon={BellRing} title="No alerts found" /></div>
      ) : (
        <div className="space-y-2">
          {filtered.map((a) => (
            <div key={a.id} className={`card p-4 border-l-4 flex items-start justify-between gap-3 ${SEVERITY_STYLE[a.severity]} ${a.read ? "opacity-60" : ""}`}>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="badge bg-white/[0.06] text-slate-300">{a.type}</span>
                  <span className={`badge risk-${a.severity}`}>{a.severity}</span>
                  {!a.read && <span className="w-1.5 h-1.5 rounded-full bg-brand-400" />}
                </div>
                <p className="text-sm font-medium text-slate-100 mt-1.5">{a.message}</p>
                <p className="text-xs text-slate-500 mt-1">Action: {a.action}</p>
                <p className="text-[11px] text-slate-600 mt-1">
                  {mineName(mines, a.mineId)} · {timeAgo(a.createdAt)}
                  {a.mineId && <> · <Link to={`/mines/${a.mineId}`} className="text-brand-400">View mine</Link></>}
                </p>
              </div>
              {!a.read && (
                <button onClick={() => markRead(a)} className="btn-secondary text-xs shrink-0"><CheckCheck size={13} /> Mark read</button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
