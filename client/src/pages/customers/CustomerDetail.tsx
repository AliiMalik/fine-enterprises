import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Pencil, FileText, Wallet, Clock } from 'lucide-react'
import { useCustomer } from '../../api/useCustomers'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Table, TH, TD, EmptyRow, InvoiceStatusBadge } from '../../components/ui/Table'
import { AnimatedNumber } from '../../components/ui/AnimatedNumber'
import { Skeleton } from '../../components/ui/Skeleton'
import { CustomerForm } from '../../components/customers/CustomerForm'
import { PageWrapper } from '../../components/layout/PageWrapper'
import { formatCurrency, formatDate } from '../../utils/format'

export default function CustomerDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: customer, isLoading } = useCustomer(id)
  const [editing, setEditing] = useState(false)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-8 w-56" />
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="py-20 text-center text-gray-400">
        Customer not found.{' '}
        <Link to="/customers" className="text-teal-700 underline dark:text-teal-300">
          Back to customers
        </Link>
      </div>
    )
  }

  const stats = [
    { label: 'Total billed', value: customer.totalBilled, icon: FileText, tone: 'bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300' },
    { label: 'Outstanding', value: customer.outstanding, icon: Clock, tone: 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' },
  ]

  return (
    <PageWrapper className="space-y-6">
      <button
        onClick={() => navigate('/customers')}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
      >
        <ArrowLeft size={16} /> Back to customers
      </button>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{customer.name}</h1>
          <p className="text-sm text-gray-400">
            {[customer.email, customer.phone].filter(Boolean).join(' · ') || 'No contact details on file'}
          </p>
        </div>
        <Button variant="secondary" onClick={() => setEditing((e) => !e)}>
          <Pencil size={14} /> {editing ? 'Cancel' : 'Edit'}
        </Button>
      </div>

      {editing && (
        <Card title="Edit customer">
          <CustomerForm customer={customer} onSaved={() => setEditing(false)} />
        </Card>
      )}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {stats.map((s) => (
          <Card key={s.label}>
            <div className="flex items-center gap-3">
              <div className={`rounded-lg p-2 ${s.tone}`}>
                <s.icon size={20} />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-600 dark:text-gray-300">{s.label}</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  <AnimatedNumber value={s.value} format={formatCurrency} />
                </div>
              </div>
            </div>
          </Card>
        ))}
        <Card>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-gray-100 p-2 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
              <Wallet size={20} />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-600 dark:text-gray-300">Invoices</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{customer.invoices.length}</div>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2" title="Invoices" padded={false}>
          <Table>
            <thead>
              <tr>
                <TH>Invoice</TH>
                <TH>Issued</TH>
                <TH>Status</TH>
                <TH className="text-right">Total</TH>
              </tr>
            </thead>
            <tbody>
              {customer.invoices.length === 0 ? (
                <EmptyRow colSpan={4}>No invoices for this customer yet.</EmptyRow>
              ) : (
                customer.invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <TD>
                      <Link to={`/invoices/${inv.id}`} className="font-medium text-teal-700 hover:underline">
                        {inv.invoiceNumber}
                      </Link>
                    </TD>
                    <TD>{formatDate(inv.issueDate)}</TD>
                    <TD>
                      <InvoiceStatusBadge status={inv.status} />
                    </TD>
                    <TD className="text-right font-medium tabular-nums">{formatCurrency(inv.grandTotal)}</TD>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Card>

        <Card title="Contact">
          <div className="space-y-1 text-sm">
            {customer.addressLine1 && <div className="text-gray-600 dark:text-gray-300">{customer.addressLine1}</div>}
            {customer.addressLine2 && <div className="text-gray-600 dark:text-gray-300">{customer.addressLine2}</div>}
            {(customer.city || customer.postcode) && (
              <div className="text-gray-600 dark:text-gray-300">{[customer.city, customer.postcode].filter(Boolean).join(', ')}</div>
            )}
            {customer.country && <div className="text-gray-600 dark:text-gray-300">{customer.country}</div>}
            {customer.email && <div className="text-gray-600 dark:text-gray-300">{customer.email}</div>}
            {customer.phone && <div className="text-gray-600 dark:text-gray-300">{customer.phone}</div>}
            {!customer.addressLine1 && !customer.city && !customer.email && !customer.phone && (
              <div className="text-gray-400">No contact details on file.</div>
            )}
          </div>
        </Card>
      </div>
    </PageWrapper>
  )
}
