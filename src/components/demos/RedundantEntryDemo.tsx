import { CircleAlert, CircleCheck } from 'lucide-react'
import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { RequiredMark, RequiredNote } from './Required'
import type { DemoVariant } from './types'

const FOCUS = 'focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-blue-700'
const PRIMARY = `inline-flex min-h-11 cursor-pointer items-center justify-center rounded-lg bg-blue-700 px-4 text-sm font-semibold text-white hover:bg-blue-800 ${FOCUS}`
const SECONDARY = `inline-flex min-h-11 cursor-pointer items-center justify-center rounded-lg border-2 border-slate-500 bg-white px-4 text-sm font-semibold text-slate-900 hover:bg-slate-100 ${FOCUS}`
const HEADING = 'text-base font-bold text-slate-900 focus:outline-3 focus:outline-offset-2 focus:outline-blue-700'

interface Address {
  name: string
  street: string
  city: string
  postcode: string
}

type Section = 'shipping' | 'billing'
type Step = Section | 'done'
type FieldErrors = Partial<Record<keyof Address, string>>

const FIELDS: readonly { key: keyof Address; label: string; token: string; missing: string }[] = [
  { key: 'name', label: 'Full name', token: 'name', missing: 'Enter the full name' },
  { key: 'street', label: 'Street address', token: 'street-address', missing: 'Enter the street address' },
  { key: 'city', label: 'City', token: 'address-level2', missing: 'Enter the city' },
  { key: 'postcode', label: 'PIN code', token: 'postal-code', missing: 'Enter the 6-digit PIN code' },
]

// Shipping starts filled in so you can go straight to the billing step.
const SAMPLE_SHIPPING: Address = { name: 'Asha Rao', street: '12 Park Street', city: 'Bengaluru', postcode: '560001' }
const EMPTY: Address = { name: '', street: '', city: '', postcode: '' }

function validate(a: Address): FieldErrors {
  const errors: FieldErrors = {}
  for (const f of FIELDS) {
    const value = a[f.key].trim()
    if (value === '' || (f.key === 'postcode' && !/^\d{6}$/.test(value))) errors[f.key] = `${f.missing}.`
  }
  return errors
}

const formatAddress = (a: Address) => [a.name, a.street, a.city, a.postcode].map((s) => s.trim()).join(', ')

export function RedundantEntryDemo({ variant }: { variant: DemoVariant }) {
  const id = useId()
  const [step, setStep] = useState<Step>('shipping')
  const [shipping, setShipping] = useState<Address>(SAMPLE_SHIPPING)
  // Only what the user typed for billing. Never a copy of shipping, so it can't go stale.
  const [billing, setBilling] = useState<Address>(EMPTY)
  const [sameAsShipping, setSameAsShipping] = useState(true)
  const [errors, setErrors] = useState<FieldErrors>({})
  const fieldRefs = useRef<Partial<Record<keyof Address, HTMLInputElement | null>>>({})

  // Pass: with the box ticked, the billing address *is* the shipping address, derived here rather than
  // copied. Going back and editing shipping can't leave an out-of-date billing copy behind.
  const reuse = variant === 'pass' && sameAsShipping
  const billingAddress = reuse ? shipping : billing

  // Each step replaces the last, so move focus to its heading (not on first render).
  const headingRef = useRef<HTMLHeadingElement>(null)
  const firstRender = useRef(true)
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    headingRef.current?.focus()
  }, [step])

  function goTo(next: Step) {
    setErrors({})
    setStep(next)
  }

  function submitStep(e: FormEvent, address: Address, next: Step, skipCheck = false) {
    e.preventDefault()
    const found = skipCheck ? {} : validate(address)
    setErrors(found)
    const firstInvalid = FIELDS.find((f) => found[f.key])
    if (firstInvalid) return fieldRefs.current[firstInvalid.key]?.focus()
    goTo(next)
  }

  function reset() {
    setShipping(SAMPLE_SHIPPING)
    setBilling(EMPTY)
    setSameAsShipping(true)
    goTo('shipping')
  }

  function fields(section: Section, value: Address, onChange: (next: Address) => void) {
    return FIELDS.map((f) => {
      const inputId = `${id}-${section}-${f.key}`
      const errorId = `${inputId}-error`
      const error = errors[f.key]
      return (
        <div key={f.key} className="flex flex-col gap-1">
          <label htmlFor={inputId} className="text-sm font-semibold text-slate-900">
            {f.label}
            <RequiredMark />
          </label>
          <input
            ref={(el) => {
              fieldRefs.current[f.key] = el
            }}
            id={inputId}
            type="text"
            inputMode={f.key === 'postcode' ? 'numeric' : undefined}
            autoComplete={`${section} ${f.token}`}
            required
            value={value[f.key]}
            onChange={(e) => {
              onChange({ ...value, [f.key]: e.target.value })
              if (error) setErrors((prev) => ({ ...prev, [f.key]: undefined }))
            }}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
            className={`min-h-11 w-full rounded-lg border-2 bg-white px-3 text-sm text-slate-900 ${FOCUS} ${
              error ? 'border-red-600' : 'border-slate-500'
            }`}
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
        </div>
      )
    })
  }

  const stepNumber = step === 'shipping' ? 1 : step === 'billing' ? 2 : 3

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-slate-300 bg-white p-4">
      <p className="text-sm text-slate-700">Continue to the billing step and complete the order.</p>

      <div className="flex flex-col gap-3 rounded-lg border border-slate-300 bg-slate-50 p-3">
        <p className="text-xs font-semibold text-slate-600">Checkout · Step {stepNumber} of 3</p>

        {step === 'shipping' && (
          <form noValidate onSubmit={(e) => submitStep(e, shipping, 'billing')} className="flex flex-col gap-3">
            <h5 ref={headingRef} tabIndex={-1} className={HEADING}>
              Shipping address
            </h5>
            <RequiredNote />
            {fields('shipping', shipping, setShipping)}
            <button type="submit" className={`${PRIMARY} self-start`}>
              Continue to billing
            </button>
          </form>
        )}

        {step === 'billing' && (
          <form noValidate onSubmit={(e) => submitStep(e, billing, 'done', reuse)} className="flex flex-col gap-3">
            <h5 ref={headingRef} tabIndex={-1} className={HEADING}>
              Billing address
            </h5>

            {variant === 'pass' && (
              <label className="flex min-h-11 cursor-pointer items-center gap-2 text-sm font-medium text-slate-900">
                <input
                  type="checkbox"
                  checked={sameAsShipping}
                  onChange={(e) => {
                    setSameAsShipping(e.target.checked)
                    setErrors({})
                  }}
                  className="size-5 shrink-0 accent-blue-700 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
                />
                Billing address is the same as shipping address
              </label>
            )}

            {reuse ? (
              <p className="rounded-lg border border-slate-300 bg-white p-3 text-sm text-slate-900">
                <span className="font-semibold">Billing to:</span> {formatAddress(shipping)}
              </p>
            ) : (
              // Intentional failure (fail version): the address from step 1 has to be typed again.
              <>
                <RequiredNote />
                {fields('billing', billing, setBilling)}
              </>
            )}

            <div className="flex flex-wrap gap-2">
              <button type="submit" className={PRIMARY}>
                Place order
              </button>
              <button type="button" onClick={() => goTo('shipping')} className={SECONDARY}>
                Back
              </button>
            </div>
          </form>
        )}

        {step === 'done' && (
          <div className="flex flex-col gap-2">
            <h5 ref={headingRef} tabIndex={-1} className={`flex items-center gap-2 ${HEADING}`}>
              <CircleCheck className="size-5 text-green-700" aria-hidden="true" />
              Order placed
            </h5>
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
              <dt className="font-semibold text-slate-600">Ship to</dt>
              <dd className="text-slate-900">{formatAddress(shipping)}</dd>
              <dt className="font-semibold text-slate-600">Bill to</dt>
              <dd className="text-slate-900">{formatAddress(billingAddress)}</dd>
            </dl>
          </div>
        )}
      </div>

      {step === 'done' && (
        <>
          <p className={`text-sm font-semibold ${reuse ? 'text-green-800' : variant === 'fail' ? 'text-red-800' : 'text-slate-900'}`}>
            {reuse
              ? 'You entered your address once: 4 fields.'
              : variant === 'fail'
                ? 'You had to enter your address twice: 8 fields, with no way to reuse the first.'
                : 'You chose a different billing address, so you entered 8 fields.'}
          </p>
          <button type="button" onClick={reset} className={`${SECONDARY} self-start`}>
            Reset demo
          </button>
        </>
      )}
    </div>
  )
}
