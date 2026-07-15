import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { EASE_OUT_EXPO } from '../layout/motion'
import type { InvoiceStatus } from '../../types'

const STEPS = [
  { key: 'DRAFT', label: 'Draft' },
  { key: 'SENT', label: 'Awaiting Payment' },
  { key: 'PAID', label: 'Paid' },
] as const

function currentIndex(status: InvoiceStatus): number {
  if (status === 'PAID') return 2
  if (status === 'DRAFT') return 0
  return 1 // SENT or OVERDUE both sit at "Awaiting Payment"
}

/**
 * Xero-style progress stepper: Draft → Awaiting Payment → Paid, with the
 * connector filling up to the current step. If the invoice is overdue, the
 * active step reads red instead of teal.
 */
export function StatusTimeline({ status }: { status: InvoiceStatus }) {
  const idx = currentIndex(status)
  const overdue = status === 'OVERDUE'
  const activeColor = overdue ? 'bg-red-500' : 'bg-teal-600'
  const activeText = overdue ? 'text-red-600 dark:text-red-400' : 'text-teal-700 dark:text-teal-300'

  return (
    <div className="flex items-center">
      {STEPS.map((step, i) => {
        const done = i < idx
        const active = i === idx
        const label = overdue && i === 1 ? 'Overdue' : step.label
        return (
          <div key={step.key} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center">
              <motion.div
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.08, type: 'spring', stiffness: 500, damping: 24 }}
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                  done
                    ? 'bg-teal-600 text-white'
                    : active
                      ? `${activeColor} text-white ring-4 ${overdue ? 'ring-red-100 dark:ring-red-900/40' : 'ring-teal-100 dark:ring-teal-900/40'}`
                      : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500'
                }`}
              >
                {done || (active && status === 'PAID') ? <Check size={15} strokeWidth={3} /> : i + 1}
              </motion.div>
              <span
                className={`mt-2 whitespace-nowrap text-xs font-medium ${
                  active ? activeText : done ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500'
                }`}
              >
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className="mx-2 mb-5 h-0.5 flex-1 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                <motion.div
                  className="h-full bg-teal-600"
                  initial={{ width: 0 }}
                  animate={{ width: i < idx ? '100%' : '0%' }}
                  transition={{ duration: 0.5, ease: EASE_OUT_EXPO, delay: 0.2 + i * 0.1 }}
                />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
