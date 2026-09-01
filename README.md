# Loxion Mart 🇿🇦
### Shop Local, Shop Lekker!

Mzansi's local marketplace — connecting township and community businesses with customers.

## Stack
| Layer     | Tech                              | Host    |
|-----------|-----------------------------------|---------|
| Frontend  | React 18 + Vite + Zustand         | Render  |
| Backend   | FastAPI + SQLAlchemy              | Render  |
| Database  | PostgreSQL                        | Render  |
| Payments  | Ozow (SA-native)                  | —       |
| Notify    | Twilio WhatsApp                   | —       |
| Auth      | JWT (7-day tokens)                | —       |

## Quick start (local)

```bash
# 1. Clone and set up backend
cd backend
pip install -r requirements.txt
cp .env.example .env          # fill in values
alembic upgrade head          # run migrations
python seed.py                # create admin + seed businesses
uvicorn app.main:app --reload # http://localhost:8000

# 2. Frontend (new terminal)
cd frontend
npm install
npm run dev                   # http://localhost:5173
```

## Deploy to production
See **RENDER.md**. The root-level `render.yaml` deploys the frontend, API, and database together as one Blueprint.

## Admin access
- URL: `/admin`
- Email: value of `ADMIN_EMAIL` in `.env`
- Password: value of `ADMIN_PASSWORD` in `.env`

## Build layers — all complete
- [x] Layer 1 — Foundation (models, config, Alembic setup)
- [x] Layer 2 — Backend API (all routes, Ozow, Twilio WhatsApp)
- [x] Layer 3 — Frontend scaffold (Vite+React, routing, Zustand auth+cart, auth pages)
- [x] Layer 4 — Mall UI (homepage, browse, business profiles, cart, orders, bookings)
- [x] Layer 5 — Admin Panel (dashboard, businesses CRUD, services, orders, bookings, commissions, users)
- [x] Layer 6 — Production hardening and Render Blueprint
- [ ] Layer 7 — Go live (buy domain, deploy, seed, done)
