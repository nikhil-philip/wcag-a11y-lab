import { CircleAlert } from 'lucide-react'
import { useId, useRef, useState, type FormEvent, type RefObject } from 'react'
import { RequiredMark, RequiredNote } from './Required'
import type { DemoVariant } from './types'

function validateEmail(value: string): string | null {
  if (value.trim() === '') return 'Enter your email address'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return 'Enter an email address in the correct format, like name@example.com'
  }
  return null
}

function validatePhone(value: string): string | null {
  const digits = value.replace(/[\s-]/g, '')
  if (digits === '') return 'Enter your mobile number'
  if (!/^\d{10}$/.test(digits)) return 'Enter a 10-digit mobile number, like 98765 43210'
  return null
}

type FieldProps = {
  variant: DemoVariant
  label: string
  type: 'email' | 'tel'
  autoComplete: string
  value: string
  onChange: (value: string) => void
  error: string | null
  inputRef: RefObject<HTMLInputElement | null>
}

function Field({ variant, label, type, autoComplete, value, onChange, error, inputRef }: FieldProps) {
  // Both panels render this demo at once, so ids must be unique per instance.
  const inputId = useId()
  const errorId = useId()

  const inputClasses = `min-h-11 w-full rounded-lg border-2 px-3 text-sm text-slate-900 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-blue-700 ${
    error ? 'border-red-600' : 'border-slate-500'
  }`

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-semibold text-slate-900">
        {label}
        <RequiredMark />
      </label>

      {variant === 'fail' ? (
        // Intentional failure: the red border is the only sign of which field is wrong.
        <input
          ref={inputRef}
          id={inputId}
          type={type}
          autoComplete={autoComplete}
          required
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={inputClasses}
        />
      ) : (
        <>
          <input
            ref={inputRef}
            id={inputId}
            type={type}
            autoComplete={autoComplete}
            required
            value={value}
            onChange={(e) => onChange(e.target.value)}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
            className={inputClasses}
          />
          {error && (
            <p id={errorId} className="flex items-start gap-1.5 text-sm font-medium text-red-700">
              <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <span>
                <span className="sr-only">Error: </span>
                {error}
              </span>
            </p>
          )}
        </>
      )}
    </div>
  )
}

export function FormErrorDemo({ variant }: { variant: DemoVariant }) {
  const emailRef = useRef<HTMLInputElement>(null)
  const phoneRef = useRef<HTMLInputElement>(null)
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [subscribed, setSubscribed] = useState(false)

  const emailError = submitted ? validateEmail(email) : null
  const phoneError = submitted ? validatePhone(phone) : null
  const hasErrors = emailError !== null || phoneError !== null

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitted(true)
    const emailProblem = validateEmail(email)
    const phoneProblem = validatePhone(phone)
    setSubscribed(emailProblem === null && phoneProblem === null)
    // Pass: move focus to the first invalid field so its error is announced with it.
    if (variant === 'pass') {
      if (emailProblem) emailRef.current?.focus()
      else if (phoneProblem) phoneRef.current?.focus()
    }
  }

  let status = ''
  if (subscribed) status = 'Subscribed.'
  // Intentional failure: one generic message, not tied to either field, that says
  // something is wrong but not which field or what the problem is.
  else if (variant === 'fail' && hasErrors) status = 'Please fix the errors in the form.'

  return (
    // noValidate: the browser's own validation bubble would otherwise describe the error for us.
    <form noValidate onSubmit={onSubmit} className="flex flex-col gap-3 rounded-lg border border-slate-300 bg-white p-4">
      <RequiredNote />
      <Field
        variant={variant}
        label="Email for order updates"
        type="email"
        autoComplete="email"
        value={email}
        onChange={setEmail}
        error={emailError}
        inputRef={emailRef}
      />
      <Field
        variant={variant}
        label="Mobile number"
        type="tel"
        autoComplete="tel"
        value={phone}
        onChange={setPhone}
        error={phoneError}
        inputRef={phoneRef}
      />

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          className="inline-flex min-h-11 cursor-pointer items-center rounded-lg bg-blue-700 px-4 text-sm font-semibold text-white hover:bg-blue-800 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
        >
          Subscribe
        </button>
        <p role="status" className={`text-sm font-medium ${subscribed ? 'text-green-800' : 'text-red-700'}`}>
          {status}
        </p>
      </div>
    </form>
  )
}
