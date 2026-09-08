import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, ArrowUpDown, MapPin, Mountain } from "lucide-react";
import { api } from "../services/api.js";
import RiskBadge from "../components/RiskBadge.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import LoadingState from "../components/LoadingState.jsx";
import EmptyState from "../components/EmptyState.jsx";
import { formatDate } from "../utils/format.js";

export default function Mines() {
  const [params] = useSearchParams();
  const [mines, setMines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(params.get("q") || "");
  const [riskFilter, setRiskFilter] = useState("ALL");
  const [sortKey, setSortKey] = useState("riskScore");
  const [sortDir, setSortDir] = useState("desc");

  useEffect(() => {
    api.getMines().then((data) => { setMines(data); setLoading(false); });
  }, []);

  const filtered = useMemo(() => {
    let items = [...mines];
    if (query) {
      const q = query.toLowerCase();
      items = items.filter((m) => m.name.toLowerCase().includes(q) || m.state.toLowerCase().includes(q) || m.code.toLowerCase().includes(q));
    }
    if (riskFilter !== "ALL") items = items.filter((m) => m.riskLevel === riskFilter);
    items.sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      if (typeof a[sortKey] === "string") return a[sortKey].localeCompare(b[sortKey]) * dir;
      return (a[sortKey] - b[sortKey]) * dir;
    });
    return items;
  }, [mines, query, riskFilter, sortKey, sortDir]);

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("desc"); }
  };

  if (loading) return <LoadingState label="Loading mines..." />;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">Mines</h1>
          <p className="text-sm text-slate-400">{filtered.length} of {mines.length} mines</p>
        </div>
      </div>

      <div className="card p-3 flex flex-col sm:flex-row gap-2">
        <div className="flex items-center gap-2 bg-white/[0.05] rounded-lg px-3 py-2 flex-1">
          <Search size={16} className="text-slate-500" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name, code, or state..." className="bg-transparent text-sm outline-none w-full" />
        </div>
        <select value={riskFilter} onChange={(e) => setRiskFilter(e.target.value)} className="input sm:w-44">
          <option value="ALL">All Risk Levels</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
          <option value="CRITICAL">Critical</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="card"><EmptyState icon={Mountain} title="No mines match your filters" /></div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-500 uppercase border-b border-white/[0.06]">
                <Th label="Mine" onClick={() => toggleSort("name")} />
                <th className="px-4 py-3 font-medium">Location</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <Th label="Compliance %" onClick={() => toggleSort("compliancePct")} />
                <Th label="Risk Level" onClick={() => toggleSort("riskScore")} />
                <Th label="Open Violations" onClick={() => toggleSort("openViolations")} />
                <th className="px-4 py-3 font-medium">Last Inspection</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => (
                <tr key={m.id} className="border-b border-slate-50 last:border-0 hover:bg-white/[0.03]">
                  <td className="px-4 py-3">
                    <Link to={`/mines/${m.id}`} className="font-medium text-brand-400 hover:underline">{m.name}</Link>
                    <p className="text-xs text-slate-500">{m.code}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-300">
                    <span className="inline-flex items-center gap-1"><MapPin size={12} className="text-slate-500" />{m.state}</span>
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={m.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                        <div className="h-full bg-brand-600" style={{ width: `${m.compliancePct}%` }} />
                      </div>
                      <span className="text-xs text-slate-400">{m.compliancePct}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-200">{m.riskScore}</span>
                      <RiskBadge level={m.riskLevel} />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-300">{m.openViolations}</td>
                  <td className="px-4 py-3 text-slate-400">{formatDate(m.lastInspection)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Th({ label, onClick }) {
  return (
    <th className="px-4 py-3 font-medium cursor-pointer select-none" onClick={onClick}>
      <span className="inline-flex items-center gap-1">{label} <ArrowUpDown size={11} /></span>
    </th>
  );
}
