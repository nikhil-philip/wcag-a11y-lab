import { CheckCircle2, XCircle } from 'lucide-react'
import { useId } from 'react'
import type { DemoVariant } from './types'

interface Field {
  key: string
  label: string
  type: 'text' | 'email' | 'tel'
  /** The HTML autocomplete token that names this field's purpose. */
  token: string
  /** A generated name that says nothing about the purpose (fail version). */
  failName: string
}

const FIELDS: readonly Field[] = [
  { key: 'first', label: 'First name', type: 'text', token: 'given-name', failName: 'field_1' },
  { key: 'email', label: 'Email', type: 'email', token: 'email', failName: 'field_2' },
  { key: 'phone', label: 'Phone', type: 'tel', token: 'tel', failName: 'field_3' },
]

const INPUT_CLASSES =
  'min-h-11 w-full rounded-lg border-2 border-slate-500 bg-white px-3 text-sm text-slate-900 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-blue-700'

export function IdentifyInputPurposeDemo({ variant }: { variant: DemoVariant }) {
  const id = useId()

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-slate-300 bg-white p-4">
      <p className="text-sm text-slate-700">
        Click into a field and see whether your browser or password manager offers to fill it in.
      </p>

      <form
        aria-label={`Registration (${variant} example)`}
        onSubmit={(e) => e.preventDefault()}
        className="flex flex-col gap-3 rounded-lg border border-slate-300 bg-slate-50 p-3"
      >
        {FIELDS.map((field) => (
          <div key={field.key} className="flex flex-col gap-1">
            <label htmlFor={`${id}-${field.key}`} className="text-sm font-semibold text-slate-900">
              {field.label}
            </label>
            <input
              id={`${id}-${field.key}`}
              // Intentional failure: no autocomplete, and a generated name that says nothing about the purpose.
              name={variant === 'fail' ? field.failName : field.token}
              type={field.type}
              autoComplete={variant === 'pass' ? field.token : undefined}
              className={INPUT_CLASSES}
            />
          </div>
        ))}
      </form>

      <div>
        <p className="mb-2 text-xs font-semibold tracking-wide text-slate-600 uppercase">Purpose in the code</p>
        <ul className="flex flex-col gap-1 text-sm">
          {FIELDS.map((field) => (
            <li key={field.key} className="flex items-center gap-1.5">
              {variant === 'pass' ? (
                <CheckCircle2 className="size-4 shrink-0 text-green-700" aria-hidden="true" />
              ) : (
                <XCircle className="size-4 shrink-0 text-red-700" aria-hidden="true" />
              )}
              <span className="text-slate-900">
                {field.label}:{' '}
                {variant === 'pass' ? (
                  <code className="rounded bg-slate-100 px-1 font-mono">autocomplete="{field.token}"</code>
                ) : (
                  <span className="font-semibold text-red-800">not declared, tools have to guess</span>
                )}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {variant === 'pass' && (
        <p className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-950">
          Browser autofill and password managers read these tokens to fill in your saved details. People with
          memory or cognitive disabilities don't have to recall and retype their email or phone number, and
          personalisation tools can add familiar icons to each field.
        </p>
      )}
    </div>
  )
}
