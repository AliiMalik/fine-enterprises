# Fine Enterprises Ltd — Full AI Context Document

> **Purpose:** This document gives a complete, accurate picture of the *Fine Enterprises Ltd* web app so an AI assistant can understand, navigate, extend, debug, or rebuild it without re-deriving context. It reflects the **actual current code**, including a few places where the code differs from older assumptions (noted explicitly under "Reality checks").
>
> **Last reviewed against code:** the current `fine-enterprises/` workspace (client + server, npm workspaces).

---

## 1. Product overview

A lightweight, demo-ready **business management tool** (inspired by Xero) with three connected modules — **Invoicing**, **Inventory**, and **Accounts** — served from one teal-accented dashboard. It is a client-pitch / demo MVP: every workflow is functional end-to-end against a real database; there are no placeholder screens.

**Core capabilities**
- **Auth:** single admin account, JWT-based, stored in `localStorage`.
- **Invoicing:** create invoices with repeatable line items, live tax/total calc, auto-generated numbers (`INV-0001…`), status workflow (Draft → Sent → Paid → Overdue), and a downloadable styled **PDF**.
- **Inventory:** manage products (SKU, name, stock in cartons); record **shipments** that auto-increment product stock via a DB transaction.
- **Accounts:** log money-in / money-out transactions, see running balance and a 6-month cashflow chart.
- **Dashboard:** summary cards (outstanding, total stock, balance) + cashflow chart + recent invoices/transactions panels.

---

## 2. Tech stack (verified)

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite 6, TypeScript 5.6, Tailwind CSS 3.4, React Router v6.28 |
| Data fetching | TanStack Query (React Query) v5 |
| Animation | **Framer Motion v11.18** (page transitions, staggering, micro-interactions, sidebar indicator) |
| Backend | Node.js, Express, TypeScript (run in dev via `tsx watch`) |
| Database | **Prisma ORM** → **SQLite** (`provider = "sqlite"`, `DATABASE_URL="file:./dev.db"`) |
| Auth | `jsonwebtoken` + `bcryptjs`, single admin role |
| PDF | `@react-pdf/renderer` v4 (client-side generation/download) |
| Charts | `recharts` v2 |
| Icons | `lucide-react` |
| Tooling | npm workspaces, `concurrently`, `dotenv` |

**Reality checks (important — earlier specs were partially aspirational):**
- The DB is **SQLite**, *not* PostgreSQL, and `Invoice.status` / `Transaction.type` are stored as **`String` fields, not Prisma enums** (SQLite has no enums). A `docker-compose.yml` for Postgres exists but is **not wired into the current schema**. Values used: status ∈ `{DRAFT, SENT, PAID, OVERDUE}`, type ∈ `{MONEY_IN, MONEY_OUT}`.
- The auth response is a JSON object `{ token, user }`; the token is stored under `localStorage` key **`fe_token`** and the user under **`fe_user`** (exported as `TOKEN_KEY`/`USER_KEY` in `client/src/api/client.ts`). The axios interceptor sends it as `Authorization: Bearer <token>`.
- Demo login: **`admin@fineenterprises.com` / `demo1234`**.

---

## 3. Repository structure

Monorepo at `fine-enterprises/` using npm workspaces (`client`, `server`).

```
fine-enterprises/
├─ package.json            # root: workspaces + scripts (dev, build, seed, prisma:*, db:*)
├─ .env / .env.example     # DATABASE_URL, JWT_SECRET, JWT_EXPIRES_IN, PORT
├─ docker-compose.yml      # optional local Postgres (NOT currently used by schema)
├─ README.md               # human quick-start (partially out of date vs code)
├─ client/                 # React + Vite frontend
│  ├─ index.html
│  ├─ vite.config.ts       # dev proxy: /api -> http://localhost:4000
│  ├─ tailwind.config.js   # teal palette (DEFAULT #0F766E) + `surface:#FAFAFA`
│  ├─ src/
│  │  ├─ main.tsx          # React root: StrictMode + QueryClient + BrowserRouter + AuthProvider
│  │  ├─ App.tsx           # Route tree (see §6)
│  │  ├─ index.css         # Tailwind directives; body bg-surface
│  │  ├─ types/index.ts     # shared TS interfaces (single source of shapes)
│  │  ├─ api/              # axios client + React Query hooks
│  │  │  ├─ client.ts          # axios instance, interceptors, TOKEN_KEY/USER_KEY
│  │  │  ├─ useDashboard.ts    # dashboard aggregation (client-side)
│  │  │  ├─ useInvoices.ts     # list/get/create + updateStatus
│  │  │  ├─ useProducts.ts     # list/create
│  │  │  ├─ useShipments.ts    # list/create
│  │  │  ├─ useTransactions.ts # list/create + cashflow summary
│  │  │  └─ useCustomers.ts    # list/create
│  │  ├─ auth/AuthContext.tsx  # AuthProvider + useAuth()
│  │  ├─ utils/format.ts       # formatCurrency (GBP), formatDate, calculateTotals, etc.
│  │  ├─ components/
│  │  │  ├─ layout/   Sidebar, TopBar, DashboardLayout, AnimatedOutlet, ProtectedRoute, PageWrapper, motion.ts
│  │  │  ├─ ui/       Button, Card, Input, Table, Badge, ErrorNote
│  │  │  ├─ invoices/ InvoiceForm, LineItemRow, InvoicePDF
│  │  │  ├─ inventory/ProductForm, ShipmentForm, InventoryTabs
│  │  │  └─ accounts/ TransactionForm, CashflowChart
│  │  └─ pages/
│  │     ├─ Login.tsx
│  │     ├─ Dashboard.tsx
│  │     ├─ invoices/   InvoiceList, InvoiceCreate, InvoiceDetail
│  │     ├─ inventory/  ProductList, ShipmentList, ShipmentCreate
│  │     └─ accounts/   Ledger
└─ server/                 # Express + TypeScript API
   └─ src/
      ├─ index.ts         # express app, route mounting, 404 + error handlers
      ├─ config.ts        # loads root .env (ENV_PATH), PORT/JWT_* from env
      ├─ lib/jwt.ts       # signToken / verifyToken (JwtPayload {userId,email})
      ├─ middleware/auth.middleware.ts  # bearer extraction -> req.userId/req.userEmail
      ├─ controllers/     # auth, customers, invoices, products, shipments, transactions
      ├─ routes/          # one router per resource (mounted at /api/<resource>)
      └─ prisma/
         ├─ client.ts     # `export const prisma = new PrismaClient()`
         ├─ schema.prisma # models (SQLite)
         ├─ seed.ts       # demo data
         └─ dev.db        # generated SQLite file (gitignored)
```

---

## 4. Environment & setup

**`.env` (root):**
```
DATABASE_URL="file:./dev.db"
JWT_SECRET="dev-secret-change-me-please"
JWT_EXPIRES_IN="7d"
PORT=4000
```

**Scripts (run from repo root):**
| Command | Effect |
|---|---|
| `npm install` | install all workspace deps |
| `npm run dev` | `concurrently` runs server (`tsx watch`) + client (`vite`) with HMR |
| `npm run dev:server` / `npm run dev:client` | run one side only |
| `npm run build` | `npm run build -w client && npm run build -w server` (client: `tsc -b && vite build`; server has no separate compile step — it runs via `tsx`) |
| `npm run seed` | wipe + reseed SQLite via `server/src/prisma/seed.ts` |
| `npm run prisma:push` | create/update SQLite DB from schema (no migrations) |
| `npm run prisma:generate` | regenerate Prisma client |
| `npm run db:up` / `npm run db:down` | start/stop the (unused) Postgres container |

**Bootstrap sequence:**
1. `npm install`
2. `npm run prisma:push` (creates `server/src/prisma/dev.db`)
3. `npm run seed` (admin + 5 customers + 8 products + 3 invoices + 2 shipments + 15 transactions)
4. `npm run dev` → client `http://localhost:5173`, API `http://localhost:4000/api`.

**Runtime notes:**
- The Vite dev server proxies `/api` → `http://localhost:4000` (see `client/vite.config.ts`), so the browser only talks to `:5173`. CORS is also enabled server-side (`app.use(cors())`).
- The server reads the **root** `.env` via `config.ts` (`ENV_PATH` resolves to repo root regardless of cwd).
- **Known operational hiccup:** a stale API process sometimes holds port 4000; the dev server then crashes with `EADDRINUSE`. Kill the stale process (or change `PORT`) before `npm run dev`.

---

## 5. Data model (Prisma / SQLite)

Relations (`schema.prisma`):
- **User** 1—∞ *(implicit)* admin logins.
- **Customer** 1—∞ **Invoice**.
- **Invoice** 1—∞ **LineItem** (`onDelete: Cascade`).
- **Product** 1—∞ **ShipmentItem**.
- **Shipment** 1—∞ **ShipmentItem** (`onDelete: Cascade`).
- **Transaction** standalone.

Models (key fields):
| Model | Fields |
|---|---|
| `User` | `id` (uuid), `email` unique, `password` (bcrypt hash), `name`, `createdAt` |
| `Customer` | `id`, `name`, `email?`, `phone?`, `addressLine1/2?`, `city?`, `postcode?`, `country?`, `invoices`, `createdAt` |
| `Invoice` | `id`, `crn`, `invoiceNumber` unique, `issueDate`, `dueDate?`, `status` (String, default `"DRAFT"`), `customerId`→Customer, `lineItems`, `subtotal`/`tax`/`grandTotal` (Decimal), `createdAt` |
| `LineItem` | `id`, `invoiceId`→Invoice, `sku`, `description`, `quantity` Int, `unitPrice` Decimal, `lineTotal` Decimal |
| `Product` | `id`, `sku` unique, `name`, `description?`, `stockCartons` Int default 0, `shipmentItems`, `createdAt` |
| `Shipment` | `id`, `shipmentNumber` unique, `receivedDate`, `items`, `createdAt` |
| `ShipmentItem` | `id`, `shipmentId`→Shipment, `productId`→Product, `quantityCartons` Int |
| `Transaction` | `id`, `type` (String), `description`, `amount` Decimal, `date`, `createdAt` |

**Business rules implemented server-side:**
- Invoice numbers: `computeNextInvoiceNumber()` scans existing `invoiceNumber`s and increments the max `INV-NNNN`.
- Shipment numbers: same pattern for `SHIP-NNNN` (auto if not supplied).
- Create Invoice: validates `crn` + `customer.name`; requires ≥1 line item; normalizes items; computes `subtotal`/`tax` (`taxRate`%)/`grandTotal` (all `.toFixed(2)` strings); **matches-or-creates** the customer by `email` (if email present). Status coerced to a valid value else `DRAFT`.
- Create Shipment: validates items; verifies all `productId`s exist; wraps creation **+ per-product `stockCartons` increment** in `prisma.$transaction`.
- Cashflow summary: buckets transactions into the last 6 months (`YYYY-MM`), summing `moneyIn`/`moneyOut`.

---

## 6. Backend API reference

Base path: `/api`. All routes except `GET /api/health` and `POST /api/auth/login` require `Authorization: Bearer <token>` (enforced by `authMiddleware`, which 401s when missing/invalid).

| Method | Path | Auth | Handler | Notes |
|---|---|---|---|---|
| GET | `/api/health` | No | inline | `{ status:"ok", time }` |
| POST | `/api/auth/login` | No | `login` | body `{email,password}` → `{ token, user }` (bcrypt compare) |
| GET | `/api/auth/me` | Yes | `me` | returns the user (from `req.userId`) |
| GET | `/api/customers` | Yes | `listCustomers` | includes `_count.invoices` |
| POST | `/api/customers` | Yes | `createCustomer` | requires `name` |
| GET | `/api/invoices` | Yes | `listInvoices` | ordered desc, includes `customer` + `lineItems` |
| POST | `/api/invoices` | Yes | `createInvoice` | see rules in §5 |
| GET | `/api/invoices/:id` | Yes | `getInvoice` | 404 if missing; includes customer + lineItems |
| PATCH | `/api/invoices/:id/status` | Yes | `updateInvoiceStatus` | body `{status}` ∈ valid set |
| GET | `/api/products` | Yes | `listProducts` | ordered desc |
| POST | `/api/products` | Yes | `createProduct` | requires `sku`+`name`; 409 if SKU exists |
| GET | `/api/shipments` | Yes | `listShipments` | includes `items.product` |
| POST | `/api/shipments` | Yes | `createShipment` | increments stock (transactional) |
| GET | `/api/transactions/summary` | Yes | `summary` | **must precede** `/:id` routes; 6-month buckets |
| GET | `/api/transactions` | Yes | `listTransactions` | ordered desc |
| POST | `/api/transactions` | Yes | `createTransaction` | requires valid `type`, `description`, `amount>0` |

**Error handling:** validation failures return `4xx` with `{ error: "..." }`. A global Express error handler returns `{ error: message }` with the error's `status` (default 500). Unknown routes → 404 `{ error: "Cannot <METHOD> <path>" }`.

**Client behavior on 401:** `api/client.ts` response interceptor clears `fe_token`/`fe_user` and redirects to `/login` (unless already there).

---

## 7. Frontend architecture

### 7.1 Routing (`App.tsx`)
- Route tree under `<BrowserRouter>`:
  - `/login` → `PublicOnlyRoute` → `Login` (redirects to `/dashboard` if already authed).
  - Protected layout `DashboardLayout` (requires token, else `/login`):
    - `/dashboard` → `Dashboard`
    - `/invoices`, `/invoices/new`, `/invoices/:id`
    - `/inventory`, `/inventory/shipments`, `/inventory/shipments/new`
    - `/accounts`
  - `*` → `<Navigate to="/dashboard" replace />`.
- Protected routes check `AuthContext.token`; a `loading` state shows a full-screen "Loading…" until `localStorage` is read.

### 7.2 Layout & chrome (`DashboardLayout`)
```
<div min-h-screen bg-surface>
  <Sidebar />            // fixed left, w-60
  <div pl-60>
    <TopBar />           // sticky top, shows user + Sign out
    <main max-w-7xl px-8 py-8>
      <AnimatedOutlet /> // page content region (animated)
    </main>
  </div>
</div>
```
The **Sidebar + TopBar stay mounted** across navigation; only `AnimatedOutlet` swaps the page — key design choice that makes the page transitions and the sidebar indicator stable (see §8).

### 7.3 State & data
- **Auth:** `AuthProvider`/`useAuth()` holds `{ user, token, loading, login, logout }`, backed by `localStorage`.
- **Server state:** TanStack Query hooks in `client/src/api/*`. Each `useX` returns query data; `useCreateX` mutations invalidate the relevant query keys (`invoices`, `products`, `shipments`, `transactions`, `cashflow`, `dashboard`, `customers`) so lists/summaries refresh.
- **Dashboard aggregation** is computed **client-side** in `useDashboard` (parallel fetches of invoices/products/transactions/cashflow/customers) → `outstanding` (sum of non-PAID grand totals), `totalStock`, `balance` (money in − out), recent slices, cashflow, and counts. **Known gap:** `counts.shipments` is hardcoded to `0` (shipments are not fetched by the dashboard hook despite a working `/api/shipments` endpoint).

### 7.4 Shared types (`types/index.ts`)
`InvoiceStatus`, `TransactionType`, `User`, `Customer`, `LineItem`, `Invoice`, `Product`, `ShipmentItem`, `Shipment`, `Transaction`, `CashflowPoint`. Note `subtotal`/`tax`/`grandTotal`/`unitPrice`/`lineTotal`/`amount` are typed as `string | number` because Prisma Decimals serialize to strings over JSON.

### 7.5 UI primitives (`components/ui`)
- `Button` — **`motion.button`** with `whileTap={{scale:0.97}}`, `whileHover={{y:-1}}`, variants `primary|secondary|ghost|danger`, sizes `sm|md`.
- `Card` — titled/actionable surface (`title`, `action`, `padded`).
- `Input` / `Select` / `Textarea` / `Field` — labeled form controls (consistent `inputClass`).
- `Table` / `TH` / `TD` / `EmptyRow` — styled table; `InvoiceStatusBadge`, `TypeBadge` (use `Badge`).
- `Badge` — tones `gray|blue|green|red|teal`.
- `ErrorNote` — animated `role="alert"` banner (fade+scale via `AnimatePresence`).

### 7.6 Key pages/components
- `Dashboard.tsx` — 3 summary cards + cashflow chart + recent invoices/transactions (animated, see §8).
- `invoices/InvoiceForm.tsx` + `LineItemRow.tsx` — multi-section form; line items use **stable `id`s + `AnimatePresence`** for add/remove; auto number preview; live totals; "Save as Sent"/"Save as Draft" call `useCreateInvoice` then navigate to detail.
- `invoices/InvoiceDetail.tsx` — view invoice, change status via `<select>` → `useUpdateInvoiceStatus`, and `InvoicePDFButton` (client-side `@react-pdf/renderer` download).
- `inventory/ProductList.tsx` — lists products; toggles inline `ProductForm` (expand/collapse animated).
- `inventory/ShipmentForm.tsx` — variable item rows (add/remove animated), selects product + cartons; on submit increments stock and navigates back.
- `accounts/Ledger.tsx` — balance cards + transactions table + `TransactionForm` + cashflow chart.

---

## 8. Animation system (Framer Motion) — the bespoke enhancement layer

A four-phase, enterprise-smooth animation system was added on top of the base app. **Design constraints:** easing `EASE_OUT_EXPO = [0.22, 1, 0.36, 1]` (easeOutExpo-style, snappy, **no bounce**), durations `0.15–0.4s`. `useReducedMotion()` is respected everywhere (collapses motion to plain fades).

**Source of truth:** `client/src/components/layout/motion.ts` exports the shared `EASE_OUT_EXPO` and reusable variant factories:
- `fadeUpContainer(delayChildren?, staggerChildren?)` / `fadeUpItem(y?, duration?)` — block-level stagger.
- `listContainer(staggerChildren?)` / `listRow(y?, duration?)` — table-row cascade.
- `errorBox`, `expand`, `rowEnter` — error banner, height-expand, and list-row enter/exit.

### Phase 1 — Page enter/exit transitions
- `PageWrapper.tsx`: wraps each routed page root; `motion.div` with `initial` (fade + `y:10→0`, 0.3s) / `animate` / `exit` (fade + `y:0→-6`, 0.18s). Respects reduced motion.
- `AnimatedOutlet.tsx`: captures the matched route element via `useOutlet()`, clones it with `key={location.pathname}`, and wraps in `<AnimatePresence mode="wait" initial={false}>`. The **previous page finishes its exit before the next enters**, while Sidebar/TopBar stay mounted.
- All 9 in-app pages + `Login` are wrapped in `PageWrapper`.

### Phase 2 — Dashboard & list staggering
- `Dashboard.tsx`: header fades up; summary cards + the two lower panels are `fadeUpContainer` groups whose children (`SummaryCard`, `Card`) are `fadeUpItem`s, cascading in.
- List pages (`InvoiceList`, `ProductList`, `ShipmentList`): the `<tbody>` is a `motion.tbody` stagger container and each row a `motion.tr` (`listRow`), so rows cascade top-to-bottom after the page fades in. Empty states are unaffected.

### Phase 3 — Form / modal micro-interactions
- `Button` upgraded to `motion.button` (global press/hover feedback).
- `ErrorNote` component: animated error banners via `AnimatePresence`.
- Invoice & Shipment line items use **stable `id` keys + `AnimatePresence`** so adding a row slides it in and removing one (even mid-list) animates out while siblings hold position (`layout`).
- Inline "Add Product" card in `ProductList` expand/collapses via the `expand` variant.

### Phase 4 — Sidebar active-item magic-move indicator
- `Sidebar.tsx`: a single `motion.span` with `layoutId="sidebar-active"` is rendered inside the active `NavLink`. Framer Motion **slides/morphs** the teal pill between items on navigation. Active state is resolved via `useMatch('/segment/*') || pathname === to`, so **sub-routes keep the parent highlighted** (e.g. `/invoices/new` highlights *Invoices*). Hook calls are pre-computed in a stable-length array to respect the Rules of Hooks.

**Verification status:** all four phases build clean (`tsc -b && vite build`), the dev server serves without runtime errors, and the API responds. Visual timing should be eyeballed in `npm run dev`.

---

## 9. Demo data (from `seed.ts`)
- **1 admin:** `admin@fineenterprises.com` / `demo1234` (name "Admin Fine").
- **5 customers:** Acme Traders Ltd, Northwind Logistics, Globex Corporation, Soylent Foods, Initech Supplies (UK/US addresses).
- **8 products** (SKU `TEA-001`…`PST-008`), various carton stocks.
- **3 invoices:** `INV-0001` (PAID), `INV-0002` (SENT), `INV-0003` (DRAFT), with line items and 20% tax.
- **2 shipments:** `SHIP-0001`, `SHIP-0002` with multiple product items.
- **15 transactions** (MIX of MONEY_IN/MONEY_OUT) spread over ~6 months, used by the cashflow chart and balance.

---

## 10. Known issues / tech debt / out-of-scope (for an AI picking this up)
1. **`shipments` count is hardcoded to `0`** in `useDashboard` (`counts.shipments`). Either fetch `/api/shipments` or drop the field.
2. **DB is SQLite, not Postgres** despite the docker-compose and some documentation. To switch: change `provider` to `postgresql`, convert `status`/`type` `String` → Prisma enums, set `DATABASE_URL`, run `prisma migrate dev`.
3. **No production build step for the server** — `npm run build` only builds the client; the server runs via `tsx`. For prod you'd compile (`tsc`) or run with `tsx`.
4. **Overdue status is never auto-computed** — it's only settable manually; no scheduled job flips SENT→OVERDUE past `dueDate`.
5. **Port 4000 conflicts** are common if a prior API process lingers; document/automate a kill step.
6. **Vanilla CSS custom-class collisions:** the `Button` secondary variant previously had a `bg-gray--50` typo (now fixed to `bg-gray-50`). Watch Tailwind class typos.
7. **Out of scope (MVP):** payments, multi-currency, recurring invoices/credit notes, emailing, bank reconciliation, multi-user roles beyond the single admin, multi-warehouse, barcode scanning, audit logs.

---

## 11. Quick "how to extend" cheat-sheet
- **Add an API endpoint:** create controller fn in `server/src/controllers/`, add route in the relevant `server/src/routes/*.routes.ts` (apply `authMiddleware` unless public), mount already wired in `index.ts`.
- **Add a page:** create `client/src/pages/...`, add a `<Route>` in `App.tsx` (inside the protected layout), wrap its root in `<PageWrapper className="space-y-6">`, add a `Sidebar` entry if it's a top-level section.
- **Add animation:** reuse variants from `motion.ts`; for list rows use `motion.tbody`+`motion.tr` with `listContainer`/`listRow`; for add/remove lists use `AnimatePresence` + stable `id` keys + `rowEnter`.
- **Add a form field/validation:** extend the relevant `*.tsx` form, surface errors with `<ErrorNote message={...} />`.
- **Data refresh after mutation:** ensure the mutation's `onSuccess` invalidates the correct React Query keys (see §7.3).
