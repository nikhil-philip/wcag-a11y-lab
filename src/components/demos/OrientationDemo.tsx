import { RotateCw, Send, Smartphone } from 'lucide-react'
import { useId, useLayoutEffect, useRef, useState } from 'react'
import type { DemoVariant } from './types'

const FOCUS = 'focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-blue-700'

/** Screen size (px) of the mock phone in portrait; landscape swaps the two. */
const SHORT = 190
const LONG = 330
const BEZEL = 8

const MESSAGES = [
  { from: 'them', text: 'Are we still on for 6?' },
  { from: 'me', text: 'Yes! See you at the café.' },
  { from: 'them', text: 'Great, I’ll grab a table.' },
] as const

const CHATS = ['Priya', 'Arjun', 'Book club'] as const

/**
 * The messaging app. `landscape` stands in for `@media (orientation: landscape)`: in landscape the
 * same grid gains a chats column instead of assuming a tall, narrow screen.
 */
function MessagingApp({ landscape, inputId }: { landscape: boolean; inputId: string }) {
  return (
    <div className={`grid h-full bg-white text-slate-900 ${landscape ? 'grid-cols-[38%_1fr]' : 'grid-cols-1'}`}>
      {landscape && (
        <ul aria-label="Chats" className="flex flex-col border-r border-slate-200 bg-slate-50 text-xs">
          {CHATS.map((name, i) => (
            <li key={name} className={`truncate px-2 py-2 ${i === 0 ? 'bg-blue-100 font-semibold' : ''}`}>
              {name}
            </li>
          ))}
        </ul>
      )}
      <div className="flex min-h-0 min-w-0 flex-col">
        <p className="border-b border-slate-200 px-2 py-1.5 text-xs font-bold">Priya</p>
        <ul aria-label="Messages" className="flex min-h-0 flex-1 flex-col gap-1 overflow-hidden p-2 text-xs">
          {MESSAGES.map((m, i) => (
            <li
              key={i}
              className={`max-w-[85%] rounded-lg px-2 py-1 ${m.from === 'me' ? 'self-end bg-blue-700 text-white' : 'self-start bg-slate-200'}`}
            >
              {m.text}
            </li>
          ))}
        </ul>
        <div className="flex gap-1 border-t border-slate-200 p-1.5">
          <label htmlFor={inputId} className="sr-only">
            Message
          </label>
          <input
            id={inputId}
            type="text"
            placeholder="Message"
            className={`min-h-8 min-w-0 flex-1 rounded-full border border-slate-400 px-2 text-xs placeholder:text-slate-600 ${FOCUS}`}
          />
          <button
            type="button"
            aria-label="Send"
            className={`inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full bg-blue-700 text-white ${FOCUS}`}
          >
            <Send className="size-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  )
}

export function OrientationDemo({ variant }: { variant: DemoVariant }) {
  const id = useId()
  const [landscape, setLandscape] = useState(false)
  const stageRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  const screenW = landscape ? LONG : SHORT
  const screenH = landscape ? SHORT : LONG
  const frameW = screenW + BEZEL * 2
  const frameH = screenH + BEZEL * 2

  // Shrink the phone to fit narrow panels instead of overflowing them.
  useLayoutEffect(() => {
    const stage = stageRef.current
    if (!stage) return
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setScale(Math.min(1, entry.contentRect.width / frameW))
    })
    observer.observe(stage)
    return () => observer.disconnect()
  }, [frameW])

  const locked = variant === 'fail' && landscape

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-slate-300 bg-white p-4">
      <p className="text-sm text-slate-700">
        Turn the phone to landscape, as if it were mounted on a wheelchair or a stand. The messaging app is a
        sample: the message field and Send button are for illustration and don't send anything.
      </p>

      <div ref={stageRef} className="flex justify-center overflow-hidden" style={{ height: frameH * scale }}>
        <div
          style={{ width: frameW, height: frameH, transform: `scale(${scale})` }}
          className="relative shrink-0 origin-top rounded-2xl bg-slate-800 motion-safe:transition-[width,height] motion-safe:duration-300"
        >
          <div
            className="absolute overflow-hidden rounded-lg bg-white"
            style={{ inset: BEZEL }}
          >
            {locked ? (
              // Intentional failure: the app insists on portrait, so in landscape it renders its portrait
              // layout turned on its side: `transform: rotate(-90deg)`.
              <div
                className="absolute top-1/2 left-1/2"
                style={{ width: SHORT, height: LONG, transform: 'translate(-50%, -50%) rotate(-90deg)' }}
              >
                <MessagingApp landscape={false} inputId={`${id}-msg`} />
              </div>
            ) : (
              <MessagingApp landscape={variant === 'pass' && landscape} inputId={`${id}-msg`} />
            )}
          </div>
        </div>
      </div>

      {/* The "hardware": outside the app, standing in for physically turning the device. */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-dashed border-slate-400 p-3">
        <p className="flex items-center gap-2 text-xs font-semibold text-slate-600">
          <Smartphone className="size-4" aria-hidden="true" />
          Device (simulated)
        </p>
        <button
          type="button"
          onClick={() => setLandscape((l) => !l)}
          className={`inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lg bg-slate-800 px-4 text-sm font-semibold text-white hover:bg-slate-700 ${FOCUS}`}
        >
          <RotateCw className="size-4" aria-hidden="true" />
          {landscape ? 'Simulate device rotate (portrait)' : 'Simulate device rotate (landscape)'}
        </button>
      </div>

      <p
        role="status"
        className={`min-h-5 text-sm font-semibold ${locked ? 'text-red-800' : landscape ? 'text-green-800' : 'text-slate-900'}`}
      >
        {!landscape
          ? 'Portrait.'
          : locked
            ? 'Landscape, but the app is locked to portrait: everything is sideways. Anyone whose device is fixed in landscape is stuck.'
            : 'Landscape: the layout adapts, with the chats list beside the conversation.'}
      </p>
    </div>
  )
}
