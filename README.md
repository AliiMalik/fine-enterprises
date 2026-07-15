# Fine Enterprises Ltd

A lightweight, demo-ready business management tool inspired by Xero, covering three connected
modules: **Invoicing**, **Inventory**, and **Accounts** — all served from one clean, teal-accented
dashboard.

Built as a client pitch / demo MVP. Everything works end-to-end against a real PostgreSQL database
— no placeholder UI.

---

## Tech Stack

| Layer    | Technology                                                        |
| -------- | ----------------------------------------------------------------- |
| Frontend | React 18 · Vite · TypeScript · Tailwind CSS · React Router v6    |
| Data     | TanStack Query (React Query)                                      |
| Backend  | Node.js · Express · TypeScript                                    |
| Database | SQLite (zero-install default) or PostgreSQL, via Prisma ORM    |
| Auth     | JWT (`jsonwebtoken`) + `bcryptjs`, single admin role             |
| PDF      | `@react-pdf/renderer`                                             |
| Charts   | Recharts                                                          |
| Icons    | lucide-react                                                      |

---

## Prerequisites

- **Node.js 18+** (developed on Node 24)
- **No database install required by default** — the project runs on **SQLite** out of the box
  (a `dev.db` file created via Prisma). A `docker-compose.yml` for **PostgreSQL** is also included
  if you prefer to use Postgres (see "Switching to PostgreSQL" below).

---

## Quick Start

```bash
# 1. Install all dependencies (root, using npm workspaces)
npm install

# 2. Create the database tables (SQLite by default)
npm run prisma:push         # creates server/src/prisma/dev.db from the schema

# 3. Seed demo data (admin user, customers, products, invoices, shipments, transactions)
npm run seed

# 4. Run the client + server together
npm run dev
```

The app will be available at:

- **Frontend:** http://localhost:5173
- **API:** http://localhost:4000/api

### Demo login

```
Email:    admin@fineenterprises.com
Password: demo1234
```

---

## Project Layout

```
fine-enterprises/
├── client/                 # React + Vite frontend
│   └── src/
│       ├── components/      # layout, ui primitives, and module components
│       ├── pages/           # Dashboard, Login, invoices/, inventory/, accounts/
│       ├── api/             # React Query hooks + axios client
│       ├── auth/            # AuthContext (JWT in localStorage)
│       ├── types/           # shared TS interfaces
│       └── utils/           # formatCurrency, formatDate, calculateTotals
├── server/                 # Express + TypeScript backend
│   └── src/
│       ├── routes/          # auth, customers, invoices, products, shipments, transactions
│       ├── controllers/     # request handlers
│       ├── middleware/      # JWT auth middleware
│       ├── lib/             # JWT helpers
│       └── prisma/          # schema.prisma + seed.ts
├── docker-compose.yml       # local PostgreSQL
├── .env.example
└── README.md
```

---

## Environment Variables

Copy `.env.example` to `.env` and adjust as needed. A `.env` is already provided for local dev.

| Variable        | Description                          | Default                                          |
| --------------- | ------------------------------------ | ------------------------------------------------ |
| `DATABASE_URL`  | SQLite file (default) or Postgres URL | `file:./dev.db`                                     |
| `JWT_SECRET`    | Secret used to sign JWTs             | `dev-secret-change-me-please`                    |
| `JWT_EXPIRES_IN`| JWT lifetime                         | `7d`                                             |
| `PORT`          | API server port                      | `4000`                                           |

---

## Useful Scripts (run from repo root)

| Command                | What it does                                          |
| ---------------------- | ----------------------------------------------------- |
| `npm run dev`          | Run both client and server with hot reload            |
| `npm run dev:server`   | Run only the API server                               |
| `npm run dev:client`   | Run only the frontend                                 |
| `npm run build`        | Build client + server for production                  |
| `npm run seed`         | Reset and re-seed the database with demo data         |
| `npm run prisma:push`   | Create/update SQLite DB from schema (no migrations) |
| `npm run prisma:migrate` | Create/apply Prisma migrations                      |
| `npm run prisma:generate` | Regenerate the Prisma client                       |
| `npm run db:up` / `npm run db:down` | Start / stop local Postgres via Docker     |

---

## Core Workflows (all functional)

- **Invoicing** — Create invoices with repeatable line items and a live tax/total calculation.
  Invoices get an auto-generated number (`INV-0001`, …). Mark status (Draft → Sent → Paid →
  Overdue) and export a styled PDF.
- **Inventory** — Manage products (SKU, name, stock). Record shipments; receiving stock
  automatically increments the matching product's carton count.
- **Accounts** — Log money-in / money-out transactions, see the running balance and a monthly
  cashflow chart.
- **Dashboard** — Three summary cards (outstanding invoices, total stock, current balance) plus a
  cashflow chart and recent invoices / transactions panels.

---

## Switching to PostgreSQL

The Prisma schema currently targets **SQLite** (`provider = "sqlite"`) so the app runs with zero
external dependencies. To use PostgreSQL instead:

1. Edit `server/src/prisma/schema.prisma`:
   - `provider = "postgresql"`
   - Convert the `status` / `type` `String` fields back to the `InvoiceStatus` / `TransactionType`
     enums (SQLite does not support enums).
2. Set `DATABASE_URL` in `.env` to your Postgres connection string.
3. Run `npm run prisma:migrate` (name it `init`), then `npm run seed`.

A `docker-compose.yml` is provided to spin up a local Postgres instance (`npm run db:up`).

## Notes / Out of Scope

This is an MVP demo build. Intentionally **not** included: payment gateways, multi-currency,
recurring invoices / credit notes, automated emailing, bank reconciliation, roles & permissions
beyond the single admin, multi-warehouse tracking, barcode scanning, and audit logs.
