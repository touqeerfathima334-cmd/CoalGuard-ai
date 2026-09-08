import { Router } from "express";
import { db, addAudit } from "../data/db.js";
import { recalcAllMines } from "../riskEngine.js";

const router = Router();

router.get("/", (req, res) => {
  const { mineId, status, category, severity } = req.query;
  let items = db.violations;
  if (mineId) items = items.filter((v) => v.mineId === mineId);
  if (status) items = items.filter((v) => v.status === status);
  if (category) items = items.filter((v) => v.category === category);
  if (severity) items = items.filter((v) => v.severity === severity);
  res.json(items.sort((a, b) => new Date(b.reportedDate) - new Date(a.reportedDate)));
});

router.post("/", (req, res) => {
  const record = {
    id: "vio-" + Math.random().toString(36).slice(2, 10),
    status: "OPEN",
    reportedDate: new Date().toISOString(),
    ...req.body,
  };
  db.violations.unshift(record);
  recalcAllMines(db);
  addAudit({ user: req.body.actor || "User", role: req.body.actorRole || "INSPECTOR", action: "Created violation", module: "Violations", recordId: record.id });
  res.status(201).json(record);
});

router.patch("/:id", (req, res) => {
  const record = db.violations.find((v) => v.id === req.params.id);
  if (!record) return res.status(404).json({ error: "Not found" });
  Object.assign(record, req.body);
  recalcAllMines(db);
  addAudit({ user: req.body.actor || "User", role: req.body.actorRole || "INSPECTOR", action: `Updated violation status to ${record.status}`, module: "Violations", recordId: record.id });
  res.json(record);
});

export default router;
