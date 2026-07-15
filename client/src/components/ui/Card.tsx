import type { HTMLAttributes, ReactNode } from 'react'

interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  children: ReactNode
  title?: ReactNode
  action?: ReactNode
  padded?: boolean
}

export function Card({
  children,
  title,
  action,
  padded = true,
  className = '',
  ...props
}: CardProps) {
  return (
    <div
      className={`rounded-xl bg-white shadow-sm ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-white/10 ${className}`}
      {...props}
    >
      {(title || action) && (
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-gray-800">
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
          {action}
        </div>
      )}
      <div className={padded ? 'p-5' : ''}>{children}</div>
    </div>
  )
}
