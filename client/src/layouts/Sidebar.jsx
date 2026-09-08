import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, Mountain, ClipboardCheck, ClipboardList, ShieldAlert,
  Wrench, BrainCircuit, MapPinned, HardHat, FileScan, FileBarChart2,
  BellRing, History, Settings, PickaxeIcon,
} from "lucide-react";
import { api } from "../services/api.js";

export default function Sidebar({ open, onNavigate }) {
  const [counts, setCounts] = useState({});

  useEffect(() => {
    Promise.all([
      api.getCompliance({ status: "OVERDUE" }),
      api.getViolations({ status: "OPEN" }),
      api.getAlerts({ unreadOnly: "true" }),
    ]).then(([overdueCompliance, openViolations, unreadAlerts]) => {
      setCounts({
        compliance: overdueCompliance.length,
        violations: openViolations.length,
        alerts: unreadAlerts.length,
      });
    }).catch(() => {});
  }, []);

  const NAV = [
    { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
    { to: "/mines", label: "Mines", icon: Mountain },
    { to: "/compliance", label: "Compliance", icon: ClipboardCheck, count: counts.compliance },
    { to: "/inspections", label: "Inspections", icon: ClipboardList },
    { to: "/violations", label: "Violations", icon: ShieldAlert, count: counts.violations },
    { to: "/risk-analysis", label: "AI Risk Engine", icon: BrainCircuit },
    { to: "/alerts", label: "Alerts", icon: BellRing, count: counts.alerts },
    { to: "/corrective-actions", label: "Corrective Actions", icon: Wrench },
    { to: "/reports", label: "Reports & Analytics", icon: FileBarChart2 },
    { to: "/gis-map", label: "GIS Map", icon: MapPinned },
    { to: "/documents", label: "Documents (OCR)", icon: FileScan },
    { to: "/contractors", label: "Contractors", icon: HardHat },
    { to: "/audit-trail", label: "Audit Trail", icon: History },
    { to: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <aside
      className={`fixed lg:sticky top-0 left-0 h-screen bg-ink-900/95 backdrop-blur-xl border-r border-white/[0.06] text-slate-300 w-64 z-40 transform transition-transform duration-200 flex flex-col
      ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
    >
      <div className="flex items-center gap-2.5 px-5 h-16 border-b border-white/[0.06] shrink-0">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-400 to-brand-700 flex items-center justify-center text-white shadow-glow">
          <PickaxeIcon size={18} />
        </div>
        <div>
          <p className="font-extrabold text-white leading-tight text-sm tracking-wide">COALGUARD <span className="text-brand-400">AI</span></p>
          <p className="text-[10px] text-slate-500 leading-tight">AI-Powered Governance Monitoring</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {NAV.map(({ to, label, icon: Icon, end, count }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                isActive
                  ? "bg-brand-500/15 text-white font-medium border border-brand-500/30"
                  : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200"
              }`
            }
          >
            <Icon size={16} className="shrink-0" />
            <span className="truncate flex-1">{label}</span>
            {!!count && (
              <span className="text-[10px] font-bold bg-red-500/20 text-red-400 rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                {count}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-white/[0.06] text-[11px] text-slate-500">
        Demo build · Synthetic data only
      </div>
    </aside>
  );
}
