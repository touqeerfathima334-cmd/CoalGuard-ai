import { Router } from "express";
import { db } from "../data/db.js";
import { recalcAllMines } from "../riskEngine.js";

const router = Router();

router.get("/summary", (_req, res) => {
  recalcAllMines(db);
  res.json({
    totalMines: db.mines.length,
    overallCompliance:
      Math.round(
        (db.mines.reduce((sum, m) => sum + m.compliancePct, 0) / db.mines.length) * 10
      ) / 10,
    openViolations: db.violations.filter((v) => ["OPEN", "IN PROGRESS"].includes(v.status)).length,
    highRiskMines: db.mines.filter((m) => m.riskLevel === "HIGH" || m.riskLevel === "CRITICAL").length,
    pendingCorrectiveActions: db.correctiveActions.filter((a) => a.status !== "Closed" && a.status !== "Completed").length,
    upcomingDeadlines: db.compliance.filter((c) => c.status === "DUE SOON").length,
  });
});

// CSV export for a given report type - simple, dependency-free.
router.get("/export/:type", (req, res) => {
  const { type } = req.params;
  let rows = [];
  let headers = [];

  if (type === "compliance") {
    headers = ["Requirement", "Category", "Mine", "Due Date", "Status", "Responsible Officer"];
    rows = db.compliance.map((c) => [
      c.requirement, c.category,
      db.mines.find((m) => m.id === c.mineId)?.name || c.mineId,
      c.dueDate, c.status, c.responsibleOfficer,
    ]);
  } else if (type === "violations") {
    headers = ["Violation ID", "Mine", "Category", "Description", "Severity", "Status"];
    rows = db.violations.map((v) => [
      v.id, db.mines.find((m) => m.id === v.mineId)?.name || v.mineId,
      v.category, v.description, v.severity, v.status,
    ]);
  } else if (type === "risk") {
    headers = ["Mine", "Risk Score", "Risk Level", "Compliance %", "Open Violations"];
    rows = db.mines.map((m) => [m.name, m.riskScore, m.riskLevel, m.compliancePct, m.openViolations]);
  } else if (type === "inspections") {
    headers = ["Mine", "Type", "Date", "Inspector", "Severity", "Observation"];
    rows = db.inspections.map((i) => [
      db.mines.find((m) => m.id === i.mineId)?.name || i.mineId,
      i.type, i.date, i.inspector, i.severity, i.observation,
    ]);
  } else if (type === "contractors") {
    headers = ["Contractor", "Mine", "Workers", "Compliance %", "Risk"];
    rows = db.contractors.map((c) => [
      c.name, db.mines.find((m) => m.id === c.mineId)?.name || c.mineId,
      c.workers, c.compliancePct, c.risk,
    ]);
  } else if (type === "safety") {
    headers = ["Mine", "Open Safety Violations", "High/Critical Inspections", "Risk Level"];
    rows = db.mines.map((m) => [
      m.name,
      db.violations.filter((v) => v.mineId === m.id && v.category === "Safety" && ["OPEN", "IN PROGRESS"].includes(v.status)).length,
      db.inspections.filter((i) => i.mineId === m.id && (i.severity === "High" || i.severity === "Critical")).length,
      m.riskLevel,
    ]);
  } else {
    return res.status(400).json({ error: "Unknown report type" });
  }

  const csv = [headers.join(","), ...rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))].join("\n");
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename="coalguard_${type}_report.csv"`);
  res.send(csv);
});

export default router;
