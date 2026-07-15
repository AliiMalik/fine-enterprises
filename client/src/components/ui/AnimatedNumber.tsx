import { useEffect, useRef, useState } from 'react'
import { animate, useReducedMotion } from 'framer-motion'
import { EASE_OUT_EXPO } from '../layout/motion'

/**
 * Counts smoothly from its previous value to the new one (and from 0 on first
 * mount). `format` maps the animating float to a display string — pass
 * `formatCurrency` / `formatNumber` from utils/format.
 *
 * Uses React state (not a raw motion value) plus a safety timeout so the final
 * value is always shown even if the animation frame loop is throttled or never
 * runs (e.g. a backgrounded tab) — the number must never get stuck mid-count.
 */
export function AnimatedNumber({
  value,
  format = (n) => Math.round(n).toLocaleString(),
  duration = 0.9,
  className,
}: {
  value: number
  format?: (n: number) => string
  duration?: number
  className?: string
}) {
  const reduce = useReducedMotion()
  const [display, setDisplay] = useState(reduce ? value : 0)
  const prev = useRef(reduce ? value : 0)

  useEffect(() => {
    if (reduce) {
      setDisplay(value)
      prev.current = value
      return
    }
    const from = prev.current
    prev.current = value
    const controls = animate(from, value, {
      duration,
      ease: EASE_OUT_EXPO,
      onUpdate: (v) => setDisplay(v),
    })
    // Guarantee the final value even if rAF is throttled/frozen.
    const safety = window.setTimeout(() => setDisplay(value), duration * 1000 + 250)
    return () => {
      controls.stop()
      window.clearTimeout(safety)
    }
  }, [value, duration, reduce])

  return <span className={className}>{format(display)}</span>
}
