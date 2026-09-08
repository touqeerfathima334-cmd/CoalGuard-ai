import express from "express";
import cors from "cors";
import morgan from "morgan";

import authRoutes from "./routes/auth.js";
import mineRoutes from "./routes/mines.js";
import complianceRoutes from "./routes/compliance.js";
import inspectionRoutes from "./routes/inspections.js";
import violationRoutes from "./routes/violations.js";
import correctiveActionRoutes from "./routes/correctiveActions.js";
import riskRoutes from "./routes/risk.js";
import contractorRoutes from "./routes/contractors.js";
import documentRoutes from "./routes/documents.js";
import alertRoutes from "./routes/alerts.js";
import reportRoutes from "./routes/reports.js";
import auditRoutes from "./routes/audit.js";

const app = express();
const PORT = process.env.PORT || 5050;

app.use(cors());
app.use(express.json({ limit: "5mb" }));
app.use(morgan("dev"));

app.get("/api/health", (_req, res) => res.json({ status: "ok", service: "CoalGuard AI API" }));

app.use("/api/auth", authRoutes);
app.use("/api/mines", mineRoutes);
app.use("/api/compliance", complianceRoutes);
app.use("/api/inspections", inspectionRoutes);
app.use("/api/violations", violationRoutes);
app.use("/api/corrective-actions", correctiveActionRoutes);
app.use("/api/risk", riskRoutes);
app.use("/api/contractors", contractorRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/audit", auditRoutes);

app.use((req, res) => res.status(404).json({ error: "Not found" }));
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`\n🛡️  CoalGuard AI API running at http://localhost:${PORT}\n`);
});
