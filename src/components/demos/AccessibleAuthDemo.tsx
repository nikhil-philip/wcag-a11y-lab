import { Copy, Eye, EyeOff, KeyRound } from 'lucide-react'
import { useId, useRef, useState, type ClipboardEvent, type FormEvent } from 'react'
import type { DemoVariant } from './types'

const FOCUS = 'focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-blue-700'
const INPUT = `min-h-11 w-full rounded-lg border-2 border-slate-500 bg-white px-3 text-sm text-slate-900 ${FOCUS}`

const DEMO_EMAIL = 'asha@example.com'
// Long and random, like a generated one: easy to paste, hard to remember and type.
const DEMO_PASSWORD = 'vT8#qL2m-Rw9!zKe'

type Outcome = { kind: 'ok' | 'error' | 'blocked' | 'copied'; text: string }

export function AccessibleAuthDemo({ variant }: { variant: DemoVariant }) {
  const id = useId()
  const passwordRef = useRef<HTMLInputElement>(null)
  const secretRef = useRef<HTMLElement>(null)
  const [email, setEmail] = useState(DEMO_EMAIL)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [outcome, setOutcome] = useState<Outcome | null>(null)

  async function copyPassword() {
    try {
      await navigator.clipboard.writeText(DEMO_PASSWORD)
      setOutcome({ kind: 'copied', text: 'Password copied. Paste it into the password field.' })
    } catch {
      // No clipboard access (e.g. an insecure context): select the text so Ctrl+C / Cmd+C works.
      const node = secretRef.current
      const selection = window.getSelection()
      if (node && selection) {
        selection.selectAllChildren(node)
        setOutcome({ kind: 'copied', text: 'Password selected. Copy it with Ctrl+C or Cmd+C.' })
      }
    }
  }

  // Intentional failure: pasting is cancelled "for security", so a password manager's copy is useless.
  function blockPaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault()
    setOutcome({ kind: 'blocked', text: 'Pasting is disabled for security reasons. Please type your password.' })
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (password === DEMO_PASSWORD) {
      setOutcome({ kind: 'ok', text: `Signed in as ${email || 'unknown user'}.` })
    } else {
      setOutcome({ kind: 'error', text: 'That password is incorrect.' })
      passwordRef.current?.focus()
    }
  }

  const outcomeClass =
    outcome?.kind === 'ok' || outcome?.kind === 'copied'
      ? 'text-green-800'
      : outcome
        ? 'text-red-800'
        : 'text-slate-900'

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-slate-300 bg-white p-4">
      <p className="text-sm text-slate-700">Copy the password from the password manager below, then paste it and sign in.</p>

      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-dashed border-slate-400 bg-slate-50 p-3">
        <p className="flex min-w-0 items-center gap-2 text-sm text-slate-900">
          <KeyRound className="size-4 shrink-0 text-slate-700" aria-hidden="true" />
          <span className="min-w-0">
            <span className="block text-xs font-semibold text-slate-600">Password manager (simulated)</span>
            <code ref={secretRef} className="font-mono break-all">
              {DEMO_PASSWORD}
            </code>
          </span>
        </p>
        <button
          type="button"
          onClick={copyPassword}
          className={`inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-lg border-2 border-slate-500 bg-white px-3 text-sm font-semibold text-slate-900 hover:bg-slate-100 ${FOCUS}`}
        >
          <Copy className="size-4" aria-hidden="true" />
          Copy password
        </button>
      </div>

      <form noValidate onSubmit={onSubmit} className="flex flex-col gap-3 rounded-lg border border-slate-300 bg-slate-50 p-3">
        <div className="flex flex-col gap-1">
          <label htmlFor={`${id}-email`} className="text-sm font-semibold text-slate-900">
            Email
          </label>
          <input
            id={`${id}-email`}
            type="email"
            // Intentional failure (fail version): no autocomplete hint for the username either.
            autoComplete={variant === 'pass' ? 'username' : undefined}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={INPUT}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor={`${id}-password`} className="text-sm font-semibold text-slate-900">
            Password
          </label>
          <div className="flex gap-2">
            <input
              ref={passwordRef}
              id={`${id}-password`}
              type={variant === 'pass' && showPassword ? 'text' : 'password'}
              autoComplete={variant === 'pass' ? 'current-password' : undefined}
              // Stop mobile keyboards "correcting" a visible password.
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onPaste={variant === 'fail' ? blockPaste : undefined}
              className={`${INPUT} font-mono`}
            />
            {variant === 'pass' && (
              // A constant label with aria-pressed: screen readers hear "Show password, toggle button, pressed".
              <button
                type="button"
                aria-pressed={showPassword}
                aria-controls={`${id}-password`}
                onClick={() => setShowPassword((s) => !s)}
                className={`inline-flex min-h-11 shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border-2 border-slate-500 bg-white px-3 text-sm font-semibold text-slate-900 hover:bg-slate-100 ${FOCUS}`}
              >
                {showPassword ? (
                  <EyeOff className="size-4" aria-hidden="true" />
                ) : (
                  <Eye className="size-4" aria-hidden="true" />
                )}
                Show password
              </button>
            )}
          </div>
        </div>

        <button
          type="submit"
          className={`inline-flex min-h-11 cursor-pointer items-center justify-center self-start rounded-lg bg-blue-700 px-4 text-sm font-semibold text-white hover:bg-blue-800 ${FOCUS}`}
        >
          Sign in
        </button>
      </form>

      <p role="status" className={`min-h-5 text-sm font-semibold ${outcomeClass}`}>
        {outcome?.text ?? ''}
      </p>
    </div>
  )
}
