import { Router } from "express";
import { db } from "../data/db.js";
import { computeMineRisk, recalcAllMines } from "../riskEngine.js";

const router = Router();

router.get("/", (_req, res) => {
  recalcAllMines(db);
  const results = db.mines.map((m) => computeMineRisk(m.id, db));
  res.json(results.sort((a, b) => b.score - a.score));
});

router.get("/:mineId", (req, res) => {
  const mine = db.mines.find((m) => m.id === req.params.mineId);
  if (!mine) return res.status(404).json({ error: "Mine not found" });
  res.json(computeMineRisk(mine.id, db));
});

router.get("/insights/trends", (_req, res) => {
  // Deterministic anomaly / trend detection over the synthetic dataset.
  const insights = [];

  db.mines.forEach((mine) => {
    const mineViolations = db.violations.filter((v) => v.mineId === mine.id);
    const byCategory = {};
    mineViolations.forEach((v) => {
      byCategory[v.category] = (byCategory[v.category] || 0) + 1;
    });
    Object.entries(byCategory).forEach(([category, count]) => {
      if (count >= 3) {
        insights.push({
          mineId: mine.id,
          mine: mine.name,
          type: "Recurring Violations",
          message: `${category} violations occurred ${count} times at ${mine.name}.`,
          recommendation: `Review ${category.toLowerCase()} procedures and root-cause the recurrence.`,
        });
      }
    });
  });

  // Incident frequency comparison (previous vs current period), deterministic per-mine.
  db.mines.forEach((mine) => {
    const mineInspections = db.inspections.filter((i) => i.mineId === mine.id);
    const now = new Date("2026-08-28T09:00:00Z");
    const prevPeriod = mineInspections.filter((i) => {
      const d = new Date(i.date);
      const diffDays = (now - d) / 86400000;
      return diffDays > 15 && diffDays <= 30 && (i.severity === "High" || i.severity === "Critical");
    }).length;
    const currentPeriod = mineInspections.filter((i) => {
      const d = new Date(i.date);
      const diffDays = (now - d) / 86400000;
      return diffDays >= 0 && diffDays <= 15 && (i.severity === "High" || i.severity === "Critical");
    }).length;
    if (prevPeriod > 0 && currentPeriod > prevPeriod) {
      const pctChange = Math.round(((currentPeriod - prevPeriod) / prevPeriod) * 100);
      insights.push({
        mineId: mine.id,
        mine: mine.name,
        type: "Incident Trend",
        message: `Incident frequency increased by ${pctChange}% at ${mine.name} (from ${prevPeriod} to ${currentPeriod}).`,
        recommendation: "Unusual increase in incidents detected — schedule a targeted safety review.",
      });
    }
  });

  res.json(insights);
});

export default router;
