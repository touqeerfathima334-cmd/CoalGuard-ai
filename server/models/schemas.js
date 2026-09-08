/**
 * Mongoose schema DEFINITIONS for CoalGuard AI.
 *
 * The running prototype uses a fast in-memory data store (server/data/db.js)
 * so the hackathon demo works instantly with zero external setup (no MongoDB
 * install required). These Mongoose schemas are included so the app can be
 * pointed at a real MongoDB instance in production with minimal changes -
 * just replace the in-memory collection access in server/data/db.js with
 * these Mongoose models.
 *
 * To activate real MongoDB:
 *   1. npm install mongoose
 *   2. mongoose.connect(process.env.MONGODB_URI)
 *   3. Swap db.mines / db.users / etc. for Mine.find(), User.find(), etc.
 */
import mongoose from "mongoose";
const { Schema } = mongoose;

export const UserSchema = new Schema({
  name: String,
  email: { type: String, unique: true },
  password: String, // hashed in production
  role: { type: String, enum: ["MINE_OFFICIAL", "INSPECTOR", "CORPORATE_ADMIN", "REGULATOR"] },
  mineId: String,
});

export const MineSchema = new Schema({
  name: String,
  code: String,
  state: String,
  lat: Number,
  lng: Number,
  status: String,
  compliancePct: Number,
  riskScore: Number,
  riskLevel: String,
  openViolations: Number,
  pendingActions: Number,
  lastInspection: Date,
});

export const ComplianceSchema = new Schema({
  mineId: String,
  requirement: String,
  category: String,
  dueDate: Date,
  responsibleOfficer: String,
  status: String,
  lastUpdated: Date,
  evidenceDoc: String,
});

export const InspectionSchema = new Schema({
  mineId: String,
  type: String,
  date: Date,
  time: String,
  location: String,
  inspector: String,
  observation: String,
  severity: String,
  evidence: String,
  comments: String,
  createdAt: Date,
});

export const ViolationSchema = new Schema({
  mineId: String,
  category: String,
  description: String,
  severity: String,
  reportedDate: Date,
  responsiblePerson: String,
  status: String,
  evidence: String,
});

export const CorrectiveActionSchema = new Schema({
  mineId: String,
  violationId: String,
  title: String,
  priority: String,
  assignedTo: String,
  deadline: Date,
  status: String,
  createdAt: Date,
});

export const ContractorSchema = new Schema({
  name: String,
  mineId: String,
  workers: Number,
  compliancePct: Number,
  safetyTrainingPct: Number,
  contractStatus: String,
  risk: String,
});

export const DocumentSchema = new Schema({
  name: String,
  mineId: String,
  type: String,
  uploadDate: Date,
  ocrStatus: String,
  complianceStatus: String,
  extractedFields: Object,
});

export const AlertSchema = new Schema({
  type: String,
  mineId: String,
  severity: String,
  message: String,
  action: String,
  createdAt: Date,
  read: Boolean,
});

export const AuditLogSchema = new Schema({
  timestamp: Date,
  user: String,
  role: String,
  action: String,
  module: String,
  recordId: String,
});
