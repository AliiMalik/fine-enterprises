import { Variants } from 'framer-motion'

export const EASE_OUT_EXPO = [0.22, 1, 0.36, 1] as const

export const fadeUpContainer = (delayChildren = 0, staggerChildren = 0.05): Variants => ({
  initial: { opacity: 1 },
  animate: {
    opacity: 1,
    transition: { delayChildren, staggerChildren }
  }
})

export const fadeUpItem = (y = 10, duration = 0.3): Variants => ({
  initial: { opacity: 0, y },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration, ease: EASE_OUT_EXPO }
  }
})

export const listContainer = (staggerChildren = 0.04): Variants => ({
  initial: { opacity: 1 },
  animate: {
    opacity: 1,
    transition: { staggerChildren, delayChildren: 0.04 }
  }
})

export const listRow = (y = 6, duration = 0.28): Variants => ({
  initial: { opacity: 0, y },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration, ease: EASE_OUT_EXPO }
  }
})

export const errorBox: Variants = {
  initial: { opacity: 0, y: -4, scale: 0.98 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.2, ease: EASE_OUT_EXPO }
  },
  exit: {
    opacity: 0,
    y: -4,
    scale: 0.98,
    transition: { duration: 0.15, ease: EASE_OUT_EXPO }
  }
}

export const expand = (duration = 0.3): Variants => ({
  initial: { opacity: 0, height: 0, y: -6 },
  animate: {
    opacity: 1,
    height: 'auto',
    y: 0,
    transition: { duration, ease: EASE_OUT_EXPO }
  },
  exit: {
    opacity: 0,
    height: 0,
    y: -6,
    transition: { duration: 0.2, ease: EASE_OUT_EXPO }
  }
})

export const rowEnter = (y = 8, duration = 0.25): Variants => ({
  initial: { opacity: 0, y },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration, ease: EASE_OUT_EXPO }
  },
  exit: {
    opacity: 0,
    y: -y,
    transition: { duration: 0.18, ease: EASE_OUT_EXPO }
  }
})
