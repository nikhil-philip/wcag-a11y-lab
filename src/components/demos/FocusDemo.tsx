import type { DemoVariant } from './types'

const LABELS = ['Save', 'Preview', 'Publish'] as const

const BASE =
  'inline-flex min-h-11 items-center rounded-lg bg-blue-700 px-4 text-sm font-semibold text-white hover:bg-blue-800'

const FOCUS_STYLES: Record<DemoVariant, string> = {
  // Intentional failure: the default focus ring is removed and nothing replaces it.
  fail: 'focus:outline-none',
  pass: 'focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-blue-700',
}

export function FocusDemo({ variant }: { variant: DemoVariant }) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-slate-300 bg-white p-4">
      <p className="text-sm text-slate-700">
        Press <kbd className="rounded border border-slate-400 px-1 font-mono">Tab</kbd> to move
        through these buttons. Can you tell which one has focus?
      </p>
      <div className="flex flex-wrap gap-3">
        {LABELS.map((label) => (
          <button key={label} type="button" className={`${BASE} ${FOCUS_STYLES[variant]}`}>
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
