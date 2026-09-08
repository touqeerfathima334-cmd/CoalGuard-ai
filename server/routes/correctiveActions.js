import { Router } from "express";
import { db, addAudit } from "../data/db.js";
import { recalcAllMines } from "../riskEngine.js";

const router = Router();

router.get("/", (req, res) => {
  const { mineId, status, priority } = req.query;
  let items = db.correctiveActions;
  if (mineId) items = items.filter((a) => a.mineId === mineId);
  if (status) items = items.filter((a) => a.status === status);
  if (priority) items = items.filter((a) => a.priority === priority);
  res.json(items.sort((a, b) => new Date(a.deadline) - new Date(b.deadline)));
});

router.post("/", (req, res) => {
  const record = {
    id: "ca-" + Math.random().toString(36).slice(2, 10),
    status: "Pending",
    createdAt: new Date().toISOString(),
    ...req.body,
  };
  db.correctiveActions.unshift(record);
  recalcAllMines(db);
  addAudit({ user: req.body.actor || "User", role: req.body.actorRole || "MINE_OFFICIAL", action: "Created corrective action", module: "Corrective Actions", recordId: record.id });
  res.status(201).json(record);
});

router.patch("/:id", (req, res) => {
  const record = db.correctiveActions.find((a) => a.id === req.params.id);
  if (!record) return res.status(404).json({ error: "Not found" });
  Object.assign(record, req.body);
  recalcAllMines(db);
  addAudit({ user: req.body.actor || "User", role: req.body.actorRole || "MINE_OFFICIAL", action: `Updated corrective action status to ${record.status}`, module: "Corrective Actions", recordId: record.id });
  res.json(record);
});

export default router;
