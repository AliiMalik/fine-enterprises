import type { ReactNode } from 'react'

export type BadgeTone = 'gray' | 'blue' | 'green' | 'red' | 'teal'

const tones: Record<BadgeTone, string> = {
  gray: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300',
  blue: 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300',
  green: 'bg-green-50 text-green-700 dark:bg-green-950/50 dark:text-green-300',
  red: 'bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300',
  teal: 'bg-teal-50 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300',
}

export function Badge({
  children,
  tone = 'gray',
  className = '',
}: {
  children: ReactNode
  tone?: BadgeTone
  className?: string
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  )
}
