import type { ReactNode, TableHTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { Badge } from './Badge'
import type { InvoiceStatus } from '../../types'
import { STATUS_LABELS, STATUS_TONES } from '../../utils/status'

/**
 * Status badge with a subtle spring pop when the status changes (keyed by
 * status), and a checkmark that pops in when an invoice becomes Paid.
 */
export function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  return (
    <span className="inline-flex">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={status}
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.7, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 520, damping: 26 }}
        >
          <Badge tone={STATUS_TONES[status]}>
            {status === 'PAID' && <Check size={12} className="-ml-0.5 mr-1" strokeWidth={3} />}
            {STATUS_LABELS[status]}
          </Badge>
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

export function TypeBadge({ type }: { type: 'MONEY_IN' | 'MONEY_OUT' }) {
  return type === 'MONEY_IN' ? (
    <Badge tone="green">Money In</Badge>
  ) : (
    <Badge tone="red">Money Out</Badge>
  )
}

export function Table({ children, className = '', ...props }: TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="overflow-x-auto">
      <table className={`w-full text-sm ${className}`} {...props}>
        {children}
      </table>
    </div>
  )
}

export function TH({ children, className = '', ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={`whitespace-nowrap border-b border-gray-200 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:border-gray-800 dark:text-gray-400 ${className}`}
      {...props}
    >
      {children}
    </th>
  )
}

export function TD({ children, className = '', ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={`whitespace-nowrap px-4 py-3 text-gray-700 border-b border-gray-100 dark:text-gray-300 dark:border-gray-800 ${className}`}
      {...props}
    >
      {children}
    </td>
  )
}

export function EmptyRow({ colSpan, children }: { colSpan: number; children: ReactNode }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-10 text-center text-sm text-gray-400 dark:text-gray-500">
        {children}
      </td>
    </tr>
  )
}
