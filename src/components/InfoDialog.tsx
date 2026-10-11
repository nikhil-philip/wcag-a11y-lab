import { X } from 'lucide-react'
import { useId, useRef, type ReactNode } from 'react'

interface InfoDialogProps {
  /** Text of the button that opens the dialog. */
  label: ReactNode
  triggerClassName: string
  title: string
  children: ReactNode
}

/**
 * A button that opens a modal dialog of read-only content. The native <dialog> with showModal() traps
 * focus, makes the page behind it inert and closes on Esc. Focus returns to the button on close.
 */
export function InfoDialog({ label, triggerClassName, title, children }: InfoDialogProps) {
  const id = useId()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="dialog"
        onClick={() => dialogRef.current?.showModal()}
        className={triggerClassName}
      >
        {label}
      </button>
      <dialog
        ref={dialogRef}
        aria-labelledby={`${id}-title`}
        onClose={() => triggerRef.current?.focus()}
        // A click on the backdrop lands on the <dialog> itself; clicks on the content land on its children.
        onClick={(e) => {
          if (e.target === e.currentTarget) e.currentTarget.close()
        }}
        className="m-auto max-h-[85vh] w-[40rem] max-w-[calc(100vw-2rem)] overflow-y-auto rounded-xl bg-white p-0 text-slate-900 shadow-2xl backdrop:bg-slate-900/60"
      >
        <div className="sticky top-0 flex items-center justify-between gap-4 border-b border-slate-200 bg-white px-5 py-3">
          <h2 id={`${id}-title`} className="text-lg font-bold">
            {title}
          </h2>
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            className="inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
          >
            <X className="size-5" aria-hidden="true" />
            <span className="sr-only">Close</span>
          </button>
        </div>
        <div className="flex flex-col gap-4 px-5 py-4 text-sm leading-relaxed text-slate-700">{children}</div>
      </dialog>
    </>
  )
}
