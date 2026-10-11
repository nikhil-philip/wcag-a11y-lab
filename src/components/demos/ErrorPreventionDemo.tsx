import { CircleAlert, CircleCheck, Landmark } from 'lucide-react'
import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { RequiredMark, RequiredNote } from './Required'
import type { DemoVariant } from './types'

const FOCUS = 'focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-blue-700'
const PRIMARY = `inline-flex min-h-11 cursor-pointer items-center justify-center rounded-lg bg-blue-700 px-4 text-sm font-semibold text-white hover:bg-blue-800 ${FOCUS}`
const SECONDARY = `inline-flex min-h-11 cursor-pointer items-center justify-center rounded-lg border-2 border-slate-500 bg-white px-4 text-sm font-semibold text-slate-900 hover:bg-slate-100 ${FOCUS}`
const HEADING = 'text-base font-bold text-slate-900 focus:outline-3 focus:outline-offset-2 focus:outline-blue-700'

// High enough that an extra zero ($5,000) still passes the balance check: only a review catches it.
const STARTING_BALANCE = 12480
const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

/** What the user has typed. Kept separately from the flow, so going back to edit loses nothing. */
interface Draft {
  payee: string
  account: string
  amount: string
}

const INITIAL_DRAFT: Draft = { payee: 'Jordan Lee', account: '40218821', amount: '500.00' }

/** A transfer as the bank will send it. */
interface Transfer {
  payee: string
  account: string
  /** null when the text could not be read as a number (only possible in the fail version). */
  amount: number | null
  amountText: string
}

type Flow =
  | { step: 'edit' }
  | { step: 'review'; transfer: Transfer }
  | { step: 'done'; transfer: Transfer; reference: string }

type FieldErrors = Partial<Record<keyof Draft, string>>

function parseAmount(text: string): number | null {
  const cleaned = text.replace(/[$,\s]/g, '')
  return /^\d+(\.\d{1,2})?$/.test(cleaned) ? Number(cleaned) : null
}

function toTransfer(draft: Draft): Transfer {
  return {
    payee: draft.payee.trim(),
    account: draft.account.replace(/\s/g, ''),
    amount: parseAmount(draft.amount),
    amountText: draft.amount.trim(),
  }
}

function formatAmount(t: Transfer): string {
  return t.amount === null ? `"${t.amountText}"` : usd.format(t.amount)
}

/** Pass version only: catch what can be caught before the review step. */
function validate(t: Transfer, balance: number): FieldErrors {
  const errors: FieldErrors = {}
  if (t.payee === '') errors.payee = 'Enter the name of the person you are paying.'
  if (!/^\d{8}$/.test(t.account)) errors.account = 'Enter the 8-digit account number, for example 40218821.'
  if (t.amount === null || t.amount <= 0) errors.amount = 'Enter an amount in dollars, for example 500.00.'
  else if (t.amount > balance) errors.amount = `Enter ${usd.format(balance)} or less. That is your available balance.`
  return errors
}

export function ErrorPreventionDemo({ variant }: { variant: DemoVariant }) {
  const id = useId()
  const [draft, setDraft] = useState<Draft>(INITIAL_DRAFT)
  const [flow, setFlow] = useState<Flow>({ step: 'edit' })
  const [balance, setBalance] = useState(STARTING_BALANCE)
  const [errors, setErrors] = useState<FieldErrors>({})
  const sentCount = useRef(0)
  const fieldRefs = useRef<Partial<Record<keyof Draft, HTMLInputElement | null>>>({})

  // Each screen replaces the last, so move focus to its heading. Screen-reader users hear where they
  // are, and keyboard users are not dropped at the top of the page. Skipped on first render.
  const headingRef = useRef<HTMLHeadingElement>(null)
  const firstRender = useRef(true)
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    headingRef.current?.focus()
  }, [flow.step])

  function send(transfer: Transfer) {
    sentCount.current += 1
    const { amount } = transfer
    if (amount !== null) setBalance((b) => b - amount)
    setFlow({ step: 'done', transfer, reference: `TX-${String(48210 + sentCount.current)}` })
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    const transfer = toTransfer(draft)

    // Intentional failure: no check, no review, no undo. The money leaves on the first press.
    if (variant === 'fail') return send(transfer)

    const found = validate(transfer, balance)
    setErrors(found)
    const firstInvalid = (['payee', 'account', 'amount'] as const).find((k) => found[k])
    if (firstInvalid) return fieldRefs.current[firstInvalid]?.focus()
    setFlow({ step: 'review', transfer })
  }

  function update(key: keyof Draft, value: string) {
    setDraft((d) => ({ ...d, [key]: value }))
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }))
  }

  function reset() {
    setDraft(INITIAL_DRAFT)
    setErrors({})
    setBalance(STARTING_BALANCE)
    setFlow({ step: 'edit' })
  }

  function field(key: keyof Draft, label: string, extra: { inputMode?: 'numeric' | 'decimal'; prefix?: string } = {}) {
    const inputId = `${id}-${key}`
    const errorId = `${inputId}-error`
    const error = errors[key]
    return (
      <div className="flex flex-col gap-1">
        <label htmlFor={inputId} className="text-sm font-semibold text-slate-900">
          {label}
          <RequiredMark />
        </label>
        <div className="flex items-center gap-1">
          {extra.prefix && (
            <span className="text-sm font-semibold text-slate-700" aria-hidden="true">
              {extra.prefix}
            </span>
          )}
          <input
            ref={(el) => {
              fieldRefs.current[key] = el
            }}
            id={inputId}
            type="text"
            inputMode={extra.inputMode}
            autoComplete="off"
            required
            value={draft[key]}
            onChange={(e) => update(key, e.target.value)}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
            className={`min-h-11 w-full rounded-lg border-2 bg-white px-3 text-sm text-slate-900 ${FOCUS} ${
              error ? 'border-red-600' : 'border-slate-500'
            }`}
          />
        </div>
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
  }

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-slate-300 bg-white p-4">
      <p className="text-sm text-slate-700">
        Slip and add an extra zero to the amount, then press "{variant === 'fail' ? 'Send money' : 'Continue'}".
      </p>

      <section
        aria-labelledby={`${id}-heading`}
        className="flex flex-col gap-3 rounded-lg border border-slate-300 bg-slate-50 p-3"
      >
        <p className="flex items-center justify-between gap-2 text-xs font-semibold text-slate-600">
          <span className="flex items-center gap-1.5">
            <Landmark className="size-4" aria-hidden="true" />
            Checking ····9034
          </span>
          <span>Available: {usd.format(balance)}</span>
        </p>

        {flow.step === 'edit' && (
          <form noValidate onSubmit={onSubmit} className="flex flex-col gap-3">
            <h5 id={`${id}-heading`} ref={headingRef} tabIndex={-1} className={HEADING}>
              Send money
            </h5>
            <RequiredNote />
            {field('payee', 'Payee name')}
            {field('account', 'Payee account number', { inputMode: 'numeric' })}
            {field('amount', 'Amount (USD)', { inputMode: 'decimal', prefix: '$' })}
            <button type="submit" className={`${PRIMARY} self-start`}>
              {variant === 'fail' ? 'Send money' : 'Continue'}
            </button>
          </form>
        )}

        {flow.step === 'review' && (
          <div className="flex flex-col gap-3">
            <h5 id={`${id}-heading`} ref={headingRef} tabIndex={-1} className={HEADING}>
              Review transfer
            </h5>
            <p className="text-sm text-slate-700">Nothing has been sent yet. Check the details below.</p>
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 rounded-lg border border-slate-300 bg-white p-3 text-sm">
              <dt className="font-semibold text-slate-600">To</dt>
              <dd className="text-slate-900">{flow.transfer.payee}</dd>
              <dt className="font-semibold text-slate-600">Account</dt>
              <dd className="font-mono text-slate-900">{flow.transfer.account}</dd>
              <dt className="font-semibold text-slate-600">Amount</dt>
              <dd className="text-lg font-bold text-slate-900">{formatAmount(flow.transfer)}</dd>
              <dt className="font-semibold text-slate-600">Balance after</dt>
              <dd className="text-slate-900">{usd.format(balance - (flow.transfer.amount ?? 0))}</dd>
            </dl>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => send(flow.transfer)} className={PRIMARY}>
                Confirm &amp; Send {formatAmount(flow.transfer)}
              </button>
              {/* The draft was never cleared, so every field comes back exactly as typed. */}
              <button type="button" onClick={() => setFlow({ step: 'edit' })} className={SECONDARY}>
                Back to Edit
              </button>
            </div>
          </div>
        )}

        {flow.step === 'done' && (
          <div className="flex flex-col gap-2">
            <h5
              id={`${id}-heading`}
              ref={headingRef}
              tabIndex={-1}
              className={`flex items-center gap-2 ${HEADING}`}
            >
              <CircleCheck className="size-5 text-green-700" aria-hidden="true" />
              Transfer complete
            </h5>
            <p className="text-sm text-slate-900">
              <strong>{formatAmount(flow.transfer)}</strong> sent to {flow.transfer.payee || '(no name)'}, account{' '}
              <span className="font-mono">{flow.transfer.account || '(none)'}</span>.
            </p>
            <p className="text-xs text-slate-600">Reference {flow.reference}. Transfers cannot be cancelled.</p>
          </div>
        )}
      </section>

      {flow.step === 'done' && (
        <p
          className={`text-sm font-semibold ${
            variant === 'fail' ? 'text-red-800' : 'text-green-800'
          }`}
        >
          {variant === 'fail'
            ? 'One press sent the money. There was no chance to review it, and no way to undo it.'
            : 'You saw exactly what would be sent, and chose to send it.'}
        </p>
      )}

      {(flow.step !== 'edit' || balance !== STARTING_BALANCE) && (
        <button type="button" onClick={reset} className={`${SECONDARY} self-start`}>
          Reset demo
        </button>
      )}
    </div>
  )
}
