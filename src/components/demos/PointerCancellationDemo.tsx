import { ShoppingCart } from 'lucide-react'
import { useEffect, useRef, useState, type MouseEvent, type PointerEvent } from 'react'
import type { DemoVariant } from './types'

const FOCUS = 'focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-blue-700'

type Tone = 'neutral' | 'fired' | 'cancelled' | 'late'

interface LogEntry {
  id: number
  text: string
  tone: Tone
}

const TONE_CLASSES: Record<Tone, string> = {
  neutral: 'text-slate-700',
  fired: 'font-semibold text-blue-800',
  cancelled: 'font-semibold text-green-800',
  late: 'font-semibold text-red-800',
}

/** Only the most recent entries are kept, so the log doesn't grow without end. */
const MAX_ENTRIES = 6

export function PointerCancellationDemo({ variant }: { variant: DemoVariant }) {
  const [log, setLog] = useState<readonly LogEntry[]>([])
  const [orders, setOrders] = useState(0)
  const nextId = useRef(0)
  // Removes the window listeners for the press in progress (and on unmount).
  const endPress = useRef<AbortController | null>(null)

  useEffect(() => () => endPress.current?.abort(), [])

  function add(text: string, tone: Tone = 'neutral') {
    const entry = { id: nextId.current++, text, tone }
    setLog((l) => [...l, entry].slice(-MAX_ENTRIES))
  }

  function fire() {
    setOrders((n) => n + 1)
    add('Action fired! Order submitted.', 'fired')
  }

  function onPointerDown(e: PointerEvent<HTMLButtonElement>) {
    if (!e.isPrimary || e.button !== 0) return
    add('Pressed down on the button.')
    // Intentional failure: the order goes through on the down-event, before the user can back out.
    if (variant === 'fail') fire()

    // Watch where the press ends. The release can happen anywhere, so listen on window, and check
    // what is under the pointer rather than the event target, which touch pointer capture can pin
    // to the button.
    const button = e.currentTarget
    endPress.current?.abort()
    const controller = new AbortController()
    endPress.current = controller
    const opts = { signal: controller.signal }

    window.addEventListener(
      'pointerup',
      (up) => {
        if (up.pointerId !== e.pointerId) return
        controller.abort()
        const over = document.elementFromPoint(up.clientX, up.clientY)
        if (over && button.contains(over)) {
          // Pass: the click event, which follows, submits the order.
          add('Released on the button.')
        } else if (variant === 'fail') {
          add('Released off the button, but too late: the order was already submitted.', 'late')
        } else {
          add('Released off the button: cancelled, nothing was submitted.', 'cancelled')
        }
      },
      opts,
    )
    window.addEventListener(
      'pointercancel',
      (cancel) => {
        if (cancel.pointerId !== e.pointerId) return
        controller.abort()
        add(
          variant === 'fail'
            ? 'Press interrupted (e.g. by scrolling), but the order was already submitted.'
            : 'Press interrupted (e.g. by scrolling): nothing was submitted.',
          variant === 'fail' ? 'late' : 'cancelled',
        )
      },
      opts,
    )
  }

  function onClick(e: MouseEvent<HTMLButtonElement>) {
    // click fires on release, and only if the press started and ended on the button.
    if (variant === 'pass') return fire()
    // Fail: pointer presses were handled on the down-event. A click with detail 0 came from Enter or
    // Space, so the button still works from the keyboard; only pointer timing differs.
    if (e.detail === 0) fire()
  }

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-slate-300 bg-white p-4">
      <p className="text-sm text-slate-700">
        Press and hold "Submit order", drag the pointer off the button, then let go.
      </p>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-300 bg-slate-50 p-3">
        <div className="text-sm text-slate-900">
          <p className="font-semibold">1 × Wireless headphones</p>
          <p className="text-slate-700">Total $59.00</p>
        </div>
        <button
          type="button"
          onPointerDown={onPointerDown}
          onClick={onClick}
          className={`inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lg bg-blue-700 px-4 text-sm font-semibold text-white select-none hover:bg-blue-800 active:bg-blue-900 ${FOCUS}`}
        >
          <ShoppingCart className="size-4" aria-hidden="true" />
          Submit order
        </button>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="text-xs font-semibold tracking-wide text-slate-600 uppercase">Event log</p>
          {log.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setLog([])
                setOrders(0)
              }}
              className={`min-h-6 cursor-pointer rounded px-1 text-xs font-semibold text-blue-800 underline ${FOCUS}`}
            >
              Clear log
            </button>
          )}
        </div>
        {/* Always rendered: a live region must exist before entries are added for them to be announced.
            The log role is on a wrapper, so the <ol> keeps its list semantics. */}
        <div role="log" aria-label="Event log">
          <ol className="flex flex-col gap-1 font-mono text-sm">
            {log.map((entry) => (
              <li key={entry.id} className={TONE_CLASSES[entry.tone]}>
                {entry.text}
              </li>
            ))}
          </ol>
        </div>
        {log.length === 0 && <p className="text-sm text-slate-700">Nothing yet.</p>}
      </div>

      <p className={`text-sm font-semibold ${orders > 0 ? 'text-slate-900' : 'text-slate-700'}`}>
        Orders submitted: {orders}
      </p>
    </div>
  )
}
