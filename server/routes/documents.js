import { Router } from "express";
import { db, addAudit } from "../data/db.js";

const router = Router();

router.get("/", (req, res) => {
  const { mineId } = req.query;
  let items = db.documents;
  if (mineId) items = items.filter((d) => d.mineId === mineId);
  res.json(items.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate)));
});

// Demo OCR pipeline: accepts document metadata (name/mine/type) and returns
// deterministic mock-extracted fields. Structured so a real OCR engine
// (e.g. Tesseract.js or a cloud OCR API) can replace extractFieldsDemo()
// without touching the route contract.
router.post("/ocr", (req, res) => {
  const { name, mineId, type } = req.body;
  const mine = db.mines.find((m) => m.id === mineId);
  const extracted = extractFieldsDemo(name, mine?.name || "Unknown Mine", type);

  const doc = {
    id: "doc-" + Math.random().toString(36).slice(2, 10),
    name,
    mineId,
    type: type || "Uncategorized",
    uploadDate: new Date().toISOString(),
    ocrStatus: "Completed",
    complianceStatus: extracted.certificateExpired ? "EXPIRED" : "VALID",
    extractedFields: extracted.fields,
  };
  db.documents.unshift(doc);
  addAudit({ user: "User", role: "MINE_OFFICIAL", action: "Uploaded document (OCR processed)", module: "Documents & OCR", recordId: doc.id });
  res.status(201).json(doc);
});

function extractFieldsDemo(fileName, mineName, docType) {
  const seed = String(fileName).length + String(mineName).length;
  const issueYear = 2025;
  const expiryYear = 2026 + (seed % 2);
  const certNumber = `${(docType || "DOC").slice(0, 2).toUpperCase()}-${issueYear}-${String(seed).padStart(4, "0")}`;
  const expiryDate = `${expiryYear}-09-15`;
  const certificateExpired = new Date(expiryDate) < new Date("2026-08-28");
  return {
    fields: {
      certificateNumber: certNumber,
      mineName,
      issueDate: `${issueYear}-09-15`,
      expiryDate,
      documentType: docType || "General Document",
    },
    certificateExpired,
  };
}

export default router;
