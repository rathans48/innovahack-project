# SMB Pulse

**AI-Powered Cashflow Auditor & Financial Advisor for Small and Medium Businesses**

Upload a bank statement CSV and get instant, plain-English financial insights: burn rate, runway, expense breakdown, anomaly detection, and AI-generated advisory — no login, no database, fully session-based.

Built in 24 hours for InnovaHack Chapter 1.

---

## 🔗 Live Demo

- **Frontend:** https://smb-pulse-frontend.vercel.app
- **Backend API:** https://smb-pulse-backend.onrender.com

> ⚠️ **Note on cold starts:** the backend runs on Render's free tier, which spins down after 15 minutes of inactivity. The **first** request after idle time can take up to ~60 seconds to wake the server back up — the frontend shows a "waking up the server" message during this window, and the request will not time out (timeout is set to 90s). Subsequent requests are fast (~3-5 seconds). Please allow the first load a moment before assuming something's broken.

---

## What It Does

1. **Upload** a CSV bank statement via drag-and-drop
2. **Parse** transactions client-side (PapaParse), auto-detecting date/description/amount columns — including separate Debit/Credit column formats
3. **Analyze** using a Pandas-based financial engine: monthly revenue/expense averages, burn rate, runway, expense category breakdown, and month-over-month expense spike detection (>30% jump)
4. **Advise** via an LLM (Google Gemini) with a structured JSON system prompt, returning a health score (1-100), an executive summary, severity-tagged alerts, and actionable recommendations
5. **Visualize** everything on a single dashboard: metric cards, a cashflow trend area chart, an expense breakdown donut chart, and an AI advisory feed

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js (App Router), TypeScript, Tailwind CSS, Recharts, PapaParse, Axios |
| Backend | FastAPI, Pandas, Pydantic |
| AI | Google Gemini API (structured JSON output mode) |
| Hosting | Vercel (frontend), Render (backend) |
| Persistence | None — fully stateless, session-based, no database |

---

## Repo Structure

```
smb-pulse/
├── frontend/          # Next.js app
│   ├── app/           # Pages, layout, global styles
│   ├── components/    # Upload, dashboard, and shared UI components
│   └── lib/           # Types, API client, CSV parser, utils
└── backend/           # FastAPI app
    ├── main.py         # API endpoints
    ├── engine.py        # Pandas financial calculations
    ├── ai_advisor.py     # LLM system prompt + integration
    ├── models.py          # Pydantic request/response schemas
    └── test/               # Sample data + tests
```

---

## Running Locally

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file in `backend/`:
```
GEMINI_API_KEY=your_key_here
```

Run the server:
```bash
uvicorn main:app --reload --port 8000
```

Confirm it's up: `curl http://localhost:8000/health` → `{"status": "ok"}`

### Frontend

```bash
cd frontend
npm install
```

Create a `.env.local` file in `frontend/`:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Run the dev server:
```bash
npm run dev
```

Open `http://localhost:3000`, drag in a CSV, and go.

---

## API Contract

### `POST /api/analyze-cashflow`

**Request:**
```json
{
  "company_name": "Acme Bakery Pvt Ltd",
  "currency": "INR",
  "transactions": [
    {
      "date": "2026-01-05",
      "description": "AWS Cloud Services",
      "amount": -4500.00,
      "category": null
    }
  ]
}
```
`amount` is signed: negative = expense/outflow, positive = revenue/inflow. `category` is optional — if omitted, the backend auto-categorizes based on keyword matching against the description.

**Response:** returns `metrics` (burn rate, runway, expense breakdown, monthly trend, expense spikes), `ai_advisory` (health score, executive summary, alerts, recommendations), and `meta` (analysis period, transaction count). Full schema in `frontend/lib/types.ts` and `backend/models.py`.

### `GET /health`
Basic liveness check, returns `{"status": "ok"}`.

---

## CSV Format Support

- Auto-detects common header aliases: `Date`/`Txn Date`/`Value Date`, `Description`/`Narration`/`Particulars`, `Amount`, or separate `Debit`/`Credit` columns
- Handles quoted fields with embedded commas
- Normalizes dates to `YYYY-MM-DD`, with `DD/MM/YYYY` vs `MM/DD/YYYY` disambiguation when one of the two values is unambiguously > 12
- Minimum 3 transaction rows required for a meaningful analysis

**Known limitation:** if a date is genuinely ambiguous (both day and month values are ≤ 12, e.g. `01/02/2026`), the parser defaults to `DD/MM/YYYY`. There's no way to disambiguate this case from the CSV alone.

---

## Feature Scope (24-Hour Build)

**Implemented:**
- CSV upload, parsing, and column auto-detection
- Burn rate, runway, net cashflow, monthly trend calculation
- Keyword-based expense auto-categorization
- Expense spike detection (>30% month-over-month)
- Cashflow trend area chart and expense breakdown donut chart
- AI-generated health score, summary, alerts, and recommendations
- Graceful error handling (malformed CSV, missing columns, insufficient rows, backend/network failures)

**Explicitly out of scope:**
- User accounts, authentication, or saved sessions
- Persistent storage / database — every analysis is stateless per upload
- Multi-currency conversion
- PDF/OCR bank statement support (CSV only)
- Live conversational follow-up chat with the AI (the advisory is a single structured response, not a chat thread)

---

## Team

| Role | Responsibilities |
|---|---|
| Frontend Engineer | UI/UX, dashboard, data visualization, CSV parsing |
| Backend & AI Engineer | FastAPI, Pandas financial engine, LLM prompt engineering, API contract |

---

## Deployment Notes

- **Backend (Render, free tier):** spins down after 15 minutes of inactivity; cold start ~30-60s. See the note at the top of this README.
- **Frontend (Vercel):** zero cold-start, deploys automatically from the `frontend/` directory on push.
- Environment variables (`GEMINI_API_KEY`, `NEXT_PUBLIC_API_URL`) are configured directly in each platform's dashboard, not committed to the repo.
