import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useInvoice, useUpdateInvoiceStatus } from '../../api/useInvoices'
import { InvoiceStatusBadge } from '../../components/ui/Table'
import { Card } from '../../components/ui/Card'
import { Table, TH, TD } from '../../components/ui/Table'
import { Skeleton } from '../../components/ui/Skeleton'
import { AnimatedNumber } from '../../components/ui/AnimatedNumber'
import { SuccessBurst } from '../../components/ui/SuccessBurst'
import { StatusTimeline } from '../../components/invoices/StatusTimeline'
import { InvoicePDFButton } from '../../components/invoices/InvoicePDF'
import { PageWrapper } from '../../components/layout/PageWrapper'
import { toast } from '../../components/ui/Toast'
import { formatCurrency, formatDate } from '../../utils/format'
import { markLabel, statusLabel } from '../../utils/status'
import type { InvoiceStatus } from '../../types'

const STATUS_OPTIONS: InvoiceStatus[] = ['DRAFT', 'SENT', 'PAID', 'OVERDUE']

export default function InvoiceDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: invoice, isLoading } = useInvoice(id)
  const updateStatus = useUpdateInvoiceStatus()
  const [burst, setBurst] = useState(0)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-4 w-32" />
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-9 w-40" />
        </div>
        <Card>
          <Skeleton className="h-10 w-full" />
        </Card>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <Skeleton className="h-40 w-full" />
          </Card>
          <Card>
            <Skeleton className="h-40 w-full" />
          </Card>
        </div>
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="py-20 text-center text-gray-400">
        Invoice not found.{' '}
        <Link to="/invoices" className="text-teal-700 underline dark:text-teal-300">
          Back to invoices
        </Link>
      </div>
    )
  }

  function handleStatusChange(next: InvoiceStatus) {
    if (!invoice) return
    const wasPaid = invoice.status === 'PAID'
    updateStatus.mutate(
      { id: invoice.id, status: next },
      {
        onSuccess: (updated) => {
          if (next === 'PAID' && !wasPaid) {
            setBurst((b) => b + 1)
            toast.success(
              'Payment recorded in Accounts',
              `${formatCurrency(updated.grandTotal)} added as money in`,
            )
          } else if (next !== invoice.status) {
            toast.success(`Status set to ${statusLabel(next)}`)
          }
        },
      },
    )
  }

  return (
    <PageWrapper className="space-y-6">
      <button
        onClick={() => navigate('/invoices')}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
      >
        <ArrowLeft size={16} /> Back to invoices
      </button>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="relative flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{invoice.invoiceNumber}</h1>
            <InvoiceStatusBadge status={invoice.status} />
            {burst > 0 && <SuccessBurst key={burst} />}
          </div>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            CRN {invoice.crn} · Issued {formatDate(invoice.issueDate)} · Due {formatDate(invoice.dueDate)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={invoice.status}
            onChange={(e) => handleStatusChange(e.target.value as InvoiceStatus)}
            disabled={updateStatus.isPending}
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-teal-700 focus:outline-none disabled:opacity-60 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:focus:border-teal-400"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {markLabel(s)}
              </option>
            ))}
          </select>
          <InvoicePDFButton invoice={invoice} />
        </div>
      </div>

      <Card>
        <StatusTimeline status={invoice.status} />
      </Card>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2" title="Invoice">
          <Table>
            <thead>
              <tr>
                <TH>SKU</TH>
                <TH>Description</TH>
                <TH className="text-right">Qty</TH>
                <TH className="text-right">Unit Price</TH>
                <TH className="text-right">Line Total</TH>
              </tr>
            </thead>
            <tbody>
              {invoice.lineItems.map((li) => (
                <tr key={li.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <TD>{li.sku}</TD>
                  <TD>{li.description}</TD>
                  <TD className="text-right">{li.quantity}</TD>
                  <TD className="text-right">{formatCurrency(li.unitPrice)}</TD>
                  <TD className="text-right font-medium">{formatCurrency(li.lineTotal)}</TD>
                </tr>
              ))}
            </tbody>
          </Table>

          <div className="mt-6 flex justify-end">
            <dl className="w-64 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500 dark:text-gray-400">Subtotal</dt>
                <dd className="font-medium">
                  <AnimatedNumber value={Number(invoice.subtotal)} format={formatCurrency} />
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500 dark:text-gray-400">Tax</dt>
                <dd className="font-medium">
                  <AnimatedNumber value={Number(invoice.tax)} format={formatCurrency} />
                </dd>
              </div>
              <div className="flex justify-between border-t border-gray-100 pt-2 text-base font-bold text-gray-900 dark:border-gray-800 dark:text-white">
                <dt>Grand Total</dt>
                <dd>
                  <AnimatedNumber value={Number(invoice.grandTotal)} format={formatCurrency} />
                </dd>
              </div>
            </dl>
          </div>
        </Card>

        <Card title="Bill to">
          <div className="space-y-1 text-sm">
            <div className="text-base font-semibold text-gray-900 dark:text-white">{invoice.customer.name}</div>
            {invoice.customer.addressLine1 && (
              <div className="text-gray-600 dark:text-gray-300">{invoice.customer.addressLine1}</div>
            )}
            {invoice.customer.addressLine2 && (
              <div className="text-gray-600 dark:text-gray-300">{invoice.customer.addressLine2}</div>
            )}
            {(invoice.customer.city || invoice.customer.postcode) && (
              <div className="text-gray-600 dark:text-gray-300">
                {[invoice.customer.city, invoice.customer.postcode].filter(Boolean).join(', ')}
              </div>
            )}
            {invoice.customer.country && (
              <div className="text-gray-600 dark:text-gray-300">{invoice.customer.country}</div>
            )}
            {invoice.customer.email && (
              <div className="text-gray-600 dark:text-gray-300">{invoice.customer.email}</div>
            )}
            {invoice.customer.phone && (
              <div className="text-gray-600 dark:text-gray-300">{invoice.customer.phone}</div>
            )}
          </div>
        </Card>
      </div>
    </PageWrapper>
  )
}
