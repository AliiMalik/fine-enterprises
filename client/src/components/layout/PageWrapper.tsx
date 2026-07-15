import { motion, useReducedMotion, type Variants } from 'framer-motion'
import type { ReactNode } from 'react'
import { EASE_OUT_EXPO } from './motion'

export { EASE_OUT_EXPO }

/**
 * PageWrapper
 * Wrap the root element of each routed page in this component. It applies a
 * subtle fade + slight vertical slide-up on mount and a quick fade-out on exit.
 *
 * Exit animations are driven by the <AnimatePresence> in AnimatedOutlet, which
 * keeps the layout chrome (Sidebar / TopBar) persistent between routes.
 *
 * Respects the user's "reduce motion" OS preference.
 */
export function PageWrapper({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  const reduceMotion = useReducedMotion()

  const variants: Variants = {
    initial: {
      opacity: 0,
      y: reduceMotion ? 0 : 10,
    },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: EASE_OUT_EXPO,
      },
    },
    exit: {
      opacity: 0,
      y: reduceMotion ? 0 : -6,
      transition: {
        duration: 0.18,
        ease: EASE_OUT_EXPO,
      },
    },
  }

  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={className}
    >
      {children}
    </motion.div>
  )
}
