import { Info } from 'lucide-react'
import { useEffect, useId, useState, type KeyboardEvent } from 'react'
import type { DemoVariant } from './types'

const TRIGGER_CLASSES =
  'inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border-2 border-slate-500 bg-white px-4 text-sm font-semibold text-slate-900 hover:bg-slate-100 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-blue-700'

const TOOLTIP_CLASSES = 'w-64 max-w-[calc(100vw-4rem)] rounded-lg bg-slate-900 p-3 text-sm text-white shadow-lg'

const TIP = 'Free standard delivery on orders over ₹999. Express delivery is ₹149.'

export function HoverContentDemo({ variant }: { variant: DemoVariant }) {
  const id = useId()
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [escIgnored, setEscIgnored] = useState(false)

  // Fail: whichever event fired last wins, so leaving with the mouse closes it even while focused.
  const [failOpen, setFailOpen] = useState(false)
  // Pass: open while hovered OR focused (persistent), until Esc dismisses it (dismissible).
  const open = variant === 'fail' ? failOpen : (hovered || focused) && !dismissed

  // Pass: Esc closes the tooltip from anywhere, without moving the pointer or focus.
  useEffect(() => {
    if (variant !== 'pass' || !open) return
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') setDismissed(true)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [variant, open])

  // A fresh hover or focus after dismissing opens it again.
  const enter = (set: (v: boolean) => void) => () => {
    set(true)
    setDismissed(false)
    setEscIgnored(false)
  }

  function failShow() {
    setFailOpen(true)
    setEscIgnored(false)
  }

  function reportIgnoredEsc(e: KeyboardEvent) {
    if (e.key === 'Escape' && failOpen) setEscIgnored(true)
  }

  const status = escIgnored
    ? 'Esc was ignored: the tooltip still covers the delivery estimate.'
    : dismissed
      ? 'Closed with Esc. Focus and the pointer stayed where they were.'
      : open
        ? 'Tooltip open.'
        : 'Tooltip closed.'

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-slate-300 bg-white p-4">
      <p className="text-sm text-slate-700">
        Hover over the button, then move the pointer onto the tooltip. Or Tab to the button and press{' '}
        <kbd className="rounded border border-slate-400 px-1 font-mono">Esc</kbd>.
      </p>

      <div className="relative">
        {variant === 'fail' ? (
          // Intentional failure: hover lives on the button only and the tooltip sits across a gap, so
          // moving onto it closes it. Esc is not handled. The wrapper is only the positioning context,
          // so the tooltip opens just below the button, over the estimate.
          <span className="relative inline-block">
            <button
              type="button"
              onMouseEnter={failShow}
              onMouseLeave={() => setFailOpen(false)}
              onFocus={failShow}
              onBlur={() => setFailOpen(false)}
              onKeyDown={reportIgnoredEsc}
              className={TRIGGER_CLASSES}
            >
              <Info className="size-4" aria-hidden="true" />
              Delivery options
            </button>
            {/* Intentional failure: mt-4 leaves a 16px dead zone below the button that belongs to nothing
                hoverable, so the pointer always falls off on the way down. */}
            {failOpen && <div className={`absolute top-full left-0 z-10 mt-4 ${TOOLTIP_CLASSES}`}>{TIP}</div>}
          </span>
        ) : (
          // The hover wrapper contains both trigger and tooltip, and is also their positioning context
          // (`relative`), so the tooltip opens directly below the button. The gap between them is the
          // tooltip wrapper's own padding (pt-3), not margin: it is part of the hover wrapper, so the hit
          // area is continuous from the button down into the tooltip and moving across it never fires
          // mouseleave.
          <span
            className="relative inline-block"
            onMouseEnter={enter(setHovered)}
            onMouseLeave={() => setHovered(false)}
          >
            <button
              type="button"
              aria-describedby={`${id}-tip`}
              onFocus={enter(setFocused)}
              onBlur={() => setFocused(false)}
              className={TRIGGER_CLASSES}
            >
              <Info className="size-4" aria-hidden="true" />
              Delivery options
            </button>
            <div hidden={!open} className="absolute top-full left-0 z-10 pt-3">
              <div id={`${id}-tip`} role="tooltip" className={TOOLTIP_CLASSES}>
                {TIP}
              </div>
            </div>
          </span>
        )}

        <p className="mt-4 rounded-lg border border-slate-300 bg-slate-50 p-3 text-sm text-slate-800">
          Estimated delivery: <strong>Tue 30 Sep – Thu 2 Oct</strong>
        </p>
      </div>

      <p role="status" className="min-h-5 text-sm font-semibold text-slate-900">
        {status}
      </p>
    </div>
  )
}
