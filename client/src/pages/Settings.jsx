import React, { useState } from "react";
import { useAuth, ROLE_LABELS } from "../context/AuthContext.jsx";
import { api } from "../services/api.js";
import { Bell, Shield, Palette, Database, Lock, CheckCircle2 } from "lucide-react";

const DEFAULT_PASSWORD = "CoalGuard@123";

export default function Settings() {
  const { user, logout } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  const isAdmin = user?.role === "CORPORATE_ADMIN";

  const changePassword = async (e) => {
    e.preventDefault();
    setStatus({ type: "", message: "" });

    if (!user?.email) {
      setStatus({ type: "error", message: "No active user found." });
      return;
    }

    if (!currentPassword || !newPassword || !confirmPassword) {
      setStatus({ type: "error", message: "Fill in all password fields before saving." });
      return;
    }

    if (newPassword !== confirmPassword) {
      setStatus({ type: "error", message: "New password and confirmation do not match." });
      return;
    }

    if (newPassword.length < 8) {
      setStatus({ type: "error", message: "New password must be at least 8 characters long." });
      return;
    }

    try {
      setSubmitting(true);
      await api.changePassword({
        email: user.email,
        currentPassword,
        newPassword,
      });
      setStatus({ type: "success", message: "Password updated successfully." });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      if (isAdmin) {
        setTimeout(() => {
          logout();
          window.location.href = "/login";
        }, 1000);
      }
    } catch (err) {
      setStatus({ type: "error", message: err.message || "Unable to change the password." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h1 className="text-xl font-bold text-white">Settings</h1>
        <p className="text-sm text-slate-400">Manage your account and platform preferences</p>
      </div>

      <div className="card p-5">
        <p className="font-semibold text-slate-200 mb-4">Profile</p>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-brand-400 to-brand-700 text-white flex items-center justify-center text-lg font-bold">
            {user?.name?.split(" ").map((n) => n[0]).slice(0, 2).join("")}
          </div>
          <div>
            <p className="font-medium text-white">{user?.name}</p>
            <p className="text-sm text-slate-400">{user?.email}</p>
            <span className="badge bg-brand-500/15 text-brand-400 mt-1">{ROLE_LABELS[user?.role]}</span>
          </div>
        </div>
      </div>

      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Lock size={16} className="text-brand-400" />
          <p className="font-semibold text-slate-200">Password management</p>
        </div>

        <form onSubmit={changePassword} className="space-y-3">
          <div>
            <label className="label">Current password</label>
            <input className="input" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Enter current password" />
          </div>
          <div>
            <label className="label">New password</label>
            <input className="input" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Minimum 8 characters" />
          </div>
          <div>
            <label className="label">Confirm new password</label>
            <input className="input" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repeat new password" />
          </div>

          {status.message && (
            <div className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-sm ${status.type === "success" ? "border-green-500/20 bg-green-500/10 text-green-200" : "border-red-500/20 bg-red-500/10 text-red-200"}`}>
              {status.type === "success" ? <CheckCircle2 size={16} className="mt-0.5" /> : <Lock size={16} className="mt-0.5" />}
              <span>{status.message}</span>
            </div>
          )}

          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? "Saving..." : "Update Password"}
          </button>
          {isAdmin && (
            <p className="text-[11px] text-slate-500">Admin password reset: the initial default is <span className="font-medium text-slate-300">{DEFAULT_PASSWORD}</span></p>
          )}
        </form>
      </div>

      <SettingsRow icon={Bell} title="Notification Preferences" desc="Critical alerts, compliance reminders, and escalation notices." />
      <SettingsRow icon={Shield} title="Role & Access" desc={`You are signed in as ${ROLE_LABELS[user?.role]}. Access to modules is scoped to this role.`} />
      <SettingsRow icon={Palette} title="Appearance" desc="Dark enterprise theme — optimized for control-room and field displays." />
      <SettingsRow icon={Database} title="Data Source" desc="This prototype runs on synthetic demo data served from an in-memory API." />
    </div>
  );
}

function SettingsRow({ icon: Icon, title, desc }) {
  return (
    <div className="card p-4 flex items-start gap-3">
      <div className="w-9 h-9 rounded-xl bg-white/[0.05] text-slate-300 flex items-center justify-center shrink-0"><Icon size={16} /></div>
      <div>
        <p className="text-sm font-medium text-slate-200">{title}</p>
        <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
      </div>
    </div>
  );
}
