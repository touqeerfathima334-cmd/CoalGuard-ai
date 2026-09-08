import { v4 as uuid } from "uuid";

// -----------------------------------------------------------------------
// SYNTHETIC / SAMPLE DATA ONLY.
// This dataset is entirely fictional and generated for demo purposes.
// It does NOT represent real Coal India Limited mines, coordinates,
// personnel, or compliance records.
// -----------------------------------------------------------------------

const today = new Date("2026-08-28T09:00:00Z");
const daysAgo = (n) => new Date(today.getTime() - n * 86400000).toISOString();
const daysFromNow = (n) => new Date(today.getTime() + n * 86400000).toISOString();

export const DEFAULT_PASSWORD = "CoalGuard@123";

export const users = [
  { id: "u-admin", name: "R. Sharma", email: "rsharma.corporateadmin@coalgov.in", password: DEFAULT_PASSWORD, role: "CORPORATE_ADMIN", mineId: null },
  { id: "u-inspector", name: "Inspector 04 - A. Verma", email: "averma.inspector@coalgov.in", password: DEFAULT_PASSWORD, role: "INSPECTOR", mineId: null },
  { id: "u-mine", name: "S. Reddy (Mine Manager)", email: "sreddy.mineofficial@coalgov.in", password: DEFAULT_PASSWORD, role: "MINE_OFFICIAL", mineId: "mine-gamma" },
  { id: "u-regulator", name: "P. Nair", email: "pnair.regulator@coalgov.in", password: DEFAULT_PASSWORD, role: "REGULATOR", mineId: null },
];

export const mines = [
  { id: "mine-alpha", name: "Mine Alpha", code: "CGA-101", state: "Jharkhand", lat: 23.7957, lng: 86.4304, status: "Operational" },
  { id: "mine-beta", name: "Mine Beta", code: "CGA-102", state: "Odisha", lat: 21.4934, lng: 84.1339, status: "Operational" },
  { id: "mine-gamma", name: "Mine Gamma", code: "CGA-103", state: "Chhattisgarh", lat: 22.0797, lng: 82.1409, status: "Operational" },
  { id: "mine-delta", name: "Mine Delta", code: "CGA-104", state: "West Bengal", lat: 23.6102, lng: 86.8996, status: "Operational" },
  { id: "mine-epsilon", name: "Mine Epsilon", code: "CGA-105", state: "Madhya Pradesh", lat: 22.9734, lng: 79.2900, status: "Operational" },
  { id: "mine-zeta", name: "Mine Zeta", code: "CGA-106", state: "Jharkhand", lat: 24.0035, lng: 85.9339, status: "Operational" },
  { id: "mine-eta", name: "Mine Eta", code: "CGA-107", state: "Telangana", lat: 18.6725, lng: 79.4816, status: "Operational" },
  { id: "mine-theta", name: "Mine Theta", code: "CGA-108", state: "Odisha", lat: 21.9497, lng: 83.9711, status: "Under Maintenance" },
  { id: "mine-iota", name: "Mine Iota", code: "CGA-109", state: "Chhattisgarh", lat: 22.3595, lng: 82.6900, status: "Operational" },
  { id: "mine-kappa", name: "Mine Kappa", code: "CGA-110", state: "Jharkhand", lat: 23.3629, lng: 85.3346, status: "Operational" },
].map((m) => ({
  ...m,
  compliancePct: 100,
  riskScore: 0,
  riskLevel: "LOW",
  riskFactors: [],
  riskRecommendation: "",
  openViolations: 0,
  pendingActions: 0,
  lastInspection: daysAgo(5),
}));

const cat = ["Safety", "Environment", "Labour", "Production", "Statutory"];

export const compliance = [
  { requirement: "Safety Equipment Inspection", category: "Safety", mineId: "mine-gamma", dueDate: daysAgo(2), status: "OVERDUE", responsibleOfficer: "Mine Manager" },
  { requirement: "Fire Extinguisher Certification", category: "Safety", mineId: "mine-gamma", dueDate: daysAgo(6), status: "OVERDUE", responsibleOfficer: "Safety Officer" },
  { requirement: "Effluent Discharge Monitoring", category: "Environment", mineId: "mine-gamma", dueDate: daysFromNow(3), status: "DUE SOON", responsibleOfficer: "Environment Officer" },
  { requirement: "Worker PPE Compliance Audit", category: "Labour", mineId: "mine-gamma", dueDate: daysAgo(1), status: "OVERDUE", responsibleOfficer: "HR Officer" },
  { requirement: "Blast Vibration Monitoring Log", category: "Production", mineId: "mine-gamma", dueDate: daysFromNow(10), status: "COMPLIANT", responsibleOfficer: "Production Head" },
  { requirement: "Mine Closure Plan Review", category: "Statutory", mineId: "mine-gamma", dueDate: daysFromNow(20), status: "UNDER REVIEW", responsibleOfficer: "Regulatory Liaison" },

  { requirement: "Ventilation System Check", category: "Safety", mineId: "mine-beta", dueDate: daysFromNow(15), status: "COMPLIANT", responsibleOfficer: "Safety Officer" },
  { requirement: "Water Quality Testing", category: "Environment", mineId: "mine-beta", dueDate: daysFromNow(2), status: "DUE SOON", responsibleOfficer: "Environment Officer" },
  { requirement: "Contractor Wage Compliance", category: "Labour", mineId: "mine-beta", dueDate: daysAgo(3), status: "OVERDUE", responsibleOfficer: "HR Officer" },
  { requirement: "Explosives Storage License Renewal", category: "Statutory", mineId: "mine-beta", dueDate: daysFromNow(30), status: "COMPLIANT", responsibleOfficer: "Regulatory Liaison" },

  { requirement: "Emergency Response Drill", category: "Safety", mineId: "mine-alpha", dueDate: daysFromNow(12), status: "COMPLIANT", responsibleOfficer: "Safety Officer" },
  { requirement: "Dust Suppression System Audit", category: "Environment", mineId: "mine-alpha", dueDate: daysFromNow(5), status: "DUE SOON", responsibleOfficer: "Environment Officer" },
  { requirement: "Overtime & Shift Compliance", category: "Labour", mineId: "mine-alpha", dueDate: daysFromNow(18), status: "COMPLIANT", responsibleOfficer: "HR Officer" },

  { requirement: "Slope Stability Assessment", category: "Safety", mineId: "mine-delta", dueDate: daysAgo(4), status: "OVERDUE", responsibleOfficer: "Mine Manager" },
  { requirement: "Air Quality Index Reporting", category: "Environment", mineId: "mine-delta", dueDate: daysFromNow(6), status: "COMPLIANT", responsibleOfficer: "Environment Officer" },
  { requirement: "Statutory Wage Board Filing", category: "Statutory", mineId: "mine-delta", dueDate: daysFromNow(9), status: "DUE SOON", responsibleOfficer: "Regulatory Liaison" },

  { requirement: "Haul Road Safety Inspection", category: "Safety", mineId: "mine-epsilon", dueDate: daysFromNow(7), status: "COMPLIANT", responsibleOfficer: "Safety Officer" },
  { requirement: "Groundwater Impact Study", category: "Environment", mineId: "mine-epsilon", dueDate: daysAgo(1), status: "OVERDUE", responsibleOfficer: "Environment Officer" },

  { requirement: "Electrical Safety Certification", category: "Safety", mineId: "mine-zeta", dueDate: daysFromNow(4), status: "DUE SOON", responsibleOfficer: "Safety Officer" },
  { requirement: "Reclamation Progress Report", category: "Production", mineId: "mine-zeta", dueDate: daysFromNow(25), status: "COMPLIANT", responsibleOfficer: "Production Head" },

  { requirement: "Underground Gas Monitoring", category: "Safety", mineId: "mine-eta", dueDate: daysFromNow(14), status: "COMPLIANT", responsibleOfficer: "Safety Officer" },
  { requirement: "Noise Pollution Assessment", category: "Environment", mineId: "mine-eta", dueDate: daysFromNow(8), status: "COMPLIANT", responsibleOfficer: "Environment Officer" },

  { requirement: "Conveyor Belt Safety Check", category: "Safety", mineId: "mine-theta", dueDate: daysAgo(5), status: "OVERDUE", responsibleOfficer: "Safety Officer" },
  { requirement: "Tailings Pond Inspection", category: "Environment", mineId: "mine-theta", dueDate: daysAgo(2), status: "OVERDUE", responsibleOfficer: "Environment Officer" },

  { requirement: "Worker Medical Camp Compliance", category: "Labour", mineId: "mine-iota", dueDate: daysFromNow(16), status: "COMPLIANT", responsibleOfficer: "HR Officer" },
  { requirement: "Production Quota Reporting", category: "Production", mineId: "mine-iota", dueDate: daysFromNow(3), status: "DUE SOON", responsibleOfficer: "Production Head" },

  { requirement: "Blast License Renewal", category: "Statutory", mineId: "mine-kappa", dueDate: daysFromNow(22), status: "COMPLIANT", responsibleOfficer: "Regulatory Liaison" },
  { requirement: "Fire Safety Drill", category: "Safety", mineId: "mine-kappa", dueDate: daysFromNow(11), status: "COMPLIANT", responsibleOfficer: "Safety Officer" },
].map((c) => ({ id: "cmp-" + uuid().slice(0, 8), lastUpdated: daysAgo(2), evidenceDoc: null, ...c }));

const inspTypes = ["Safety", "Environment", "Labour", "Equipment", "Operational", "Emergency"];

export const inspections = [
  { mineId: "mine-gamma", type: "Safety", date: daysAgo(1), time: "10:30", location: "Shaft B-2", inspector: "Inspector 04 - A. Verma", observation: "Safety equipment maintenance issue detected on primary winder.", severity: "High", evidence: "photo_gamma_1.jpg", comments: "Immediate attention required." },
  { mineId: "mine-gamma", type: "Equipment", date: daysAgo(9), time: "14:00", location: "Conveyor 3", inspector: "Inspector 02 - K. Rao", observation: "Belt tension below spec.", severity: "Medium", evidence: null, comments: "" },
  { mineId: "mine-gamma", type: "Safety", date: daysAgo(20), time: "09:00", location: "Shaft A-1", inspector: "Inspector 04 - A. Verma", observation: "Fire extinguisher pressure low in 2 locations.", severity: "High", evidence: "photo_gamma_2.jpg", comments: "" },
  { mineId: "mine-gamma", type: "Emergency", date: daysAgo(35), time: "16:20", location: "Site-wide", inspector: "Inspector 01 - N. Iyer", observation: "Minor gas seepage detected, contained.", severity: "Critical", evidence: null, comments: "Escalated at the time." },

  { mineId: "mine-beta", type: "Environment", date: daysAgo(4), time: "11:00", location: "Discharge Point 2", inspector: "Inspector 03 - M. Singh", observation: "Effluent slightly above threshold.", severity: "Medium", evidence: null, comments: "" },
  { mineId: "mine-beta", type: "Labour", date: daysAgo(15), time: "13:00", location: "Contractor Yard", inspector: "Inspector 02 - K. Rao", observation: "Missing PPE on 3 contract workers.", severity: "Medium", evidence: null, comments: "" },

  { mineId: "mine-alpha", type: "Safety", date: daysAgo(6), time: "09:45", location: "Open Pit North", inspector: "Inspector 01 - N. Iyer", observation: "Routine check, all clear.", severity: "Low", evidence: null, comments: "" },
  { mineId: "mine-alpha", type: "Operational", date: daysAgo(22), time: "10:00", location: "Processing Plant", inspector: "Inspector 04 - A. Verma", observation: "Minor equipment wear noted.", severity: "Low", evidence: null, comments: "" },

  { mineId: "mine-delta", type: "Safety", date: daysAgo(3), time: "12:15", location: "Slope Section C", inspector: "Inspector 03 - M. Singh", observation: "Slope stability marginal, cracks observed.", severity: "High", evidence: "photo_delta_1.jpg", comments: "" },
  { mineId: "mine-delta", type: "Equipment", date: daysAgo(18), time: "15:30", location: "Drill Site 4", inspector: "Inspector 02 - K. Rao", observation: "Drill rig hydraulic leak.", severity: "Medium", evidence: null, comments: "" },

  { mineId: "mine-epsilon", type: "Environment", date: daysAgo(2), time: "08:30", location: "Groundwater Well 5", inspector: "Inspector 01 - N. Iyer", observation: "Contamination indicators elevated.", severity: "High", evidence: null, comments: "" },

  { mineId: "mine-zeta", type: "Safety", date: daysAgo(10), time: "09:00", location: "Substation 1", inspector: "Inspector 04 - A. Verma", observation: "Electrical panel needs re-certification.", severity: "Medium", evidence: null, comments: "" },

  { mineId: "mine-eta", type: "Operational", date: daysAgo(7), time: "10:00", location: "Loading Bay", inspector: "Inspector 02 - K. Rao", observation: "All systems nominal.", severity: "Low", evidence: null, comments: "" },

  { mineId: "mine-theta", type: "Safety", date: daysAgo(5), time: "11:20", location: "Conveyor Belt System", inspector: "Inspector 03 - M. Singh", observation: "Belt guard missing at 2 points.", severity: "High", evidence: "photo_theta_1.jpg", comments: "" },
  { mineId: "mine-theta", type: "Environment", date: daysAgo(12), time: "14:45", location: "Tailings Pond", inspector: "Inspector 01 - N. Iyer", observation: "Embankment seepage observed.", severity: "Critical", evidence: null, comments: "" },

  { mineId: "mine-iota", type: "Labour", date: daysAgo(8), time: "09:30", location: "Worker Camp", inspector: "Inspector 04 - A. Verma", observation: "Medical camp records incomplete.", severity: "Low", evidence: null, comments: "" },

  { mineId: "mine-kappa", type: "Safety", date: daysAgo(14), time: "10:10", location: "Blast Zone 2", inspector: "Inspector 02 - K. Rao", observation: "Routine blast safety check, compliant.", severity: "Low", evidence: null, comments: "" },
].map((i) => ({ id: "insp-" + uuid().slice(0, 8), createdAt: i.date, ...i }));

export const violations = [
  { mineId: "mine-gamma", category: "Safety", description: "Safety equipment maintenance failure - primary winder", severity: "Critical", reportedDate: daysAgo(1), responsiblePerson: "Mine Manager", status: "OPEN" },
  { mineId: "mine-gamma", category: "Safety", description: "Fire extinguisher pressure below standard (2 units)", severity: "High", reportedDate: daysAgo(6), responsiblePerson: "Safety Officer", status: "IN PROGRESS" },
  { mineId: "mine-gamma", category: "Safety", description: "Recurring belt tension non-conformance", severity: "Medium", reportedDate: daysAgo(9), responsiblePerson: "Maintenance Head", status: "OPEN" },
  { mineId: "mine-gamma", category: "Labour", description: "PPE non-compliance among contract workers", severity: "Medium", reportedDate: daysAgo(1), responsiblePerson: "HR Officer", status: "OPEN" },
  { mineId: "mine-gamma", category: "Environment", description: "Effluent discharge monitoring lapse", severity: "Medium", reportedDate: daysAgo(3), responsiblePerson: "Environment Officer", status: "OPEN" },
  { mineId: "mine-gamma", category: "Safety", description: "Gas seepage incident (contained)", severity: "Critical", reportedDate: daysAgo(35), responsiblePerson: "Safety Officer", status: "RESOLVED" },
  { mineId: "mine-gamma", category: "Statutory", description: "Delayed statutory filing for Q2 closure plan", severity: "Low", reportedDate: daysAgo(20), responsiblePerson: "Regulatory Liaison", status: "IN PROGRESS" },

  { mineId: "mine-beta", category: "Environment", description: "Effluent levels above threshold at discharge point 2", severity: "Medium", reportedDate: daysAgo(4), responsiblePerson: "Environment Officer", status: "OPEN" },
  { mineId: "mine-beta", category: "Labour", description: "Contractor wage compliance overdue", severity: "Medium", reportedDate: daysAgo(3), responsiblePerson: "HR Officer", status: "OPEN" },
  { mineId: "mine-beta", category: "Labour", description: "Missing PPE - 3 contract workers", severity: "Medium", reportedDate: daysAgo(15), responsiblePerson: "Contractor Supervisor", status: "VERIFIED" },

  { mineId: "mine-delta", category: "Safety", description: "Slope instability with visible cracking - Section C", severity: "High", reportedDate: daysAgo(3), responsiblePerson: "Mine Manager", status: "OPEN" },
  { mineId: "mine-delta", category: "Equipment", description: "Drill rig hydraulic leak", severity: "Medium", reportedDate: daysAgo(18), responsiblePerson: "Maintenance Head", status: "RESOLVED" },
  { mineId: "mine-delta", category: "Safety", description: "Overdue slope stability assessment", severity: "High", reportedDate: daysAgo(4), responsiblePerson: "Safety Officer", status: "IN PROGRESS" },

  { mineId: "mine-epsilon", category: "Environment", description: "Elevated groundwater contamination indicators", severity: "High", reportedDate: daysAgo(2), responsiblePerson: "Environment Officer", status: "OPEN" },

  { mineId: "mine-theta", category: "Safety", description: "Conveyor belt guard missing at 2 points", severity: "High", reportedDate: daysAgo(5), responsiblePerson: "Safety Officer", status: "OPEN" },
  { mineId: "mine-theta", category: "Environment", description: "Tailings pond embankment seepage", severity: "Critical", reportedDate: daysAgo(12), responsiblePerson: "Environment Officer", status: "IN PROGRESS" },
  { mineId: "mine-theta", category: "Safety", description: "Overdue conveyor safety check", severity: "Medium", reportedDate: daysAgo(5), responsiblePerson: "Mine Manager", status: "OPEN" },

  { mineId: "mine-zeta", category: "Safety", description: "Electrical panel re-certification overdue", severity: "Medium", reportedDate: daysAgo(10), responsiblePerson: "Electrical Engineer", status: "OPEN" },

  { mineId: "mine-alpha", category: "Environment", description: "Dust suppression system minor underperformance", severity: "Low", reportedDate: daysAgo(6), responsiblePerson: "Environment Officer", status: "RESOLVED" },
].map((v) => ({ id: "vio-" + uuid().slice(0, 8), evidence: null, ...v }));

export const correctiveActions = [
  { mineId: "mine-gamma", title: "Inspect and repair primary winder safety equipment", priority: "CRITICAL", assignedTo: "Mine Manager", deadline: daysAgo(0), status: "Pending" },
  { mineId: "mine-gamma", title: "Replace / recharge fire extinguishers (2 units)", priority: "HIGH", assignedTo: "Safety Officer", deadline: daysAgo(1), status: "In Progress" },
  { mineId: "mine-gamma", title: "Recalibrate conveyor belt tension system", priority: "MEDIUM", assignedTo: "Maintenance Head", deadline: daysFromNow(3), status: "Pending" },
  { mineId: "mine-gamma", title: "Conduct PPE compliance retraining", priority: "MEDIUM", assignedTo: "HR Officer", deadline: daysFromNow(2), status: "Pending" },
  { mineId: "mine-gamma", title: "Resume effluent monitoring cadence", priority: "MEDIUM", assignedTo: "Environment Officer", deadline: daysFromNow(5), status: "In Progress" },

  { mineId: "mine-beta", title: "Reduce effluent discharge to threshold", priority: "MEDIUM", assignedTo: "Environment Officer", deadline: daysFromNow(4), status: "In Progress" },
  { mineId: "mine-beta", title: "Settle overdue contractor wage compliance", priority: "MEDIUM", assignedTo: "HR Officer", deadline: daysAgo(1), status: "Pending" },

  { mineId: "mine-delta", title: "Stabilize slope Section C / install monitoring", priority: "HIGH", assignedTo: "Mine Manager", deadline: daysAgo(1), status: "Pending" },
  { mineId: "mine-delta", title: "Repair drill rig hydraulic system", priority: "MEDIUM", assignedTo: "Maintenance Head", deadline: daysAgo(5), status: "Completed" },

  { mineId: "mine-epsilon", title: "Investigate groundwater contamination source", priority: "HIGH", assignedTo: "Environment Officer", deadline: daysFromNow(2), status: "Pending" },

  { mineId: "mine-theta", title: "Install missing conveyor belt guards", priority: "HIGH", assignedTo: "Safety Officer", deadline: daysAgo(2), status: "Pending" },
  { mineId: "mine-theta", title: "Reinforce tailings pond embankment", priority: "CRITICAL", assignedTo: "Environment Officer", deadline: daysAgo(3), status: "In Progress" },
  { mineId: "mine-theta", title: "Complete overdue conveyor safety check", priority: "MEDIUM", assignedTo: "Mine Manager", deadline: daysFromNow(1), status: "Pending" },

  { mineId: "mine-zeta", title: "Re-certify substation electrical panel", priority: "MEDIUM", assignedTo: "Electrical Engineer", deadline: daysFromNow(6), status: "Pending" },

  { mineId: "mine-alpha", title: "Service dust suppression nozzles", priority: "LOW", assignedTo: "Environment Officer", deadline: daysAgo(2), status: "Completed" },
].map((a) => ({ id: "ca-" + uuid().slice(0, 8), violationId: null, createdAt: daysAgo(10), ...a }));

export const contractors = [
  { name: "ABC Mining Services", mineId: "mine-alpha", workers: 125, compliancePct: 91, safetyTrainingPct: 96, contractStatus: "Active", risk: "LOW" },
  { name: "XYZ Industrial Services", mineId: "mine-gamma", workers: 82, compliancePct: 68, safetyTrainingPct: 71, contractStatus: "Active", risk: "HIGH" },
  { name: "Delta Earthworks Pvt Ltd", mineId: "mine-delta", workers: 64, compliancePct: 79, safetyTrainingPct: 84, contractStatus: "Active", risk: "MEDIUM" },
  { name: "Sunrise Logistics Co.", mineId: "mine-beta", workers: 40, compliancePct: 88, safetyTrainingPct: 90, contractStatus: "Active", risk: "LOW" },
  { name: "Bharat Drilling Contractors", mineId: "mine-theta", workers: 55, compliancePct: 61, safetyTrainingPct: 58, contractStatus: "Under Review", risk: "HIGH" },
  { name: "Prime Equipment Rentals", mineId: "mine-eta", workers: 30, compliancePct: 94, safetyTrainingPct: 97, contractStatus: "Active", risk: "LOW" },
].map((c) => ({ id: "con-" + uuid().slice(0, 8), ...c }));

export const documents = [
  { name: "Safety_Certificate_MineGamma.pdf", mineId: "mine-gamma", type: "Safety Certificate", uploadDate: daysAgo(1), ocrStatus: "Completed", complianceStatus: "VALID", extractedFields: { certificateNumber: "SC-2026-GM-0417", mineName: "Mine Gamma", issueDate: "2025-09-15", expiryDate: "2026-09-15", documentType: "Safety Certificate" } },
  { name: "Fire_Extinguisher_Log.pdf", mineId: "mine-gamma", type: "Inspection Log", uploadDate: daysAgo(6), ocrStatus: "Completed", complianceStatus: "REVIEW REQUIRED", extractedFields: { certificateNumber: "FE-2026-0231", mineName: "Mine Gamma", issueDate: "2026-02-01", expiryDate: "2026-08-01", documentType: "Inspection Log" } },
  { name: "Environment_Clearance_MineBeta.pdf", mineId: "mine-beta", type: "Environment Clearance", uploadDate: daysAgo(20), ocrStatus: "Completed", complianceStatus: "VALID", extractedFields: { certificateNumber: "EC-2025-BT-1190", mineName: "Mine Beta", issueDate: "2025-01-10", expiryDate: "2027-01-10", documentType: "Environment Clearance" } },
  { name: "Contractor_Agreement_XYZ.pdf", mineId: "mine-gamma", type: "Contractor Agreement", uploadDate: daysAgo(45), ocrStatus: "Completed", complianceStatus: "VALID", extractedFields: { certificateNumber: "CA-2025-XYZ-77", mineName: "Mine Gamma", issueDate: "2025-06-01", expiryDate: "2027-06-01", documentType: "Contractor Agreement" } },
  { name: "Blast_License_MineKappa.pdf", mineId: "mine-kappa", type: "Blast License", uploadDate: daysAgo(30), ocrStatus: "Completed", complianceStatus: "VALID", extractedFields: { certificateNumber: "BL-2025-KP-552", mineName: "Mine Kappa", issueDate: "2025-03-20", expiryDate: "2027-03-20", documentType: "Blast License" } },
  { name: "Slope_Stability_Report_Delta.pdf", mineId: "mine-delta", type: "Safety Report", uploadDate: daysAgo(3), ocrStatus: "Completed", complianceStatus: "REVIEW REQUIRED", extractedFields: { certificateNumber: "SR-2026-DL-091", mineName: "Mine Delta", issueDate: "2026-08-25", expiryDate: "N/A", documentType: "Safety Report" } },
  { name: "Water_Quality_Report_Beta.pdf", mineId: "mine-beta", type: "Environment Report", uploadDate: daysAgo(4), ocrStatus: "Completed", complianceStatus: "VALID", extractedFields: { certificateNumber: "WQ-2026-BT-303", mineName: "Mine Beta", issueDate: "2026-08-24", expiryDate: "N/A", documentType: "Environment Report" } },
  { name: "Electrical_Safety_Cert_Zeta.pdf", mineId: "mine-zeta", type: "Safety Certificate", uploadDate: daysAgo(60), ocrStatus: "Completed", complianceStatus: "EXPIRING SOON", extractedFields: { certificateNumber: "ES-2024-ZT-118", mineName: "Mine Zeta", issueDate: "2024-09-01", expiryDate: "2026-09-01", documentType: "Safety Certificate" } },
  { name: "Tailings_Pond_Assessment_Theta.pdf", mineId: "mine-theta", type: "Environment Report", uploadDate: daysAgo(12), ocrStatus: "Completed", complianceStatus: "REVIEW REQUIRED", extractedFields: { certificateNumber: "TP-2026-TH-044", mineName: "Mine Theta", issueDate: "2026-08-16", expiryDate: "N/A", documentType: "Environment Report" } },
  { name: "Medical_Camp_Records_Iota.pdf", mineId: "mine-iota", type: "Labour Compliance", uploadDate: daysAgo(8), ocrStatus: "Completed", complianceStatus: "VALID", extractedFields: { certificateNumber: "MC-2026-IT-212", mineName: "Mine Iota", issueDate: "2026-08-20", expiryDate: "N/A", documentType: "Labour Compliance" } },
].map((d) => ({ id: "doc-" + uuid().slice(0, 8), ...d }));

export const alerts = [
  { type: "Critical Safety Alert", mineId: "mine-gamma", severity: "CRITICAL", message: "Mine Gamma has been classified as CRITICAL RISK.", action: "Schedule immediate inspection.", createdAt: daysAgo(0), read: false },
  { type: "Overdue Compliance", mineId: "mine-gamma", severity: "HIGH", message: "2 compliance requirements are overdue at Mine Gamma.", action: "Review and update compliance status.", createdAt: daysAgo(1), read: false },
  { type: "Corrective Action Deadline", mineId: "mine-gamma", severity: "HIGH", message: "Corrective action CA for winder repair is overdue.", action: "Escalate to Mine Manager.", createdAt: daysAgo(0), read: false },
  { type: "Risk Increase", mineId: "mine-gamma", severity: "CRITICAL", message: "Risk score increased from 72 to 87 after latest inspection.", action: "Immediate corrective action required.", createdAt: daysAgo(0), read: false },
  { type: "Inspection Alert", mineId: "mine-theta", severity: "HIGH", message: "Critical environment finding at tailings pond, Mine Theta.", action: "Assign environment officer for follow-up.", createdAt: daysAgo(12), read: true },
  { type: "Overdue Compliance", mineId: "mine-theta", severity: "MEDIUM", message: "Conveyor safety check overdue at Mine Theta.", action: "Reschedule inspection.", createdAt: daysAgo(5), read: true },
  { type: "Contractor Compliance Alert", mineId: "mine-theta", severity: "MEDIUM", message: "Bharat Drilling Contractors compliance score below threshold (61%).", action: "Initiate contractor review.", createdAt: daysAgo(6), read: false },
  { type: "Contractor Compliance Alert", mineId: "mine-gamma", severity: "MEDIUM", message: "XYZ Industrial Services compliance score below threshold (68%).", action: "Initiate contractor review.", createdAt: daysAgo(2), read: false },
  { type: "Overdue Compliance", mineId: "mine-delta", severity: "MEDIUM", message: "Slope stability assessment overdue at Mine Delta.", action: "Assign safety officer.", createdAt: daysAgo(4), read: true },
  { type: "Risk Increase", mineId: "mine-delta", severity: "MEDIUM", message: "Mine Delta risk trending upward due to slope instability.", action: "Monitor closely.", createdAt: daysAgo(3), read: true },
  { type: "Inspection Alert", mineId: "mine-epsilon", severity: "MEDIUM", message: "Elevated groundwater contamination indicators at Mine Epsilon.", action: "Investigate source.", createdAt: daysAgo(2), read: false },
  { type: "Corrective Action Deadline", mineId: "mine-beta", severity: "LOW", message: "Contractor wage compliance action overdue at Mine Beta.", action: "Follow up with HR Officer.", createdAt: daysAgo(1), read: true },
  { type: "Overdue Compliance", mineId: "mine-beta", severity: "LOW", message: "Contractor wage compliance overdue at Mine Beta.", action: "Settle payment records.", createdAt: daysAgo(3), read: true },
  { type: "Critical Safety Alert", mineId: "mine-theta", severity: "HIGH", message: "Tailings pond embankment seepage requires urgent reinforcement.", action: "Deploy structural review team.", createdAt: daysAgo(12), read: false },
  { type: "Inspection Alert", mineId: "mine-zeta", severity: "LOW", message: "Electrical panel re-certification due soon at Mine Zeta.", action: "Schedule certification.", createdAt: daysAgo(10), read: true },
].map((a) => ({ id: "alt-" + uuid().slice(0, 8), ...a }));

export const auditLogs = [
  { timestamp: daysAgo(0), user: "Inspector 04 - A. Verma", role: "INSPECTOR", action: "Created inspection", module: "Inspections", recordId: "INS-1024" },
  { timestamp: daysAgo(0), user: "AI Engine", role: "SYSTEM", action: "Updated risk score", module: "AI Risk Analysis", recordId: "Mine Gamma" },
  { timestamp: daysAgo(0), user: "System", role: "SYSTEM", action: "Generated critical alert", module: "Alerts", recordId: "ALT-1024" },
  { timestamp: daysAgo(0), user: "System", role: "SYSTEM", action: "Created recommended corrective action", module: "Corrective Actions", recordId: "CA-1024" },
  { timestamp: daysAgo(1), user: "R. Sharma", role: "CORPORATE_ADMIN", action: "Reviewed dashboard analytics", module: "Dashboard", recordId: "-" },
  { timestamp: daysAgo(1), user: "S. Reddy", role: "MINE_OFFICIAL", action: "Uploaded compliance evidence", module: "Compliance", recordId: "CMP-0091" },
  { timestamp: daysAgo(2), user: "P. Nair", role: "REGULATOR", action: "Reviewed audit trail", module: "Audit Trail", recordId: "-" },
  { timestamp: daysAgo(2), user: "Inspector 02 - K. Rao", role: "INSPECTOR", action: "Updated violation status", module: "Violations", recordId: "VIO-0034" },
  { timestamp: daysAgo(3), user: "Environment Officer", role: "MINE_OFFICIAL", action: "Marked compliance under review", module: "Compliance", recordId: "CMP-0055" },
  { timestamp: daysAgo(4), user: "System", role: "SYSTEM", action: "Generated overdue compliance alert", module: "Alerts", recordId: "ALT-0989" },
].map((l) => ({ id: "log-" + uuid().slice(0, 8), ...l }));
