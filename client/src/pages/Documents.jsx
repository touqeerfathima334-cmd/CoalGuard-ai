import React, { useEffect, useState } from "react";
import { Upload, X, FileScan, CheckCircle2 } from "lucide-react";
import { api } from "../services/api.js";
import { useToast } from "../components/Toast.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import LoadingState from "../components/LoadingState.jsx";
import EmptyState from "../components/EmptyState.jsx";
import { formatDate, mineName } from "../utils/format.js";

const DOC_TYPES = ["Safety Certificate", "Environment Clearance", "Contractor Agreement", "Blast License", "Inspection Log", "Safety Report", "Environment Report", "Labour Compliance"];

export default function Documents() {
  const toast = useToast();
  const [documents, setDocuments] = useState([]);
  const [mines, setMines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [ocrResult, setOcrResult] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [form, setForm] = useState({ name: "", mineId: "", type: DOC_TYPES[0] });

  const load = async () => {
    setLoading(true);
    const [d, m] = await Promise.all([api.getDocuments(), api.getMines()]);
    setDocuments(d); setMines(m); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const runOcr = async (e) => {
    e.preventDefault();
    if (!form.name || !form.mineId) { toast.push("Please provide a file name and mine.", "error"); return; }
    setProcessing(true);
    setTimeout(async () => {
      try {
        const doc = await api.runOcr(form);
        setOcrResult(doc);
        setDocuments((ds) => [doc, ...ds]);
        toast.push("OCR completed successfully.");
      } catch (err) { toast.push(err.message, "error"); }
      finally { setProcessing(false); }
    }, 700);
  };

  const closeModal = () => { setModalOpen(false); setOcrResult(null); setForm({ name: "", mineId: "", type: DOC_TYPES[0] }); };

  if (loading) return <LoadingState label="Loading documents..." />;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">Documents & OCR</h1>
          <p className="text-sm text-slate-400">{documents.length} documents on file</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary"><Upload size={16} /> Upload Document</button>
      </div>

      {documents.length === 0 ? (
        <div className="card"><EmptyState icon={FileScan} title="No documents uploaded" /></div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-xs text-slate-500 uppercase border-b border-white/[0.06]">
              <th className="px-4 py-3 font-medium">Document</th><th className="px-4 py-3 font-medium">Mine</th>
              <th className="px-4 py-3 font-medium">Type</th><th className="px-4 py-3 font-medium">Uploaded</th>
              <th className="px-4 py-3 font-medium">OCR Status</th><th className="px-4 py-3 font-medium">Compliance</th>
            </tr></thead>
            <tbody>
              {documents.map((d) => (
                <tr key={d.id} className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02]">
                  <td className="px-4 py-3 font-medium text-slate-200">{d.name}</td>
                  <td className="px-4 py-3 text-slate-400">{mineName(mines, d.mineId)}</td>
                  <td className="px-4 py-3 text-slate-400">{d.type}</td>
                  <td className="px-4 py-3 text-slate-400">{formatDate(d.uploadDate)}</td>
                  <td className="px-4 py-3"><span className="badge bg-emerald-500/15 text-emerald-400"><CheckCircle2 size={11} /> {d.ocrStatus}</span></td>
                  <td className="px-4 py-3"><StatusBadge status={d.complianceStatus} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card w-full max-w-md p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="font-semibold text-white">{ocrResult ? "OCR Completed" : "Upload Document"}</p>
              <button onClick={closeModal}><X size={18} className="text-slate-500" /></button>
            </div>

            {!ocrResult ? (
              <form onSubmit={runOcr} className="space-y-3">
                <div>
                  <label className="label">File Name</label>
                  <input required className="input" placeholder="e.g. Safety_Certificate_MineAlpha.pdf" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
                  <p className="text-[11px] text-slate-500 mt-1">Demo upload — supports PDF, JPG, PNG. Type a filename to simulate a scan.</p>
                </div>
                <div>
                  <label className="label">Mine</label>
                  <select required className="input" value={form.mineId} onChange={(e) => setForm((f) => ({ ...f, mineId: e.target.value }))}>
                    <option value="">Select mine</option>
                    {mines.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Document Type</label>
                  <select className="input" value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
                    {DOC_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="pt-2 flex justify-end gap-2">
                  <button type="button" onClick={closeModal} className="btn-secondary">Cancel</button>
                  <button type="submit" disabled={processing} className="btn-primary">{processing ? "Running OCR..." : "Upload & Run OCR"}</button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium"><CheckCircle2 size={17} /> OCR completed successfully.</div>
                <div className="border border-white/10 bg-white/[0.03] rounded-xl p-4 space-y-1.5 text-sm">
                  <Row label="Certificate Number" value={ocrResult.extractedFields.certificateNumber} />
                  <Row label="Mine Name" value={ocrResult.extractedFields.mineName} />
                  <Row label="Issue Date" value={ocrResult.extractedFields.issueDate} />
                  <Row label="Expiry Date" value={ocrResult.extractedFields.expiryDate} />
                  <Row label="Document Type" value={ocrResult.extractedFields.documentType} />
                  <div className="flex justify-between pt-1"><span className="text-slate-500">Certificate Status</span><StatusBadge status={ocrResult.complianceStatus} /></div>
                </div>
                <div className="flex justify-end gap-2">
                  <button onClick={closeModal} className="btn-secondary">Close</button>
                  <button onClick={() => { toast.push("Saved to compliance records."); closeModal(); }} className="btn-primary">Save to Compliance Records</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }) {
  return <div className="flex justify-between"><span className="text-slate-500">{label}</span><span className="font-medium text-slate-200">{value}</span></div>;
}
