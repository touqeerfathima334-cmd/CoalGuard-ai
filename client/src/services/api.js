const BASE = "/api";

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    let msg = "Request failed";
    try {
      const body = await res.json();
      msg = body.error || msg;
    } catch (_e) {
      /* noop */
    }
    throw new Error(msg);
  }
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("text/csv")) return res.blob();
  return res.json();
}

export const api = {
  // auth
  login: (payload) => request("/auth/login", { method: "POST", body: JSON.stringify(payload) }),
  changePassword: (payload) => request("/auth/change-password", { method: "POST", body: JSON.stringify(payload) }),
  demoAccounts: () => request("/auth/demo-accounts"),

  // mines
  getMines: () => request("/mines"),
  getMine: (id) => request(`/mines/${id}`),
  getMineSummary: (id) => request(`/mines/${id}/summary`),

  // compliance
  getCompliance: (params = {}) => request(`/compliance?${new URLSearchParams(params)}`),
  createCompliance: (payload) => request("/compliance", { method: "POST", body: JSON.stringify(payload) }),
  updateCompliance: (id, payload) => request(`/compliance/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),

  // inspections
  getInspections: (params = {}) => request(`/inspections?${new URLSearchParams(params)}`),
  createInspection: (payload) => request("/inspections", { method: "POST", body: JSON.stringify(payload) }),

  // violations
  getViolations: (params = {}) => request(`/violations?${new URLSearchParams(params)}`),
  createViolation: (payload) => request("/violations", { method: "POST", body: JSON.stringify(payload) }),
  updateViolation: (id, payload) => request(`/violations/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),

  // corrective actions
  getCorrectiveActions: (params = {}) => request(`/corrective-actions?${new URLSearchParams(params)}`),
  createCorrectiveAction: (payload) => request("/corrective-actions", { method: "POST", body: JSON.stringify(payload) }),
  updateCorrectiveAction: (id, payload) => request(`/corrective-actions/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),

  // risk
  getRisk: () => request("/risk"),
  getMineRisk: (mineId) => request(`/risk/${mineId}`), // includes factors, recommendation, explanation, confidence
  getTrendInsights: () => request("/risk/insights/trends"),

  // contractors
  getContractors: (params = {}) => request(`/contractors?${new URLSearchParams(params)}`),
  createContractor: (payload) => request("/contractors", { method: "POST", body: JSON.stringify(payload) }),
  updateContractor: (id, payload) => request(`/contractors/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),

  // documents
  getDocuments: (params = {}) => request(`/documents?${new URLSearchParams(params)}`),
  runOcr: (payload) => request("/documents/ocr", { method: "POST", body: JSON.stringify(payload) }),

  // alerts
  getAlerts: (params = {}) => request(`/alerts?${new URLSearchParams(params)}`),
  markAlertRead: (id) => request(`/alerts/${id}/read`, { method: "PATCH" }),

  // reports
  getSummary: () => request("/reports/summary"),
  exportReport: (type) => request(`/reports/export/${type}`),

  // audit
  getAudit: (params = {}) => request(`/audit?${new URLSearchParams(params)}`),
};
