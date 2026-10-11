import { CircleAlert } from 'lucide-react'
import { useId, useRef, useState, type FormEvent } from 'react'
import { RequiredMark, RequiredNote } from './Required'
import type { DemoVariant } from './types'

const FOCUS = 'focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-blue-700'
const FORMAT_HINT = 'Please use MM/DD/YYYY (e.g., 10/31/1990).'

const pad = (n: number) => String(n).padStart(2, '0')

/** The three captured numbers of a date match, in the order they were typed. */
const parts = (m: RegExpExecArray): [number, number, number] => [Number(m[1]), Number(m[2]), Number(m[3])]

/** A real, non-future calendar date, formatted MM/DD/YYYY; null if there is no such date. */
function formatIfValid(year: number, month: number, day: number): string | null {
  const date = new Date(year, month - 1, day)
  const exists = date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
  return exists && year >= 1900 && date <= new Date() ? `${pad(month)}/${pad(day)}/${year}` : null
}

/** Best guess at what the user meant, when the intended date is unambiguous. */
function suggestFix(raw: string): string | null {
  const value = raw.trim()
  let m = /^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/.exec(value) // 1990-10-31
  if (m) {
    const [year, month, day] = parts(m)
    return formatIfValid(year, month, day)
  }
  m = /^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/.exec(value)
  if (m) {
    const [a, b, year] = parts(m)
    if (a > 12 && b <= 12) return formatIfValid(year, b, a) // day first: 31/10/1990
    return formatIfValid(year, a, b) // other separators or no leading zeros: 10-31-1990, 1/5/1990
  }
  m = /^(\d{2})(\d{2})(\d{4})$/.exec(value) // 10311990
  if (m) {
    const [month, day, year] = parts(m)
    return formatIfValid(year, month, day)
  }
  return null
}

interface Problem {
  message: string
  suggestion: string | null
}

function validate(raw: string, variant: DemoVariant): Problem | null {
  const value = raw.trim()
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value)
  const [month, day, year] = m ? parts(m) : [0, 0, 0]
  if (m && formatIfValid(year, month, day)) return null

  // Intentional failure: the code knows what it wants but only says that something is wrong.
  if (variant === 'fail') return { message: 'Invalid date format.', suggestion: null }

  if (value === '') return { message: `Enter your date of birth. ${FORMAT_HINT}`, suggestion: null }
  if (m) {
    const future = new Date(year, month - 1, day) > new Date()
    return {
      message: future
        ? 'Your date of birth cannot be in the future. Check the year.'
        : month > 12
          ? `There is no month ${month}. ${FORMAT_HINT} The month comes first.`
          : `${value} is not a real date. Check the day and month. ${FORMAT_HINT}`,
      suggestion: suggestFix(`${day}/${month}/${year}`),
    }
  }
  return { message: `Invalid date format. ${FORMAT_HINT}`, suggestion: suggestFix(value) }
}

export function ErrorSuggestionDemo({ variant }: { variant: DemoVariant }) {
  const id = useId()
  const inputId = `${id}-dob`
  const errorId = `${id}-error`
  const inputRef = useRef<HTMLInputElement>(null)
  const [value, setValue] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [saved, setSaved] = useState(false)

  // Once submitted, the message tracks the value, so it clears as soon as the date is fixed.
  const problem = submitted ? validate(value, variant) : null
  const suggestion = problem?.suggestion ?? null

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitted(true)
    const found = validate(value, variant)
    setSaved(found === null)
    // Move focus to the field so the error, linked with aria-describedby, is read with it.
    if (found) inputRef.current?.focus()
  }

  function applySuggestion(fix: string) {
    setValue(fix)
    setSaved(false)
    inputRef.current?.focus()
  }

  return (
    // noValidate: the browser's own validation bubble would otherwise replace our messages.
    <form noValidate onSubmit={onSubmit} className="flex flex-col gap-3 rounded-lg border border-slate-300 bg-white p-4">
      <p className="text-sm text-slate-700">
        Enter a date the way you usually would, such as 31/10/1990 or 1990-10-31, then select Save.
      </p>
      <RequiredNote />

      <div className="flex flex-col gap-1">
        <label htmlFor={inputId} className="text-sm font-semibold text-slate-900">
          Date of birth
          <RequiredMark />
        </label>
        <input
          ref={inputRef}
          id={inputId}
          type="text"
          inputMode="numeric"
          autoComplete="bday"
          required
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
            setSaved(false)
          }}
          aria-invalid={problem ? true : undefined}
          // Linked in both versions: the difference is what the message says, not whether it is announced.
          aria-describedby={problem ? errorId : undefined}
          className={`min-h-11 w-full rounded-lg border-2 px-3 text-sm text-slate-900 ${FOCUS} ${
            problem ? 'border-red-600 bg-red-50' : 'border-slate-500 bg-white'
          }`}
        />
        {problem && (
          <div className="flex flex-col items-start gap-2">
            <p id={errorId} className="flex items-start gap-1.5 text-sm font-medium text-red-700">
              <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <span>
                <span className="sr-only">Error: </span>
                {problem.message}
                {suggestion && ` Did you mean ${suggestion}?`}
              </span>
            </p>
            {suggestion && (
              <button
                type="button"
                onClick={() => applySuggestion(suggestion)}
                className={`min-h-11 cursor-pointer rounded-lg border-2 border-blue-700 bg-white px-3 text-sm font-semibold text-blue-800 hover:bg-blue-50 ${FOCUS}`}
              >
                Use {suggestion}
              </button>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          className={`inline-flex min-h-11 cursor-pointer items-center rounded-lg bg-blue-700 px-4 text-sm font-semibold text-white hover:bg-blue-800 ${FOCUS}`}
        >
          Save
        </button>
        <p role="status" className="text-sm font-medium text-green-800">
          {saved ? 'Saved.' : ''}
        </p>
      </div>
    </form>
  )
}
