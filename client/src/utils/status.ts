import type { Invoice, InvoiceStatus } from '../types'
import type { BadgeTone } from '../components/ui/Badge'

/**
 * Xero-inspired display labels. The stored values are unchanged
 * (DRAFT / SENT / PAID / OVERDUE); only the presentation differs — notably
 * SENT is shown as "Awaiting Payment", matching Xero's language.
 */
export const STATUS_LABELS: Record<InvoiceStatus, string> = {
  DRAFT: 'Draft',
  SENT: 'Awaiting Payment',
  PAID: 'Paid',
  OVERDUE: 'Overdue',
}

export const STATUS_TONES: Record<InvoiceStatus, BadgeTone> = {
  DRAFT: 'gray',
  SENT: 'blue',
  PAID: 'green',
  OVERDUE: 'red',
}

export function statusLabel(status: InvoiceStatus): string {
  return STATUS_LABELS[status] ?? status
}

/** Label for the invoice-status <select> ("Mark …"). */
export function markLabel(status: InvoiceStatus): string {
  return `Mark ${statusLabel(status)}`
}

/**
 * An invoice is effectively overdue when it is awaiting payment (or already
 * flagged OVERDUE) and its due date is in the past. Draft and paid invoices
 * are never overdue.
 */
export function isOverdue(
  inv: Pick<Invoice, 'status' | 'dueDate'>,
  now: Date = new Date(),
): boolean {
  if (inv.status === 'PAID' || inv.status === 'DRAFT') return false
  if (inv.status === 'OVERDUE') return true
  if (!inv.dueDate) return false
  const due = new Date(inv.dueDate)
  if (Number.isNaN(due.getTime())) return false
  return due.getTime() < now.getTime()
}

/** Low-stock threshold (cartons) used for inventory alerts and stock bars. */
export const LOW_STOCK_THRESHOLD = 20
