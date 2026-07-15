import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { Package, ArrowDown, ArrowRight } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import { HeroBackground } from '../components/landing/HeroBackground'
import {
  InvoiceCard,
  BalanceCard,
  CashflowCard,
  OwedCard,
  PaymentChip,
  ModuleRow,
} from '../components/landing/HeroCards'
import { formatCurrency } from '../utils/format'

gsap.registerPlugin(useGSAP, ScrollTrigger)

const BAL_START = 17500
const BAL_END = 18180.58

/**
 * Product-led landing at "/".
 *
 * A pinned, scroll-scrubbed GSAP timeline that assembles the real Fine
 * Enterprises UI and demonstrates its actual differentiator — the connected
 * modules: an invoice is marked Paid, a payment chip flies into the balance,
 * and the balance / cashflow / "owed to you" figures update live. At the end
 * the composition hands off into the real app (/dashboard if authed, else
 * /login). A subtle real-time float keeps the cards alive regardless of scroll.
 * Reduced-motion / small screens get a static composed hero + CTA.
 */
export default function Landing() {
  const scope = useRef<HTMLDivElement>(null)
  const navigatedRef = useRef(false)
  const navigate = useNavigate()
  const { token } = useAuth()
  const [staticMode, setStaticMode] = useState(false)
  const [paid, setPaid] = useState(false)

  const target = token ? '/dashboard' : '/login'

  function openApp() {
    if (navigatedRef.current) return
    navigatedRef.current = true
    navigate(target)
  }

  useGSAP(
    () => {
      const q = gsap.utils.selector(scope)
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const small = window.matchMedia('(max-width: 760px)').matches
      const cards = q('.hero-card')
      const balEl = q('#hero-balance-value')[0] as HTMLElement | undefined

      // ---- Static composed state for reduced-motion / small screens ---------
      if (reduce || small) {
        setStaticMode(true)
        setPaid(true)
        gsap.set(cards, { autoAlpha: 1, y: 0, scale: 1 })
        gsap.set(['#headline', '#hero-resolve'], { autoAlpha: 1, y: 0 })
        gsap.set('#scrollHint', { autoAlpha: 0 })
        if (balEl) balEl.textContent = formatCurrency(BAL_END)
        gsap.set('#hero-balance-delta', { autoAlpha: 1 })
        gsap.set('#hero-cashflow-bar', { height: '82%' })
        gsap.set('#hero-owed-awaiting', { width: '6%' })
        return
      }

      // ---- Initial states ---------------------------------------------------
      gsap.set('#headline', { autoAlpha: 0, y: 26 })
      gsap.set('#hero-resolve', { autoAlpha: 0, y: 20 })
      gsap.set(cards, { autoAlpha: 0, y: 44, scale: 0.96, transformOrigin: 'center bottom' })
      gsap.set('#hero-chip', { autoAlpha: 0, scale: 0.8 })
      gsap.set('#opener', { scale: 0, transformOrigin: 'center center' })

      // Measure the flight path for the payment chip (stage-relative).
      const stageEl = q('#stage')[0] as HTMLElement
      const invEl = q('#hero-invoice')[0] as HTMLElement
      const balCard = q('#hero-balance')[0] as HTMLElement
      let chipFrom = { x: 60, y: 240 }
      let chipTo = { x: 520, y: 40 }
      if (stageEl && invEl && balCard) {
        const s = stageEl.getBoundingClientRect()
        const i = invEl.getBoundingClientRect()
        const b = balCard.getBoundingClientRect()
        chipFrom = { x: i.left - s.left + i.width / 2 - 44, y: i.top - s.top + i.height - 34 }
        chipTo = { x: b.left - s.left + b.width / 2 - 44, y: b.top - s.top + b.height / 2 - 12 }
      }
      gsap.set('#hero-chip', { x: chipFrom.x, y: chipFrom.y })

      // Snap points (progress) filled in after the timeline is built.
      const P: Record<string, number> = {}

      const tl = gsap.timeline({
        defaults: { ease: 'power2.out' },
        scrollTrigger: {
          trigger: '#hero',
          start: 'top top',
          end: () => '+=' + Math.round(window.innerHeight * 5),
          scrub: 1.2,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onLeave: openApp,
          onUpdate: (self) => {
            // Flip the invoice to Paid once the playhead passes the "paid" beat.
            if (P.paid != null) setPaid(self.progress >= P.paid)
          },
          snap: {
            snapTo: (value) => {
              if (P.assembled == null) return value
              const pts = [0, P.assembled, P.paidDone, P.revealed, 1]
              return pts.reduce((best, p) => (Math.abs(p - value) < Math.abs(best - value) ? p : best))
            },
            duration: { min: 0.15, max: 0.5 },
            ease: 'power1.inOut',
            delay: 0.06,
          },
        },
      })

      // ---- Beat 1-2: headline + the dashboard assembles ---------------------
      tl.to('#scrollHint', { autoAlpha: 0, duration: 0.3 }, 0)
      tl.to('#headline', { autoAlpha: 1, y: 0, duration: 0.9 }, 0.1)
      tl.to(cards, { autoAlpha: 1, y: 0, scale: 1, duration: 1.1, stagger: 0.3, ease: 'power3.out' }, 0.5)
      tl.addLabel('assembled', 2.4)

      // ---- Beat 3: get paid — badge morph (React) + chip flies to balance ---
      const PAID = 2.7
      tl.addLabel('paid', PAID)
      tl.fromTo('#hero-chip', { autoAlpha: 0, scale: 0.8 }, { autoAlpha: 1, scale: 1, duration: 0.3 }, PAID)
      tl.to('#hero-chip', { x: chipTo.x, y: chipTo.y, duration: 0.95, ease: 'power2.inOut' }, PAID + 0.25)
      tl.to('#hero-chip', { autoAlpha: 0, scale: 0.7, duration: 0.3 }, PAID + 1.15)

      // ---- Beat 4: the payment lands — balance / cashflow / owed update -----
      const LAND = PAID + 1.1
      const bal = { v: BAL_START }
      tl.to(
        bal,
        {
          v: BAL_END,
          duration: 0.9,
          ease: 'power2.out',
          onUpdate: () => {
            if (balEl) balEl.textContent = formatCurrency(bal.v)
          },
        },
        LAND,
      )
      tl.fromTo('#hero-balance-flash', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.18, yoyo: true, repeat: 1 }, LAND)
      tl.to('#hero-balance-delta', { autoAlpha: 1, duration: 0.4 }, LAND + 0.4)
      tl.to('#hero-cashflow-bar', { height: '82%', duration: 0.8, ease: 'power2.out' }, LAND)
      tl.to('#hero-owed-awaiting', { width: '6%', duration: 0.8, ease: 'power2.out' }, LAND)
      tl.addLabel('paidDone', LAND + 1.0)

      // ---- Beat 5: resolve — modules + tagline, then hand off to the app ----
      tl.to('#hero-resolve', { autoAlpha: 1, y: 0, duration: 0.8 }, LAND + 1.1)
      tl.addLabel('revealed', LAND + 1.8)

      const OPENER = LAND + 2.1
      tl.to('#opener', { scale: 1, duration: 1.4, ease: 'power2.inOut' }, OPENER)
      tl.to('#openLabel', { autoAlpha: 1, duration: 0.5 }, OPENER + 0.7)
      tl.to({}, { duration: 0.3 })

      // ---- Real-time ambient float (independent of scroll speed) ------------
      const floatLoop = gsap.timeline({ repeat: -1, yoyo: true, defaults: { ease: 'sine.inOut' } })
      cards.forEach((el, i) => {
        floatLoop.to(el, { y: '+=8', duration: 2.2 + i * 0.25 }, i * 0.2)
      })

      // Parallax the background blobs a touch as the story plays.
      tl.to('[data-blob]', { yPercent: -12, duration: tl.duration(), ease: 'none' }, 0)

      const d = tl.duration()
      P.assembled = tl.labels.assembled / d
      P.paid = tl.labels.paid / d
      P.paidDone = tl.labels.paidDone / d
      P.revealed = tl.labels.revealed / d

      return () => {
        floatLoop.kill()
      }
    },
    { scope },
  )

  return (
    <div
      ref={scope}
      className="relative w-full overflow-x-hidden bg-gradient-to-b from-teal-50 via-white to-white font-sans text-gray-900 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 dark:text-gray-100"
    >
      <HeroBackground />

      {/* Slim header */}
      <header className="absolute inset-x-0 top-0 z-30 mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-700 text-white shadow-sm">
            <Package size={18} />
          </span>
          <span className="text-sm font-bold tracking-tight">Fine Enterprises</span>
        </div>
        <button
          onClick={openApp}
          className="rounded-lg px-4 py-2 text-sm font-semibold text-teal-700 transition hover:bg-teal-100/70 dark:text-teal-300 dark:hover:bg-teal-900/40"
        >
          {token ? 'Go to app' : 'Sign in'}
        </button>
      </header>

      {/* ============================= HERO STAGE (pinned) ==================== */}
      <section
        id="hero"
        className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden px-4"
        style={{ perspective: '1600px' }}
      >
        <div id="headline" className="relative z-20 mb-8 max-w-2xl text-center">
          <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">
            Invoicing, inventory and accounts —{' '}
            <span className="bg-gradient-to-r from-teal-600 to-emerald-500 bg-clip-text text-transparent">
              finally in sync
            </span>
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-base text-gray-600 dark:text-gray-400">
            Mark an invoice paid and watch it flow straight into your balance and cashflow — one connected system.
          </p>
          {staticMode && (
            <button
              onClick={openApp}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-teal-700 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-teal-800"
            >
              {token ? 'Open dashboard' : 'Get started'}
              <ArrowRight size={16} />
            </button>
          )}
        </div>

        {/* The product composition */}
        <div
          id="stage"
          className="relative z-10 grid w-full max-w-[900px] grid-cols-1 gap-4 md:grid-cols-[minmax(0,320px)_minmax(0,1fr)]"
        >
          <InvoiceCard paid={paid} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <BalanceCard />
            <CashflowCard />
            <div className="sm:col-span-2">
              <OwedCard />
            </div>
          </div>
          <PaymentChip />
        </div>

        {/* Resolve line */}
        <div id="hero-resolve" className="relative z-10 mt-8 flex flex-col items-center gap-3">
          <ModuleRow />
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Three modules. One connected system.
          </p>
        </div>

        {/* Scroll hint */}
        <div
          id="scrollHint"
          className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-1 text-sm font-semibold text-teal-700 dark:text-teal-300"
        >
          {token ? 'Scroll to open your dashboard' : 'Scroll to see it in action'}
          <ArrowDown size={18} className="animate-bounce" />
        </div>
      </section>

      {/* ---- Fullscreen "opener" hand-off ---- */}
      <div
        id="opener"
        aria-hidden
        className="pointer-events-none fixed left-1/2 top-1/2 z-40 flex h-[260vmax] w-[260vmax] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-surface dark:bg-gray-900"
        style={{ backgroundImage: 'radial-gradient(circle at center, rgba(45,212,191,0.16), rgba(255,255,255,0) 40%)' }}
      >
        <div id="openLabel" className="flex flex-col items-center gap-3 opacity-0">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-700 text-white shadow-lg">
            <Package size={26} />
          </span>
          <span className="text-sm font-semibold text-gray-500">
            {token ? 'Opening your dashboard…' : 'Opening sign in…'}
          </span>
        </div>
      </div>
    </div>
  )
}
