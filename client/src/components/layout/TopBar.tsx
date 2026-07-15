import { LogOut, User, Search } from 'lucide-react'
import { useAuth } from '../../auth/AuthContext'
import { ThemeToggle } from './ThemeToggle'
import { NotificationsBell } from './NotificationsBell'

export function TopBar({ onOpenSearch }: { onOpenSearch: () => void }) {
  const { user, logout } = useAuth()

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-gray-200 bg-white/90 px-8 backdrop-blur dark:border-gray-800 dark:bg-gray-900/90">
      <button
        onClick={onOpenSearch}
        className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-400 transition hover:border-gray-300 hover:text-gray-600 dark:border-gray-700 dark:hover:border-gray-600"
      >
        <Search size={15} />
        <span className="hidden sm:inline">Search…</span>
        <kbd className="ml-1 hidden rounded border border-gray-200 px-1.5 py-0.5 text-[10px] font-semibold text-gray-400 dark:border-gray-600 sm:inline">
          ⌘K
        </kbd>
      </button>
      <div className="flex items-center gap-3">
        <NotificationsBell />
        <ThemeToggle />
        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-50 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300">
            <User size={16} />
          </span>
          <span className="hidden font-medium sm:inline">{user?.name ?? 'Admin'}</span>
        </div>
        <button
          onClick={logout}
          className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">Sign out</span>
        </button>
      </div>
    </header>
  )
}
