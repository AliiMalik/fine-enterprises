import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'

const STORAGE_KEY = 'fe_theme'

type Theme = 'light' | 'dark'

interface ThemeContextValue {
  theme: Theme
  toggle: () => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'light'
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'light' || stored === 'dark') return stored
  // Default to light; don't inherit the OS preference so the app never
  // appears "permanently dark" on a dark-themed machine until explicitly chosen.
  return 'light'
}

function applyTheme(theme: Theme) {
  const root = document.documentElement
  root.classList.toggle('dark', theme === 'dark')
  root.style.colorScheme = theme
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(getInitialTheme)

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  const set = useCallback((next: Theme) => {
    localStorage.setItem(STORAGE_KEY, next)
    setTheme(next)
  }, [])

  const toggle = useCallback(() => {
    set(theme === 'dark' ? 'light' : 'dark')
  }, [theme, set])

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>
  )
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
