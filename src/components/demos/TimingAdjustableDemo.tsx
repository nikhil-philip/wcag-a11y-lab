import { Clock, LockKeyhole, LogOut, TriangleAlert } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import type { DemoVariant } from './types'

const FOCUS = 'focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-blue-700'
const PRIMARY = `inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 text-sm font-semibold text-white hover:bg-blue-800 ${FOCUS}`
const HEADING = 'flex items-center gap-2 text-base font-bold text-slate-900 focus:outline-3 focus:outline-offset-2 focus:outline-blue-700'

// Compressed for the demo. Real warnings must give at least 20 seconds to respond.
const SESSION_MS = 10_000
const WARN_AT_MS = 5_000
const TICK_MS = 250

type Session =
  | { status: 'signed-out' }
  | { status: 'active'; expiresAt: number }
  | { status: 'expired'; lostDraft: boolean }

export function TimingAdjustableDemo({ variant }: { variant: DemoVariant }) {
  const id = useId()
  const [session, setSession] = useState<Session>({ status: 'signed-out' })
  const [now, setNow] = useState(() => Date.now())
  const [draft, setDraft] = useState('')
  const [extensions, setExtensions] = useState(0)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)

  // Remaining time is derived from a deadline rather than counted down, so it cannot drift, and
  // extending is just moving the deadline.
  const remainingMs = session.status === 'active' ? Math.max(0, session.expiresAt - now) : 0
  const secondsLeft = Math.ceil(remainingMs / 1000)
  const warning = variant === 'pass' && session.status === 'active' && remainingMs <= WARN_AT_MS

  // The interval reads the latest draft without restarting whenever the user types.
  const draftRef = useRef(draft)
  useEffect(() => {
    draftRef.current = draft
  }, [draft])

  // One interval per deadline. Extending replaces the deadline, which restarts the effect; leaving the
  // active state (or unmounting) clears it.
  useEffect(() => {
    if (session.status !== 'active') return
    const { expiresAt } = session
    const timer = window.setInterval(() => {
      const t = Date.now()
      setNow(t)
      // Intentional failure (fail version): nothing happens before this line. No warning, no extension.
      if (t >= expiresAt) setSession({ status: 'expired', lostDraft: draftRef.current.trim() !== '' })
    }, TICK_MS)
    return () => window.clearInterval(timer)
  }, [session])

  // Keep the modal in step with `warning`. showModal() moves focus into it and makes the rest of the page
  // inert; close() hands focus back to wherever the user was.
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (warning && !dialog.open) dialog.showModal()
    if (!warning && dialog.open) dialog.close()
  }, [warning])

  // Each new screen replaces the last, so move focus to its heading.
  const previousStatus = useRef(session.status)
  useEffect(() => {
    if (previousStatus.current !== session.status) headingRef.current?.focus()
    previousStatus.current = session.status
  }, [session.status])

  function signIn() {
    const t = Date.now()
    setNow(t)
    setDraft('')
    setExtensions(0)
    setSession({ status: 'active', expiresAt: t + SESSION_MS })
  }

  function keepLoggedIn() {
    const t = Date.now()
    setNow(t)
    setExtensions((n) => n + 1)
    setSession({ status: 'active', expiresAt: t + SESSION_MS })
  }

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-slate-300 bg-white p-4">
      <p className="text-sm text-slate-700">
        Sign in and start writing a message. The session lasts 10 seconds (shortened for the demo; real warnings
        must give at least 20 seconds to respond).
      </p>

      <div className="flex flex-col gap-3 rounded-lg border border-slate-300 bg-slate-50 p-3">
        {session.status === 'signed-out' && (
          <>
            <h5 ref={headingRef} tabIndex={-1} className={HEADING}>
              <LockKeyhole className="size-5 text-slate-700" aria-hidden="true" />
              Secure banking
            </h5>
            <button type="button" onClick={signIn} className={`${PRIMARY} self-start`}>
              Sign in
            </button>
          </>
        )}

        {session.status === 'active' && (
          <>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h5 ref={headingRef} tabIndex={-1} className={HEADING}>
                <LockKeyhole className="size-5 text-green-700" aria-hidden="true" />
                Secure session
              </h5>
              {/* Visual only: announcing every second would drown out everything else. */}
              <p
                aria-hidden="true"
                className={`flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-xs font-semibold ${
                  remainingMs <= WARN_AT_MS ? 'bg-red-100 text-red-800' : 'bg-slate-200 text-slate-800'
                }`}
              >
                <Clock className="size-3.5" />
                {secondsLeft}s
              </p>
            </div>
            <label htmlFor={`${id}-msg`} className="text-sm font-semibold text-slate-900">
              Message to your branch
            </label>
            <textarea
              id={`${id}-msg`}
              rows={3}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className={`w-full resize-y rounded-lg border-2 border-slate-500 bg-white p-2 text-sm text-slate-900 ${FOCUS}`}
            />
          </>
        )}

        {session.status === 'expired' && (
          <>
            <h5 ref={headingRef} tabIndex={-1} className={HEADING}>
              <LogOut className="size-5 text-red-700" aria-hidden="true" />
              Session expired: you have been logged out
            </h5>
            <p className="text-sm text-slate-800">
              {session.lostDraft ? 'Your unsent message was lost. ' : ''}
              {variant === 'fail' ? 'There was no warning and no way to ask for more time.' : 'The warning was ignored, so the session ended.'}
            </p>
            <button type="button" onClick={signIn} className={`${PRIMARY} self-start`}>
              Sign in again
            </button>
          </>
        )}
      </div>

      {variant === 'pass' && extensions > 0 && session.status === 'active' && (
        <p className="text-sm font-semibold text-green-800">
          Session extended {extensions} {extensions === 1 ? 'time' : 'times'}. You can extend it as often as you need.
        </p>
      )}

      {variant === 'pass' && (
        <dialog
          ref={dialogRef}
          role="alertdialog"
          aria-labelledby={`${id}-warn-title`}
          aria-describedby={`${id}-warn-desc`}
          // Esc means "I'm still here": treat it like the button rather than leaving the timer running.
          onCancel={(e) => {
            e.preventDefault()
            keepLoggedIn()
          }}
          className="m-auto w-80 max-w-[calc(100vw-2rem)] rounded-xl border-t-4 border-amber-500 bg-white p-0 text-slate-900 shadow-2xl backdrop:bg-slate-900/60"
        >
          <div className="flex flex-col gap-3 p-5">
            <h5 id={`${id}-warn-title`} className="flex items-center gap-2 text-base font-bold">
              <TriangleAlert className="size-5 text-amber-600" aria-hidden="true" />
              Your session is about to expire.
            </h5>
            <p id={`${id}-warn-desc`} className="text-sm text-slate-700">
              You will be logged out in {secondsLeft} {secondsLeft === 1 ? 'second' : 'seconds'}, and your unsent message
              will be lost.
            </p>
            <button type="button" onClick={keepLoggedIn} className={PRIMARY}>
              Keep me logged in
            </button>
          </div>
        </dialog>
      )}
    </div>
  )
}
