import {
  users, mines, compliance, inspections, violations,
  correctiveActions, contractors, documents, alerts, auditLogs,
} from "./seed.js";
import { recalcAllMines } from "../riskEngine.js";

/**
 * In-memory data store, structured to mirror the Mongoose collections in
 * server/models/schemas.js. This keeps the hackathon prototype instantly
 * runnable (npm install && npm run dev) with zero external database setup.
 */
export const db = {
  users: JSON.parse(JSON.stringify(users)),
  mines: JSON.parse(JSON.stringify(mines)),
  compliance: JSON.parse(JSON.stringify(compliance)),
  inspections: JSON.parse(JSON.stringify(inspections)),
  violations: JSON.parse(JSON.stringify(violations)),
  correctiveActions: JSON.parse(JSON.stringify(correctiveActions)),
  contractors: JSON.parse(JSON.stringify(contractors)),
  documents: JSON.parse(JSON.stringify(documents)),
  alerts: JSON.parse(JSON.stringify(alerts)),
  auditLogs: JSON.parse(JSON.stringify(auditLogs)),
};

// Compute initial risk scores for every mine from the seeded data.
recalcAllMines(db);

export function addAudit({ user, role, action, module, recordId }) {
  const entry = {
    id: "log-" + Math.random().toString(36).slice(2, 10),
    timestamp: new Date().toISOString(),
    user, role, action, module, recordId,
  };
  db.auditLogs.unshift(entry);
  return entry;
}

export function addAlert({ type, mineId, severity, message, action }) {
  const entry = {
    id: "alt-" + Math.random().toString(36).slice(2, 10),
    type, mineId, severity, message, action,
    createdAt: new Date().toISOString(),
    read: false,
  };
  db.alerts.unshift(entry);
  return entry;
}
