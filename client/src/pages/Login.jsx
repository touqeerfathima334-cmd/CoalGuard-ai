import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PickaxeIcon, ShieldCheck, MapPinned, BrainCircuit, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../components/Toast.jsx";

const ROLES = [
  { value: "MINE_OFFICIAL", label: "Mine Official" },
  { value: "INSPECTOR", label: "Inspector" },
  { value: "CORPORATE_ADMIN", label: "Corporate Admin" },
  { value: "REGULATOR", label: "Regulatory Officer" },
];

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("CORPORATE_ADMIN");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login({ email, password, role });
      toast.push(`Welcome back, ${user.name.split(" ")[0]}.`);
      navigate("/");
    } catch (err) {
      setError(err.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-brand-950">
      {/* Left / brand panel */}
      <div className="hidden lg:flex flex-col justify-between p-12 text-brand-100 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-700/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-accent-500/10 rounded-full blur-3xl" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 rounded-xl bg-accent-500 flex items-center justify-center text-brand-950">
              <PickaxeIcon size={20} />
            </div>
            <div>
              <p className="font-bold text-white text-lg leading-tight">CoalGuard AI</p>
              <p className="text-xs text-brand-300">Ministry of Coal · Coal India Limited</p>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            AI-Powered Smart Governance & Compliance Monitoring
          </h1>
          <p className="text-brand-300 max-w-md">
            A unified platform for safety, environmental, labour and production
            compliance across every coal mine — with explainable AI risk scoring,
            live inspections, GIS visibility and full audit traceability.
          </p>
        </div>
        <div className="relative z-10 grid grid-cols-3 gap-4">
          <Feature icon={ShieldCheck} label="Explainable Risk Scoring" />
          <Feature icon={MapPinned} label="Live GIS Mine Map" />
          <Feature icon={BrainCircuit} label="AI Governance Assistant" />
        </div>
      </div>

      {/* Right / form panel */}
      <div className="flex items-center justify-center p-6 bg-ink-950">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <div className="w-9 h-9 rounded-lg bg-brand-600 flex items-center justify-center text-white">
              <PickaxeIcon size={18} />
            </div>
            <p className="font-bold text-white text-lg">CoalGuard AI</p>
          </div>

          <h2 className="text-xl font-bold text-white">Sign in to CoalGuard AI</h2>
          <p className="text-sm text-slate-400 mt-1 mb-6">AI-Powered Smart Governance & Compliance Monitoring</p>

          <form onSubmit={submit} className="card p-5 space-y-4">
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name.designation@coalgov.in" />
            </div>
            <div>
              <label className="label">Password</label>
              <input className="input" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            </div>
            <div>
              <label className="label">Role</label>
              <select className="input" value={role} onChange={(e) => setRole(e.target.value)}>
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
            {error && <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg">{error}</p>}
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading && <Loader2 size={15} className="animate-spin" />}
              Login
            </button>
          </form>

          <div className="mt-5">
            <p className="text-[11px] text-slate-500">Use your official email and password to access the system.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Feature({ icon: Icon, label }) {
  return (
    <div className="flex flex-col gap-2 bg-white/5 border border-white/10 rounded-xl p-3">
      <Icon size={18} className="text-accent-500" />
      <p className="text-xs text-brand-200 leading-tight">{label}</p>
    </div>
  );
}
