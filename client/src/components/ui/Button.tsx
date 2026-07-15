import { motion, type HTMLMotionProps } from 'framer-motion'
import type { ReactNode } from 'react'
import { EASE_OUT_EXPO } from '../layout/motion'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md'

interface ButtonProps extends HTMLMotionProps<'button'> {
  variant?: Variant
  size?: Size
  children: ReactNode
}

const base =
  'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-teal-700/40 disabled:opacity-50 disabled:cursor-not-allowed dark:focus:ring-teal-400/40'

const variants: Record<Variant, string> = {
  primary: 'bg-teal-700 text-white hover:bg-teal-800 px-4 py-2',
  secondary:
    'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 px-4 py-2 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700',
  ghost: 'text-teal-700 hover:bg-teal-50 px-3 py-2 dark:text-teal-300 dark:hover:bg-teal-900/30',
  danger:
    'border border-red-300 text-red-700 bg-white hover:bg-red-50 px-4 py-2 dark:border-red-800 dark:bg-gray-800 dark:text-red-400 dark:hover:bg-red-950/40',
}

const sizes: Record<Size, string> = {
  sm: 'text-sm',
  md: 'text-sm',
}

/**
 * Button
 * Thin motion layer over a native <button>: a subtle press-down (scale 0.97)
 * and 1px lift on hover, using the app's shared easing curve. All native
 * button props/attributes (onClick, disabled, type, aria-*) still work.
 */
export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      whileHover={{ y: -1 }}
      transition={{ duration: 0.15, ease: EASE_OUT_EXPO }}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  )
}
