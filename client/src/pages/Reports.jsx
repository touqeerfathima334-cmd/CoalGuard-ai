import React, { useEffect, useState } from "react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, PieChart, Pie, Cell,
} from "recharts";
import { Download, FileBarChart2 } from "lucide-react";
import { api } from "../services/api.js";
import { useToast } from "../components/Toast.jsx";
import LoadingState from "../components/LoadingState.jsx";

const REPORTS = [
  { key: "compliance", label: "Compliance Report" },
  { key: "safety", label: "Safety Report" },
  { key: "violations", label: "Violation Report" },
  { key: "inspections", label: "Inspection Report" },
  { key: "risk", label: "Mine Risk Report" },
  { key: "contractors", label: "Contractor Report" },
];

const RISK_COLORS = { LOW: "#34d399", MEDIUM: "#fbbf24", HIGH: "#fb923c", CRITICAL: "#f87171" };

export default function Reports() {
  const toast = useToast();
  const [mines, setMines] = useState([]);
  const [violations, setViolations] = useState([]);
  const [correctiveActions, setCorrectiveActions] = useState([]);
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getMines(), api.getViolations(), api.getCorrectiveActions(), api.getInspections()])
      .then(([m, v, c, i]) => { setMines(m); setViolations(v); setCorrectiveActions(c); setInspections(i); setLoading(false); });
  }, []);

  const generate = async (key, label) => {
    try {
      const blob = await api.exportReport(key);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `coalguard_${key}_report.csv`;
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
      toast.push(`${label} downloaded as CSV.`);
    } catch (e) { toast.push(e.message, "error"); }
  };

  if (loading) return <LoadingState label="Loading analytics..." />;

  const violationsByMine = mines.map((m) => ({ name: m.name.replace("Mine ", ""), count: violations.filter((v) => v.mineId === m.id).length })).sort((a, b) => b.count - a.count).slice(0, 8);
  const riskDist = ["LOW", "MEDIUM", "HIGH", "CRITICAL"].map((level) => ({ name: level, value: mines.filter((m) => m.riskLevel === level).length }));
  const closedActions = correctiveActions.filter((a) => a.status === "Completed" || a.status === "Closed").length;
  const closureRate = correctiveActions.length ? Math.round((closedActions / correctiveActions.length) * 100) : 0;
  const inspectionsByType = ["Safety", "Environment", "Labour", "Equipment", "Operational", "Emergency"].map((t) => ({ type: t, count: inspections.filter((i) => i.type === t).length }));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-white">Reports & Analytics</h1>
        <p className="text-sm text-slate-400">Generate and export governance reports across all mines</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {REPORTS.map((r) => (
          <div key={r.key} className="card p-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-brand-500/15 text-brand-400 flex items-center justify-center"><FileBarChart2 size={16} /></div>
              <p className="text-sm font-medium text-slate-200">{r.label}</p>
            </div>
            <button onClick={() => generate(r.key, r.label)} className="btn-secondary text-xs"><Download size={13} /> CSV</button>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="card p-4">
          <p className="font-semibold text-slate-200 mb-3">Violations by Mine</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={violationsByMine}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} interval={0} angle={-25} textAnchor="end" height={55} />
              <YAxis tick={{ fontSize: 12, fill: "#64748b" }} allowDecimals={false} />
              <Tooltip contentStyle={{ background: "#151b2c", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, fontSize: 12 }} />
              <Bar dataKey="count" fill="#5b8bf0" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-4">
          <p className="font-semibold text-slate-200 mb-3">Mine Risk Distribution</p>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width={160} height={200}>
              <PieChart>
                <Pie data={riskDist} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75} paddingAngle={2} stroke="none">
                  {riskDist.map((r) => <Cell key={r.name} fill={RISK_COLORS[r.name]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "#151b2c", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 text-sm">
              {riskDist.map((r) => (
                <div key={r.name} className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: RISK_COLORS[r.name] }} />
                  <span className="text-slate-400">{r.name}</span><span className="font-semibold text-slate-200">{r.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card p-4">
          <p className="font-semibold text-slate-200 mb-1">Corrective Action Closure Rate</p>
          <p className="text-3xl font-extrabold text-white mt-2">{closureRate}%</p>
          <div className="h-2 rounded-full bg-white/[0.06] mt-3 overflow-hidden">
            <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${closureRate}%` }} />
          </div>
          <p className="text-xs text-slate-500 mt-2">{closedActions} of {correctiveActions.length} corrective actions completed or closed.</p>
        </div>

        <div className="card p-4">
          <p className="font-semibold text-slate-200 mb-3">Inspection Frequency by Type</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={inspectionsByType} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis type="number" tick={{ fontSize: 12, fill: "#64748b" }} allowDecimals={false} />
              <YAxis dataKey="type" type="category" tick={{ fontSize: 12, fill: "#64748b" }} width={80} />
              <Tooltip contentStyle={{ background: "#151b2c", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, fontSize: 12 }} />
              <Bar dataKey="count" fill="#f5a524" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
