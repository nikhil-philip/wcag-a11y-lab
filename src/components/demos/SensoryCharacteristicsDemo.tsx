import { ArrowRight, Smartphone } from 'lucide-react'
import { useState } from 'react'
import type { DemoVariant } from './types'

const INSTRUCTION: Record<DemoVariant, string> = {
  fail: 'Click the round green button on the right to continue.',
  pass: 'Click the "Next" button to continue.',
}

const FOCUS = 'focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-blue-700'

export function SensoryCharacteristicsDemo({ variant }: { variant: DemoVariant }) {
  const [mobile, setMobile] = useState(false)

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-slate-300 bg-white p-4">
      <button
        type="button"
        aria-pressed={mobile}
        onClick={() => setMobile((m) => !m)}
        className={`inline-flex min-h-11 cursor-pointer items-center gap-2 self-start rounded-lg border-2 px-4 text-sm font-semibold ${FOCUS} ${
          mobile
            ? 'border-blue-700 bg-blue-700 text-white hover:bg-blue-800'
            : 'border-slate-500 bg-white text-slate-900 hover:bg-slate-100'
        }`}
      >
        <Smartphone className="size-4" aria-hidden="true" />
        Simulate mobile layout
      </button>

      <p className="-mb-2 text-sm text-slate-700">Sample form. The buttons are for illustration and don't do anything.</p>

      <div className="flex flex-col gap-3 rounded-lg border border-slate-300 bg-slate-50 p-3">
        <p className="text-xs font-semibold text-slate-600">Step 1 of 3: Delivery address</p>
        <p className="text-sm text-slate-900">{INSTRUCTION[variant]}</p>

        {/* On mobile the buttons stack (in DOM order, so focus order still matches), and "on the right" stops being true. */}
        <div className={`flex gap-2 ${mobile ? 'flex-col items-stretch' : 'flex-wrap items-center justify-end'}`}>
          <button
            type="button"
            className={`min-h-11 cursor-pointer rounded-md border-2 border-slate-500 bg-white px-4 text-sm font-semibold text-slate-900 hover:bg-slate-100 ${FOCUS}`}
          >
            Back
          </button>
          <button
            type="button"
            className={`min-h-11 cursor-pointer rounded-full border-2 border-slate-500 bg-white px-4 text-sm font-semibold text-slate-900 hover:bg-slate-100 ${FOCUS}`}
          >
            Save draft
          </button>
          {variant === 'fail' ? (
            // Intentional failure: the only way the instruction identifies it is shape, colour and position.
            <button
              type="button"
              aria-label="Next"
              className={`inline-flex size-11 shrink-0 cursor-pointer items-center justify-center self-center rounded-full bg-green-700 text-white hover:bg-green-800 ${FOCUS}`}
            >
              <ArrowRight className="size-5" aria-hidden="true" />
            </button>
          ) : (
            <button
              type="button"
              className={`inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full bg-green-700 px-5 text-sm font-semibold text-white hover:bg-green-800 ${FOCUS}`}
            >
              Next
              <ArrowRight className="size-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold tracking-wide text-slate-600 uppercase">Screen reader hears</p>
        <p className="font-mono text-sm text-slate-900">"Back, button" · "Save draft, button" · "Next, button"</p>
        <p className={`mt-2 text-sm font-semibold ${variant === 'fail' ? 'text-red-800' : 'text-green-800'}`}>
          {variant === 'fail'
            ? '"Round", "green" and "on the right" are never announced, and on mobile the button isn\'t on the right.'
            : 'The instruction uses the button\'s own name, which works for every user and every layout.'}
        </p>
      </div>
    </div>
  )
}
