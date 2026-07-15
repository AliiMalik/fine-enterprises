import { useQuery } from '@tanstack/react-query'
import { api } from './client'
import type { Bill, CashflowPoint, Customer, Invoice, Product, Shipment, Transaction } from '../types'
import { isOverdue } from '../utils/status'

export interface OwedBucket {
  amount: number
  count: number
}

export interface DashboardData {
  outstanding: number
  totalStock: number
  balance: number
  recentInvoices: Invoice[]
  recentTransactions: Transaction[]
  cashflow: CashflowPoint[]
  /** Xero "Invoices owed to you" breakdown (unpaid invoices by state). */
  owed: {
    draft: OwedBucket
    awaiting: OwedBucket
    overdue: OwedBucket
    total: number
  }
  /** Bills you still need to pay (unpaid bills). */
  billsToPay: { amount: number; count: number; overdue: number }
  counts: {
    customers: number
    invoices: number
    products: number
    shipments: number
    transactions: number
  }
}

function byDateDesc<T extends { date?: string; issueDate?: string }>(field: 'date' | 'issueDate') {
  return (a: T, b: T) => new Date(b[field] ?? 0).getTime() - new Date(a[field] ?? 0).getTime()
}

export function useDashboard() {
  return useQuery<DashboardData>({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const [invoices, products, transactions, cashflow, customers, shipments, bills] = await Promise.all([
        api.get<Invoice[]>('/invoices'),
        api.get<Product[]>('/products'),
        api.get<Transaction[]>('/transactions'),
        api.get<CashflowPoint[]>('/transactions/summary'),
        api.get<Customer[]>('/customers'),
        api.get<Shipment[]>('/shipments'),
        api.get<Bill[]>('/bills'),
      ])

      const outstanding = invoices.data
        .filter((i) => i.status !== 'PAID')
        .reduce((sum, i) => sum + Number(i.grandTotal), 0)

      const totalStock = products.data.reduce((sum, p) => sum + (p.stockCartons || 0), 0)

      const balance = transactions.data.reduce(
        (sum, t) => sum + (t.type === 'MONEY_IN' ? Number(t.amount) : -Number(t.amount)),
        0,
      )

      // Bucket unpaid invoices into draft / awaiting payment / overdue.
      const owed = {
        draft: { amount: 0, count: 0 },
        awaiting: { amount: 0, count: 0 },
        overdue: { amount: 0, count: 0 },
        total: 0,
      }
      for (const inv of invoices.data) {
        if (inv.status === 'PAID') continue
        const amt = Number(inv.grandTotal) || 0
        const bucket = isOverdue(inv) ? owed.overdue : inv.status === 'DRAFT' ? owed.draft : owed.awaiting
        bucket.amount += amt
        bucket.count += 1
        owed.total += amt
      }

      const unpaidBills = bills.data.filter((b) => b.status !== 'PAID')
      const billsToPay = {
        amount: Math.round(unpaidBills.reduce((s, b) => s + Number(b.grandTotal), 0) * 100) / 100,
        count: unpaidBills.length,
        overdue: unpaidBills.filter((b) => isOverdue(b)).length,
      }

      const recentInvoices = [...invoices.data].sort(byDateDesc<Invoice>('issueDate')).slice(0, 5)
      const recentTransactions = [...transactions.data].sort(byDateDesc<Transaction>('date')).slice(0, 5)

      return {
        outstanding: Math.round(outstanding * 100) / 100,
        totalStock,
        balance: Math.round(balance * 100) / 100,
        recentInvoices,
        recentTransactions,
        cashflow: cashflow.data,
        owed,
        billsToPay,
        counts: {
          customers: customers.data.length,
          invoices: invoices.data.length,
          products: products.data.length,
          shipments: shipments.data.length,
          transactions: transactions.data.length,
        },
      }
    },
  })
}
