import { Mic, MicOff } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import type { DemoVariant } from './types'

const FOCUS = 'focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-blue-700'

const SHORTCUT: Record<DemoVariant, { label: string; aria: string }> = {
  fail: { label: 'M', aria: 'M' },
  pass: { label: 'Alt + Shift + M', aria: 'Alt+Shift+M' },
}

function isTextEntry(target: EventTarget | null): boolean {
  return target instanceof Element && target.closest('input, textarea, select, [contenteditable]') !== null
}

export function KeyShortcutsDemo({ variant }: { variant: DemoVariant }) {
  const id = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const [muted, setMuted] = useState(false)
  const [hijacked, setHijacked] = useState(0)

  // The failing listener sits on this demo's box, which stands in for the whole page. A real `document`
  // listener would also fire while you type in the other panel and everywhere else in the lab.
  // Keystrokes in the textarea bubble up to it, so it sees every key the user types.
  // The passing listener is on `document`, like a real shortcut: Alt+Shift+M works wherever focus is,
  // and needing Alt means it can't steal typed letters elsewhere in the lab.
  useEffect(() => {
    const root: GlobalEventHandlers | null = variant === 'fail' ? rootRef.current : document
    if (!root) return

    function onKeyDown(e: KeyboardEvent) {
      if (e.isComposing) return // mid-IME composition, the key belongs to the input method

      if (variant === 'fail') {
        // Intentional failure: a bare "m" (or "M") toggles mute wherever it was pressed, with no check
        // of e.target, and preventDefault() swallows the letter the user meant to type.
        if (e.ctrlKey || e.metaKey || e.altKey || e.key.toLowerCase() !== 'm') return
        e.preventDefault()
        if (e.repeat) return
        setMuted((m) => !m)
        if (isTextEntry(e.target)) setHijacked((n) => n + 1)
      } else {
        // Needs Alt+Shift: some browsers (e.g. Brave) keep plain Alt+M for themselves.
        // Ctrl is ruled out because AltGr reports as Ctrl+Alt on Windows and types characters.
        // e.code, not e.key: on macOS Option+Shift+M reports key "Â", and on other layouts M may not be "m".
        if (!e.altKey || !e.shiftKey || e.ctrlKey || e.metaKey || e.code !== 'KeyM') return
        e.preventDefault() // stop Option+Shift+M typing "Â" into the textarea on macOS
        if (e.repeat) return
        setMuted((m) => !m)
      }
    }

    root.addEventListener('keydown', onKeyDown)
    return () => root.removeEventListener('keydown', onKeyDown)
  }, [variant])

  const shortcut = SHORTCUT[variant]
  const MicIcon = muted ? MicOff : Mic

  return (
    <div ref={rootRef} className="flex flex-col gap-4 rounded-lg border border-slate-300 bg-white p-4">
      <p className="text-sm text-slate-700">
        Type <strong>"my message"</strong> in the Feedback box
        {variant === 'pass' && (
          <>
            , then press <kbd className="rounded border border-slate-400 px-1 font-mono">Alt</kbd> +{' '}
            <kbd className="rounded border border-slate-400 px-1 font-mono">Shift</kbd> +{' '}
            <kbd className="rounded border border-slate-400 px-1 font-mono">M</kbd>
          </>
        )}
        .
      </p>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-300 bg-slate-50 p-3">
        <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <MicIcon className={`size-5 ${muted ? 'text-red-700' : 'text-green-700'}`} aria-hidden="true" />
          Team call
        </p>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-600" aria-hidden="true">
            Shortcut: <kbd className="rounded border border-slate-400 px-1 font-mono">{shortcut.label}</kbd>
          </span>
          <button
            type="button"
            aria-pressed={muted}
            aria-keyshortcuts={shortcut.aria}
            onClick={() => setMuted((m) => !m)}
            className={`min-h-11 cursor-pointer rounded-lg border-2 px-4 text-sm font-semibold ${FOCUS} ${
              muted
                ? 'border-red-700 bg-red-700 text-white hover:bg-red-800'
                : 'border-slate-500 bg-white text-slate-900 hover:bg-slate-100'
            }`}
          >
            Mute
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor={`${id}-feedback`} className="text-sm font-semibold text-slate-900">
          Feedback
        </label>
        <textarea
          id={`${id}-feedback`}
          rows={3}
          className={`w-full resize-y rounded-lg border-2 border-slate-500 bg-white p-2 text-sm text-slate-900 ${FOCUS}`}
        />
      </div>

      <p
        role="status"
        className={`min-h-5 text-sm font-semibold ${hijacked > 0 ? 'text-red-800' : 'text-slate-900'}`}
      >
        {muted ? 'Microphone muted. ' : 'Microphone on. '}
        {variant === 'fail'
          ? hijacked > 0 &&
            `Typing "m" toggled mute ${hijacked} ${hijacked === 1 ? 'time' : 'times'}, and each "m" was lost.`
          : `"m" types normally; only ${shortcut.label} toggles mute.`}
      </p>
    </div>
  )
}
