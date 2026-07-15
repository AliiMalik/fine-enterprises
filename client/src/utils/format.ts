export function formatCurrency(value: number | string | null | undefined): string {
  const n = typeof value === 'string' ? parseFloat(value) : value ?? 0
  const safe = Number.isFinite(n) ? n : 0
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(safe)
}

export function formatNumber(value: number | string | null | undefined): string {
  const n = typeof value === 'string' ? parseFloat(value) : value ?? 0
  const safe = Number.isFinite(n) ? n : 0
  return new Intl.NumberFormat('en-GB').format(safe)
}

export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return '—'
  const d = typeof value === 'string' ? new Date(value) : value
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function toInputDate(value: string | Date | null | undefined): string {
  if (!value) return ''
  const d = typeof value === 'string' ? new Date(value) : value
  if (Number.isNaN(d.getTime())) return ''
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export interface TotalsInput {
  quantity: number
  unitPrice: number
}

export function calculateLineTotal(quantity: number, unitPrice: number): number {
  return (Number(quantity) || 0) * (Number(unitPrice) || 0)
}

export function calculateTotals(
  lineItems: { quantity: number; unitPrice: number }[],
  taxRate: number,
) {
  const subtotal = lineItems.reduce(
    (sum, li) => sum + calculateLineTotal(li.quantity, li.unitPrice),
    0,
  )
  const tax = subtotal * (Number(taxRate) || 0) / 100
  const grandTotal = subtotal + tax
  return {
    subtotal: round2(subtotal),
    tax: round2(tax),
    grandTotal: round2(grandTotal),
  }
}

export function round2(n: number): number {
  return Math.round((Number(n) + Number.EPSILON) * 100) / 100
}
