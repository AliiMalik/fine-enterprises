import { Wallet, TrendingUp, FileText, Boxes, ArrowUpRight } from 'lucide-react'
import { InvoiceStatusBadge } from '../ui/Table'
import { SuccessBurst } from '../ui/SuccessBurst'

const CARD =
  'rounded-2xl bg-white/95 shadow-2xl ring-1 ring-black/5 backdrop-blur dark:bg-gray-900/95 dark:ring-white/10'

/* --------------------------------- Invoice -------------------------------- */

export function InvoiceCard({ paid }: { paid: boolean }) {
  return (
    <div id="hero-invoice" className={`hero-card w-full overflow-hidden ${CARD}`}>
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3.5 dark:border-gray-800">
        <div>
          <div className="text-sm font-bold text-gray-900 dark:text-gray-100">INV-0002</div>
          <div className="text-xs text-gray-400">Northwind Logistics</div>
        </div>
        <div className="relative">
          <InvoiceStatusBadge status={paid ? 'PAID' : 'SENT'} />
          {paid && <SuccessBurst />}
        </div>
      </div>
      <div className="px-5 py-3">
        {[
          { d: 'Assorted tea cartons', q: '40', p: '£12.40' },
          { d: 'Ground coffee 1kg', q: '18', p: '£9.80' },
        ].map((li) => (
          <div key={li.d} className="flex items-center justify-between py-1.5 text-xs">
            <span className="truncate text-gray-600 dark:text-gray-300">{li.d}</span>
            <span className="ml-3 shrink-0 tabular-nums text-gray-400">
              {li.q} × {li.p}
            </span>
          </div>
        ))}
      </div>
      <div className="border-t border-gray-100 px-5 py-3 dark:border-gray-800">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>Subtotal</span>
          <span className="tabular-nums">£567.15</span>
        </div>
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>Tax (20%)</span>
          <span className="tabular-nums">£113.43</span>
        </div>
        <div className="mt-1.5 flex items-center justify-between border-t border-gray-100 pt-1.5 text-sm font-bold text-gray-900 dark:border-gray-800 dark:text-white">
          <span>Grand Total</span>
          <span className="tabular-nums">£680.58</span>
        </div>
      </div>
    </div>
  )
}

/* --------------------------------- Balance -------------------------------- */

export function BalanceCard() {
  return (
    <div id="hero-balance" className={`hero-card relative w-full overflow-hidden p-5 ${CARD}`}>
      {/* green flash overlay driven by the timeline on the "paid" beat */}
      <div id="hero-balance-flash" className="pointer-events-none absolute inset-0 bg-green-400/25 opacity-0" />
      <div className="relative flex items-start justify-between">
        <div>
          <div className="text-sm font-medium text-gray-600 dark:text-gray-300">Current Balance</div>
          <div className="mt-1.5 text-2xl font-bold tabular-nums text-gray-900 dark:text-white">
            <span id="hero-balance-value">£17,500.00</span>
          </div>
          <div
            id="hero-balance-delta"
            className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-green-600 opacity-0 dark:text-green-400"
          >
            <ArrowUpRight size={13} /> +£680.58 from INV-0002
          </div>
        </div>
        <div className="rounded-lg bg-green-50 p-2 text-green-700 dark:bg-green-900/30 dark:text-green-400">
          <Wallet size={20} />
        </div>
      </div>
    </div>
  )
}

/* -------------------------------- Cashflow -------------------------------- */

const BARS = [42, 60, 48, 72, 55, 30]

export function CashflowCard() {
  return (
    <div id="hero-cashflow" className={`hero-card w-full p-5 ${CARD}`}>
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
        <TrendingUp size={16} className="text-teal-600" /> Cashflow
      </div>
      <div className="flex h-24 items-end gap-2">
        {BARS.map((h, i) => {
          const last = i === BARS.length - 1
          return (
            <div key={i} className="flex flex-1 flex-col justify-end">
              <div
                {...(last ? { id: 'hero-cashflow-bar' } : {})}
                className={`w-full rounded-t ${last ? 'bg-teal-500' : 'bg-teal-500/40'}`}
                style={{ height: `${h}%` }}
              />
            </div>
          )
        })}
      </div>
      <div className="mt-2 flex justify-between text-[10px] text-gray-400">
        {['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'].map((m) => (
          <span key={m}>{m}</span>
        ))}
      </div>
    </div>
  )
}

/* --------------------------------- Owed ----------------------------------- */

export function OwedCard() {
  return (
    <div id="hero-owed" className={`hero-card w-full p-5 ${CARD}`}>
      <div className="mb-1 text-sm font-semibold text-gray-900 dark:text-gray-100">Invoices owed to you</div>
      <div className="mb-3 text-lg font-bold tabular-nums text-gray-900 dark:text-white">
        <span id="hero-owed-total">£1,397.44</span>
      </div>
      <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
        <div className="h-full bg-gray-300 dark:bg-gray-600" style={{ width: '30%' }} />
        <div id="hero-owed-awaiting" className="h-full bg-teal-500" style={{ width: '49%' }} />
        <div className="h-full bg-red-500" style={{ width: '0%' }} />
      </div>
      <div className="mt-3 flex justify-between text-[11px] text-gray-400">
        <span>Draft</span>
        <span>Awaiting</span>
        <span>Overdue</span>
      </div>
    </div>
  )
}

/* ------------------------------ Payment chip ------------------------------ */

export function PaymentChip() {
  return (
    <div
      id="hero-chip"
      className="pointer-events-none absolute left-0 top-0 z-30 inline-flex items-center gap-1 rounded-full bg-green-600 px-3 py-1.5 text-xs font-bold text-white opacity-0 shadow-lg"
    >
      <ArrowUpRight size={13} /> +£680.58
    </div>
  )
}

/* ------------------------------- Module row ------------------------------- */

const MODULES = [
  { icon: FileText, label: 'Invoicing' },
  { icon: Boxes, label: 'Inventory' },
  { icon: Wallet, label: 'Accounts' },
]

export function ModuleRow() {
  return (
    <div id="hero-modules" className="flex items-center justify-center gap-3">
      {MODULES.map((m) => {
        const Icon = m.icon
        return (
          <div
            key={m.label}
            className="hero-module flex items-center gap-2 rounded-xl bg-white/90 px-4 py-2.5 text-sm font-semibold text-gray-800 shadow-lg ring-1 ring-black/5 dark:bg-gray-800/90 dark:text-gray-100 dark:ring-white/10"
          >
            <Icon size={16} className="text-teal-600 dark:text-teal-400" />
            {m.label}
          </div>
        )
      })}
    </div>
  )
}
