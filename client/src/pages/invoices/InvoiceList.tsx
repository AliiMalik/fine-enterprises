import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Plus, Eye } from 'lucide-react'
import { useInvoices } from '../../api/useInvoices'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Table, TH, TD, EmptyRow, InvoiceStatusBadge } from '../../components/ui/Table'
import { Badge } from '../../components/ui/Badge'
import { SkeletonRows } from '../../components/ui/Skeleton'
import { PageWrapper } from '../../components/layout/PageWrapper'
import { listContainer, listRow } from '../../components/layout/motion'
import { formatCurrency, formatDate } from '../../utils/format'
import { isOverdue } from '../../utils/status'

export default function InvoiceList() {
  const { data: invoices, isLoading } = useInvoices()

  return (
    <PageWrapper className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Invoices</h1>
          <p className="text-sm text-gray-400">Create and track customer invoices.</p>
        </div>
        <Link to="/invoices/new">
          <Button>
            <Plus size={16} /> New Invoice
          </Button>
        </Link>
      </div>

      <Card padded={false}>
          <Table>
              <thead>
                <tr>
                  <TH>Invoice No.</TH>
                  <TH>Customer</TH>
                  <TH>Issue Date</TH>
                  <TH>Due Date</TH>
                  <TH>Status</TH>
                  <TH className="text-right">Grand Total</TH>
                  <TH className="text-right">Actions</TH>
                </tr>
              </thead>
              <motion.tbody variants={listContainer()} initial="initial" animate="animate">
                {isLoading ? (
                  <SkeletonRows rows={5} cols={7} />
                ) : !invoices || invoices.length === 0 ? (
                  <EmptyRow colSpan={7}>No invoices yet. Create your first invoice.</EmptyRow>
                ) : (
                  invoices.map((inv) => {
                    const overdue = isOverdue(inv)
                    return (
                    <motion.tr
                      key={inv.id}
                      variants={listRow()}
                      className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 ${overdue ? 'bg-red-50/40 dark:bg-red-950/10' : ''}`}
                    >
                    <TD className="font-medium text-teal-700">{inv.invoiceNumber}</TD>
                    <TD>{inv.customer.name}</TD>
                    <TD>{formatDate(inv.issueDate)}</TD>
                    <TD className={overdue ? 'font-medium text-red-600 dark:text-red-400' : ''}>{formatDate(inv.dueDate)}</TD>
                    <TD>
                      {overdue && inv.status !== 'OVERDUE' ? (
                        <Badge tone="red">Overdue</Badge>
                      ) : (
                        <InvoiceStatusBadge status={inv.status} />
                      )}
                    </TD>
                    <TD className="text-right font-medium">{formatCurrency(inv.grandTotal)}</TD>
                    <TD className="text-right">
                      <Link to={`/invoices/${inv.id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye size={14} /> View
                        </Button>
                      </Link>
                    </TD>
                  </motion.tr>
                    )
                  })
              )}
            </motion.tbody>
            </Table>
      </Card>
    </PageWrapper>
  )
}
