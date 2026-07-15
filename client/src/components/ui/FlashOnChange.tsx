import { useEffect, useRef, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

/**
 * Wraps a value display and flashes a soft green (up) / red (down) glow when
 * the numeric `value` changes — used to draw the eye to live balance updates.
 */
export function FlashOnChange({
  value,
  children,
  className = '',
}: {
  value: number
  children: ReactNode
  className?: string
}) {
  const prev = useRef(value)
  const [flash, setFlash] = useState<'up' | 'down' | null>(null)

  useEffect(() => {
    const p = prev.current
    if (value > p) setFlash('up')
    else if (value < p) setFlash('down')
    prev.current = value
  }, [value])

  useEffect(() => {
    if (!flash) return
    const t = window.setTimeout(() => setFlash(null), 900)
    return () => window.clearTimeout(t)
  }, [flash])

  return (
    <span className={`relative inline-block ${className}`}>
      {children}
      <AnimatePresence>
        {flash && (
          <motion.span
            key={`${flash}-${value}`}
            aria-hidden
            initial={{ opacity: 0.55, scale: 0.92 }}
            animate={{ opacity: 0, scale: 1.18 }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
            className={`pointer-events-none absolute -inset-2 rounded-lg ${
              flash === 'up' ? 'bg-green-400/25' : 'bg-red-400/25'
            }`}
          />
        )}
      </AnimatePresence>
    </span>
  )
}
