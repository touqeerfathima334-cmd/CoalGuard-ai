import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, MapPin, Users, Info, Sparkles } from "lucide-react";
import { api } from "../services/api.js";
import RiskBadge from "../components/RiskBadge.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import SeverityBadge from "../components/SeverityBadge.jsx";
import LoadingState from "../components/LoadingState.jsx";
import EmptyState from "../components/EmptyState.jsx";
import AnalyzeRiskModal from "../components/AnalyzeRiskModal.jsx";
import { formatDate } from "../utils/format.js";

const TABS = ["Overview", "Compliance", "Inspections", "Violations", "Corrective Actions", "Workers", "Contractors", "Documents", "Location"];

export default function MineDetails() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [tab, setTab] = useState("Overview");
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(null);

  useEffect(() => {
    setLoading(true);
    api.getMineSummary(id).then((d) => { setData(d); setLoading(false); });
  }, [id]);

  if (loading) return <LoadingState label="Loading mine details..." />;
  if (!data) return <EmptyState title="Mine not found" />;

  const { mine, compliance, inspections, violations, correctiveActions, contractors, documents } = data;
  const totalWorkers = contractors.reduce((sum, c) => sum + c.workers, 0);

  return (
    <div className="space-y-4">
      <Link to="/mines" className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-slate-200">
        <ArrowLeft size={14} /> Back to Mines
      </Link>

      <div className="card p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-white">{mine.name}</h1>
            <StatusBadge status={mine.status} />
            <RiskBadge level={mine.riskLevel} size="lg" />
          </div>
          <p className="text-sm text-slate-400 mt-1 flex items-center gap-1">
            <MapPin size={13} /> {mine.state} · {mine.code}
          </p>
        </div>
        <div className="flex items-center gap-6">
          <Metric label="Compliance" value={`${mine.compliancePct}%`} />
          <Metric label="Risk Score" value={`${mine.riskScore}/100`} />
          <Metric label="Open Violations" value={mine.openViolations} />
          <Metric label="Pending Actions" value={mine.pendingActions} />
          <button onClick={() => setAnalyzing(mine)} className="btn-primary shrink-0"><Sparkles size={15} /> Analyze Risk</button>
        </div>
      </div>

      <AnalyzeRiskModal mine={analyzing} onClose={() => setAnalyzing(null)} />

      <div className="card">
        <div className="flex overflow-x-auto border-b border-white/[0.06]">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                tab === t ? "border-brand-500 text-brand-400" : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="p-5">
          {tab === "Overview" && (
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <p className="text-sm font-semibold text-slate-200 mb-2">Mine Summary</p>
                <dl className="text-sm space-y-2">
                  <Row label="Production Status" value={mine.status} />
                  <Row label="Compliance Score" value={`${mine.compliancePct}%`} />
                  <Row label="Risk Score" value={`${mine.riskScore}/100 (${mine.riskLevel})`} />
                  <Row label="Recent Incidents" value={inspections.filter((i) => i.severity === "High" || i.severity === "Critical").length} />
                  <Row label="Open Violations" value={mine.openViolations} />
                  <Row label="Pending Corrective Actions" value={mine.pendingActions} />
                </dl>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-200 mb-2 flex items-center gap-1.5"><Info size={14} /> Risk Explanation</p>
                <div className="space-y-2">
                  {(mine.riskFactors || []).map((f) => (
                    <div key={f.label} className="flex items-center justify-between text-sm bg-white/[0.03] rounded-lg px-3 py-2">
                      <span className="text-slate-300">{f.label}</span>
                      <span className="flex items-center gap-2">
                        <span className="text-slate-500">{f.value} record{f.value === 1 ? "" : "s"}</span>
                        <SeverityBadge severity={f.severity} />
                      </span>
                    </div>
                  ))}
                </div>
                {mine.riskRecommendation && (
                  <p className="text-sm text-slate-200 bg-brand-500/10 border border-brand-500/20 rounded-lg px-3 py-2.5 mt-3">
                    <span className="font-semibold text-brand-400">AI Recommendation: </span>{mine.riskRecommendation}
                  </p>
                )}
              </div>
            </div>
          )}

          {tab === "Compliance" && (
            compliance.length === 0 ? <EmptyState /> : (
              <table className="w-full text-sm">
                <thead><tr className="text-left text-xs text-slate-500 uppercase border-b border-white/[0.06]">
                  <th className="py-2 pr-4 font-medium">Requirement</th><th className="py-2 pr-4 font-medium">Category</th>
                  <th className="py-2 pr-4 font-medium">Due Date</th><th className="py-2 pr-4 font-medium">Officer</th><th className="py-2 font-medium">Status</th>
                </tr></thead>
                <tbody>
                  {compliance.map((c) => (
                    <tr key={c.id} className="border-b border-slate-50 last:border-0">
                      <td className="py-2.5 pr-4">{c.requirement}</td>
                      <td className="py-2.5 pr-4 text-slate-400">{c.category}</td>
                      <td className="py-2.5 pr-4 text-slate-400">{formatDate(c.dueDate)}</td>
                      <td className="py-2.5 pr-4 text-slate-400">{c.responsibleOfficer}</td>
                      <td className="py-2.5"><StatusBadge status={c.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          )}

          {tab === "Inspections" && (
            inspections.length === 0 ? <EmptyState /> : (
              <div className="space-y-2">
                {inspections.map((i) => (
                  <div key={i.id} className="flex items-start justify-between gap-3 border border-white/[0.06] rounded-lg px-3 py-2.5">
                    <div>
                      <p className="text-sm font-medium text-slate-200">{i.type} · {i.location}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{i.observation}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{i.inspector} · {formatDate(i.date)}</p>
                    </div>
                    <SeverityBadge severity={i.severity} />
                  </div>
                ))}
              </div>
            )
          )}

          {tab === "Violations" && (
            violations.length === 0 ? <EmptyState /> : (
              <div className="space-y-2">
                {violations.map((v) => (
                  <div key={v.id} className="flex items-start justify-between gap-3 border border-white/[0.06] rounded-lg px-3 py-2.5">
                    <div>
                      <p className="text-sm font-medium text-slate-200">{v.description}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{v.category} · {v.responsiblePerson} · {formatDate(v.reportedDate)}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0"><SeverityBadge severity={v.severity} /><StatusBadge status={v.status} /></div>
                  </div>
                ))}
              </div>
            )
          )}

          {tab === "Corrective Actions" && (
            correctiveActions.length === 0 ? <EmptyState /> : (
              <div className="space-y-2">
                {correctiveActions.map((a) => (
                  <div key={a.id} className="flex items-start justify-between gap-3 border border-white/[0.06] rounded-lg px-3 py-2.5">
                    <div>
                      <p className="text-sm font-medium text-slate-200">{a.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">Assigned: {a.assignedTo} · Deadline: {formatDate(a.deadline)}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0"><SeverityBadge severity={a.priority} /><StatusBadge status={a.status} /></div>
                  </div>
                ))}
              </div>
            )
          )}

          {tab === "Workers" && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <Users size={16} className="text-slate-500" />
                Approx. {totalWorkers} workers on-site across {contractors.length} contractor teams.
              </div>
              <p className="text-xs text-slate-500">Detailed worker-level records are managed by contractors — see the Contractors tab for compliance and safety training coverage.</p>
            </div>
          )}

          {tab === "Contractors" && (
            contractors.length === 0 ? <EmptyState /> : (
              <div className="grid sm:grid-cols-2 gap-3">
                {contractors.map((c) => (
                  <div key={c.id} className="border border-white/[0.06] rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-200">{c.name}</p>
                      <RiskBadge level={c.risk} />
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{c.workers} workers · {c.contractStatus}</p>
                    <p className="text-xs text-slate-400 mt-1">Compliance {c.compliancePct}% · Safety training {c.safetyTrainingPct}%</p>
                  </div>
                ))}
              </div>
            )
          )}

          {tab === "Documents" && (
            documents.length === 0 ? <EmptyState /> : (
              <div className="space-y-2">
                {documents.map((d) => (
                  <div key={d.id} className="flex items-center justify-between border border-white/[0.06] rounded-lg px-3 py-2.5">
                    <div>
                      <p className="text-sm font-medium text-slate-200">{d.name}</p>
                      <p className="text-xs text-slate-500">{d.type} · Uploaded {formatDate(d.uploadDate)}</p>
                    </div>
                    <StatusBadge status={d.complianceStatus} />
                  </div>
                ))}
              </div>
            )
          )}

          {tab === "Location" && (
            <div className="space-y-2 text-sm">
              <Row label="State" value={mine.state} />
              <Row label="Coordinates (sample)" value={`${mine.lat.toFixed(4)}, ${mine.lng.toFixed(4)}`} />
              <p className="text-xs text-slate-500 mt-2">Coordinates are illustrative sample data for demo purposes and do not represent confidential Coal India survey data.</p>
              <Link to="/gis-map" className="btn-secondary text-sm mt-2 inline-flex">Open in GIS Map</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="text-right">
      <p className="text-lg font-bold text-white leading-tight">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-slate-400">{label}</dt>
      <dd className="font-medium text-slate-200">{value}</dd>
    </div>
  );
}
