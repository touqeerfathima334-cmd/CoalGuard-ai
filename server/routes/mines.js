import { Router } from "express";
import { db } from "../data/db.js";

const router = Router();

router.get("/", (_req, res) => res.json(db.mines));

router.get("/:id", (req, res) => {
  const mine = db.mines.find((m) => m.id === req.params.id);
  if (!mine) return res.status(404).json({ error: "Mine not found" });
  res.json(mine);
});

router.get("/:id/summary", (req, res) => {
  const mineId = req.params.id;
  const mine = db.mines.find((m) => m.id === mineId);
  if (!mine) return res.status(404).json({ error: "Mine not found" });
  res.json({
    mine,
    compliance: db.compliance.filter((c) => c.mineId === mineId),
    inspections: db.inspections.filter((i) => i.mineId === mineId),
    violations: db.violations.filter((v) => v.mineId === mineId),
    correctiveActions: db.correctiveActions.filter((a) => a.mineId === mineId),
    contractors: db.contractors.filter((c) => c.mineId === mineId),
    documents: db.documents.filter((d) => d.mineId === mineId),
  });
});

export default router;
