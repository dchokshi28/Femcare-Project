# FEMCARE — AI-Powered Women's Reproductive Health Platform

FEMCARE is a full-stack web application for women's reproductive health monitoring. It integrates menstrual cycle tracking, PCOS risk screening (XGBoost ML), an AI health assistant (Groq LLM), healthcare provider booking, and educational health awareness.

---

## Technology Stack

| Layer      | Technology                                      |
|------------|-------------------------------------------------|
| Frontend   | React 18, Vite 5, Tailwind CSS, Framer Motion  |
| Backend    | Python, FastAPI, Uvicorn                        |
| Database   | Supabase (PostgreSQL + Auth + RLS)              |
| ML Model   | XGBoost (PCOS classification + cycle prediction)|
| AI         | Groq API (llama-3.1-8b-instant)                 |
| Email      | Resend API                                      |
| Map        | React-Leaflet + OpenStreetMap                   |

---

## Project Structure

```
ai-women-reproductive-health-main/
├── backend/                  # FastAPI Python backend
│   ├── main.py               # API entry point (port 5000)
│   ├── femcare_chatbot.py    # AI chatbot pipeline
│   ├── femcare_email.py      # Email notification service
│   ├── femcare_knowledge_base.py
│   ├── *.pkl / *.json        # Trained ML model files
│   ├── .env                  # Environment variables (not committed)
│   └── requirements.txt
├── frontend/                 # React + Vite frontend
│   ├── src/
│   │   ├── pages/            # All page components
│   │   ├── components/       # Shared components (ChatBot, etc.)
│   │   ├── context/          # AuthContext
│   │   ├── services/         # Supabase service layer
│   │   ├── data/             # Static data (awarenessData.js)
│   │   └── lib/              # API utilities
│   └── package.json
├── supabase/
│   └── migrations/           # PostgreSQL schema migrations
├── docs/
│   ├── status-reports/       # Development status and test result reports
│   ├── sql-migrations/       # SQL scripts for database setup and fixes
│   ├── tests/                # Backend and integration test scripts
│   └── debug-scripts/        # Diagnostic utilities
├── start.bat                 # Windows: starts both servers
└── README.md
```

---

## Installation and Running

### Prerequisites
- Python 3.11+
- Node.js 18+
- A Supabase project (set credentials in `backend/.env`)

### Backend
```bash
cd backend
pip install -r requirements.txt
python main.py
# Runs on http://localhost:5000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:3000
```

### Quick Start (Windows)
```bat
start.bat
```

### Environment Variables
Create `backend/.env` with:
```
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
GROQ_API_KEY=...
RESEND_API_KEY=...
```

Create `frontend/.env.local` with:
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_API_URL=http://localhost:5000
```

---

## docs/ Directory

| Folder           | Contents                                                  |
|------------------|-----------------------------------------------------------|
| `status-reports/`| Development status reports, test results, implementation notes |
| `sql-migrations/`| SQL scripts for database schema setup and migration fixes  |
| `tests/`         | Backend, chatbot, and integration test scripts             |
| `debug-scripts/` | Diagnostic and monitoring utilities                        |

---

## Features

- Menstrual cycle tracking (flow, pain, mood, symptoms)
- Real-time Dashboard with cycle phase visualisation
- 18-feature PCOS risk assessment (XGBoost + heuristic fallback)
- AI health assistant — scoped to women's reproductive health
- Find Care: interactive map with 10 Vadodara providers, slot booking
- Appointment confirmation and cancellation emails
- Women's Health Awareness module (8 conditions)
- Row Level Security for per-user data isolation
