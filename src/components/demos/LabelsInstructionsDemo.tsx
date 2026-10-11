import { CheckCircle2, XCircle } from 'lucide-react'
import { useId, useState } from 'react'
import { RequiredMark, RequiredNote } from './Required'
import type { DemoVariant } from './types'

const RULE = 'Must be at least 8 characters and include 1 number.'

export function LabelsInstructionsDemo({ variant }: { variant: DemoVariant }) {
  const id = useId()
  const inputId = `${id}-pw`
  const hintId = `${id}-hint`
  const [value, setValue] = useState('')

  // Placeholder text vanishes as soon as there's a value; persistent text never does.
  // Most screen readers also only read a placeholder while the field is empty.
  const instructionVisible = variant === 'pass' || value === ''
  // Fail: the bare asterisk is read as "star" and never explained. Pass: `required` is announced.
  const name = variant === 'pass' ? 'Create a password, required' : 'Create a password star'
  const heard = instructionVisible
    ? `"${name}, secure edit text, ${RULE}"`
    : `"${name}, secure edit text" (the rule is gone)`

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-slate-300 bg-white p-4">
      <p className="text-sm text-slate-700">Start typing a password, then try to remember the rules.</p>
      {variant === 'pass' && <RequiredNote />}

      <div className="flex flex-col gap-1.5">
        <label htmlFor={inputId} className="text-sm font-semibold text-slate-900">
          Create a password
          {variant === 'pass' ? (
            <RequiredMark />
          ) : (
            // Intentional failure: an asterisk nobody explains, and no `required` on the input.
            <span className="ml-0.5 text-red-700">*</span>
          )}
        </label>
        <input
          id={inputId}
          type="password"
          autoComplete="new-password"
          required={variant === 'pass'}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          // Intentional failure: the rule lives only in the placeholder.
          placeholder={variant === 'fail' ? RULE : undefined}
          aria-describedby={variant === 'pass' ? hintId : undefined}
          className="min-h-11 w-full rounded-lg border-2 border-slate-500 px-3 text-sm text-slate-900 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
        />
        {variant === 'pass' && (
          <p id={hintId} className="text-sm text-slate-700">
            {RULE}
          </p>
        )}
      </div>

      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
        <dt className="font-semibold text-slate-600">Rule visible now</dt>
        <dd className={`flex items-center gap-1.5 font-semibold ${instructionVisible ? 'text-green-800' : 'text-red-800'}`}>
          {instructionVisible ? (
            <CheckCircle2 className="size-4 shrink-0" aria-hidden="true" />
          ) : (
            <XCircle className="size-4 shrink-0" aria-hidden="true" />
          )}
          {instructionVisible ? 'Yes' : 'No: it disappeared when you started typing'}
        </dd>
        <dt className="font-semibold text-slate-600">Screen reader hears</dt>
        <dd className="font-mono break-words text-slate-900">{heard}</dd>
      </dl>
    </div>
  )
}
