import { Pause, Play } from 'lucide-react'
import { useEffect, useId, useState, useSyncExternalStore, type CSSProperties } from 'react'
import type { DemoVariant } from './types'

const HEADLINES = [
  'City council approves ₹1,200 crore plan to extend the metro to the airport by 2029.',
  'Monsoon arrives three days early; heavy rain expected along the coast this weekend.',
  'National team names 18-year-old captain ahead of the Asia Cup qualifiers.',
  'Hospitals report a 30% drop in waiting times after the new online booking system.',
  'Scientists find a fungus that breaks down plastic in under six weeks.',
] as const

/** Long enough to read a line, short enough that slower readers still lose it mid-sentence. */
const ROTATE_MS = 3500

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)'

function subscribeReducedMotion(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION)
  query.addEventListener('change', onChange)
  return () => query.removeEventListener('change', onChange)
}

/** False on the server (pre-rendered HTML) and during hydration, then the real setting, kept up to date. */
function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => false,
  )
}

export function PauseStopHideDemo({ variant }: { variant: DemoVariant }) {
  const id = useId()
  const [index, setIndex] = useState(0)
  // Fail: always playing, with nothing to stop it. Pass: the user decides, and it starts paused for
  // anyone who has asked their system to reduce motion.
  const reducedMotion = usePrefersReducedMotion()
  // null until the user presses Pause or Play.
  const [userPlaying, setUserPlaying] = useState<boolean | null>(null)
  const playing = variant === 'fail' || (userPlaying ?? !reducedMotion)

  // One interval per play session. Pausing (and unmounting, e.g. closing the accordion) runs the cleanup,
  // so no timer is left behind. The functional update means the interval never reads a stale index.
  useEffect(() => {
    if (!playing) return
    const timer = window.setInterval(() => setIndex((i) => (i + 1) % HEADLINES.length), ROTATE_MS)
    return () => window.clearInterval(timer)
  }, [playing])

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-slate-300 bg-white p-4">
      <p className="text-sm text-slate-700">
        Try to read every headline in full.{variant === 'pass' && ' Pause the ticker whenever you need more time.'}
      </p>

      {/* No live region: announcing every automatic change would interrupt screen-reader users. */}
      <section
        aria-labelledby={`${id}-label`}
        className="flex flex-col gap-3 overflow-hidden rounded-lg border border-slate-300 bg-slate-900 p-3 text-white"
      >
        <div className="flex items-center justify-between gap-2">
          <h5 id={`${id}-label`} className="flex items-center gap-2 text-xs font-bold tracking-wide uppercase">
            <span className="rounded bg-red-600 px-1.5 py-0.5">Breaking news</span>
            <span className="font-normal text-slate-300">
              {index + 1} of {HEADLINES.length}
            </span>
          </h5>
          {variant === 'pass' && (
            // Visible text changes between Pause and Play; the hidden word keeps the name specific.
            <button
              type="button"
              onClick={() => setUserPlaying(!playing)}
              className="inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-lg border-2 border-white bg-slate-900 px-3 text-sm font-semibold text-white hover:bg-slate-700 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              {playing ? <Pause className="size-4" aria-hidden="true" /> : <Play className="size-4" aria-hidden="true" />}
              {playing ? 'Pause' : 'Play'}
              <span className="sr-only"> headlines</span>
            </button>
          )}
        </div>

        {/* Keyed so each headline slides in; reduced-motion users get a plain swap. */}
        <p
          key={index}
          className="min-h-12 text-sm leading-relaxed motion-safe:animate-ticker-in"
        >
          {HEADLINES[index]}
        </p>

        <div className="h-1 overflow-hidden rounded bg-slate-700" aria-hidden="true">
          {/* Countdown to the next headline; restarts with each one, and freezes while paused. */}
          <div
            key={`${index}-${playing}`}
            className={`h-full origin-left bg-red-500 ${playing ? 'motion-safe:animate-ticker-progress' : 'scale-x-0'}`}
            style={{ '--ticker-ms': `${ROTATE_MS}ms` } as CSSProperties}
          />
        </div>
      </section>

      <p className={`text-sm font-semibold ${variant === 'fail' ? 'text-red-800' : 'text-slate-900'}`}>
        {variant === 'fail'
          ? 'There is no way to pause, stop or hide the ticker. It keeps moving for as long as the page is open.'
          : playing
            ? 'Headlines change every few seconds. Press Pause to stop them.'
            : 'Paused. The headline stays until you press Play.'}
      </p>
    </div>
  )
}
