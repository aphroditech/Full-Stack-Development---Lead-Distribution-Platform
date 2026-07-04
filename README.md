# Lead Distribution Platform

A full-stack lead distribution platform. A single public form captures leads, and a
single distribution assigns each lead to an eligible broker based on **percentage
share, timezone, open hours, working days and daily cap**, while preventing duplicate
email assignments and capturing the visitor's IP address.

- **Frontend:** Next.js 16 (App Router, TypeScript) — public port **8169**
- **Backend:** Express + TypeScript + Prisma ORM — private port **8170**
- **Database:** MySQL 8
- **Process manager:** PM2 (no sudo required)

> **Live app:** http://31.97.72.35:8169
> **Admin credentials:** provided separately (not committed to the repository).

The frontend is the only publicly exposed service. It talks to the backend
server-to-server over `127.0.0.1:8170` (a BFF pattern), so the backend is never
reachable from the internet.

---

## Table of contents

- [Features](#features)
- [Architecture](#architecture)
- [Repository structure](#repository-structure)
- [Distribution logic](#distribution-logic)
- [Environment variables](#environment-variables)
- [Local development](#local-development)
- [Deployment (VPS + PM2)](#deployment-vps--pm2)
- [Checking logs](#checking-logs)
- [Test notes](#test-notes)

---

## Features

- Admin login (JWT + bcrypt) protecting the whole admin area; public form is open.
- Admin dashboard with counts and setup checklist.
- **Brokers**: create/edit/delete, active flag, daily cap, timezone, open/close time, working days.
- **Broker detail** page listing every lead received by that broker (with IP address).
- **Lead form**: exactly **one** form can be created (name + public URL slug).
- **Distribution**: exactly **one** distribution, auto-bound to the form; choose brokers and set percentages / active flags.
- **Distribution detail**: full history of leads that passed through (sent, unsent, duplicate, failed).
- **Leads** page with status filter and manual assignment of unsent leads.
- Public lead form at `/{slug}` — captures IP, prevents duplicates, runs distribution.
- Duplicate email prevention, IP capture, timezone/open-hours/working-days/daily-cap gating.

---

## Architecture

```
Browser ──HTTP──▶  Next.js frontend (public :8169)
                        │  server-to-server (BFF), forwards JWT + visitor IP
                        ▼
                   Express backend (private :8170)  ──▶  MySQL (:3306)
```

- The browser only ever calls the Next.js origin.
- Next.js server components / server actions call the backend with the admin JWT
  (stored in an httpOnly cookie on the frontend origin) as a `Bearer` token.
- All business logic (auth, validation, distribution algorithm, DB access) lives in
  the backend.

### Tech stack

| Layer     | Tech                                                        |
| --------- | ----------------------------------------------------------- |
| Frontend  | Next.js 16, React 19, TypeScript, Tailwind CSS 4            |
| Backend   | Node.js, Express 4, TypeScript, Prisma ORM, Zod, JWT, bcrypt, Luxon |
| Database  | MySQL 8                                                     |
| Deploy    | PM2                                                         |

---

## Repository structure

```
.
├── backend/            # Express + Prisma API (private :8170)
│   ├── prisma/         # schema.prisma, migrations, seed.ts
│   ├── src/
│   │   ├── config/     # env validation
│   │   ├── lib/        # prisma, jwt, password, http-error
│   │   ├── middleware/ # auth, validate, error handling
│   │   ├── modules/    # auth, brokers, forms, distribution, leads, public, dashboard
│   │   ├── services/   # distribution logic (+ unit tests), time/timezone helpers
│   │   └── server.ts
│   └── .env.example
├── frontend/           # Next.js admin UI + public form (public :8169)
│   ├── src/app/        # routes (admin + /login + /[slug])
│   ├── src/components/  src/lib/
│   └── .env.example
├── ecosystem.config.js # PM2 config
└── README.md
```

---

## Distribution logic

When a lead is submitted the backend:

1. Saves the lead (name, email, phone, form name, created time, **visitor IP**).
2. Normalizes the email: `email.trim().toLowerCase()`.
3. **Duplicate check** — if the email was already assigned to any broker, the lead is
   marked `duplicate` and not assigned.
4. Loads the single distribution. If none exists, the lead is `unsent`.
5. **Eligibility** — a broker is eligible only if it is active, active in the
   distribution, **under its daily cap** (counted in the broker's timezone), and
   **currently open** (working day + within open/close time in the broker's timezone).
6. **Deficit** for each eligible broker:

   ```
   targetAfterLead = (totalSentToday + 1) * brokerPercentage / 100
   deficit         = targetAfterLead - brokerSentToday
   ```

   `totalSentToday` is the number of leads sent today across all brokers in the
   distribution.
7. The eligible broker with the **highest deficit** receives the lead (ties broken by
   fewer leads sent today). The lead is marked `sent`.
8. If no broker is eligible, the lead is `unsent` and can be **manually assigned**.

The pure selection function and timezone helpers are covered by unit tests
(`backend/src/services/distribution.service.test.ts`), including the exact example
from the specification.

---

## Environment variables

### Backend (`backend/.env`)

| Variable         | Description                                             |
| ---------------- | ------------------------------------------------------- |
| `NODE_ENV`       | `development` / `production`                            |
| `PORT`           | Backend port (private). `8170` on the VPS.              |
| `HOST`           | Bind address. `127.0.0.1` so it stays private.          |
| `DATABASE_URL`   | `mysql://USER:PASSWORD@127.0.0.1:3306/DATABASE`         |
| `JWT_SECRET`     | Long random string for signing admin tokens            |
| `JWT_EXPIRES_IN` | Token lifetime, e.g. `7d`                               |
| `ADMIN_EMAIL`    | Seeded admin email                                     |
| `ADMIN_PASSWORD` | Seeded admin password                                  |
| `ADMIN_NAME`     | Seeded admin display name                              |
| `CORS_ORIGIN`    | Optional allowed origin(s)                              |

### Frontend (`frontend/.env`)

| Variable      | Description                                            |
| ------------- | ----------------------------------------------------- |
| `NODE_ENV`    | `development` / `production`                           |
| `PORT`        | Public port. `8169` on the VPS.                       |
| `BACKEND_URL` | Internal backend URL, e.g. `http://127.0.0.1:8170`    |

Copy the samples and fill in real values (never commit real secrets):

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

---

## Local development

Prerequisites: Node.js 20+, a running MySQL 8, and a database created for the app.

```bash
# 1. Clone
git clone https://github.com/aphroditech/Full-Stack-Development---Lead-Distribution-Platform.git
cd Full-Stack-Development---Lead-Distribution-Platform

# 2. Backend
cd backend
npm install
cp .env.example .env            # then edit DATABASE_URL, JWT_SECRET, ADMIN_*
npm run prisma:migrate:dev      # create tables
npm run seed                    # create the admin user
npm run dev                     # backend on http://127.0.0.1:8170

# 3. Frontend (in a second terminal)
cd ../frontend
npm install
cp .env.example .env            # BACKEND_URL=http://127.0.0.1:8170
npm run dev                     # frontend on http://localhost:3000
```

Run backend unit tests:

```bash
cd backend && npm test
```

---

## Deployment (VPS + PM2)

The VPS already has MySQL and git. Node.js and PM2 are installed at user level with
`nvm` (no sudo). Frontend is exposed on **8169**; backend stays private on **8170**.

```bash
# --- One-time: install Node LTS + PM2 (no sudo) ---
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh"
nvm install --lts
npm install -g pm2

# --- Clone ---
cd ~ && git clone https://github.com/aphroditech/Full-Stack-Development---Lead-Distribution-Platform.git app
cd app

# --- Backend: install, configure, migrate, seed, build ---
cd backend
npm install
cp .env.example .env            # edit: DATABASE_URL, JWT_SECRET, PORT=8170, HOST=127.0.0.1, ADMIN_*
npm run prisma:migrate          # prisma migrate deploy (creates tables)
npm run seed                    # create admin user
npm run build

# --- Frontend: install, configure, build ---
cd ../frontend
npm install
cp .env.example .env            # BACKEND_URL=http://127.0.0.1:8170
npm run build

# --- Start both with PM2 ---
cd ..
pm2 start ecosystem.config.js
pm2 save                        # persist across reboots
```

### Start / restart / stop

```bash
pm2 start ecosystem.config.js   # start both apps
pm2 restart ld-backend ld-frontend
pm2 restart all
pm2 stop all
pm2 status
```

After pulling new code:

```bash
cd ~/app && git pull
cd backend  && npm install && npm run prisma:migrate && npm run build
cd ../frontend && npm install && npm run build
pm2 restart all
```

---

## Checking logs

```bash
pm2 logs                 # both apps, live
pm2 logs ld-backend      # backend only
pm2 logs ld-frontend     # frontend only
pm2 logs --lines 200     # recent history
```

## Accessing the deployed app

- Admin: **http://31.97.72.35:8169** → redirected to `/login`.
- Public form: **http://31.97.72.35:8169/{slug}** (e.g. `/lead-registration`).

---

## Test notes

The suggested test cases from the specification are supported:

1. Login works — `/login`.
2. Create multiple brokers — Brokers page.
3. Create one lead form — Lead Form page.
4. Second form blocked — backend returns `409 FORM_EXISTS`; UI hides the create form.
5. Distribution before form shows **"Oops, please create a form first."**
6. Create one distribution after the form exists.
7. Second distribution blocked — `409 DISTRIBUTION_EXISTS`.
8. Add brokers to the distribution with percentages.
9. Submit a lead from `/{slug}`.
10. Lead IP address is saved and shown.
11. Lead assigned to an eligible broker by the deficit rule.
12. Lead appears in the broker's leads view with IP address.
13. Distribution detail shows sent / assigned broker / duplicate / unsent.
14. Re-submitting the same email → `duplicate`.
15. Daily cap reached → broker skipped.
16. Outside working hours / days → broker skipped.
17. Manually assign an unsent lead.
18. App survives a PM2 restart (`pm2 restart all`).

## Security notes

- No real secrets are committed. `.env` files are git-ignored; only `.env.example`
  files (sample values) are tracked.
- Admin JWT is stored in an httpOnly cookie; the backend validates every admin request.
- Passwords are hashed with bcrypt.
- Server-side input validation with Zod on every write endpoint.
