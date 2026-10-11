import { Mic, Send } from 'lucide-react'
import { useId, useRef, useState } from 'react'
import type { DemoVariant } from './types'

const VISIBLE_LABEL = 'Send'

const ARIA_LABEL: Record<DemoVariant, string> = {
  // Intentional failure: the accessible name doesn't contain the visible word "Send".
  fail: 'Submit message',
  pass: 'Send message',
}

type Result = { ok: true } | { ok: false; name: string }

export function LabelInNameDemo({ variant }: { variant: DemoVariant }) {
  const id = useId()
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [result, setResult] = useState<Result | null>(null)

  // Voice control matches the spoken words against each control's accessible name,
  // not against what is painted on screen.
  function simulateVoiceCommand() {
    const button = buttonRef.current
    if (!button) return
    const name = button.getAttribute('aria-label') ?? button.textContent ?? ''
    if (new RegExp(`\\b${VISIBLE_LABEL}\\b`, 'i').test(name)) {
      button.click()
    } else {
      setResult({ ok: false, name })
    }
  }

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-slate-300 bg-white p-4">
      <div className="flex flex-col gap-2 rounded-lg border border-slate-300 bg-slate-50 p-3">
        <label htmlFor={`${id}-msg`} className="text-sm font-semibold text-slate-900">
          Message
        </label>
        <textarea
          id={`${id}-msg`}
          defaultValue="Hi, is the blue jacket back in stock?"
          className="min-h-20 w-full rounded-lg border-2 border-slate-500 bg-white p-2 text-sm text-slate-900 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
        />
        <button
          ref={buttonRef}
          type="button"
          aria-label={ARIA_LABEL[variant]}
          onClick={() => setResult({ ok: true })}
          className="inline-flex min-h-11 cursor-pointer items-center gap-2 self-end rounded-lg bg-blue-700 px-4 text-sm font-semibold text-white hover:bg-blue-800 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
        >
          <Send className="size-4" aria-hidden="true" />
          {VISIBLE_LABEL}
        </button>
      </div>

      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 font-mono text-sm">
        <dt className="text-slate-600">Visible label</dt>
        <dd className="text-slate-900">"{VISIBLE_LABEL}"</dd>
        <dt className="text-slate-600">Accessible name</dt>
        <dd className="text-slate-900">"{ARIA_LABEL[variant]}"</dd>
      </dl>

      <button
        type="button"
        onClick={simulateVoiceCommand}
        className="inline-flex min-h-11 cursor-pointer items-center gap-2 self-start rounded-lg border-2 border-slate-500 bg-white px-4 text-sm font-semibold text-slate-900 hover:bg-slate-100 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
      >
        <Mic className="size-4" aria-hidden="true" />
        Simulate voice command: "Click Send"
      </button>

      <p
        role="status"
        className={`min-h-5 text-sm font-semibold ${result === null ? '' : result.ok ? 'text-green-800' : 'text-red-800'}`}
      >
        {result === null
          ? ''
          : result.ok
            ? 'Matched "Send message". Message sent.'
            : `Command failed: no element found matching "${VISIBLE_LABEL}". The button is called "${result.name}".`}
      </p>
    </div>
  )
}
