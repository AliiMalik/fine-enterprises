import { motion } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'
import { Card } from '../ui/Card'
import { AnimatedNumber } from '../ui/AnimatedNumber'
import { formatCurrency } from '../../utils/format'
import { EASE_OUT_EXPO } from '../layout/motion'
import type { DashboardData } from '../../api/useDashboard'

const SEGMENTS = [
  { key: 'draft', label: 'Draft', bar: 'bg-gray-300 dark:bg-gray-600', dot: 'bg-gray-400' },
  { key: 'awaiting', label: 'Awaiting Payment', bar: 'bg-teal-500', dot: 'bg-teal-500' },
  { key: 'overdue', label: 'Overdue', bar: 'bg-red-500', dot: 'bg-red-500' },
] as const

/**
 * Xero-style "Invoices owed to you" — a segmented bar of unpaid invoices by
 * state (Draft / Awaiting Payment / Overdue) with an animated total and legend.
 */
export function OwedToYou({ owed }: { owed: DashboardData['owed'] }) {
  const denom = owed.total > 0 ? owed.total : 1

  return (
    <Card title="Invoices owed to you">
      {owed.total <= 0 ? (
        <div className="flex items-center gap-3 py-2 text-sm text-gray-500 dark:text-gray-400">
          <CheckCircle2 size={20} className="text-teal-600 dark:text-teal-400" />
          You&apos;re all paid up — no outstanding invoices.
        </div>
      ) : (
        <>
          <div className="mb-4">
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              <AnimatedNumber value={owed.total} format={formatCurrency} />
            </div>
            <div className="text-xs text-gray-400">Total unpaid</div>
          </div>

          <div className="flex h-3 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
            {SEGMENTS.map((s) => {
              const amt = owed[s.key].amount
              if (amt <= 0) return null
              return (
                <motion.div
                  key={s.key}
                  className={s.bar}
                  initial={{ width: 0 }}
                  animate={{ width: `${(amt / denom) * 100}%` }}
                  transition={{ duration: 0.8, ease: EASE_OUT_EXPO }}
                />
              )
            })}
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3">
            {SEGMENTS.map((s) => (
              <div key={s.key}>
                <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">
                  <span className={`h-2 w-2 rounded-full ${s.dot}`} />
                  {s.label}
                </div>
                <div className="mt-1 text-sm font-bold text-gray-900 dark:text-white">
                  {formatCurrency(owed[s.key].amount)}
                </div>
                <div className="text-[11px] text-gray-400">
                  {owed[s.key].count} invoice{owed[s.key].count === 1 ? '' : 's'}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </Card>
  )
}
