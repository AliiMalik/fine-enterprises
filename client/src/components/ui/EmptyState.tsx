import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

/** Friendly illustrated-ish empty state for lists (icon + copy + optional CTA). */
export function EmptyState({
  icon: Icon,
  title,
  message,
  action,
}: {
  icon: LucideIcon
  title: string
  message?: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-600 dark:bg-teal-900/40 dark:text-teal-300">
        <Icon size={24} />
      </div>
      <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{title}</div>
      {message && <div className="mt-1 max-w-xs text-sm text-gray-400 dark:text-gray-500">{message}</div>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
