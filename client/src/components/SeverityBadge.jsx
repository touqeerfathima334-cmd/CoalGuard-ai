import React from "react";

const STYLES = {
  Low: "bg-emerald-500/15 text-emerald-400",
  Medium: "bg-amber-500/15 text-amber-400",
  High: "bg-orange-500/15 text-orange-400",
  Critical: "bg-red-500/15 text-red-400",
  LOW: "bg-emerald-500/15 text-emerald-400",
  MEDIUM: "bg-amber-500/15 text-amber-400",
  HIGH: "bg-orange-500/15 text-orange-400",
  CRITICAL: "bg-red-500/15 text-red-400",
};

export default function SeverityBadge({ severity }) {
  return <span className={`badge ${STYLES[severity] || "bg-slate-500/15 text-slate-300"}`}>{severity}</span>;
}
