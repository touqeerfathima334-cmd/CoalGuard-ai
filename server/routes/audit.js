import { Router } from "express";
import { db } from "../data/db.js";

const router = Router();

router.get("/", (req, res) => {
  const { module, role } = req.query;
  let items = db.auditLogs;
  if (module) items = items.filter((l) => l.module === module);
  if (role) items = items.filter((l) => l.role === role);
  res.json(items.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
});

export default router;
