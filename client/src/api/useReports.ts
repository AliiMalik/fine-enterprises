import { useMemo } from 'react'
import { useInvoices } from './useInvoices'
import { useTransactions } from './useTransactions'

export interface AgingBucket {
  key: string
  label: string
  amount: number
  count: number
}

export interface CategoryTotal {
  category: string
  amount: number
}

export interface CustomerTotal {
  name: string
  amount: number
  count: number
}

export interface ReportsData {
  pl: {
    income: number
    expenses: number
    net: number
    expenseByCategory: CategoryTotal[]
  }
  aging: AgingBucket[]
  agingTotal: number
  salesByCustomer: CustomerTotal[]
  ready: boolean
}

const DAY = 1000 * 60 * 60 * 24

/**
 * Client-computed reports for the Accounting area — Profit & Loss (from the
 * cash ledger), AR aging (unpaid invoices by age), and Sales by customer.
 * Reuses the cached invoice/transaction queries, so it adds no requests.
 */
export function useReports(): ReportsData {
  const { data: invoices } = useInvoices()
  const { data: transactions } = useTransactions()

  return useMemo(() => {
    const txs = transactions ?? []
    const invs = invoices ?? []

    // --- Profit & Loss (from actual money in/out) ---------------------------
    let income = 0
    let expenses = 0
    const expenseMap = new Map<string, number>()
    for (const t of txs) {
      const amt = Number(t.amount) || 0
      if (t.type === 'MONEY_IN') {
        income += amt
      } else {
        expenses += amt
        const cat = t.category || 'Uncategorised'
        expenseMap.set(cat, (expenseMap.get(cat) ?? 0) + amt)
      }
    }
    const expenseByCategory = [...expenseMap.entries()]
      .map(([category, amount]) => ({ category, amount: Math.round(amount * 100) / 100 }))
      .sort((a, b) => b.amount - a.amount)

    // --- AR aging (unpaid invoices bucketed by days past due) ---------------
    const now = Date.now()
    const buckets: AgingBucket[] = [
      { key: 'current', label: 'Current', amount: 0, count: 0 },
      { key: '1-30', label: '1–30 days', amount: 0, count: 0 },
      { key: '31-60', label: '31–60 days', amount: 0, count: 0 },
      { key: '60+', label: '60+ days', amount: 0, count: 0 },
    ]
    for (const inv of invs) {
      if (inv.status === 'PAID') continue
      const amt = Number(inv.grandTotal) || 0
      const due = inv.dueDate ? new Date(inv.dueDate).getTime() : now
      const overdueDays = Math.floor((now - due) / DAY)
      const b =
        overdueDays <= 0 ? buckets[0] : overdueDays <= 30 ? buckets[1] : overdueDays <= 60 ? buckets[2] : buckets[3]
      b.amount += amt
      b.count += 1
    }
    buckets.forEach((b) => (b.amount = Math.round(b.amount * 100) / 100))
    const agingTotal = Math.round(buckets.reduce((s, b) => s + b.amount, 0) * 100) / 100

    // --- Sales by customer --------------------------------------------------
    const custMap = new Map<string, { amount: number; count: number }>()
    for (const inv of invs) {
      const name = inv.customer?.name ?? 'Unknown'
      const cur = custMap.get(name) ?? { amount: 0, count: 0 }
      cur.amount += Number(inv.grandTotal) || 0
      cur.count += 1
      custMap.set(name, cur)
    }
    const salesByCustomer = [...custMap.entries()]
      .map(([name, v]) => ({ name, amount: Math.round(v.amount * 100) / 100, count: v.count }))
      .sort((a, b) => b.amount - a.amount)

    return {
      pl: {
        income: Math.round(income * 100) / 100,
        expenses: Math.round(expenses * 100) / 100,
        net: Math.round((income - expenses) * 100) / 100,
        expenseByCategory,
      },
      aging: buckets,
      agingTotal,
      salesByCustomer,
      ready: !!invoices && !!transactions,
    }
  }, [invoices, transactions])
}
