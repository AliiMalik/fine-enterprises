import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { AnimatedOutlet } from './AnimatedOutlet'
import { CommandPalette } from '../ui/CommandPalette'

export function DashboardLayout() {
  const navigate = useNavigate()
  const [paletteOpen, setPaletteOpen] = useState(false)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      // ⌘K / Ctrl-K toggles the palette from anywhere.
      if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setPaletteOpen((o) => !o)
        return
      }
      const target = e.target as HTMLElement | null
      const typing =
        !!target && (/^(input|textarea|select)$/i.test(target.tagName) || target.isContentEditable)
      if (typing || paletteOpen) return

      // Single-key shortcuts (only when not typing).
      if (e.key === '/') {
        e.preventDefault()
        setPaletteOpen(true)
      } else if (e.key === 'n') {
        e.preventDefault()
        navigate('/invoices/new')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [paletteOpen, navigate])

  return (
    <div className="min-h-screen bg-surface dark:bg-gray-950">
      <Sidebar />
      <div className="pl-60">
        <TopBar onOpenSearch={() => setPaletteOpen(true)} />
        <main className="mx-auto max-w-7xl px-8 py-8">
          <AnimatedOutlet />
        </main>
      </div>
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
  )
}
