/**
 * CoalGuard AI - Transparent, deterministic Risk Scoring Engine
 * -----------------------------------------------------------------------
 * NOTE: This is an AI-INSPIRED, RULE-BASED explainable scoring engine built
 * for the SIH hackathon prototype. It is intentionally NOT a black-box /
 * random model - the same input data always produces the same score, and
 * every point of the score can be traced back to a specific factor.
 *
 * The function signatures below are written so that this module can later
 * be swapped for a trained ML model (e.g. a FastAPI microservice) without
 * changing any calling code - callers only depend on computeMineRisk().
 *
 * Risk Score = Violation Risk (0-30)
 *            + Compliance Risk (0-25)
 *            + Incident Risk   (0-20)
 *            + Inspection Risk (0-15)
 *            + Corrective Action Delay Risk (0-10)
 *            = 0-100 total
 *
 * Classification:
 *   0-30   LOW
 *   31-60  MEDIUM
 *   61-80  HIGH
 *   81-100 CRITICAL
 */

export function classifyRisk(score) {
  if (score >= 81) return "CRITICAL";
  if (score >= 61) return "HIGH";
  if (score >= 31) return "MEDIUM";
  return "LOW";
}

export function computeMineRisk(mineId, db) {
  const violations = db.violations.filter((v) => v.mineId === mineId);
  const compliance = db.compliance.filter((c) => c.mineId === mineId);
  const inspections = db.inspections.filter((i) => i.mineId === mineId);
  const actions = db.correctiveActions.filter((a) => a.mineId === mineId);

  const openViolations = violations.filter((v) =>
    ["OPEN", "IN PROGRESS"].includes(v.status)
  );
  const criticalViolations = violations.filter(
    (v) => v.severity === "Critical" && v.status !== "CLOSED"
  );

  const overdueCompliance = compliance.filter((c) => c.status === "OVERDUE");
  const dueSoonCompliance = compliance.filter((c) => c.status === "DUE SOON");

  const recentIncidents = inspections.filter(
    (i) => i.severity === "Critical" || i.severity === "High"
  );

  const highSeverityFindings = inspections.filter(
    (i) => i.severity === "High" || i.severity === "Critical"
  );

  const overdueActions = actions.filter(
    (a) => a.status !== "Closed" && new Date(a.deadline) < new Date()
  );

  const violationRisk = Math.min(
    30,
    openViolations.length * 4 + criticalViolations.length * 6
  );
  const complianceRisk = Math.min(
    25,
    overdueCompliance.length * 5 + dueSoonCompliance.length * 2
  );
  const incidentRisk = Math.min(20, recentIncidents.length * 4);
  const inspectionRisk = Math.min(15, highSeverityFindings.length * 5);
  const correctiveDelayRisk = Math.min(10, overdueActions.length * 3);

  const score = Math.min(
    100,
    violationRisk + complianceRisk + incidentRisk + inspectionRisk + correctiveDelayRisk
  );
  const level = classifyRisk(score);

  const factors = [
    {
      label: "Open / critical violations",
      value: openViolations.length,
      points: violationRisk,
      severity: violationRisk >= 20 ? "High" : violationRisk >= 10 ? "Medium" : "Low",
    },
    {
      label: "Overdue / due-soon compliance",
      value: overdueCompliance.length,
      points: complianceRisk,
      severity: complianceRisk >= 15 ? "High" : complianceRisk >= 8 ? "Medium" : "Low",
    },
    {
      label: "High/critical severity incidents",
      value: recentIncidents.length,
      points: incidentRisk,
      severity: incidentRisk >= 12 ? "High" : incidentRisk >= 4 ? "Medium" : "Low",
    },
    {
      label: "High-severity inspection findings",
      value: highSeverityFindings.length,
      points: inspectionRisk,
      severity: inspectionRisk >= 10 ? "High" : inspectionRisk >= 5 ? "Medium" : "Low",
    },
    {
      label: "Overdue corrective actions",
      value: overdueActions.length,
      points: correctiveDelayRisk,
      severity: correctiveDelayRisk >= 6 ? "High" : correctiveDelayRisk >= 3 ? "Medium" : "Low",
    },
  ];

  const recommendation = buildRecommendation({
    level,
    overdueActions,
    overdueCompliance,
    criticalViolations,
    openViolations,
  });

  // Confidence score: reflects how much underlying data supports the score
  // (more inspections/violations/compliance records behind a mine = higher
  // confidence in the computed risk score). Deterministic, capped 65-98.
  const dataPoints = violations.length + compliance.length + inspections.length + actions.length;
  const confidence = Math.min(98, 65 + Math.min(33, dataPoints * 2));

  const explanation = buildExplanation({ mineId, level, factors, score });

  return {
    mineId,
    score,
    level,
    factors,
    recommendation,
    explanation,
    confidence,
    computedAt: new Date().toISOString(),
  };
}

function buildExplanation({ level, factors, score }) {
  const leading = [...factors].sort((a, b) => b.points - a.points)[0];
  const base = `This mine scores ${score}/100, placing it in the ${level} risk band.`;
  if (!leading || leading.points === 0) {
    return `${base} No significant risk factors were detected in the current dataset — all monitored categories are within acceptable bounds.`;
  }
  return `${base} The largest contributor is "${leading.label}" (${leading.value} record${leading.value === 1 ? "" : "s"}, +${leading.points} points), indicating this category needs the most attention. The score recalculates automatically whenever new inspections, violations, compliance updates, or corrective action changes are recorded for this mine.`;
}

function buildRecommendation({ level, overdueActions, overdueCompliance, criticalViolations, openViolations }) {
  if (level === "CRITICAL") {
    return "Schedule an immediate safety inspection and close outstanding corrective actions.";
  }
  if (level === "HIGH") {
    if (overdueActions.length > 0) {
      return "Prioritize closure of overdue corrective actions and re-inspect within 7 days.";
    }
    return "Increase inspection frequency and review recurring violation categories.";
  }
  if (level === "MEDIUM") {
    if (overdueCompliance.length > 0) {
      return "Clear overdue compliance requirements before the next statutory review.";
    }
    return "Continue routine monitoring; no immediate escalation required.";
  }
  return "Mine is within acceptable risk parameters. Maintain current compliance cadence.";
}

export function recalcAllMines(db) {
  db.mines.forEach((mine) => {
    const risk = computeMineRisk(mine.id, db);
    mine.riskScore = risk.score;
    mine.riskLevel = risk.level;
    mine.riskFactors = risk.factors;
    mine.riskRecommendation = risk.recommendation;
    mine.riskUpdatedAt = risk.computedAt;

    const mineCompliance = db.compliance.filter((c) => c.mineId === mine.id);
    const compliantCount = mineCompliance.filter((c) => c.status === "COMPLIANT").length;
    mine.compliancePct = mineCompliance.length
      ? Math.round((compliantCount / mineCompliance.length) * 1000) / 10
      : 100;

    mine.openViolations = db.violations.filter(
      (v) => v.mineId === mine.id && ["OPEN", "IN PROGRESS"].includes(v.status)
    ).length;

    mine.pendingActions = db.correctiveActions.filter(
      (a) => a.mineId === mine.id && a.status !== "Closed"
    ).length;
  });
  return db.mines;
}
