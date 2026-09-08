import { Router } from "express";
import { db, addAudit, addAlert } from "../data/db.js";
import { computeMineRisk, recalcAllMines } from "../riskEngine.js";

const router = Router();

router.get("/", (req, res) => {
  const { mineId, type, severity } = req.query;
  let items = db.inspections;
  if (mineId) items = items.filter((i) => i.mineId === mineId);
  if (type) items = items.filter((i) => i.type === type);
  if (severity) items = items.filter((i) => i.severity === severity);
  res.json(items.sort((a, b) => new Date(b.date) - new Date(a.date)));
});

router.post("/", (req, res) => {
  const mine = db.mines.find((m) => m.id === req.body.mineId);
  if (!mine) return res.status(400).json({ error: "Invalid mineId" });

  const previousRisk = mine.riskScore;

  const inspection = {
    id: "insp-" + Math.random().toString(36).slice(2, 10),
    createdAt: new Date().toISOString(),
    date: req.body.date || new Date().toISOString(),
    ...req.body,
  };
  db.inspections.unshift(inspection);

  // Recompute risk for the affected mine (and all mines, cheap for demo scale)
  recalcAllMines(db);
  const newRisk = computeMineRisk(mine.id, db);

  addAudit({
    user: req.body.inspector || "Inspector",
    role: "INSPECTOR",
    action: "Created inspection",
    module: "Inspections",
    recordId: inspection.id,
  });
  addAudit({
    user: "AI Engine",
    role: "SYSTEM",
    action: "Updated risk score",
    module: "AI Risk Analysis",
    recordId: mine.name,
  });

  let alert = null;
  if (newRisk.level === "CRITICAL" || newRisk.level === "HIGH") {
    alert = addAlert({
      type: newRisk.level === "CRITICAL" ? "Critical Safety Alert" : "Risk Increase",
      mineId: mine.id,
      severity: newRisk.level,
      message: `${mine.name} has been classified as ${newRisk.level} RISK.`,
      action: newRisk.recommendation,
    });
    addAudit({ user: "System", role: "SYSTEM", action: "Generated critical alert", module: "Alerts", recordId: alert.id });
  }

  res.status(201).json({
    inspection,
    riskBefore: previousRisk,
    riskAfter: newRisk.score,
    riskLevel: newRisk.level,
    recommendation: newRisk.recommendation,
    alert,
  });
});

export default router;
