import { useRef } from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../../theme/ThemeProvider'

/**
 * ThemeToggle
 * Exact replication of MagicUI's `AnimatedThemeToggler` (variant="circle",
 * duration={400}): toggling runs a View Transitions API circular clip-path
 * reveal that expands from the button. The circle origin (--theme-toggle-x/y)
 * and radius (--theme-toggle-radius) are set on <html> so the CSS keyframe
 * knows where to expand from. The theme class is swapped inside the
 * transition's update callback so the new look is captured mid-animation.
 * Falls back to an instant swap where the API is unavailable.
 */
export function ThemeToggle() {
  const { theme, toggle } = useTheme()
  const btnRef = useRef<HTMLButtonElement>(null)

  function handleToggle() {
    const btn = btnRef.current
    if (btn) {
      const rect = btn.getBoundingClientRect()
      const x = rect.left + rect.width / 2
      const y = rect.top + rect.height / 2
      const radius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y),
      )
      const root = document.documentElement
      root.style.setProperty('--theme-toggle-x', `${x}px`)
      root.style.setProperty('--theme-toggle-y', `${y}px`)
      root.style.setProperty('--theme-toggle-radius', `${radius}px`)
    }

    const doc = document as Document & {
      startViewTransition?: (cb: () => void) => { ready: Promise<void> }
    }
    if (typeof doc.startViewTransition === 'function') {
      try {
        doc.startViewTransition(() => {
          toggle()
        })
      } catch {
        toggle()
      }
    } else {
      toggle()
    }
  }

  const isDark = theme === 'dark'

  return (
    <button
      ref={btnRef}
      type="button"
      onClick={handleToggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  )
}
