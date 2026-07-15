import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Eye, Users } from 'lucide-react'
import { useCustomers } from '../../api/useCustomers'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Table, TH, TD } from '../../components/ui/Table'
import { SkeletonRows } from '../../components/ui/Skeleton'
import { EmptyState } from '../../components/ui/EmptyState'
import { CustomerForm } from '../../components/customers/CustomerForm'
import { PageWrapper } from '../../components/layout/PageWrapper'
import { listContainer, listRow, expand } from '../../components/layout/motion'

export default function CustomerList() {
  const { data: customers, isLoading } = useCustomers()
  const [showForm, setShowForm] = useState(false)

  return (
    <PageWrapper className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Customers</h1>
          <p className="text-sm text-gray-400">The people and businesses you invoice.</p>
        </div>
        <Button onClick={() => setShowForm((s) => !s)}>
          <Plus size={16} /> Add Customer
        </Button>
      </div>

      <AnimatePresence initial={false}>
        {showForm && (
          <motion.div key="customer-form" variants={expand()} initial="initial" animate="animate" exit="exit" style={{ overflow: 'hidden' }}>
            <Card title="Add Customer">
              <CustomerForm onSaved={() => setShowForm(false)} />
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <Card padded={false}>
        <Table>
          <thead>
            <tr>
              <TH>Name</TH>
              <TH>Email</TH>
              <TH>Location</TH>
              <TH className="text-right">Invoices</TH>
              <TH className="text-right">Actions</TH>
            </tr>
          </thead>
          <motion.tbody variants={listContainer()} initial="initial" animate="animate">
            {isLoading ? (
              <SkeletonRows rows={5} cols={5} />
            ) : !customers || customers.length === 0 ? (
              <tr>
                <td colSpan={5}>
                  <EmptyState
                    icon={Users}
                    title="No customers yet"
                    message="Add a customer, or create an invoice — new customers are saved automatically."
                    action={
                      <Button size="sm" onClick={() => setShowForm(true)}>
                        <Plus size={14} /> Add Customer
                      </Button>
                    }
                  />
                </td>
              </tr>
            ) : (
              customers.map((c) => (
                <motion.tr key={c.id} variants={listRow()} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <TD className="font-medium text-teal-700">{c.name}</TD>
                  <TD className="text-gray-500">{c.email || '—'}</TD>
                  <TD className="text-gray-500">{[c.city, c.country].filter(Boolean).join(', ') || '—'}</TD>
                  <TD className="text-right tabular-nums">{c._count?.invoices ?? 0}</TD>
                  <TD className="text-right">
                    <Link to={`/customers/${c.id}`}>
                      <Button variant="ghost" size="sm">
                        <Eye size={14} /> View
                      </Button>
                    </Link>
                  </TD>
                </motion.tr>
              ))
            )}
          </motion.tbody>
        </Table>
      </Card>
    </PageWrapper>
  )
}
