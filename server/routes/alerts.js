import { Router } from "express";
import { db } from "../data/db.js";

const router = Router();

router.get("/", (req, res) => {
  const { mineId, severity, unreadOnly } = req.query;
  let items = db.alerts;
  if (mineId) items = items.filter((a) => a.mineId === mineId);
  if (severity) items = items.filter((a) => a.severity === severity);
  if (unreadOnly === "true") items = items.filter((a) => !a.read);
  res.json(items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
});

router.patch("/:id/read", (req, res) => {
  const alert = db.alerts.find((a) => a.id === req.params.id);
  if (!alert) return res.status(404).json({ error: "Not found" });
  alert.read = true;
  res.json(alert);
});

export default router;
