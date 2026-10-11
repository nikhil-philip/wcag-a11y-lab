import { Smartphone, Vibrate, X } from 'lucide-react'
import { useId, useRef, useState } from 'react'
import type { DemoVariant } from './types'

const FOCUS = 'focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-blue-700'

const STARTER = 'Pick up dry cleaning, call the bank about the card, book dentist for Tuesday.'

export function MotionActuationDemo({ variant }: { variant: DemoVariant }) {
  const id = useId()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [notes, setNotes] = useState(STARTER)
  const [shakeToUndo, setShakeToUndo] = useState(true)
  const deviceRef = useRef<HTMLDivElement>(null)
  const [status, setStatus] = useState<{ text: string; tone: 'bad' | 'good' | 'neutral' } | null>(null)

  function clear(how: 'shake' | 'button') {
    const hadText = notes.trim() !== ''
    setNotes('')
    if (how === 'button') {
      setStatus({ text: 'Notes cleared.', tone: 'neutral' })
      textareaRef.current?.focus()
    } else {
      setStatus({
        text: hadText ? 'Shake detected: your notes were erased.' : 'Shake detected: nothing left to erase.',
        tone: 'bad',
      })
    }
  }

  // Stands in for a devicemotion listener crossing its shake threshold.
  function onShake() {
    // Wobble the "phone" without re-rendering it, so the textarea keeps focus and caret position.
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      deviceRef.current?.animate(
        [0, -6, 6, -4, 4, 0].map((x) => ({ transform: `translateX(${x}px)` })),
        { duration: 400, easing: 'ease-in-out' },
      )
    }
    // Intentional failure (fail version): every shake erases the notes, and it can't be switched off.
    if (variant === 'fail' || shakeToUndo) clear('shake')
    else setStatus({ text: 'Shake ignored: Shake to undo is turned off.', tone: 'good' })
  }

  const statusClass =
    status?.tone === 'bad' ? 'text-red-800' : status?.tone === 'good' ? 'text-green-800' : 'text-slate-900'

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-slate-300 bg-white p-4">
      <p className="text-sm text-slate-700">
        Imagine the phone bumping in a bag, or a hand with a tremor: press "Simulate device shake".
        {variant === 'pass' && ' Then turn Shake to undo off and try again.'}
      </p>

      {/* The app */}
      <div ref={deviceRef} className="flex flex-col gap-2 rounded-2xl border-4 border-slate-800 bg-slate-50 p-3">
        <div className="flex items-end justify-between gap-2">
          <label htmlFor={`${id}-notes`} className="text-sm font-semibold text-slate-900">
            Notes
          </label>
          {variant === 'pass' && (
            <button
              type="button"
              onClick={() => clear('button')}
              className={`inline-flex min-h-11 cursor-pointer items-center gap-1 rounded-lg border-2 border-slate-500 bg-white px-3 text-sm font-semibold text-slate-900 hover:bg-slate-100 ${FOCUS}`}
            >
              <X className="size-4" aria-hidden="true" />
              Clear text
            </button>
          )}
        </div>
        <textarea
          ref={textareaRef}
          id={`${id}-notes`}
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className={`w-full resize-y rounded-lg border-2 border-slate-500 bg-white p-2 text-sm text-slate-900 ${FOCUS}`}
        />
        {variant === 'pass' && (
          <label className="flex min-h-11 cursor-pointer items-center gap-2 text-sm text-slate-900">
            <input
              type="checkbox"
              checked={shakeToUndo}
              onChange={(e) => {
                setShakeToUndo(e.target.checked)
                setStatus(null)
              }}
              className="size-5 shrink-0 accent-blue-700 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
            />
            Shake to undo
          </label>
        )}
      </div>

      {/* The "hardware": outside the app, standing in for physically moving the device. */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-dashed border-slate-400 p-3">
        <p className="flex items-center gap-2 text-xs font-semibold text-slate-600">
          <Smartphone className="size-4" aria-hidden="true" />
          Device sensors (simulated)
        </p>
        <button
          type="button"
          onClick={onShake}
          className={`inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lg bg-slate-800 px-4 text-sm font-semibold text-white hover:bg-slate-700 ${FOCUS}`}
        >
          <Vibrate className="size-4" aria-hidden="true" />
          Simulate device shake
        </button>
      </div>

      <p role="status" className={`min-h-5 text-sm font-semibold ${statusClass}`}>
        {status?.text ??
          (variant === 'fail'
            ? 'There is no on-screen way to clear the notes, and shaking cannot be turned off.'
            : '')}
      </p>

      {notes === '' && (
        <button
          type="button"
          onClick={() => {
            setNotes(STARTER)
            setStatus(null)
          }}
          className={`inline-flex min-h-11 cursor-pointer items-center self-start rounded-lg border-2 border-slate-500 bg-white px-4 text-sm font-semibold text-slate-900 hover:bg-slate-100 ${FOCUS}`}
        >
          Reset demo
        </button>
      )}
    </div>
  )
}
