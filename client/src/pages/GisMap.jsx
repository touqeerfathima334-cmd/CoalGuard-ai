import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import { Link } from "react-router-dom";
import { api } from "../services/api.js";
import RiskBadge from "../components/RiskBadge.jsx";
import LoadingState from "../components/LoadingState.jsx";

const RISK_COLORS = { LOW: "#10b981", MEDIUM: "#f59e0b", HIGH: "#f97316", CRITICAL: "#ef4444" };

export default function GisMap() {
  const [mines, setMines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getMines().then((data) => { setMines(data); setLoading(false); });
  }, []);

  if (loading) return <LoadingState label="Loading GIS mine map..." />;

  const center = [22.9, 82.5];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-white">GIS Mine Map</h1>
        <p className="text-sm text-slate-400">Sample India-based coordinates for demo purposes — not confidential Coal India survey data.</p>
      </div>

      <div className="card p-3 flex items-center gap-4 flex-wrap text-xs text-slate-400">
        {Object.entries(RISK_COLORS).map(([level, color]) => (
          <span key={level} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: color }} /> {level}
          </span>
        ))}
      </div>

      <div className="card overflow-hidden" style={{ height: "560px" }}>
        <MapContainer center={center} zoom={6} style={{ height: "100%", width: "100%" }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {mines.map((m) => (
            <CircleMarker
              key={m.id}
              center={[m.lat, m.lng]}
              radius={10}
              pathOptions={{ color: RISK_COLORS[m.riskLevel], fillColor: RISK_COLORS[m.riskLevel], fillOpacity: 0.75, weight: 2 }}
            >
              <Popup>
                <div className="text-sm space-y-1 min-w-[160px]">
                  <p className="font-semibold">{m.name}</p>
                  <p>Risk: <strong>{m.riskLevel}</strong></p>
                  <p>Risk Score: {m.riskScore}</p>
                  <p>Compliance: {m.compliancePct}%</p>
                  <p>Open Violations: {m.openViolations}</p>
                  <Link to={`/mines/${m.id}`} className="text-brand-400 font-medium underline block mt-1">View Mine Details</Link>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {mines.map((m) => (
          <Link key={m.id} to={`/mines/${m.id}`} className="card p-3 flex items-center justify-between hover:border-white/10">
            <div>
              <p className="text-sm font-medium text-slate-200">{m.name}</p>
              <p className="text-xs text-slate-500">{m.state}</p>
            </div>
            <RiskBadge level={m.riskLevel} />
          </Link>
        ))}
      </div>
    </div>
  );
}
