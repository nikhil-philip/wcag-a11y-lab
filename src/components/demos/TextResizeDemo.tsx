import { CheckCircle2, Mountain, XCircle, ZoomIn } from 'lucide-react'
import { useRef, useState } from 'react'
import type { DemoVariant } from './types'
import { useHiddenOverflow } from './useHiddenOverflow'

const CARD_HEIGHT: Record<DemoVariant, string> = {
  // Intentional failure: a fixed rem height doesn't grow with the text, and overflow is clipped.
  fail: 'h-64 overflow-hidden',
  pass: 'min-h-64',
}

export function TextResizeDemo({ variant }: { variant: DemoVariant }) {
  const [zoomed, setZoomed] = useState(false)
  const cardRef = useRef<HTMLElement>(null)
  const hiddenPx = useHiddenOverflow(cardRef, zoomed)
  const clipped = hiddenPx > 1

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-slate-300 bg-white p-4">
      <button
        type="button"
        aria-pressed={zoomed}
        onClick={() => setZoomed((z) => !z)}
        className={`inline-flex min-h-11 cursor-pointer items-center gap-2 self-start rounded-lg border-2 px-4 text-sm font-semibold focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-blue-700 ${
          zoomed
            ? 'border-blue-700 bg-blue-700 text-white hover:bg-blue-800'
            : 'border-slate-500 bg-white text-slate-900 hover:bg-slate-100'
        }`}
      >
        <ZoomIn className="size-4" aria-hidden="true" />
        Simulate 200% text size
      </button>

      {/* Text is sized in em, so doubling this wrapper's font-size doubles all of it (like text-only zoom). */}
      <div style={{ fontSize: zoomed ? '200%' : '100%' }}>
        <article
          ref={cardRef}
          className={`flex flex-col overflow-x-hidden rounded-lg border border-slate-300 bg-slate-50 ${CARD_HEIGHT[variant]}`}
        >
          <div
            role="img"
            aria-label="Mountain lake at sunrise"
            className="flex h-20 shrink-0 items-center justify-center bg-linear-to-br from-sky-700 to-indigo-900 text-sky-100"
          >
            <Mountain className="size-8" aria-hidden="true" />
          </div>
          <div className="flex flex-col gap-2 p-3">
            <h5 className="text-[1.125em] leading-snug font-bold break-words text-slate-900">
              Five quiet trails for a weekend escape
            </h5>
            <p className="text-[0.875em] leading-relaxed break-words text-slate-700">
              From lakeside loops to forest ridges, these routes are under 10 km, have step-free
              sections and are well signposted. Book parking in advance at weekends.
            </p>
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              className="self-start text-[0.875em] font-semibold text-blue-800 underline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
            >
              Read the guide
            </a>
          </div>
        </article>
      </div>

      <p
        role="status"
        className={`flex items-start gap-2 text-sm font-semibold ${clipped ? 'text-red-800' : 'text-green-800'}`}
      >
        {clipped ? (
          <XCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        ) : (
          <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        )}
        <span>
          {clipped
            ? `${Math.round(hiddenPx)}px of content is cut off, including the "Read the guide" link.`
            : zoomed
              ? 'All content is visible at 200%.'
              : 'All content is visible at 100%.'}
        </span>
      </p>
    </div>
  )
}
