import { Check, CheckCircle2, XCircle } from 'lucide-react'
import { useId, useState } from 'react'
import { contrastRatio } from '../../lib/contrast'
import type { DemoVariant } from './types'

const BACKGROUND = '#ffffff'
const AA_NON_TEXT = 3

/** Unchecked checkbox border: #d1d5db (1.47:1, the pale border in the fail snippet) vs #6b7280 (4.83:1). */
const BORDER: Record<DemoVariant, string> = { fail: '#d1d5db', pass: '#6b7280' }

/** Checked state: blue-700 fill, which has 6.70:1 against white in both versions. */
const CHECKED = '#1d4ed8'

const OPTIONS = ['Email me order updates', 'Text me delivery alerts', 'Send me offers'] as const

export function NonTextContrastDemo({ variant }: { variant: DemoVariant }) {
  const id = useId()
  const [checked, setChecked] = useState<Record<string, boolean>>({ [OPTIONS[0]]: true })

  const border = BORDER[variant]
  const ratio = contrastRatio(border, BACKGROUND)
  const passes = ratio >= AA_NON_TEXT
  const ratioText = `${ratio.toFixed(2)}:1`

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-slate-300 bg-white p-4">
      <fieldset className="flex flex-col gap-1">
        <legend className="mb-1 text-sm font-bold text-slate-900">Notifications</legend>
        {OPTIONS.map((label, i) => {
          const isChecked = !!checked[label]
          return (
            <label
              key={label}
              htmlFor={`${id}-${i}`}
              className="flex min-h-11 cursor-pointer items-center gap-3 text-sm text-slate-900"
            >
              <span className="relative inline-flex size-6 shrink-0">
                {/* Native checkbox restyled: semantics and keyboard support stay intact. */}
                <input
                  id={`${id}-${i}`}
                  type="checkbox"
                  checked={isChecked}
                  onChange={(e) => setChecked((c) => ({ ...c, [label]: e.target.checked }))}
                  style={{
                    borderColor: isChecked ? CHECKED : border,
                    backgroundColor: isChecked ? CHECKED : BACKGROUND,
                  }}
                  className="peer size-6 cursor-pointer appearance-none rounded-md border-2 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
                />
                <Check
                  aria-hidden="true"
                  strokeWidth={3}
                  className="pointer-events-none absolute inset-1 hidden size-4 text-white peer-checked:block"
                />
              </span>
              {label}
            </label>
          )
        })}
      </fieldset>

      <p className={`flex items-start gap-2 text-sm font-semibold ${passes ? 'text-green-800' : 'text-red-800'}`}>
        {passes ? (
          <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        ) : (
          <XCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        )}
        <span>
          Unchecked border <span className="font-mono">{border}</span> on white: {ratioText},{' '}
          {passes ? 'passes' : 'fails'} (needs {AA_NON_TEXT}:1)
        </span>
      </p>
    </div>
  )
}
