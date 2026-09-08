import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, Search, Bell, ChevronDown, LogOut, User, Maximize2 } from "lucide-react";
import { useAuth, ROLE_LABELS } from "../context/AuthContext.jsx";
import { api } from "../services/api.js";
import { timeAgo } from "../utils/format.js";

export default function Topbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [alerts, setAlerts] = useState([]);
  const menuRef = useRef();
  const notifRef = useRef();

  useEffect(() => {
    api.getAlerts({ unreadOnly: "true" }).then(setAlerts).catch(() => {});
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const submitSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/mines?q=${encodeURIComponent(search.trim())}`);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
    else document.exitFullscreen?.();
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-ink-900/80 backdrop-blur-xl border-b border-white/[0.06] flex items-center gap-3 px-4 lg:px-6">
      <button className="lg:hidden text-slate-300" onClick={onMenuClick}>
        <Menu size={22} />
      </button>

      <form onSubmit={submitSearch} className="hidden sm:flex items-center gap-2 bg-white/[0.04] border border-white/10 rounded-full px-4 py-2 w-full max-w-sm">
        <Search size={16} className="text-slate-500" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search mines, inspections, compliance..."
          className="bg-transparent text-sm outline-none w-full text-slate-200 placeholder:text-slate-500"
        />
      </form>

      <div className="flex-1" />

      <button onClick={toggleFullscreen} className="hidden sm:flex p-2 rounded-xl hover:bg-white/[0.06] text-slate-400">
        <Maximize2 size={17} />
      </button>

      <div className="relative" ref={notifRef}>
        <button
          onClick={() => setNotifOpen((o) => !o)}
          className="relative p-2 rounded-xl hover:bg-white/[0.06] text-slate-300"
        >
          <Bell size={19} />
          {alerts.length > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold ring-2 ring-ink-900">
              {alerts.length > 9 ? "9+" : alerts.length}
            </span>
          )}
        </button>
        {notifOpen && (
          <div className="absolute right-0 mt-2 w-80 card p-2 max-h-96 overflow-y-auto">
            <p className="text-xs font-semibold text-slate-500 uppercase px-2 py-1">Unread Alerts</p>
            {alerts.length === 0 && <p className="text-sm text-slate-500 px-2 py-3">No unread alerts.</p>}
            {alerts.slice(0, 8).map((a) => (
              <div key={a.id} className="px-2 py-2 hover:bg-white/[0.04] rounded-xl cursor-pointer" onClick={() => { setNotifOpen(false); navigate("/alerts"); }}>
                <p className="text-sm font-medium text-slate-200 leading-snug">{a.message}</p>
                <p className="text-xs text-slate-500 mt-0.5">{timeAgo(a.createdAt)} · {a.severity}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="relative" ref={menuRef}>
        <button onClick={() => setMenuOpen((o) => !o)} className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-xl hover:bg-white/[0.06]">
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-700 text-white flex items-center justify-center text-xs font-bold">
              {user?.name?.split(" ").map((n) => n[0]).slice(0, 2).join("")}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-ink-900" />
          </div>
          <div className="hidden md:block text-left">
            <p className="text-sm font-medium leading-tight text-slate-200">{user?.name}</p>
            <p className="text-[11px] text-slate-500 leading-tight">{ROLE_LABELS[user?.role]}</p>
          </div>
          <ChevronDown size={14} className="text-slate-500" />
        </button>
        {menuOpen && (
          <div className="absolute right-0 mt-2 w-52 card p-1.5">
            <div className="px-2.5 py-2 border-b border-white/[0.06] mb-1">
              <p className="text-sm font-medium text-slate-200">{user?.name}</p>
              <p className="text-xs text-slate-500">{user?.email}</p>
            </div>
            <button className="w-full flex items-center gap-2 px-2.5 py-2 text-sm rounded-xl hover:bg-white/[0.05] text-slate-300">
              <User size={15} /> Profile
            </button>
            <button
              onClick={logout}
              className="w-full flex items-center gap-2 px-2.5 py-2 text-sm rounded-xl hover:bg-red-500/10 text-red-400"
            >
              <LogOut size={15} /> Log out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
