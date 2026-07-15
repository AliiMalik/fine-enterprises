import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2 } from 'lucide-react'
import { Field, Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { ErrorNote } from '../ui/ErrorNote'
import { useCreateBill } from '../../api/useBills'
import { calculateTotals, formatCurrency, toInputDate } from '../../utils/format'
import { rowEnter } from '../layout/motion'
import type { InvoiceStatus } from '../../types'

interface BillLine {
  id: string
  description: string
  quantity: number
  unitPrice: number
}

const uid = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `bl_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

const emptyLine = (): BillLine => ({ id: uid(), description: '', quantity: 1, unitPrice: 0 })

function todayPlus(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return toInputDate(d)
}

export function BillForm({ onSaved }: { onSaved: (id: string) => void }) {
  const createBill = useCreateBill()
  const [supplierName, setSupplierName] = useState('')
  const [category, setCategory] = useState('')
  const [issueDate, setIssueDate] = useState(toInputDate(new Date()))
  const [dueDate, setDueDate] = useState(todayPlus(30))
  const [taxRate, setTaxRate] = useState(20)
  const [lines, setLines] = useState<BillLine[]>([emptyLine()])
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState<InvoiceStatus | null>(null)

  const totals = calculateTotals(lines, taxRate)

  const update = (i: number, patch: Partial<BillLine>) =>
    setLines((prev) => prev.map((l, idx) => (idx === i ? { ...l, ...patch } : l)))
  const addLine = () => setLines((prev) => [...prev, emptyLine()])
  const removeLine = (i: number) => setLines((prev) => (prev.length > 1 ? prev.filter((_, idx) => idx !== i) : prev))

  async function handleSubmit(status: InvoiceStatus) {
    setError(null)
    if (!supplierName.trim()) return setError('Supplier name is required.')
    const validLines = lines.filter((l) => l.description.trim() && l.quantity > 0 && l.unitPrice >= 0)
    if (validLines.length === 0) return setError('Add at least one valid line item.')

    setSubmitting(status)
    try {
      const created = await createBill.mutateAsync({
        supplierName,
        category: category || null,
        issueDate,
        dueDate: dueDate || null,
        taxRate,
        status,
        items: validLines,
      })
      onSaved(created.id)
    } catch (e: any) {
      setError(e?.response?.data?.error ?? 'Failed to save bill.')
      setSubmitting(null)
    }
  }

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
      <div className="space-y-5 lg:col-span-2">
        <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-white/10">
          <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-gray-100">Bill details</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Supplier" className="sm:col-span-2">
              <Input value={supplierName} onChange={(e) => setSupplierName(e.target.value)} placeholder="Supplier name" />
            </Field>
            <Field label="Category">
              <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Utilities" />
            </Field>
            <Field label="Tax rate (%)">
              <Input type="number" min={0} step="0.1" value={taxRate} onChange={(e) => setTaxRate(Number(e.target.value))} />
            </Field>
            <Field label="Issue Date">
              <Input type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} />
            </Field>
            <Field label="Due Date">
              <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </Field>
          </div>
        </div>

        <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-white/10">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Line items</h3>
            <Button variant="secondary" size="sm" type="button" onClick={addLine}>
              <Plus size={14} /> Add line item
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <th className="px-2 py-2">Description</th>
                  <th className="px-2 py-2">Qty</th>
                  <th className="px-2 py-2">Unit Price</th>
                  <th className="px-2 py-2 text-right">Line Total</th>
                  <th className="px-2 py-2" />
                </tr>
              </thead>
              <tbody>
                <AnimatePresence initial={false}>
                  {lines.map((line, i) => (
                    <motion.tr key={line.id} layout variants={rowEnter()} initial="initial" animate="animate" exit="exit">
                      <td className="px-2 py-2">
                        <Input aria-label="Description" value={line.description} onChange={(e) => update(i, { description: e.target.value })} placeholder="Description" />
                      </td>
                      <td className="px-2 py-2">
                        <Input type="number" min={1} aria-label="Quantity" value={line.quantity} onChange={(e) => update(i, { quantity: Number(e.target.value) })} />
                      </td>
                      <td className="px-2 py-2">
                        <Input type="number" min={0} step="0.01" aria-label="Unit price" value={line.unitPrice} onChange={(e) => update(i, { unitPrice: Number(e.target.value) })} />
                      </td>
                      <td className="px-2 py-2 text-right align-middle font-medium text-gray-800 dark:text-gray-200">
                        {formatCurrency((Number(line.quantity) || 0) * (Number(line.unitPrice) || 0))}
                      </td>
                      <td className="px-2 py-2 text-right align-middle">
                        <button
                          type="button"
                          onClick={() => removeLine(i)}
                          disabled={lines.length <= 1}
                          className="rounded-md p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-30 dark:hover:bg-red-950/40"
                          aria-label="Remove line item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="lg:col-span-1">
        <div className="sticky top-24 rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-white/10">
          <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-gray-100">Summary</h3>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500 dark:text-gray-400">Subtotal</dt>
              <dd className="font-medium">{totals.subtotal.toFixed(2)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500 dark:text-gray-400">Tax</dt>
              <dd className="font-medium">{totals.tax.toFixed(2)}</dd>
            </div>
            <div className="flex justify-between border-t border-gray-100 pt-2 text-base font-bold text-gray-900 dark:border-gray-800 dark:text-white">
              <dt>Grand Total</dt>
              <dd>{totals.grandTotal.toFixed(2)}</dd>
            </div>
          </dl>

          <ErrorNote message={error} />

          <div className="mt-5 space-y-2">
            <Button className="w-full" type="button" disabled={submitting !== null} onClick={() => handleSubmit('SENT')}>
              {submitting === 'SENT' ? 'Saving…' : 'Save as Awaiting Payment'}
            </Button>
            <Button className="w-full" variant="secondary" type="button" disabled={submitting !== null} onClick={() => handleSubmit('DRAFT')}>
              {submitting === 'DRAFT' ? 'Saving…' : 'Save as Draft'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
