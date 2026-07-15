import { TD } from './Table'

/** A single shimmering placeholder block. Size it via className (h-*, w-*). */
export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-shimmer rounded bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 ${className}`}
    />
  )
}

/** Placeholder rows for a table body while data loads. */
export function SkeletonRows({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, r) => (
        <tr key={r}>
          {Array.from({ length: cols }).map((_, c) => (
            <TD key={c}>
              <Skeleton className={`h-4 ${c === 0 ? 'w-24' : c === cols - 1 ? 'ml-auto w-16' : 'w-32'}`} />
            </TD>
          ))}
        </tr>
      ))}
    </>
  )
}

/** A skeleton summary card matching the dashboard/ledger card shape. */
export function SkeletonCard() {
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-white/10">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-3">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="h-9 w-9 rounded-lg" />
      </div>
    </div>
  )
}
