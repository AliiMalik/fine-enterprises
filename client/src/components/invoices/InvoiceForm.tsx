import { useMemo, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Plus } from 'lucide-react'
import { Field, Input, Select } from '../ui/Input'
import { Button } from '../ui/Button'
import { ErrorNote } from '../ui/ErrorNote'
import { LineItemRow, type LineItemDraft } from './LineItemRow'
import { useInvoices, useCreateInvoice } from '../../api/useInvoices'
import { useProducts } from '../../api/useProducts'
import { useCustomers } from '../../api/useCustomers'
import { calculateTotals, toInputDate } from '../../utils/format'
import type { InvoiceStatus } from '../../types'

function todayPlus(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return toInputDate(d)
}

const uid = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `li_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

const emptyLine = (): LineItemDraft => ({
  id: uid(),
  productId: null,
  sku: '',
  description: '',
  quantity: 1,
  unitPrice: 0,
})

export function InvoiceForm({ onSaved }: { onSaved: (id: string) => void }) {
  const { data: invoices } = useInvoices()
  const { data: products } = useProducts()
  const { data: customers } = useCustomers()
  const createInvoice = useCreateInvoice()

  const [customerId, setCustomerId] = useState<string | null>(null)
  const [crn, setCrn] = useState('')
  const [issueDate, setIssueDate] = useState(toInputDate(new Date()))
  const [dueDate, setDueDate] = useState(todayPlus(30))
  const [taxRate, setTaxRate] = useState(20)
  const [customer, setCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    postcode: '',
    country: 'United Kingdom',
  })
  const [lines, setLines] = useState<LineItemDraft[]>([emptyLine()])
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState<InvoiceStatus | null>(null)

  const nextNumber = useMemo(() => {
    const count = invoices?.length ?? 0
    return `INV-${String(count + 1).padStart(4, '0')}`
  }, [invoices])

  const totals = calculateTotals(lines, taxRate)

  function updateLine(index: number, patch: Partial<LineItemDraft>) {
    setLines((prev) => prev.map((l, i) => (i === index ? { ...l, ...patch } : l)))
  }

  function addLine() {
    setLines((prev) => [...prev, emptyLine()])
  }

  function removeLine(index: number) {
    setLines((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev))
  }

  const selectedCustomer = customerId ? customers?.find((c) => c.id === customerId) : null

  async function handleSubmit(status: InvoiceStatus) {
    setError(null)

    if (!crn.trim()) return setError('CRN is required.')
    if (!customerId && !customer.name.trim())
      return setError('Select an existing customer or enter a new one.')
    const validLines = lines.filter(
      (l) => l.sku.trim() && l.description.trim() && l.quantity > 0 && l.unitPrice >= 0,
    )
    if (validLines.length === 0)
      return setError('Add at least one valid line item (product/SKU, description, quantity and price).')

    setSubmitting(status)
    try {
      const created = await createInvoice.mutateAsync({
        crn,
        issueDate,
        dueDate: dueDate || null,
        taxRate,
        status,
        customerId: customerId ?? undefined,
        customer: customerId ? undefined : customer,
        lineItems: validLines,
      })
      onSaved(created.id)
    } catch (e: any) {
      setError(e?.response?.data?.error ?? 'Failed to save invoice.')
      setSubmitting(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-5">
            <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-white/10">
              <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-gray-100">Invoice details</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="CRN">
                <Input value={crn} onChange={(e) => setCrn(e.target.value)} placeholder="Customer reference" />
              </Field>
              <Field label="Invoice No." hint="Auto-generated">
                <Input value={nextNumber} readOnly className="bg-gray-50 text-gray-500 dark:bg-gray-800 dark:text-gray-400" />
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
              <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-gray-100">Customer</h3>
            <Field label="Bill to">
              <Select
                value={customerId ?? 'new'}
                onChange={(e) => setCustomerId(e.target.value === 'new' ? null : e.target.value)}
              >
                <option value="new">+ New customer</option>
                {customers?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </Field>

            {selectedCustomer ? (
              <div className="mt-3 rounded-lg bg-gray-50 p-3 text-sm dark:bg-gray-800">
                <div className="font-semibold text-gray-900 dark:text-gray-100">{selectedCustomer.name}</div>
                <div className="text-gray-500 dark:text-gray-400">
                  {[selectedCustomer.email, selectedCustomer.city, selectedCustomer.country].filter(Boolean).join(' · ') || 'No contact details on file'}
                </div>
              </div>
            ) : (
            <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Name" className="sm:col-span-2">
                <Input
                  value={customer.name}
                  onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                  placeholder="Customer name"
                />
              </Field>
              <Field label="Email">
                <Input
                  type="email"
                  value={customer.email}
                  onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                />
              </Field>
              <Field label="Phone">
                <Input
                  value={customer.phone}
                  onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                />
              </Field>
              <Field label="Address Line 1" className="sm:col-span-2">
                <Input
                  value={customer.addressLine1}
                  onChange={(e) => setCustomer({ ...customer, addressLine1: e.target.value })}
                />
              </Field>
              <Field label="Address Line 2" className="sm:col-span-2">
                <Input
                  value={customer.addressLine2}
                  onChange={(e) => setCustomer({ ...customer, addressLine2: e.target.value })}
                />
              </Field>
              <Field label="City">
                <Input
                  value={customer.city}
                  onChange={(e) => setCustomer({ ...customer, city: e.target.value })}
                />
              </Field>
              <Field label="Postcode">
                <Input
                  value={customer.postcode}
                  onChange={(e) => setCustomer({ ...customer, postcode: e.target.value })}
                />
              </Field>
              <Field label="Country" className="sm:col-span-2">
                <Input
                  value={customer.country}
                  onChange={(e) => setCustomer({ ...customer, country: e.target.value })}
                />
              </Field>
            </div>
            )}
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
                    <th className="px-2 py-2">Item</th>
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
                      <LineItemRow
                        key={line.id}
                        index={i}
                        item={line}
                        products={products ?? []}
                        onChange={(patch) => updateLine(i, patch)}
                        onRemove={() => removeLine(i)}
                        canRemove={lines.length > 1}
                      />
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
            <Field label="Tax rate (%)">
              <Input
                type="number"
                min={0}
                step="0.1"
                value={taxRate}
                onChange={(e) => setTaxRate(Number(e.target.value))}
              />
            </Field>

            <dl className="mt-4 space-y-2 text-sm">
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
              <Button
                className="w-full"
                type="button"
                disabled={submitting !== null}
                onClick={() => handleSubmit('SENT')}
              >
                {submitting === 'SENT' ? 'Saving…' : 'Save as Sent'}
              </Button>
              <Button
                className="w-full"
                variant="secondary"
                type="button"
                disabled={submitting !== null}
                onClick={() => handleSubmit('DRAFT')}
              >
                {submitting === 'DRAFT' ? 'Saving…' : 'Save as Draft'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
