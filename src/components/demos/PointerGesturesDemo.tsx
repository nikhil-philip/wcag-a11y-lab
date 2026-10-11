import { ArrowLeft, Trash2, Undo2 } from 'lucide-react'
import { useEffect, useRef, useState, type PointerEvent } from 'react'
import type { DemoVariant } from './types'

interface Message {
  id: number
  from: string
  subject: string
}

const MESSAGES: readonly Message[] = [
  { id: 1, from: 'Priya', subject: 'Lunch on Friday?' },
  { id: 2, from: 'Arjun', subject: 'Slides for the review' },
  { id: 3, from: 'Meera', subject: 'Invoice #2291' },
]

/** How far left (px) a row must be dragged before letting go deletes it. */
const DELETE_THRESHOLD = 96

const FOCUS = 'focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-blue-700'

interface Drag {
  id: number
  pointerId: number
  startX: number
  dx: number
}

export function PointerGesturesDemo({ variant }: { variant: DemoVariant }) {
  const [messages, setMessages] = useState<readonly Message[]>(MESSAGES)
  const [drag, setDrag] = useState<Drag | null>(null)
  const [lastDeleted, setLastDeleted] = useState<{ from: string; how: 'swipe' | 'button' } | null>(null)

  // Deleting with the button removes the focused button, so focus moves to a neighbour instead of
  // falling back to the top of the page.
  const deleteButtons = useRef(new Map<number, HTMLButtonElement>())
  const restoreRef = useRef<HTMLButtonElement>(null)
  const refocusIndex = useRef<number | null>(null)

  useEffect(() => {
    if (refocusIndex.current === null) return
    const next = messages[Math.min(refocusIndex.current, messages.length - 1)]
    ;(next ? deleteButtons.current.get(next.id) : restoreRef.current)?.focus()
    refocusIndex.current = null
  }, [messages])

  function remove(message: Message, how: 'swipe' | 'button') {
    if (how === 'button') refocusIndex.current = messages.indexOf(message)
    setMessages((list) => list.filter((m) => m.id !== message.id))
    setLastDeleted({ from: message.from, how })
  }

  // The swipe: a path-based gesture. Pointer capture keeps the row tracking the finger or mouse even
  // if it leaves the row.
  function onPointerDown(e: PointerEvent<HTMLDivElement>, message: Message) {
    if (!e.isPrimary || e.button !== 0) return
    if (e.target instanceof Element && e.target.closest('button')) return // let buttons be buttons
    e.currentTarget.setPointerCapture(e.pointerId)
    setDrag({ id: message.id, pointerId: e.pointerId, startX: e.clientX, dx: 0 })
  }

  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    if (!drag || e.pointerId !== drag.pointerId) return
    // Left only; overshooting past the reveal area feels elastic.
    const raw = Math.min(0, e.clientX - drag.startX)
    setDrag({ ...drag, dx: raw < -DELETE_THRESHOLD ? -DELETE_THRESHOLD + (raw + DELETE_THRESHOLD) / 3 : raw })
  }

  function onPointerUp(e: PointerEvent<HTMLDivElement>, message: Message) {
    if (!drag || e.pointerId !== drag.pointerId) return
    if (drag.dx <= -DELETE_THRESHOLD * 0.9) remove(message, 'swipe')
    setDrag(null)
  }

  const status = lastDeleted
    ? `Deleted message from ${lastDeleted.from} by ${lastDeleted.how === 'swipe' ? 'swiping' : 'pressing Delete'}.`
    : variant === 'fail'
      ? 'Try deleting a message with a single tap or click, or with the keyboard.'
      : 'Swipe still works, or use the Delete button with one tap, click or key press.'

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-slate-300 bg-white p-4">
      <p className="flex items-center gap-1 text-sm text-slate-700">
        <ArrowLeft className="size-4" aria-hidden="true" />
        Swipe left to delete
      </p>

      {messages.length > 0 ? (
        <ul aria-label="Inbox" className="flex flex-col gap-2">
          {messages.map((message) => {
            const dx = drag?.id === message.id ? drag.dx : 0
            const armed = dx <= -DELETE_THRESHOLD * 0.9
            return (
              <li key={message.id} className="relative overflow-hidden rounded-lg">
                {/* Revealed behind the row as it slides; purely visual. */}
                <div
                  aria-hidden="true"
                  className={`absolute inset-0 flex items-center justify-end gap-1 px-4 text-sm font-semibold text-white ${
                    armed ? 'bg-red-700' : 'bg-red-500'
                  }`}
                >
                  <Trash2 className="size-4" />
                  {armed ? 'Release to delete' : 'Delete'}
                </div>
                <div
                  onPointerDown={(e) => onPointerDown(e, message)}
                  onPointerMove={onPointerMove}
                  onPointerUp={(e) => onPointerUp(e, message)}
                  onPointerCancel={() => setDrag(null)}
                  style={{ transform: `translateX(${dx}px)` }}
                  className={`relative flex cursor-grab touch-pan-y items-center justify-between gap-2 rounded-lg border border-slate-300 bg-slate-50 p-3 select-none active:cursor-grabbing ${
                    drag?.id === message.id ? '' : 'transition-transform duration-200 motion-reduce:transition-none'
                  }`}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900">{message.from}</p>
                    <p className="truncate text-sm text-slate-700">{message.subject}</p>
                  </div>
                  {/* Intentional failure (fail version): no single-pointer or keyboard alternative. */}
                  {variant === 'pass' && (
                    <button
                      type="button"
                      ref={(el) => {
                        if (el) deleteButtons.current.set(message.id, el)
                        else deleteButtons.current.delete(message.id)
                      }}
                      onClick={() => remove(message, 'button')}
                      className={`inline-flex min-h-11 shrink-0 cursor-pointer items-center gap-1 rounded-lg border-2 border-red-700 bg-white px-3 text-sm font-semibold text-red-800 hover:bg-red-50 ${FOCUS}`}
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                      Delete<span className="sr-only"> message from {message.from}</span>
                    </button>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      ) : (
        <p className="rounded-lg border border-dashed border-slate-400 p-3 text-center text-sm text-slate-700">
          Inbox empty.
        </p>
      )}

      {messages.length < MESSAGES.length && (
        <button
          ref={restoreRef}
          type="button"
          onClick={() => {
            setMessages(MESSAGES)
            setLastDeleted(null)
          }}
          className={`inline-flex min-h-11 cursor-pointer items-center gap-2 self-start rounded-lg border-2 border-slate-500 bg-white px-4 text-sm font-semibold text-slate-900 hover:bg-slate-100 ${FOCUS}`}
        >
          <Undo2 className="size-4" aria-hidden="true" />
          Reset demo
        </button>
      )}

      <p role="status" className="min-h-5 text-sm font-semibold text-slate-900">
        {status}
      </p>
    </div>
  )
}
