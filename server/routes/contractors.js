import { Router } from "express";
import { db, addAudit } from "../data/db.js";

const router = Router();

router.get("/", (req, res) => {
  const { mineId } = req.query;
  let items = db.contractors;
  if (mineId) items = items.filter((c) => c.mineId === mineId);
  res.json(items);
});

router.post("/", (req, res) => {
  const record = { id: "con-" + Math.random().toString(36).slice(2, 10), risk: "LOW", contractStatus: "Active", ...req.body };
  db.contractors.unshift(record);
  addAudit({ user: req.body.actor || "User", role: req.body.actorRole || "CORPORATE_ADMIN", action: "Added contractor", module: "Contractors", recordId: record.id });
  res.status(201).json(record);
});

router.patch("/:id", (req, res) => {
  const record = db.contractors.find((c) => c.id === req.params.id);
  if (!record) return res.status(404).json({ error: "Not found" });
  Object.assign(record, req.body);
  addAudit({ user: req.body.actor || "User", role: req.body.actorRole || "CORPORATE_ADMIN", action: "Updated contractor compliance", module: "Contractors", recordId: record.id });
  res.json(record);
});

export default router;
