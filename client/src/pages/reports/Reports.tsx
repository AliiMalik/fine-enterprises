import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Scale, BookOpen, Landmark, PieChart, Lock } from 'lucide-react'
import { useReports } from '../../api/useReports'
import { Card } from '../../components/ui/Card'
import { AnimatedNumber } from '../../components/ui/AnimatedNumber'
import { PageWrapper } from '../../components/layout/PageWrapper'
import { fadeUpContainer, fadeUpItem, EASE_OUT_EXPO } from '../../components/layout/motion'
import { formatCurrency } from '../../utils/format'

const COMING_SOON = [
  { label: 'Balance Sheet', icon: Scale },
  { label: 'Trial Balance', icon: BookOpen },
  { label: 'Bank Reconciliation', icon: Landmark },
  { label: 'Chart of Accounts', icon: PieChart },
]

function Bar({ pct, tone = 'bg-teal-500' }: { pct: number; tone?: string }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
      <motion.div
        className={`h-full ${tone}`}
        initial={{ width: 0 }}
        animate={{ width: `${Math.max(2, pct)}%` }}
        transition={{ duration: 0.7, ease: EASE_OUT_EXPO }}
      />
    </div>
  )
}

export default function Reports() {
  const { pl, aging, agingTotal, salesByCustomer } = useReports()

  const maxExpense = Math.max(1, ...pl.expenseByCategory.map((c) => c.amount))
  const maxSales = Math.max(1, ...salesByCustomer.map((c) => c.amount))
  const netPositive = pl.net >= 0

  return (
    <PageWrapper className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports</h1>
        <p className="text-sm text-gray-400">Profit &amp; loss, receivables and sales — from your live data.</p>
      </div>

      {/* Profit & Loss */}
      <motion.div variants={fadeUpContainer(0.05, 0.07)} initial="initial" animate="animate" className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <motion.div variants={fadeUpItem()}>
          <Card>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-50 p-2 text-green-700 dark:bg-green-900/30 dark:text-green-400"><TrendingUp size={20} /></div>
              <div>
                <div className="text-sm font-medium text-gray-600 dark:text-gray-300">Income</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white"><AnimatedNumber value={pl.income} format={formatCurrency} /></div>
              </div>
            </div>
          </Card>
        </motion.div>
        <motion.div variants={fadeUpItem()}>
          <Card>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-amber-50 p-2 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"><TrendingDown size={20} /></div>
              <div>
                <div className="text-sm font-medium text-gray-600 dark:text-gray-300">Expenses</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white"><AnimatedNumber value={pl.expenses} format={formatCurrency} /></div>
              </div>
            </div>
          </Card>
        </motion.div>
        <motion.div variants={fadeUpItem()}>
          <Card>
            <div className="flex items-center gap-3">
              <div className={`rounded-lg p-2 ${netPositive ? 'bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300' : 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400'}`}><Scale size={20} /></div>
              <div>
                <div className="text-sm font-medium text-gray-600 dark:text-gray-300">Net profit</div>
                <div className={`text-2xl font-bold ${netPositive ? 'text-gray-900 dark:text-white' : 'text-red-700 dark:text-red-400'}`}><AnimatedNumber value={pl.net} format={formatCurrency} /></div>
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Expense breakdown */}
        <Card title="Expenses by category">
          <div className="space-y-3">
            {pl.expenseByCategory.length === 0 && <div className="text-sm text-gray-400">No expenses recorded.</div>}
            {pl.expenseByCategory.map((c) => (
              <div key={c.category}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-300">{c.category}</span>
                  <span className="font-medium tabular-nums text-gray-900 dark:text-gray-100">{formatCurrency(c.amount)}</span>
                </div>
                <Bar pct={(c.amount / maxExpense) * 100} tone="bg-amber-500" />
              </div>
            ))}
          </div>
        </Card>

        {/* AR aging */}
        <Card title="Aged receivables (owed to you)">
          <div className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
            <AnimatedNumber value={agingTotal} format={formatCurrency} />
          </div>
          <div className="space-y-3">
            {aging.map((b) => (
              <div key={b.key}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-300">
                    {b.label} <span className="text-gray-400">· {b.count}</span>
                  </span>
                  <span className="font-medium tabular-nums text-gray-900 dark:text-gray-100">{formatCurrency(b.amount)}</span>
                </div>
                <Bar pct={agingTotal > 0 ? (b.amount / agingTotal) * 100 : 0} tone={b.key === '60+' ? 'bg-red-500' : b.key === 'current' ? 'bg-teal-500' : 'bg-amber-500'} />
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Sales by customer */}
      <Card title="Sales by customer">
        <div className="space-y-3">
          {salesByCustomer.length === 0 && <div className="text-sm text-gray-400">No sales yet.</div>}
          {salesByCustomer.map((c) => (
            <div key={c.name}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-300">
                  {c.name} <span className="text-gray-400">· {c.count} invoice{c.count === 1 ? '' : 's'}</span>
                </span>
                <span className="font-medium tabular-nums text-gray-900 dark:text-gray-100">{formatCurrency(c.amount)}</span>
              </div>
              <Bar pct={(c.amount / maxSales) * 100} />
            </div>
          ))}
        </div>
      </Card>

      {/* Coming soon */}
      <div>
        <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">More reports coming soon</div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {COMING_SOON.map((r) => (
            <div
              key={r.label}
              className="relative flex flex-col items-start gap-3 rounded-xl border border-dashed border-gray-200 bg-white/60 p-4 dark:border-gray-700 dark:bg-gray-900/40"
            >
              <div className="rounded-lg bg-gray-100 p-2 text-gray-400 dark:bg-gray-800 dark:text-gray-500">
                <r.icon size={18} />
              </div>
              <div className="text-sm font-semibold text-gray-500 dark:text-gray-400">{r.label}</div>
              <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-400 dark:bg-gray-800 dark:text-gray-500">
                <Lock size={10} /> Coming soon
              </span>
            </div>
          ))}
        </div>
      </div>
    </PageWrapper>
  )
}
