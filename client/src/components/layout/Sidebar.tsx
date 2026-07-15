import { NavLink, useLocation, useMatch } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  FileText,
  Users,
  ReceiptText,
  Boxes,
  Landmark,
  BarChart3,
  Wallet,
  Package,
} from 'lucide-react'
import { EASE_OUT_EXPO } from './motion'

const items = [
  { section: 'Overview', to: '/dashboard', match: '/dashboard/*', label: 'Dashboard', icon: LayoutDashboard },
  { section: 'Sales', to: '/invoices', match: '/invoices/*', label: 'Invoices', icon: FileText },
  { section: 'Sales', to: '/customers', match: '/customers/*', label: 'Customers', icon: Users },
  { section: 'Purchases', to: '/bills', match: '/bills/*', label: 'Bills', icon: ReceiptText },
  { section: 'Inventory', to: '/inventory', match: '/inventory/*', label: 'Inventory', icon: Boxes },
  { section: 'Accounting', to: '/accounts', match: '/accounts/*', label: 'Accounts', icon: Landmark },
  { section: 'Accounting', to: '/reports', match: '/reports/*', label: 'Reports', icon: BarChart3 },
]

export function Sidebar() {
  const { pathname } = useLocation()
  // Fixed-length array of hook calls (Rules of Hooks) — `items` is static.
  const activeMap = items.map(({ match, to }) => Boolean(useMatch(match)) || pathname === to)

  return (
    <aside className="fixed inset-y-0 left-0 z-20 flex w-60 flex-col border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center gap-2 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-700 text-white">
          <Package size={18} />
        </div>
        <div className="leading-tight">
          <div className="text-sm font-bold text-gray-900 dark:text-white">Fine Enterprises</div>
          <div className="text-xs text-gray-400">Ltd</div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
        {items.map((item, i) => {
          const Icon = item.icon
          const active = activeMap[i]
          const showHeader = i === 0 || items[i - 1].section !== item.section
          return (
            <div key={item.to}>
              {showHeader && (
                <div className="px-3 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                  {item.section}
                </div>
              )}
              <NavLink
                to={item.to}
                className={`relative flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? 'text-teal-700 dark:text-teal-300'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white'
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-md bg-teal-50 dark:bg-teal-500/15"
                    transition={{ duration: 0.32, ease: EASE_OUT_EXPO }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-3">
                  <Icon size={18} />
                  {item.label}
                </span>
              </NavLink>
            </div>
          )
        })}

        {/* Roadmap hint */}
        <div className="px-3 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
          Coming soon
        </div>
        <div className="flex cursor-not-allowed items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-gray-300 dark:text-gray-600">
          <Wallet size={18} />
          Payroll
          <span className="ml-auto rounded-full bg-gray-100 px-1.5 py-0.5 text-[9px] font-semibold text-gray-400 dark:bg-gray-800 dark:text-gray-500">
            Soon
          </span>
        </div>
      </nav>

      <div className="px-5 py-4 text-xs text-gray-400">v1.0 · Demo build</div>
    </aside>
  )
}
