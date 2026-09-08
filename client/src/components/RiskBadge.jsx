import React from "react";
import { ShieldAlert, ShieldCheck, ShieldQuestion, ShieldX } from "lucide-react";

const ICONS = {
  LOW: ShieldCheck,
  MEDIUM: ShieldQuestion,
  HIGH: ShieldAlert,
  CRITICAL: ShieldX,
};

export default function RiskBadge({ level, size = "sm" }) {
  const Icon = ICONS[level] || ShieldQuestion;
  const sizeClasses = size === "lg" ? "text-sm px-3 py-1" : "text-xs px-2 py-0.5";
  return (
    <span className={`badge risk-${level} ${sizeClasses}`}>
      <Icon size={size === "lg" ? 14 : 12} />
      {level}
    </span>
  );
}
