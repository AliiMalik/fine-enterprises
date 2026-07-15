import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Bell, AlertTriangle, PackageMinus } from 'lucide-react'
import { useAlerts } from '../../api/useAlerts'
import { EASE_OUT_EXPO } from './motion'

export function NotificationsBell() {
  const { alerts } = useAlerts()
  const [open, setOpen] = useState(false)
  const count = alerts.length

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative rounded-md p-2 text-gray-500 transition hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
        aria-label={`Notifications${count ? ` (${count})` : ''}`}
      >
        <Bell size={18} />
        {count > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white"
          >
            {count}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={{ duration: 0.16, ease: EASE_OUT_EXPO }}
              className="absolute right-0 z-20 mt-2 w-80 overflow-hidden rounded-xl bg-white shadow-lg ring-1 ring-black/5 dark:bg-gray-800 dark:ring-white/10"
            >
              <div className="border-b border-gray-100 px-4 py-3 text-sm font-semibold text-gray-900 dark:border-gray-700 dark:text-gray-100">
                Notifications {count > 0 && <span className="font-normal text-gray-400">({count})</span>}
              </div>
              <div className="max-h-96 overflow-y-auto">
                {count === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-gray-400">You&apos;re all caught up 🎉</div>
                ) : (
                  alerts.map((a) => (
                    <Link
                      key={a.id}
                      to={a.to}
                      onClick={() => setOpen(false)}
                      className="flex items-start gap-3 px-4 py-3 transition hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <span
                        className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                          a.kind === 'overdue'
                            ? 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                            : 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
                        }`}
                      >
                        {a.kind === 'overdue' ? <AlertTriangle size={14} /> : <PackageMinus size={14} />}
                      </span>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">{a.title}</div>
                        <div className="truncate text-xs text-gray-400">{a.detail}</div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
