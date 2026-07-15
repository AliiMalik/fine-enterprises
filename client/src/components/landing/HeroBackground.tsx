/**
 * Ambient hero backdrop: a soft gradient-mesh of blurred blobs plus a faint
 * film grain. Blobs carry `data-blob` so the landing timeline can parallax
 * them slower than the foreground cards for depth. Theme-aware.
 */
export function HeroBackground() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        data-blob
        className="absolute -left-40 -top-32 h-[38rem] w-[38rem] rounded-full bg-teal-300/25 blur-[110px] dark:bg-teal-700/20"
      />
      <div
        data-blob
        className="absolute -right-40 top-1/4 h-[42rem] w-[42rem] rounded-full bg-emerald-200/30 blur-[120px] dark:bg-emerald-800/15"
      />
      <div
        data-blob
        className="absolute -bottom-48 left-1/3 h-[34rem] w-[34rem] rounded-full bg-cyan-200/25 blur-[110px] dark:bg-cyan-900/20"
      />
      <div className="hero-grain absolute inset-0 opacity-[0.12] mix-blend-multiply dark:opacity-[0.06] dark:mix-blend-screen" />
    </div>
  )
}
