import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Eye, ReceiptText } from 'lucide-react'
import { useBills } from '../../api/useBills'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Table, TH, TD, InvoiceStatusBadge } from '../../components/ui/Table'
import { Badge } from '../../components/ui/Badge'
import { SkeletonRows } from '../../components/ui/Skeleton'
import { EmptyState } from '../../components/ui/EmptyState'
import { PageWrapper } from '../../components/layout/PageWrapper'
import { listContainer, listRow } from '../../components/layout/motion'
import { formatCurrency, formatDate } from '../../utils/format'
import { isOverdue } from '../../utils/status'

export default function BillList() {
  const navigate = useNavigate()
  const { data: bills, isLoading } = useBills()

  return (
    <PageWrapper className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Bills</h1>
          <p className="text-sm text-gray-400">Expenses and money you owe suppliers.</p>
        </div>
        <Button onClick={() => navigate('/bills/new')}>
          <Plus size={16} /> New Bill
        </Button>
      </div>

      <Card padded={false}>
        <Table>
          <thead>
            <tr>
              <TH>Bill No.</TH>
              <TH>Supplier</TH>
              <TH>Issue Date</TH>
              <TH>Due Date</TH>
              <TH>Status</TH>
              <TH className="text-right">Total</TH>
              <TH className="text-right">Actions</TH>
            </tr>
          </thead>
          <motion.tbody variants={listContainer()} initial="initial" animate="animate">
            {isLoading ? (
              <SkeletonRows rows={5} cols={7} />
            ) : !bills || bills.length === 0 ? (
              <tr>
                <td colSpan={7}>
                  <EmptyState
                    icon={ReceiptText}
                    title="No bills yet"
                    message="Record a supplier bill to track what you owe — paying it flows straight into Accounts."
                    action={
                      <Button size="sm" onClick={() => navigate('/bills/new')}>
                        <Plus size={14} /> New Bill
                      </Button>
                    }
                  />
                </td>
              </tr>
            ) : (
              bills.map((b) => {
                const overdue = isOverdue(b)
                return (
                  <motion.tr
                    key={b.id}
                    variants={listRow()}
                    className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 ${overdue ? 'bg-red-50/40 dark:bg-red-950/10' : ''}`}
                  >
                    <TD className="font-medium text-teal-700">{b.billNumber}</TD>
                    <TD>{b.supplierName}</TD>
                    <TD>{formatDate(b.issueDate)}</TD>
                    <TD className={overdue ? 'font-medium text-red-600 dark:text-red-400' : ''}>{formatDate(b.dueDate)}</TD>
                    <TD>
                      {overdue && b.status !== 'OVERDUE' ? (
                        <Badge tone="red">Overdue</Badge>
                      ) : (
                        <InvoiceStatusBadge status={b.status} />
                      )}
                    </TD>
                    <TD className="text-right font-medium tabular-nums">{formatCurrency(b.grandTotal)}</TD>
                    <TD className="text-right">
                      <Link to={`/bills/${b.id}`}>
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
