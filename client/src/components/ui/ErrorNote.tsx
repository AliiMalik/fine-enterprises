import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { AlertCircle } from 'lucide-react'
import { errorBox } from '../layout/motion'

/**
 * ErrorNote
 * Animated inline error banner. Fades + slightly scales in/out so validation
 * feedback feels responsive rather than snapping. Respects reduce-motion.
 */
export function ErrorNote({ message }: { message: string | null }) {
  const reduceMotion = useReducedMotion()

  return (
    <AnimatePresence initial={false}>
      {message && (
        <motion.p
          role="alert"
          variants={errorBox}
          initial={reduceMotion ? false : 'initial'}
          animate="animate"
          exit="exit"
          className="flex items-start gap-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300"
        >
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{message}</span>
        </motion.p>
      )}
    </AnimatePresence>
  )
}
