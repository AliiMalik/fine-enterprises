import { useMemo } from 'react'
import { useInvoices } from './useInvoices'
import { useProducts } from './useProducts'
import { isOverdue, LOW_STOCK_THRESHOLD } from '../utils/status'
import { formatCurrency } from '../utils/format'

export interface Alert {
  id: string
  kind: 'overdue' | 'low-stock'
  title: string
  detail: string
  to: string
}

/**
 * Client-computed notifications: overdue invoices (awaiting payment past the
 * due date) and low-stock products. Reuses the already-cached invoice/product
 * queries, so it adds no extra requests.
 */
export function useAlerts(): { alerts: Alert[]; overdueCount: number; lowStockCount: number } {
  const { data: invoices } = useInvoices()
  const { data: products } = useProducts()

  return useMemo(() => {
    const alerts: Alert[] = []

    for (const inv of invoices ?? []) {
      if (isOverdue(inv)) {
        alerts.push({
          id: `inv-${inv.id}`,
          kind: 'overdue',
          title: `${inv.invoiceNumber} overdue`,
          detail: `${inv.customer.name} · ${formatCurrency(inv.grandTotal)}`,
          to: `/invoices/${inv.id}`,
        })
      }
    }

    for (const p of products ?? []) {
      if (p.stockCartons < LOW_STOCK_THRESHOLD) {
        alerts.push({
          id: `prod-${p.id}`,
          kind: 'low-stock',
          title: `${p.name} low on stock`,
          detail: `${p.stockCartons} carton${p.stockCartons === 1 ? '' : 's'} left`,
          to: '/inventory',
        })
      }
    }

    const overdueCount = alerts.filter((a) => a.kind === 'overdue').length
    return { alerts, overdueCount, lowStockCount: alerts.length - overdueCount }
  }, [invoices, products])
}
