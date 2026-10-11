import { Music, Pause, Play } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { DemoVariant } from './types'

/** WCAG 1.4.2: auto-playing audio longer than this needs a pause/stop or volume control. */
const LIMIT_SECONDS = 3

/** Per-bar animation timing, so the visualiser doesn't pulse in lockstep. */
const BARS = [
  { duration: 700, delay: 0 },
  { duration: 950, delay: 120 },
  { duration: 600, delay: 300 },
  { duration: 1100, delay: 60 },
  { duration: 800, delay: 220 },
  { duration: 650, delay: 400 },
  { duration: 1000, delay: 150 },
]

function Visualiser({ playing }: { playing: boolean }) {
  return (
    <div aria-hidden="true" className="flex h-10 items-end gap-1">
      {BARS.map(({ duration, delay }, i) => (
        <span
          key={i}
          style={playing ? { animationDuration: `${duration}ms`, animationDelay: `${delay}ms` } : undefined}
          className={`h-full w-1.5 origin-bottom rounded-sm bg-amber-300 ${
            // Reduced motion: bars hold still at a "playing" height instead of pulsing.
            playing ? 'motion-safe:animate-equalizer motion-reduce:scale-y-75' : 'scale-y-25'
          }`}
        />
      ))}
    </div>
  )
}

export function AudioControlDemo({ variant }: { variant: DemoVariant }) {
  // "Auto-plays" on mount. No real sound is played: the lab must not fail 1.4.2 itself.
  const [playing, setPlaying] = useState(true)
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    if (!playing) return
    const timer = setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => clearInterval(timer)
  }, [playing])

  const overLimit = seconds > LIMIT_SECONDS

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-slate-300 bg-white p-4">
      <div className="overflow-hidden rounded-lg border border-slate-300">
        {variant === 'pass' && (
          // First thing on the page, so keyboard and screen-reader users reach it straight away.
          <div className="border-b border-slate-300 bg-slate-100 p-2">
            <button
              type="button"
              onClick={() => setPlaying((p) => !p)}
              className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lg bg-blue-700 px-4 text-sm font-semibold text-white hover:bg-blue-800 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
            >
              {playing ? <Pause className="size-4" aria-hidden="true" /> : <Play className="size-4" aria-hidden="true" />}
              {playing ? 'Pause background music' : 'Play background music'}
            </button>
          </div>
        )}

        <div className="flex flex-col gap-3 bg-linear-to-br from-indigo-900 to-purple-900 p-4 text-white">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h5 className="text-lg font-bold">Summer sale</h5>
              <p className="text-sm text-indigo-100">Up to 50% off headphones and speakers.</p>
            </div>
            <Visualiser playing={playing} />
          </div>
          <p className="flex items-center gap-2 text-xs text-indigo-100">
            <Music className="size-4 shrink-0" aria-hidden="true" />
            {playing ? 'Now playing: "Sunny beats" (started on its own)' : 'Music paused'}
          </p>
        </div>
      </div>

      {/* Not a live region on purpose: it changes every second. */}
      <p className={`text-sm font-semibold ${playing && overLimit ? 'text-red-800' : 'text-slate-900'}`}>
        {playing
          ? `Playing for ${seconds}s${overLimit ? `, past the ${LIMIT_SECONDS}s limit` : ''}. A screen reader would be talking over it${
              variant === 'fail' ? ', with no control to stop it.' : '.'
            }`
          : 'Paused. Screen-reader speech is easy to hear again.'}
      </p>
      <p className="text-xs text-slate-600">No real sound plays in this lab; the animated bars stand in for the music.</p>
    </div>
  )
}
