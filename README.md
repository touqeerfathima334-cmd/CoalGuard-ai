# CoalGuard AI
**AI-Powered Smart Governance & Compliance Monitoring System for Coal Mines**

Built for Smart India Hackathon — Problem Statement ID 26024 (Ministry of Coal / Coal India Limited).

> ⚠️ All data in this prototype (mine names, coordinates, personnel, compliance
> records) is **synthetic / sample data** generated for demonstration purposes.
> It does not represent real Coal India mines, confidential survey data, or an
> official government system.

---

## What this is

A full-stack governance prototype covering:

- **Dashboard** — KPIs, AI risk overview, compliance trend, live mine monitoring, critical alert banner, AI Governance Assistant
- **Mines** & **Mine Details** (9-tab drill-down: overview, compliance, inspections, violations, corrective actions, workers, contractors, documents, location)
- **Compliance Management** — filterable requirement tracker with evidence upload / mark-complete workflow
- **Inspection Management** — create an inspection and watch the AI risk engine recompute live
- **Violation Management** — full lifecycle (open → in progress → resolved → verified → closed)
- **Corrective Actions** — staged workflow with overdue highlighting
- **AI Risk Analysis / Explainable AI** — deterministic, transparent 0–100 risk score per mine with an "Analyze Risk" panel showing factor-by-factor contribution, a plain-language explanation, an AI recommendation, and a confidence score
- **GIS Mine Map** — Leaflet map with color-coded risk markers
- **Contractors** — compliance & safety-training tracking
- **Documents & OCR** — demo OCR pipeline that extracts certificate fields from an uploaded document name
- **Reports & Analytics** — charts + CSV report generation/download
- **Alerts & Escalations** — severity-tagged alerts with an escalation workflow
- **Audit Trail** — full accountability log
- **Role-based login** — Mine Official, Inspector, Corporate Admin, Regulatory Officer

Every button, filter, form, and chart is wired to a real (in-memory) backend —
creating an inspection actually recalculates that mine's risk score and can
generate a critical alert live, exactly like the demo scenario in the brief.

## Tech stack

- **Frontend:** React 18 + Vite + Tailwind CSS + React Router + Recharts + Lucide React + Leaflet/React-Leaflet + Framer Motion
- **Backend:** Node.js + Express
- **Data layer:** In-memory store, structured to mirror Mongoose schemas (see `server/models/schemas.js`) so it can be swapped for real MongoDB with minimal changes — this keeps the hackathon build **instantly runnable with zero external database setup**
- **AI:** A transparent, rule-based / explainable risk-scoring engine (`server/riskEngine.js`) — deterministic, same inputs always produce the same score, and every point is traceable to a specific factor. Structured so a trained ML model or a FastAPI microservice can later replace it without changing the calling code.
- **OCR:** Demo/mock OCR pipeline (`server/routes/documents.js`) structured so Tesseract.js or a cloud OCR API can be dropped in later.

> Note on scope: the prototype is implemented in JavaScript (JSX) rather than
> TypeScript to keep the hackathon build lean and fast to iterate on; the
> module boundaries, prop shapes, and API contracts are already TS-ready if
> you want to add `tsc` type-checking later.

## Running it locally

You'll need Node.js 18+ installed.

### 1. Start the backend API

```bash
cd server
npm install
npm run dev
```

This starts the API at **http://localhost:5050** (health check: `/api/health`).

### 2. Start the frontend

In a second terminal:

```bash
cd client
npm install
npm run dev
```

This starts the app at **http://localhost:5173** and proxies all `/api/*`
calls to the backend automatically (see `client/vite.config.js`).

Open **http://localhost:5173** in your browser.

### Demo accounts (password for all: `demo123`)

| Role | Email |
|---|---|
| Corporate Admin | admin@coalguard.demo |
| Inspector | inspector@coalguard.demo |
| Mine Official | mine@coalguard.demo |
| Regulatory Officer | regulator@coalguard.demo |

The login screen has one-click buttons to fill these in.

---

## Project structure

```
coalguard-ai/
├── client/                 React + Vite frontend
│   └── src/
│       ├── components/     Shared UI (badges, modals, toast, Analyze Risk panel)
│       ├── context/        Auth + shared data context
│       ├── layouts/        Sidebar, Topbar, DashboardLayout
│       ├── pages/          One file per module (Dashboard, Mines, Compliance, ...)
│       ├── services/api.js Single fetch wrapper for the whole REST API
│       └── utils/          Formatting helpers
└── server/                 Express backend
    ├── data/
    │   ├── seed.js         Synthetic demo dataset (10 mines, compliance,
    │   │                   inspections, violations, corrective actions,
    │   │                   contractors, documents, alerts, audit logs)
    │   └── db.js            In-memory store + helpers
    ├── models/schemas.js   Mongoose schema definitions (for future real DB)
    ├── riskEngine.js       Explainable AI risk scoring engine
    └── routes/             REST endpoints — auth, mines, compliance,
                             inspections, violations, corrective-actions,
                             risk, contractors, documents, alerts, reports, audit
```

## The AI Risk Engine, explained

```
Risk Score = Violation Risk (0–30)
           + Compliance Risk (0–25)
           + Incident Risk (0–20)
           + Inspection Risk (0–15)
           + Corrective Action Delay Risk (0–10)
           = 0–100, deterministic
```

Classification: **0–30 Low · 31–60 Medium · 61–80 High · 81–100 Critical.**

Every mine card has an **"Analyze Risk"** button (Risk Analysis page and Mine
Details page) that opens a panel showing:
- the numeric score and risk band
- a **confidence score** (based on how much supporting data — inspections,
  violations, compliance records — exists for that mine)
- **per-factor point contribution** with animated bars
- a **plain-language explanation** of why the mine is risky
- an **AI recommendation** for next steps

The engine recalculates live: creating a new inspection, violation, or
corrective-action update immediately re-scores the affected mine and can
generate a new critical alert — this is what powers the guided demo scenario
below.

## 3-minute demo flow (matches the brief's Section 25)

1. Log in as **Inspector**.
2. Go to **Inspections → New Inspection**, pick **Mine Gamma**, type
   **Safety**, severity **High**, observation *"Safety equipment maintenance
   issue detected."* Submit.
3. Watch the AI Analysis panel: risk score jumps and a **Critical Risk
   Alert** is generated automatically.
4. Log out, log back in as **Corporate Admin**.
5. Dashboard shows **High Risk Mines** count updated and a red **Critical
   Alert** banner for Mine Gamma with an AI recommendation.
6. Open **Mine Gamma** → Overview tab shows compliance %, risk score, open
   violations, pending actions, and the risk explanation.
7. Click **Analyze Risk** for the full explainable breakdown.

## What's intentionally out of scope

Per the brief's own guidance, this is a hackathon MVP: it does not claim to
use real Coal India data, does not claim medical/legal/scientific
certification of the AI, does not integrate any real government API, and
uses a mock OCR pipeline rather than a production OCR service. All of these
are structured so they can be swapped for production integrations later.
