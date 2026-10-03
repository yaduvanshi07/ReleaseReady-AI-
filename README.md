# ReleaseReady AI 🚀
### Full-Stack AI-Powered Release Communication & Readiness Assistant

ReleaseReady AI is a developer-tool SaaS web application designed for engineering leads, QA engineers, release managers, and product owners to prepare accurate, evidence-backed software release briefs.

---

## 🎨 Visual Design & Brand Identity
The interface is designed with a **saffron-and-grey** color palette:
- **Primary Saffron:** `#F59E0B`
- **Deep Saffron:** `#D97706`
- **Soft Saffron Accent:** `#FEF3C7`
- **Primary Text:** `#202124`
- **Secondary Text:** `#475569`
- **Application Background:** `#F5F6F8`
- **Card Background:** `#FFFFFF`
- **Border:** `#E5E7EB`
- **Status Accents:** Success `#15803D`, Warning `#B45309`, Error `#B91C1C`, Info `#1D4ED8`

---

## 🏗️ Architecture & Technology Stack

- **Pure JavaScript (ES6+ / ES Modules)** — Strictly zero TypeScript files (`.js`, `.jsx`).
- **Frontend:** React 18, Vite 6, Tailwind CSS 3, React Router 6, Lucide React icons.
- **Backend:** Node.js 24, Express 4, ES Modules.
- **Database:** SQLite (`better-sqlite3`) with WAL journal mode, parameterized queries, and cascading foreign keys.
- **Validation:** Zod schemas for deterministic request validation and AI structured response validation.
- **AI Engine:** Google Gemini via the official `@google/genai` SDK with strict JSON schemas and evidence citation verification.
- **Testing:** Vitest, React Testing Library, Supertest.

```
release-ready-ai/
├── client/
│   ├── src/
│   │   ├── components/       # Layout, Sidebar, TopNav, ScoreGauge, StatusBadge
│   │   ├── features/
│   │   │   ├── releases/     # ReleaseEditor, ItemListEditor, QAEvidenceEditor
│   │   │   ├── analysis/     # AIAnalysisPanel (Impact, Missing info, QA checks)
│   │   │   ├── review/       # ReviewPanel (Human review, Stale detection banners)
│   │   │   ├── versions/     # VersionHistory, VersionComparison (Diff viewer)
│   │   │   └── brief/        # FinalReleaseBrief (16-section brief, Markdown, Print)
│   │   ├── pages/            # DashboardPage, ReleasesPage, CreateReleasePage, DetailPage, SettingsPage
│   │   ├── lib/              # api.js, constants.js, utils.js
│   │   └── styles/           # index.css with saffron tokens and print media rules
│   └── package.json
├── server/
│   ├── src/
│   │   ├── database/         # db.js, schema.js, seed.js
│   │   ├── repositories/     # releaseRepository, versionRepository, reviewRepository
│   │   ├── services/         # validationService, comparisonService, staleDetectionService, aiService, briefService
│   │   ├── validators/       # releaseSchema.js, aiResponseSchema.js
│   │   ├── ai/               # geminiProvider.js, prompts.js, citationValidator.js
│   │   ├── controllers/      # releaseController, versionController, analysisController, reviewController, briefController
│   │   ├── routes/           # REST endpoints
│   │   ├── app.js            # Express app factory
│   │   └── server.js         # Entry point & DB bootstrapper
│   ├── tests/                # validation, comparison, staleDetection, aiService, api tests
│   └── package.json
├── .env.example
├── package.json
└── README.md
```

---

## ⚡ Key Features

### 1. Deterministic Readiness Validation
- Inspects all 7 core sections:
  1. Completed features
  2. Bug fixes
  3. Changed behaviour & breaking changes
  4. QA summary & structured QA evidence records
  5. Known limitations
  6. Migration or configuration notes
  7. Affected user groups
- Operates deterministically without relying on AI availability.

### 2. Evidence-Backed AI Analysis (Google Gemini)
- **Change Impact Classification:** Classifies items as `Low`, `Moderate`, `High`, or `Unknown` with supporting citations.
- **Missing Information Detection:** Distinguishes confirmed omissions from suggestions.
- **QA Evidence Support Analysis:** Evaluates claims as `supported`, `partially_supported`, `not_supported`, or `contradicted`. Precise phrasing: *"The supplied QA evidence does not establish this claim."*
- **Citation Validator:** Strips or flags any hallucinated IDs, allowing only authentic `REL-xxx` and `QA-xxx` codes.
- **Dual Summaries:** Synthesizes a technical summary (for developers/QA) and a stakeholder summary (for clients/PMs) from identical source records.

### 3. Human-in-the-Loop Review System
- AI **never** deploys code or automatically approves releases.
- Statement review states: `Generated`, `Edited`, `Accepted`, `Rejected`, `Needs Review`.
- Inline editing preserves original generated statements in an audit trail.

### 4. Immutable Snapshots & Version Comparison
- Creates persistent snapshots capturing items, evidence, validation score, AI output, and review state at that point in time.
- Deterministic comparison identifies added, removed, modified, and unchanged items.

### 5. Stale Statement Detection
- Tracks dependencies between generated statements and source item/evidence codes (`REL-001`, `QA-001`, etc.).
- When source records are updated, dependent statements are automatically flagged with reasons and require re-verification.

### 6. 16-Section Final Release Brief
- Compiles a complete 16-section document.
- One-click copy markdown, download `.md` file, and browser print-friendly layout.

---

## 🚀 Quickstart Guide

### 1. Prerequisites
- Node.js 18+ (tested on Node v24)
- npm 9+

### 2. Environment Configuration
Create a `.env` file in the project root or `server/` directory:
```bash
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
DATABASE_PATH=./data/release-ready.sqlite

# Google Gemini API (Get key at https://aistudio.google.com/)
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
```
*(Note: If `GEMINI_API_KEY` is not provided, the application runs with full deterministic validation, sample analysis data, and versioning capabilities).*

### 3. Install Dependencies
```bash
npm --prefix server install
npm --prefix client install
```

### 4. Running the Development Servers
In separate terminals:
```bash
# Terminal 1: Backend Server (starts on http://localhost:5000)
npm run dev:server

# Terminal 2: Frontend Client (starts on http://localhost:5173)
npm run dev:client
```

### 5. Running Automated Tests
```bash
# Run backend test suite (14 tests covering validation, comparison, stale detection, API)
npm run test:server

# Run frontend test suite (Component and form tests)
npm run test:client
```

### 6. Production Build
```bash
npm run build
```

---

## 📡 REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health & AI configuration status |
| `GET` | `/api/releases` | List all release packages with review metrics |
| `POST` | `/api/releases` | Create new release package with items and QA evidence |
| `GET` | `/api/releases/:id` | Get full release details with live validation score |
| `PATCH` | `/api/releases/:id` | Update release (triggers stale detection for modified items) |
| `DELETE` | `/api/releases/:id` | Delete release package |
| `POST` | `/api/releases/:id/validate` | Run deterministic readiness checks |
| `POST` | `/api/releases/:id/analyze` | Trigger Google Gemini AI evidence analysis |
| `GET` | `/api/releases/:id/versions` | List immutable version snapshots |
| `POST` | `/api/releases/:id/versions` | Create new version snapshot |
| `POST` | `/api/releases/:id/versions/compare` | Deterministically compare two snapshots |
| `GET` | `/api/releases/:id/review` | Get statements and human review audit trail |
| `PATCH` | `/api/statements/:id/review` | Update statement review decision (`accepted`/`edited`/`rejected`) |
| `GET` | `/api/releases/:id/brief` | Compile 16-section release brief (JSON & Markdown) |

---

## 🛡️ Safety & Limitations
- **Assessment Scope:** Single-tenant developer tool designed for release communication preparation.
- **No Direct Deployment:** The AI assistant strictly produces advisory documentation and never connects to production infrastructure, Git providers, or deployment pipelines.
