import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Search,
  FileText,
  Boxes,
  Wallet,
  Plus,
  Sun,
  Moon,
  LayoutDashboard,
  ArrowRight,
  Package,
  Truck,
  type LucideIcon,
} from 'lucide-react'
import { useInvoices } from '../../api/useInvoices'
import { useProducts } from '../../api/useProducts'
import { useTheme } from '../../theme/ThemeProvider'
import { formatCurrency } from '../../utils/format'
import { statusLabel } from '../../utils/status'
import { EASE_OUT_EXPO } from '../layout/motion'

interface CmdItem {
  id: string
  label: string
  hint?: string
  icon: LucideIcon
  run: () => void
}

/**
 * ⌘K command palette — fuzzy-search invoices/products and run quick actions.
 * Data comes from the already-cached list queries; no backend search needed.
 */
export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate()
  const { theme, toggle } = useTheme()
  const { data: invoices } = useInvoices()
  const { data: products } = useProducts()
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const items = useMemo<CmdItem[]>(() => {
    const go = (to: string) => () => {
      onClose()
      navigate(to)
    }
    const actions: CmdItem[] = [
      { id: 'a-new-invoice', label: 'New Invoice', icon: Plus, run: go('/invoices/new') },
      { id: 'a-add-product', label: 'Add Product', icon: Plus, run: go('/inventory') },
      { id: 'a-new-shipment', label: 'New Shipment', icon: Truck, run: go('/inventory/shipments/new') },
      { id: 'a-add-transaction', label: 'Add Transaction', icon: Plus, run: go('/accounts') },
      {
        id: 'a-toggle-theme',
        label: `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`,
        icon: theme === 'dark' ? Sun : Moon,
        run: () => {
          toggle()
          onClose()
        },
      },
      { id: 'n-dashboard', label: 'Go to Dashboard', icon: LayoutDashboard, run: go('/dashboard') },
      { id: 'n-invoices', label: 'Go to Invoices', icon: FileText, run: go('/invoices') },
      { id: 'n-inventory', label: 'Go to Inventory', icon: Boxes, run: go('/inventory') },
      { id: 'n-accounts', label: 'Go to Accounts', icon: Wallet, run: go('/accounts') },
    ]
    const inv: CmdItem[] = (invoices ?? []).map((i) => ({
      id: `inv-${i.id}`,
      label: `${i.invoiceNumber} · ${i.customer.name}`,
      hint: `${statusLabel(i.status)} · ${formatCurrency(i.grandTotal)}`,
      icon: FileText,
      run: go(`/invoices/${i.id}`),
    }))
    const prod: CmdItem[] = (products ?? []).map((p) => ({
      id: `prod-${p.id}`,
      label: `${p.sku} · ${p.name}`,
      hint: `${p.stockCartons} cartons`,
      icon: Package,
      run: go('/inventory'),
    }))
    return [...actions, ...inv, ...prod]
  }, [invoices, products, theme, navigate, onClose, toggle])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return items
    return items.filter((it) => `${it.label} ${it.hint ?? ''}`.toLowerCase().includes(q))
  }, [items, query])

  useEffect(() => {
    setActive(0)
  }, [query, open])

  useEffect(() => {
    if (open) {
      const t = window.setTimeout(() => inputRef.current?.focus(), 20)
      return () => window.clearTimeout(t)
    }
    setQuery('')
  }, [open])

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((a) => Math.min(a + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((a) => Math.max(a - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      filtered[active]?.run()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
    }
  }

  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-idx="${active}"]`)?.scrollIntoView({ block: 'nearest' })
  }, [active])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-start justify-center p-4 pt-[12vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ scale: 0.96, y: -8, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.97, opacity: 0 }}
            transition={{ duration: 0.18, ease: EASE_OUT_EXPO }}
            className="relative w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 dark:bg-gray-900 dark:ring-white/10"
            onKeyDown={onKeyDown}
          >
            <div className="flex items-center gap-2 border-b border-gray-100 px-4 dark:border-gray-800">
              <Search size={18} className="shrink-0 text-gray-400" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search invoices, products, or run a command…"
                className="w-full bg-transparent py-4 text-sm text-gray-900 outline-none placeholder:text-gray-400 dark:text-gray-100"
              />
              <kbd className="hidden rounded border border-gray-200 px-1.5 py-0.5 text-[10px] font-semibold text-gray-400 dark:border-gray-700 sm:block">
                Esc
              </kbd>
            </div>
            <div ref={listRef} className="max-h-80 overflow-y-auto p-2">
              {filtered.length === 0 ? (
                <div className="px-3 py-8 text-center text-sm text-gray-400">No matches for "{query}"</div>
              ) : (
                filtered.map((it, i) => {
                  const Icon = it.icon
                  return (
                    <button
                      key={it.id}
                      data-idx={i}
                      onMouseEnter={() => setActive(i)}
                      onClick={it.run}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ${
                        i === active
                          ? 'bg-teal-50 text-teal-900 dark:bg-teal-900/30 dark:text-teal-100'
                          : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <Icon size={16} className={i === active ? 'text-teal-600 dark:text-teal-300' : 'text-gray-400'} />
                      <span className="flex-1 truncate">{it.label}</span>
                      {it.hint && <span className="truncate text-xs text-gray-400">{it.hint}</span>}
                      {i === active && <ArrowRight size={14} className="shrink-0 text-teal-500" />}
                    </button>
                  )
                })
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
