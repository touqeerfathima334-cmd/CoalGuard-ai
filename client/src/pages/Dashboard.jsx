import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Mountain, ShieldCheck, ShieldAlert, Wrench, CalendarClock, TrendingUp,
  Sparkles, ArrowRight, ClipboardList, ClipboardCheck, FileText, MapPinned,
  Megaphone,
} from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, BarChart, Bar, Legend,
} from "recharts";
import { api } from "../services/api.js";
import { useAuth, ROLE_LABELS } from "../context/AuthContext.jsx";
import RiskBadge from "../components/RiskBadge.jsx";
import SeverityBadge from "../components/SeverityBadge.jsx";
import LoadingState from "../components/LoadingState.jsx";
import AnalyzeRiskModal from "../components/AnalyzeRiskModal.jsx";
import { formatDate, timeAgo } from "../utils/format.js";

const RISK_COLORS = { LOW: "#34d399", MEDIUM: "#fbbf24", HIGH: "#fb923c", CRITICAL: "#f87171" };

export default function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [mines, setMines] = useState([]);
  const [inspections, setInspections] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [violations, setViolations] = useState([]);
  const [insights, setInsights] = useState([]);
  const [compliance, setCompliance] = useState([]);
  const [audit, setAudit] = useState([]);
  const [analyzing, setAnalyzing] = useState(null);

  useEffect(() => {
    let mounted = true;
    Promise.all([
      api.getSummary(), api.getMines(), api.getInspections(), api.getAlerts(),
      api.getViolations(), api.getTrendInsights(), api.getCompliance(), api.getAudit(),
    ]).then(([s, m, i, a, v, ins, c, aud]) => {
      if (!mounted) return;
      setSummary(s); setMines(m); setInspections(i); setAlerts(a);
      setViolations(v); setInsights(ins); setCompliance(c); setAudit(aud);
      setLoading(false);
    }).catch(() => setLoading(false));
    return () => { mounted = false; };
  }, []);

  const riskDistribution = useMemo(() => {
    const counts = { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 };
    mines.forEach((m) => { counts[m.riskLevel] = (counts[m.riskLevel] || 0) + 1; });
    return Object.entries(counts).map(([level, value]) => ({ name: level, value }));
  }, [mines]);

  const violationsByCategory = useMemo(() => {
    const counts = {};
    violations.forEach((v) => { counts[v.category] = (counts[v.category] || 0) + 1; });
    return Object.entries(counts).map(([category, count]) => ({ category, count })).sort((a, b) => b.count - a.count);
  }, [violations]);

  const complianceDistribution = useMemo(() => {
    const counts = { COMPLIANT: 0, "DUE SOON": 0, OVERDUE: 0, "UNDER REVIEW": 0 };
    compliance.forEach((c) => { counts[c.status] = (counts[c.status] || 0) + 1; });
    return [
      { name: "Compliant", value: counts.COMPLIANT, color: "#34d399" },
      { name: "Due Soon", value: counts["DUE SOON"], color: "#fbbf24" },
      { name: "Overdue", value: counts.OVERDUE, color: "#f87171" },
      { name: "Under Review", value: counts["UNDER REVIEW"], color: "#94a3b8" },
    ];
  }, [compliance]);

  const complianceTrend = useMemo(() => {
    const base = summary?.overallCompliance || 85;
    return [
      { month: "Mar", value: Math.max(60, Math.round(base - 9)) },
      { month: "Apr", value: Math.max(60, Math.round(base - 6)) },
      { month: "May", value: Math.max(60, Math.round(base - 5)) },
      { month: "Jun", value: Math.max(60, Math.round(base - 2)) },
      { month: "Jul", value: Math.max(60, Math.round(base - 1)) },
      { month: "Aug", value: Math.round(base) },
    ];
  }, [summary]);

  const highRiskMines = useMemo(
    () => [...mines].filter((m) => m.riskLevel === "HIGH" || m.riskLevel === "CRITICAL").sort((a, b) => b.riskScore - a.riskScore),
    [mines]
  );
  const criticalMine = highRiskMines.find((m) => m.riskLevel === "CRITICAL");
  const recommendations = useMemo(() => buildRecommendations({ mines, compliance, violations, insights }), [mines, compliance, violations, insights]);

  if (loading) return <LoadingState label="Loading governance dashboard..." />;

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold text-white">Governance Dashboard</h1>
          <p className="text-sm text-slate-500">Welcome back, {user?.name?.split(" ")[0]} · {ROLE_LABELS[user?.role]}</p>
        </div>
        <Link to="/gis-map" className="btn-secondary text-sm"><MapPinned size={14} /> Live GIS Map</Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        <Kpi icon={Mountain} label="Total Mines" value={summary?.totalMines} tone="brand" />
        <Kpi icon={ShieldCheck} label="Compliance Score" value={`${summary?.overallCompliance}%`} tone="emerald" />
        <Kpi icon={TrendingUp} label="High Risk Mines" value={summary?.highRiskMines} tone="orange" />
        <Kpi icon={ShieldAlert} label="Open Violations" value={summary?.openViolations} tone="red" />
        <Kpi icon={Wrench} label="Pending Actions" value={summary?.pendingCorrectiveActions} tone="amber" />
        <Kpi icon={CalendarClock} label="Overdue Compliance" value={compliance.filter((c) => c.status === "OVERDUE").length} tone="sky" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* AI Risk Overview donut */}
        <div className="card p-4">
          <p className="font-semibold text-slate-200 mb-3">AI Risk Overview</p>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width={130} height={130}>
              <PieChart>
                <Pie data={riskDistribution} dataKey="value" nameKey="name" innerRadius={40} outerRadius={62} paddingAngle={2} stroke="none">
                  {riskDistribution.map((entry) => <Cell key={entry.name} fill={RISK_COLORS[entry.name]} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5 text-xs">
              {riskDistribution.map((r) => (
                <div key={r.name} className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ background: RISK_COLORS[r.name] }} />
                  <span className="text-slate-500 w-16">{r.name}</span>
                  <span className="font-semibold text-slate-200">{r.value} ({mines.length ? Math.round((r.value / mines.length) * 100) : 0}%)</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Risk / compliance trend */}
        <div className="card p-4 lg:col-span-2">
          <p className="font-semibold text-slate-200 mb-3">Compliance Trend Analysis (6 months)</p>
          <ResponsiveContainer width="100%" height={170}>
            <LineChart data={complianceTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={{ stroke: "rgba(255,255,255,0.08)" }} tickLine={false} />
              <YAxis domain={[50, 100]} tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "#151b2c", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, fontSize: 12 }} />
              <Line type="monotone" dataKey="value" stroke="#5b8bf0" strokeWidth={2.5} dot={{ r: 3, fill: "#5b8bf0" }} name="Compliance %" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Live monitoring + critical alert */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="card p-4 lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <p className="font-semibold text-slate-200 flex items-center gap-2">
              Live Mines Monitoring
              <span className="badge bg-emerald-500/15 text-emerald-400"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Live</span>
            </p>
            <Link to="/gis-map" className="text-xs text-brand-400 font-medium">Open Map <ArrowRight size={11} className="inline" /></Link>
          </div>
          <div className="grid sm:grid-cols-2 gap-2.5">
            {mines.slice(0, 8).map((m) => (
              <Link key={m.id} to={`/mines/${m.id}`} className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-white/20 transition-colors">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 dot-${m.riskLevel}`} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-200 truncate">{m.name}</p>
                    <p className="text-xs text-slate-400 truncate">{m.state}</p>
                  </div>
                </div>
                <RiskBadge level={m.riskLevel} />
              </Link>
            ))}
          </div>
        </div>

        {criticalMine ? (
          <div className="card p-4 border-red-500/30 bg-gradient-to-b from-red-500/10 to-transparent flex flex-col">
            <p className="text-xs font-bold text-red-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <ShieldAlert size={13} /> Critical Alert
            </p>
            <p className="font-semibold text-white">{criticalMine.name}</p>
            <p className="text-2xl font-extrabold text-red-400 mt-1">{criticalMine.riskScore}<span className="text-sm text-slate-400">/100</span></p>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              {criticalMine.riskFactors?.filter((f) => f.severity !== "Low").slice(0, 2).map((f) => f.label).join(" · ")}
            </p>
            <div className="flex-1" />
            <div className="flex gap-2 mt-3">
              <button onClick={() => setAnalyzing(criticalMine)} className="btn-primary text-xs flex-1"><Sparkles size={12} /> Analyze</button>
              <Link to={`/mines/${criticalMine.id}`} className="btn-secondary text-xs flex-1 justify-center">Details</Link>
            </div>
          </div>
        ) : (
          <div className="card p-4 flex flex-col items-center justify-center text-center">
            <ShieldCheck size={28} className="text-emerald-400 mb-2" />
            <p className="text-sm font-medium text-slate-200">No critical-risk mines</p>
            <p className="text-xs text-slate-400 mt-1">All mines are within acceptable risk thresholds.</p>
          </div>
        )}
      </div>

      {/* Bottom row: violations, compliance status, inspections, recent activity */}
      <div className="grid lg:grid-cols-4 gap-4">
        <div className="card p-4">
          <p className="font-semibold text-slate-200 mb-3 text-sm">Top Violations</p>
          <div className="space-y-2.5">
            {violationsByCategory.slice(0, 5).map((v) => (
              <div key={v.category}>
                <div className="flex justify-between text-xs mb-1"><span className="text-slate-500">{v.category}</span><span className="font-semibold text-slate-200">{v.count}</span></div>
                <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                  <div className="h-full bg-accent-500 rounded-full" style={{ width: `${(v.count / violationsByCategory[0].count) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-4">
          <p className="font-semibold text-slate-200 mb-3 text-sm">Compliance Status</p>
          <ResponsiveContainer width="100%" height={130}>
            <PieChart>
              <Pie data={complianceDistribution} dataKey="value" nameKey="name" innerRadius={35} outerRadius={55} paddingAngle={2} stroke="none">
                {complianceDistribution.map((c) => <Cell key={c.name} fill={c.color} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1 text-xs mt-1">
            {complianceDistribution.map((c) => (
              <div key={c.name} className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: c.color }} />
                <span className="text-slate-400">{c.name}</span><span className="ml-auto font-medium text-slate-300">{c.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="font-semibold text-slate-200 text-sm">Recent Inspections</p>
            <Link to="/inspections" className="text-[11px] text-brand-400">View all</Link>
          </div>
          <div className="space-y-2.5 max-h-44 overflow-y-auto pr-1">
            {inspections.slice(0, 5).map((i) => (
              <div key={i.id} className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-slate-300 truncate">{i.type} · {mineNameById(mines, i.mineId)}</p>
                  <p className="text-[11px] text-slate-400 truncate">{timeAgo(i.date)}</p>
                </div>
                <SeverityBadge severity={i.severity} />
              </div>
            ))}
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="font-semibold text-slate-200 text-sm">Recent Activity</p>
            <Link to="/audit-trail" className="text-[11px] text-brand-400">View all</Link>
          </div>
          <div className="space-y-2.5 max-h-44 overflow-y-auto pr-1">
            {audit.slice(0, 5).map((a) => (
              <div key={a.id} className="flex items-start gap-2">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-400 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-slate-300 leading-snug">{a.action} <span className="text-slate-400">· {a.recordId}</span></p>
                  <p className="text-[11px] text-slate-400">{a.user} · {timeAgo(a.timestamp)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Governance Assistant */}
      <div className="card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={16} className="text-accent-500" />
          <p className="font-semibold text-slate-200">AI Governance Assistant</p>
        </div>
        <div className="grid md:grid-cols-2 gap-2.5">
          {recommendations.map((r, idx) => (
            <div key={idx} className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-brand-500/[0.06] border border-brand-500/20">
              <ClipboardList size={14} className="text-brand-400 mt-0.5 shrink-0" />
              <p className="text-sm text-slate-300">{r}</p>
            </div>
          ))}
        </div>
      </div>

      {/* announcements ticker */}
      <div className="card px-4 py-2.5 flex items-center gap-3 overflow-hidden">
        <Megaphone size={15} className="text-accent-500 shrink-0" />
        <p className="text-xs text-slate-500 whitespace-nowrap overflow-hidden text-ellipsis">
          System announcements: Scheduled maintenance window · New environmental clearance rules effective this quarter · DGMS safety circular updated
        </p>
      </div>

      <AnalyzeRiskModal mine={analyzing} onClose={() => setAnalyzing(null)} />
    </div>
  );
}

function mineNameById(mines, id) {
  return mines.find((m) => m.id === id)?.name || id;
}

function buildRecommendations({ mines, compliance, violations, insights }) {
  const recs = [];
  const topRisk = [...mines].sort((a, b) => b.riskScore - a.riskScore)[0];
  if (topRisk) recs.push(`${topRisk.name} should be prioritized for inspection (risk score ${topRisk.riskScore}/100).`);
  const overdue = compliance.filter((c) => c.status === "OVERDUE").length;
  if (overdue > 0) recs.push(`${overdue} compliance requirement${overdue > 1 ? "s are" : " is"} overdue across all mines.`);
  const safetyViolations = violations.filter((v) => v.category === "Safety" && v.status !== "CLOSED").length;
  if (safetyViolations > 0) recs.push(`${safetyViolations} open safety violations require attention this week.`);
  insights.slice(0, 2).forEach((i) => recs.push(i.message + " " + i.recommendation));
  return recs.slice(0, 4);
}

function Kpi({ icon: Icon, label, value, tone }) {
  const tones = {
    brand: "bg-brand-500/15 text-brand-400",
    emerald: "bg-emerald-500/15 text-emerald-400",
    red: "bg-red-500/15 text-red-400",
    orange: "bg-orange-500/15 text-orange-400",
    amber: "bg-amber-500/15 text-amber-400",
    sky: "bg-sky-500/15 text-sky-400",
  };
  return (
    <div className="card p-3.5">
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-2 ${tones[tone]}`}>
        <Icon size={16} />
      </div>
      <p className="text-xl font-bold text-white leading-tight">{value}</p>
      <p className="text-xs text-slate-400 mt-0.5">{label}</p>
    </div>
  );
}
