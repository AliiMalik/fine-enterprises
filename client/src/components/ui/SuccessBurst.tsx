import { motion, useReducedMotion } from 'framer-motion'
import { Check } from 'lucide-react'

/**
 * A subtle, Xero-understated success flourish: a teal ring sweep, a checkmark
 * pop, and a few particles. Render it (keyed) when a payment lands; it plays
 * once on mount and calls `onDone`. Place inside a `relative` container.
 */
export function SuccessBurst({ onDone }: { onDone?: () => void }) {
  const reduce = useReducedMotion()
  const dots = Array.from({ length: 10 })

  return (
    <div className="pointer-events-none absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2">
      {!reduce && (
        <motion.span
          className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-teal-400"
          initial={{ scale: 0.3, opacity: 0.7 }}
          animate={{ scale: 2.4, opacity: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        />
      )}

      <motion.span
        className="relative flex h-10 w-10 items-center justify-center rounded-full bg-teal-600 text-white shadow-lg"
        initial={{ scale: 0 }}
        animate={{ scale: reduce ? 1 : [0, 1.2, 1], opacity: [1, 1, 0] }}
        transition={{ duration: reduce ? 0.4 : 1.1, times: [0, 0.4, 1], ease: 'easeOut' }}
        onAnimationComplete={onDone}
      >
        <Check size={20} strokeWidth={3} />
      </motion.span>

      {!reduce &&
        dots.map((_, i) => {
          const angle = (i / dots.length) * Math.PI * 2
          const dist = 44
          return (
            <motion.span
              key={i}
              className="absolute left-1/2 top-1/2 h-1.5 w-1.5 rounded-full bg-teal-500"
              initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
              animate={{ x: Math.cos(angle) * dist, y: Math.sin(angle) * dist, opacity: 0, scale: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
            />
          )
        })}
    </div>
  )
}
