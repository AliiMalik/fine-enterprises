import {
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'
import { EASE_OUT_EXPO } from '../layout/motion'

export type ToastKind = 'success' | 'error' | 'info'

export interface ToastItem {
  id: number
  kind: ToastKind
  message: string
  description?: string
}

type Payload = Omit<ToastItem, 'id'>
type Listener = (t: Payload) => void

// Module-level bus so anything (including non-React api hooks) can raise a
// toast without prop-drilling or context access.
const listeners = new Set<Listener>()
let seq = 0

function emit(t: Payload) {
  listeners.forEach((l) => l(t))
}

export const toast = {
  success: (message: string, description?: string) => emit({ kind: 'success', message, description }),
  error: (message: string, description?: string) => emit({ kind: 'error', message, description }),
  info: (message: string, description?: string) => emit({ kind: 'info', message, description }),
}

const CONFIG: Record<ToastKind, { icon: typeof CheckCircle2; ring: string; iconClass: string }> = {
  success: { icon: CheckCircle2, ring: 'ring-teal-200 dark:ring-teal-800', iconClass: 'text-teal-600 dark:text-teal-400' },
  error: { icon: AlertCircle, ring: 'ring-red-200 dark:ring-red-900', iconClass: 'text-red-600 dark:text-red-400' },
  info: { icon: Info, ring: 'ring-blue-200 dark:ring-blue-900', iconClass: 'text-blue-600 dark:text-blue-400' },
}

const DURATION = 4200

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const remove = useCallback((id: number) => {
    setToasts((ts) => ts.filter((t) => t.id !== id))
  }, [])

  useEffect(() => {
    const listener: Listener = (t) => {
      const id = ++seq
      setToasts((ts) => [...ts, { ...t, id }])
      window.setTimeout(() => remove(id), DURATION)
    }
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  }, [remove])

  return (
    <>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-2 px-4 sm:inset-x-auto sm:right-4 sm:items-end">
        <AnimatePresence initial={false}>
          {toasts.map((t) => {
            const { icon: Icon, ring, iconClass } = CONFIG[t.kind]
            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: -16, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 24, scale: 0.96, transition: { duration: 0.18 } }}
                transition={{ duration: 0.32, ease: EASE_OUT_EXPO }}
                className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl bg-white p-4 shadow-lg ring-1 ${ring} dark:bg-gray-800`}
                role="status"
              >
                <Icon size={20} className={`mt-0.5 shrink-0 ${iconClass}`} />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{t.message}</div>
                  {t.description && (
                    <div className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{t.description}</div>
                  )}
                </div>
                <button
                  onClick={() => remove(t.id)}
                  className="shrink-0 rounded p-0.5 text-gray-400 transition hover:text-gray-700 dark:hover:text-gray-200"
                  aria-label="Dismiss"
                >
                  <X size={15} />
                </button>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </>
  )
}
