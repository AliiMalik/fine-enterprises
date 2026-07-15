import { Link } from 'react-router-dom'
import {
  FileText,
  Boxes,
  ArrowRight,
  TrendingUp,
  TrendingDown,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useDashboard } from '../api/useDashboard'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Table, TH, TD, EmptyRow, InvoiceStatusBadge, TypeBadge } from '../components/ui/Table'
import { AnimatedNumber } from '../components/ui/AnimatedNumber'
import { Skeleton, SkeletonCard, SkeletonRows } from '../components/ui/Skeleton'
import { OwedToYou } from '../components/dashboard/OwedToYou'
import { CashflowChart } from '../components/accounts/CashflowChart'
import { PageWrapper } from '../components/layout/PageWrapper'
import { fadeUpContainer, fadeUpItem } from '../components/layout/motion'
import { formatCurrency, formatDate, formatNumber } from '../utils/format'

function SummaryCard({
  label,
  value,
  format,
  icon: Icon,
  tone,
  sub,
}: {
  label: string
  value: number
  format: (n: number) => string
  icon: typeof FileText
  tone: string
  sub?: string
}) {
  return (
    <motion.div variants={fadeUpItem()}>
      <Card>
        <div className="flex items-start justify-between">
          <div>
            <div className="text-sm font-medium text-gray-600 dark:text-gray-300">{label}</div>
            <div className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
              <AnimatedNumber value={value} format={format} />
            </div>
            {sub && <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">{sub}</div>}
          </div>
          <div className={`rounded-lg p-2 ${tone}`}>
            <Icon size={20} />
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

export default function Dashboard() {
  const { data, isLoading } = useDashboard()

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <Card>
          <Skeleton className="h-56 w-full" />
        </Card>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <Card title="Recent Invoices">
            <Table>
              <tbody>
                <SkeletonRows rows={4} cols={4} />
              </tbody>
            </Table>
          </Card>
          <Card title="Recent Transactions">
            <Table>
              <tbody>
                <SkeletonRows rows={4} cols={4} />
              </tbody>
            </Table>
          </Card>
        </div>
      </div>
    )
  }

  const balancePositive = data.balance >= 0

  return (
    <PageWrapper className="space-y-6">
      <motion.div variants={fadeUpItem(8, 0.32)} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-sm text-gray-400 dark:text-gray-500">Welcome back. Here's your business at a glance.</p>
        </div>
        <Link to="/invoices/new">
          <Button>New Invoice</Button>
        </Link>
      </motion.div>

      <motion.div variants={fadeUpContainer(0.05, 0.07)} className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <SummaryCard
          label="Total Outstanding"
          value={data.outstanding}
          format={formatCurrency}
          icon={FileText}
          tone="bg-amber-50 text-amber-600"
          sub="Unpaid invoices"
        />
        <SummaryCard
          label="Total Stock"
          value={data.totalStock}
          format={(n) => `${formatNumber(n)} cartons`}
          icon={Boxes}
          tone="bg-teal-50 text-teal-700"
          sub={`${data.counts.products} products`}
        />
        <SummaryCard
          label="Current Balance"
          value={data.balance}
          format={formatCurrency}
          icon={balancePositive ? TrendingUp : TrendingDown}
          tone={balancePositive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}
          sub="Money in − money out"
        />
      </motion.div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <motion.div variants={fadeUpItem()}>
          <OwedToYou owed={data.owed} />
        </motion.div>
        <motion.div variants={fadeUpItem()}>
          <Card title="Bills to pay">
            <div className="mb-1 text-3xl font-bold text-gray-900 dark:text-white">
              <AnimatedNumber value={data.billsToPay.amount} format={formatCurrency} />
            </div>
            <div className="text-xs text-gray-400">
              {data.billsToPay.count} unpaid bill{data.billsToPay.count === 1 ? '' : 's'}
              {data.billsToPay.overdue > 0 && (
                <span className="ml-1 font-semibold text-red-500">· {data.billsToPay.overdue} overdue</span>
              )}
            </div>
            <div className="mt-4 flex h-3 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
              <div className="h-full bg-amber-500" style={{ width: data.billsToPay.count ? '100%' : '0%' }} />
            </div>
            <Link
              to="/bills"
              className="mt-4 inline-flex text-sm font-medium text-teal-700 hover:underline dark:text-teal-300"
            >
              View bills →
            </Link>
          </Card>
        </motion.div>
      </div>

      <motion.div variants={fadeUpItem()}>
        <Card title="Cashflow — last 6 months">
          <CashflowChart data={data.cashflow} />
        </Card>
      </motion.div>

      <motion.div variants={fadeUpContainer(0, 0.07)} className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <motion.div variants={fadeUpItem()}>
          <Card
            title="Recent Invoices"
            action={
              <Link to="/invoices" className="text-sm font-medium text-teal-700 hover:underline dark:text-teal-300">
                View all
              </Link>
            }
          >
            <Table>
              <thead>
                <tr>
                  <TH>Invoice</TH>
                  <TH>Customer</TH>
                  <TH>Status</TH>
                  <TH className="text-right">Total</TH>
                </tr>
              </thead>
              <tbody>
                {data.recentInvoices.length === 0 && (
                  <EmptyRow colSpan={4}>No invoices yet</EmptyRow>
                )}
                {data.recentInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <TD>
                      <Link to={`/invoices/${inv.id}`} className="font-medium text-teal-700 hover:underline">
                        {inv.invoiceNumber}
                      </Link>
                    </TD>
                    <TD>{inv.customer.name}</TD>
                    <TD>
                      <InvoiceStatusBadge status={inv.status} />
                    </TD>
                    <TD className="text-right font-medium">{formatCurrency(inv.grandTotal)}</TD>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>
        </motion.div>

        <motion.div variants={fadeUpItem()}>
          <Card
            title="Recent Transactions"
            action={
              <Link to="/accounts" className="text-sm font-medium text-teal-700 hover:underline dark:text-teal-300">
                View all
              </Link>
            }
          >
            <Table>
              <thead>
                <tr>
                  <TH>Date</TH>
                  <TH>Description</TH>
                  <TH>Type</TH>
                  <TH className="text-right">Amount</TH>
                </tr>
              </thead>
              <tbody>
                {data.recentTransactions.length === 0 && (
                  <EmptyRow colSpan={4}>No transactions yet</EmptyRow>
                )}
                {data.recentTransactions.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <TD>{formatDate(t.date)}</TD>
                    <TD className="max-w-[12rem] truncate">{t.description}</TD>
                    <TD>
                      <TypeBadge type={t.type} />
                    </TD>
                    <TD
                      className={`text-right font-medium ${
                        t.type === 'MONEY_IN' ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'
                      }`}
                    >
                      {t.type === 'MONEY_IN' ? '+' : '−'}
                      {formatCurrency(t.amount)}
                    </TD>
                  </tr>
                ))}
              </tbody>
            </Table>
            <div className="mt-4">
              <Link to="/accounts">
                <Button variant="secondary" size="sm">
                  Add Transaction <ArrowRight size={14} />
                </Button>
              </Link>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </PageWrapper>
  )
}
