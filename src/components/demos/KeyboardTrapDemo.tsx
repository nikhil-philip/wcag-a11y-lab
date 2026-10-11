import { Play } from 'lucide-react'
import { useId, useRef, useState, type KeyboardEvent } from 'react'
import type { DemoVariant } from './types'

const STARTER_CODE = `function greet(name) {
  return 'Hello, ' + name
}`

const EDITOR_CLASSES =
  'min-h-32 w-full resize-y rounded-lg border-2 border-slate-600 bg-slate-900 p-3 font-mono text-sm text-slate-100 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-blue-700'

export function KeyboardTrapDemo({ variant }: { variant: DemoVariant }) {
  const id = useId()
  const runRef = useRef<HTMLButtonElement>(null)
  const [blocked, setBlocked] = useState(0)

  // Intentional failure: Tab and Shift+Tab are swallowed to insert indentation.
  function trapTab(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Tab') {
      e.preventDefault()
      e.currentTarget.setRangeText('  ', e.currentTarget.selectionStart, e.currentTarget.selectionEnd, 'end')
      setBlocked((n) => n + 1)
    } else if (e.key === 'Escape') {
      // Lab safety net only, so this page doesn't itself fail 2.1.2.
      // Focus lands on "Run code" after the editor, so the next Tab continues from there.
      runRef.current?.focus()
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-slate-300 bg-white p-4">
      <p className="text-sm text-slate-700">
        Click in the editor, then press{' '}
        <kbd className="rounded border border-slate-400 px-1 font-mono">Tab</kbd> or{' '}
        <kbd className="rounded border border-slate-400 px-1 font-mono">Shift+Tab</kbd> to leave it.
      </p>

      <p className="rounded-lg border border-slate-300 bg-slate-50 p-2 text-sm text-slate-700">
        Note: "Run code" is for demonstration only and doesn't run anything.
      </p>
      {variant === 'fail' && (
        <p
          id={`${id}-exit`}
          className="rounded-lg border border-amber-300 bg-amber-50 p-2 text-sm text-amber-900"
        >
          Lab safety net: press <kbd className="rounded border border-amber-400 px-1 font-mono">Esc</kbd>{' '}
          to leave the editor. A real trap has no way out.
        </p>
      )}

      <label htmlFor={`${id}-editor`} className="text-sm font-semibold text-slate-900">
        Code editor
      </label>
      {variant === 'fail' ? (
        <textarea
          id={`${id}-editor`}
          defaultValue={STARTER_CODE}
          spellCheck={false}
          onKeyDown={trapTab}
          aria-describedby={`${id}-exit`}
          className={EDITOR_CLASSES}
        />
      ) : (
        <textarea id={`${id}-editor`} defaultValue={STARTER_CODE} spellCheck={false} className={EDITOR_CLASSES} />
      )}

      <button
        ref={runRef}
        type="button"
        className="inline-flex min-h-11 cursor-pointer items-center gap-2 self-start rounded-lg bg-blue-700 px-4 text-sm font-semibold text-white hover:bg-blue-800 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
      >
        <Play className="size-4" aria-hidden="true" />
        Run code
      </button>

      {variant === 'fail' ? (
        <p className="text-sm font-semibold text-red-800">
          {blocked === 0 ? 'Tab has not been blocked yet.' : `Tab blocked ${blocked} ${blocked === 1 ? 'time' : 'times'}.`}
        </p>
      ) : (
        <p className="text-sm font-semibold text-green-800">
          Tab moves on to "Run code"; Shift+Tab moves back.
        </p>
      )}
    </div>
  )
}
