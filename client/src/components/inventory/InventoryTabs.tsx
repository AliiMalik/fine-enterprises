import { NavLink } from 'react-router-dom'
import { Package, Truck } from 'lucide-react'

export function InventoryTabs() {
  const tabs = [
    { to: '/inventory', label: 'Products', icon: Package, end: true },
    { to: '/inventory/shipments', label: 'Shipments', icon: Truck, end: false },
  ]
  return (
    <div className="mb-6 flex gap-1 border-b border-gray-200 dark:border-gray-800">
      {tabs.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              isActive
                ? 'border-teal-700 text-teal-700 dark:border-teal-400 dark:text-teal-300'
                : 'border-transparent text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
            }`
          }
        >
          <Icon size={16} />
          {label}
        </NavLink>
      ))}
    </div>
  )
}
