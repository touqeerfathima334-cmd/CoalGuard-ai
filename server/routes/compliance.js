import { Router } from "express";
import { db, addAudit } from "../data/db.js";
import { recalcAllMines } from "../riskEngine.js";

const router = Router();

router.get("/", (req, res) => {
  const { mineId, category, status } = req.query;
  let items = db.compliance;
  if (mineId) items = items.filter((c) => c.mineId === mineId);
  if (category) items = items.filter((c) => c.category === category);
  if (status) items = items.filter((c) => c.status === status);
  res.json(items);
});

router.post("/", (req, res) => {
  const record = { id: "cmp-" + Math.random().toString(36).slice(2, 10), lastUpdated: new Date().toISOString(), status: "UNDER REVIEW", ...req.body };
  db.compliance.unshift(record);
  recalcAllMines(db);
  addAudit({ user: req.body.actor || "User", role: req.body.actorRole || "MINE_OFFICIAL", action: "Created compliance record", module: "Compliance", recordId: record.id });
  res.status(201).json(record);
});

router.patch("/:id", (req, res) => {
  const record = db.compliance.find((c) => c.id === req.params.id);
  if (!record) return res.status(404).json({ error: "Not found" });
  Object.assign(record, req.body, { lastUpdated: new Date().toISOString() });
  recalcAllMines(db);
  addAudit({ user: req.body.actor || "User", role: req.body.actorRole || "MINE_OFFICIAL", action: `Updated compliance status to ${record.status}`, module: "Compliance", recordId: record.id });
  res.json(record);
});

export default router;
