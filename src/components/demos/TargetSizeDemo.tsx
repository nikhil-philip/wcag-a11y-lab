import {
  Bold,
  CheckCircle2,
  Italic,
  Link,
  Strikethrough,
  Underline,
  XCircle,
  type LucideIcon,
} from 'lucide-react'
import { useId, useState } from 'react'
import type { DemoVariant } from './types'

/** WCAG 2.5.8 minimum target size and spacing-circle diameter, in CSS px. */
const MIN_TARGET = 24

/** Target size and gap (CSS px) per variant; everything below is derived from these. */
const LAYOUT: Record<DemoVariant, { size: number; gap: number; icon: number }> = {
  fail: { size: 16, gap: 2, icon: 12 },
  pass: { size: 24, gap: 8, icon: 16 },
}

const TOOLS: readonly { label: string; Icon: LucideIcon }[] = [
  { label: 'Bold', Icon: Bold },
  { label: 'Italic', Icon: Italic },
  { label: 'Underline', Icon: Underline },
  { label: 'Strikethrough', Icon: Strikethrough },
  { label: 'Insert link', Icon: Link },
]

export function TargetSizeDemo({ variant }: { variant: DemoVariant }) {
  const id = useId()
  const [lastPressed, setLastPressed] = useState<string | null>(null)
  const [showCircles, setShowCircles] = useState(false)

  const { size, gap, icon } = LAYOUT[variant]
  const centreDistance = size + gap
  // Passes if big enough, or if 24px circles centred on each target don't overlap.
  const passes = size >= MIN_TARGET || centreDistance >= MIN_TARGET

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-slate-300 bg-white p-4">
      <p className="text-sm text-slate-700">Tap or click the formatting buttons.</p>

      <div role="toolbar" aria-label="Text formatting" className="flex p-2" style={{ gap }}>
        {TOOLS.map(({ label, Icon }) => (
          <button
            key={label}
            type="button"
            aria-label={label}
            onClick={() => setLastPressed(label)}
            style={{ width: size, height: size }}
            className="relative inline-flex shrink-0 items-center justify-center rounded border border-slate-500 bg-slate-50 text-slate-800 hover:bg-slate-200 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-blue-700"
          >
            <Icon style={{ width: icon, height: icon }} aria-hidden="true" />
            {showCircles && (
              <span
                aria-hidden="true"
                style={{ width: MIN_TARGET, height: MIN_TARGET }}
                className={`pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dashed ${
                  passes ? 'border-green-700 bg-green-500/10' : 'border-red-700 bg-red-500/20'
                }`}
              />
            )}
          </button>
        ))}
      </div>

      <label htmlFor={`${id}-circles`} className="flex min-h-6 cursor-pointer items-center gap-2 text-sm text-slate-900">
        <input
          id={`${id}-circles`}
          type="checkbox"
          checked={showCircles}
          onChange={(e) => setShowCircles(e.target.checked)}
          className="size-4 accent-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
        />
        Show 24px test circles
      </label>

      <p className={`flex items-start gap-2 text-sm font-semibold ${passes ? 'text-green-800' : 'text-red-800'}`}>
        {passes ? (
          <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        ) : (
          <XCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        )}
        <span>
          {size}×{size}px targets, {gap}px apart (centres {centreDistance}px apart):{' '}
          {passes
            ? size >= MIN_TARGET
              ? 'passes, each target is at least 24×24px.'
              : 'passes via the spacing exception.'
            : 'fails, 24px circles overlap.'}
        </span>
      </p>

      <p role="status" className="text-sm text-slate-700">
        {lastPressed ? `Last pressed: ${lastPressed}` : 'Nothing pressed yet'}
      </p>
    </div>
  )
}
