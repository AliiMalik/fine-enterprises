import { cloneElement } from 'react'
import { useLocation, useOutlet } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'

/**
 * AnimatedOutlet
 * Drop-in replacement for React Router's <Outlet> that animates page
 * transitions with <AnimatePresence mode="wait">.
 *
 * It captures the currently matched route element via useOutlet() and clones it
 * with a key derived from the pathname. AnimatePresence retains the previous
 * page tree until its exit animation finishes, so each page's <PageWrapper>
 * fade/slide-out completes before the next page fades in.
 *
 * The surrounding layout chrome (Sidebar / TopBar) stays mounted, which keeps
 * navigation state and the active-nav magic-move indicator perfectly stable.
 */
export function AnimatedOutlet() {
  const location = useLocation()
  const element = useOutlet()

  return (
    <AnimatePresence mode="wait" initial={false}>
      {element ? cloneElement(element, { key: location.pathname }) : null}
    </AnimatePresence>
  )
}
