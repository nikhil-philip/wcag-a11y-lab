import { LifeBuoy, X } from 'lucide-react'
import { useId, useRef, useState } from 'react'
import type { DemoVariant } from './types'

const FOCUS = 'focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-blue-700'
const NAV_ITEM_CLASSES = `inline-flex min-h-11 cursor-pointer items-center rounded px-2 text-sm font-semibold text-blue-800 underline ${FOCUS}`

type OpenedBy = 'focus' | 'activation'

export function OnFocusDemo({ variant }: { variant: DemoVariant }) {
  const id = useId()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const helpRef = useRef<HTMLButtonElement>(null)
  // True while focus is being handed back to Help after the dialog closes.
  const restoringFocus = useRef(false)
  const [openedBy, setOpenedBy] = useState<OpenedBy | null>(null)
  const [focusOpens, setFocusOpens] = useState(0)

  function openHelp(by: OpenedBy) {
    const dialog = dialogRef.current
    if (!dialog || dialog.open) return
    dialog.showModal()
    setOpenedBy(by)
    if (by === 'focus') setFocusOpens((n) => n + 1)
  }

  function closeHelp() {
    // Closing a modal dialog returns focus to Help, which would fire the fail version's onFocus and
    // reopen it straight away. Real sites often loop like that; the lab skips it so you can move on.
    restoringFocus.current = true
    dialogRef.current?.close()
    helpRef.current?.focus()
    restoringFocus.current = false
  }

  const status =
    openedBy === null
      ? variant === 'fail'
        ? ''
        : 'Help opens only when you press Enter or Space, or click it.'
      : openedBy === 'focus'
        ? `Help opened ${focusOpens} ${focusOpens === 1 ? 'time' : 'times'} just because focus landed on it. You never pressed Enter.`
        : 'Help opened because you activated it.'

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-slate-300 bg-white p-4">
      <p className="text-sm text-slate-700">
        Press <kbd className="rounded border border-slate-400 px-1 font-mono">Tab</kbd> through the
        site navigation to reach "Contact".
      </p>

      <nav aria-label={`Site (${variant} example)`} className="rounded-lg border border-slate-300 bg-slate-50 p-2">
        <ul className="flex flex-wrap items-center gap-1">
          {['Home', 'Pricing'].map((label) => (
            <li key={label}>
              <a href="#" onClick={(e) => e.preventDefault()} className={NAV_ITEM_CLASSES}>
                {label}
              </a>
            </li>
          ))}
          <li>
            {/* A button, not a link: it opens a dialog rather than going to a page, and it responds
                to both Enter and Space. */}
            <button
              ref={helpRef}
              type="button"
              aria-haspopup="dialog"
              onClick={() => openHelp('activation')}
              // Intentional failure: merely receiving focus opens the dialog.
              onFocus={
                variant === 'fail'
                  ? () => {
                      if (!restoringFocus.current) openHelp('focus')
                    }
                  : undefined
              }
              className={NAV_ITEM_CLASSES}
            >
              Help
            </button>
          </li>
          <li>
            <a href="#" onClick={(e) => e.preventDefault()} className={NAV_ITEM_CLASSES}>
              Contact
            </a>
          </li>
        </ul>
      </nav>

      <dialog
        ref={dialogRef}
        aria-labelledby={`${id}-title`}
        // Handle Esc ourselves so it goes through the same focus handling as the Close button.
        onCancel={(e) => {
          e.preventDefault()
          closeHelp()
        }}
        className="m-auto w-80 max-w-[calc(100vw-2rem)] rounded-xl bg-white p-0 text-slate-900 shadow-2xl backdrop:bg-slate-900/60"
      >
        <div className="flex flex-col gap-3 p-5">
          <div className="flex items-start justify-between gap-2">
            <h5 id={`${id}-title`} className="flex items-center gap-2 text-base font-bold">
              <LifeBuoy className="size-5 text-blue-700" aria-hidden="true" />
              Chat with support
            </h5>
            <button
              type="button"
              aria-label="Close"
              onClick={closeHelp}
              className={`inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100 ${FOCUS}`}
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>
          <p className="text-sm text-slate-700">
            {variant === 'fail'
              ? 'You were only passing through, but this dialog now covers the page and holds your focus.'
              : 'You asked for help, so this dialog is expected. Esc or Close takes you back to Help.'}
          </p>
          <button
            type="button"
            onClick={closeHelp}
            className={`min-h-11 cursor-pointer rounded-lg bg-blue-700 px-4 text-sm font-semibold text-white hover:bg-blue-800 ${FOCUS}`}
          >
            Start chat
          </button>
        </div>
      </dialog>

      <p
        role="status"
        className={`min-h-5 text-sm font-semibold ${openedBy === 'focus' ? 'text-red-800' : 'text-slate-900'}`}
      >
        {status}
      </p>
    </div>
  )
}
