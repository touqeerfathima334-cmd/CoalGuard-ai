import React from "react";

const STYLES = {
  COMPLIANT: "bg-emerald-500/15 text-emerald-400",
  "DUE SOON": "bg-amber-500/15 text-amber-400",
  OVERDUE: "bg-red-500/15 text-red-400",
  "UNDER REVIEW": "bg-slate-500/15 text-slate-300",
  OPEN: "bg-red-500/15 text-red-400",
  "IN PROGRESS": "bg-amber-500/15 text-amber-400",
  RESOLVED: "bg-sky-500/15 text-sky-400",
  VERIFIED: "bg-indigo-500/15 text-indigo-400",
  CLOSED: "bg-slate-500/15 text-slate-300",
  Pending: "bg-slate-500/15 text-slate-300",
  "In Progress": "bg-amber-500/15 text-amber-400",
  Completed: "bg-emerald-500/15 text-emerald-400",
  Closed: "bg-slate-500/15 text-slate-300",
  Active: "bg-emerald-500/15 text-emerald-400",
  "Under Review": "bg-amber-500/15 text-amber-400",
  VALID: "bg-emerald-500/15 text-emerald-400",
  EXPIRED: "bg-red-500/15 text-red-400",
  "EXPIRING SOON": "bg-amber-500/15 text-amber-400",
  "REVIEW REQUIRED": "bg-orange-500/15 text-orange-400",
  Operational: "bg-emerald-500/15 text-emerald-400",
  "Under Maintenance": "bg-amber-500/15 text-amber-400",
};

export default function StatusBadge({ status }) {
  const cls = STYLES[status] || "bg-slate-500/15 text-slate-300";
  return <span className={`badge ${cls}`}>{status}</span>;
}
