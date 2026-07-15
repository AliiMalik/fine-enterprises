import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useBill, useUpdateBillStatus } from '../../api/useBills'
import { InvoiceStatusBadge } from '../../components/ui/Table'
import { Card } from '../../components/ui/Card'
import { Table, TH, TD } from '../../components/ui/Table'
import { Skeleton } from '../../components/ui/Skeleton'
import { AnimatedNumber } from '../../components/ui/AnimatedNumber'
import { SuccessBurst } from '../../components/ui/SuccessBurst'
import { StatusTimeline } from '../../components/invoices/StatusTimeline'
import { PageWrapper } from '../../components/layout/PageWrapper'
import { toast } from '../../components/ui/Toast'
import { formatCurrency, formatDate } from '../../utils/format'
import { markLabel, statusLabel } from '../../utils/status'
import type { InvoiceStatus } from '../../types'

const STATUS_OPTIONS: InvoiceStatus[] = ['DRAFT', 'SENT', 'PAID', 'OVERDUE']

export default function BillDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: bill, isLoading } = useBill(id)
  const updateStatus = useUpdateBillStatus()
  const [burst, setBurst] = useState(0)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-8 w-48" />
        <Card>
          <Skeleton className="h-10 w-full" />
        </Card>
      </div>
    )
  }

  if (!bill) {
    return (
      <div className="py-20 text-center text-gray-400">
        Bill not found.{' '}
        <Link to="/bills" className="text-teal-700 underline dark:text-teal-300">
          Back to bills
        </Link>
      </div>
    )
  }

  function handleStatusChange(next: InvoiceStatus) {
    if (!bill) return
    const wasPaid = bill.status === 'PAID'
    updateStatus.mutate(
      { id: bill.id, status: next },
      {
        onSuccess: (updated) => {
          if (next === 'PAID' && !wasPaid) {
            setBurst((b) => b + 1)
            toast.success('Payment recorded in Accounts', `${formatCurrency(updated.grandTotal)} paid to ${updated.supplierName}`)
          } else if (next !== bill.status) {
            toast.success(`Status set to ${statusLabel(next)}`)
          }
        },
      },
    )
  }

  return (
    <PageWrapper className="space-y-6">
      <button
        onClick={() => navigate('/bills')}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
      >
        <ArrowLeft size={16} /> Back to bills
      </button>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="relative flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{bill.billNumber}</h1>
            <InvoiceStatusBadge status={bill.status} />
            {burst > 0 && <SuccessBurst key={burst} />}
          </div>
          <p className="text-sm text-gray-400">
            {bill.supplierName} · Issued {formatDate(bill.issueDate)} · Due {formatDate(bill.dueDate)}
            {bill.category ? ` · ${bill.category}` : ''}
          </p>
        </div>
        <select
          value={bill.status}
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
      </div>

      <Card>
        <StatusTimeline status={bill.status} />
      </Card>

      <Card title="Bill">
        <Table>
          <thead>
            <tr>
              <TH>Description</TH>
              <TH className="text-right">Qty</TH>
              <TH className="text-right">Unit Price</TH>
              <TH className="text-right">Line Total</TH>
            </tr>
          </thead>
          <tbody>
            {bill.items.map((li) => (
              <tr key={li.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
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
                <AnimatedNumber value={Number(bill.subtotal)} format={formatCurrency} />
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500 dark:text-gray-400">Tax</dt>
              <dd className="font-medium">
                <AnimatedNumber value={Number(bill.tax)} format={formatCurrency} />
              </dd>
            </div>
            <div className="flex justify-between border-t border-gray-100 pt-2 text-base font-bold text-gray-900 dark:border-gray-800 dark:text-white">
              <dt>Grand Total</dt>
              <dd>
                <AnimatedNumber value={Number(bill.grandTotal)} format={formatCurrency} />
              </dd>
            </div>
          </dl>
        </div>
      </Card>
    </PageWrapper>
  )
}
