import { Moon } from 'lucide-react'
import { useState } from 'react'
import type { DemoVariant } from './types'

function trackClasses(on: boolean) {
  return `relative inline-flex h-8 w-14 shrink-0 cursor-pointer items-center rounded-full transition-colors ${
    on ? 'bg-blue-700' : 'bg-slate-500'
  }`
}

function Knob({ on }: { on: boolean }) {
  return (
    <span
      className={`inline-flex size-6 items-center justify-center rounded-full bg-white text-slate-700 shadow motion-safe:transition-transform ${
        on ? 'translate-x-7' : 'translate-x-1'
      }`}
    >
      <Moon className="size-4" aria-hidden="true" />
    </span>
  )
}

export function SwitchDemo({ variant }: { variant: DemoVariant }) {
  const [on, setOn] = useState(false)
  const toggle = () => setOn((v) => !v)

  // What the browser exposes to assistive technology for each version.
  const exposed =
    variant === 'fail'
      ? { role: 'generic (none)', name: '(none)', state: 'not exposed' }
      : { role: 'switch', name: 'Dark mode', state: on ? 'on (aria-checked="true")' : 'off (aria-checked="false")' }

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-slate-300 bg-white p-4">
      <div>
        {variant === 'fail' ? (
          // Intentional failure: no role, no name, state lives only in a class.
          // It IS focusable and keyboard-operable, so this demo fails 4.1.2 alone, not 2.1.1 or 2.4.7.
          <div
            tabIndex={0}
            onClick={toggle}
            onKeyDown={(e) => {
              if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault() // stop Space from scrolling the page
                toggle()
              }
            }}
            className={`${trackClasses(on)} focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-blue-700`}
          >
            <Knob on={on} />
          </div>
        ) : (
          <button
            type="button"
            role="switch"
            aria-checked={on}
            aria-label="Dark mode"
            onClick={toggle}
            className={`${trackClasses(on)} focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-blue-700`}
          >
            <Knob on={on} />
          </button>
        )}
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold tracking-wide text-slate-600 uppercase">
          Accessibility tree
        </p>
        <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 font-mono text-sm">
          <dt className="text-slate-600">Role</dt>
          <dd className="text-slate-900">{exposed.role}</dd>
          <dt className="text-slate-600">Name</dt>
          <dd className="text-slate-900">{exposed.name}</dd>
          <dt className="text-slate-600">State</dt>
          <dd className="text-slate-900">{exposed.state}</dd>
        </dl>
      </div>
    </div>
  )
}
