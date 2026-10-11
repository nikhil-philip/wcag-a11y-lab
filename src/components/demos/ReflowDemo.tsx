import { Check, CheckCircle2, MonitorSmartphone, XCircle } from 'lucide-react'
import { useRef, useState } from 'react'
import type { DemoVariant } from './types'
import { useHiddenOverflow } from './useHiddenOverflow'

const PLANS = [
  { name: 'Basic', price: '₹199', features: ['1 screen', 'HD streaming'] },
  { name: 'Standard', price: '₹499', features: ['2 screens', 'Full HD', 'Downloads'] },
  { name: 'Premium', price: '₹649', features: ['4 screens', '4K + HDR', 'Downloads'] },
] as const

const GRID: Record<DemoVariant, string> = {
  // Intentional failure: three fixed 11rem columns, whatever the available width.
  fail: 'grid w-max grid-cols-[repeat(3,11rem)] gap-3',
  // Container query, so the simulated 320px frame triggers stacking (a media query would only see the real viewport).
  pass: 'grid gap-3 @min-[22rem]:grid-cols-3',
}

export function ReflowDemo({ variant }: { variant: DemoVariant }) {
  const [narrow, setNarrow] = useState(false)
  const frameRef = useRef<HTMLDivElement>(null)
  const hiddenX = useHiddenOverflow(frameRef, narrow, 'x')
  const scrollsSideways = hiddenX > 1

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-slate-300 bg-white p-4">
      <button
        type="button"
        aria-pressed={narrow}
        onClick={() => setNarrow((n) => !n)}
        className={`inline-flex min-h-11 cursor-pointer items-center gap-2 self-start rounded-lg border-2 px-4 text-sm font-semibold focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-blue-700 ${
          narrow
            ? 'border-blue-700 bg-blue-700 text-white hover:bg-blue-800'
            : 'border-slate-500 bg-white text-slate-900 hover:bg-slate-100'
        }`}
      >
        <MonitorSmartphone className="size-4" aria-hidden="true" />
        Simulate 320px viewport
      </button>

      <div
        ref={frameRef}
        // A scrollable area must be keyboard-reachable, so the failure is about reflow, not 2.1.1.
        tabIndex={scrollsSideways ? 0 : undefined}
        role={scrollsSideways ? 'region' : undefined}
        aria-label={scrollsSideways ? 'Pricing plans (scrolls sideways)' : undefined}
        style={narrow ? { width: 320 } : undefined}
        className="@container max-w-full overflow-x-auto rounded-lg border-2 border-dashed border-slate-400 bg-slate-50 p-3 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
      >
        <ul className={GRID[variant]}>
          {PLANS.map((plan) => (
            <li key={plan.name} className="flex flex-col gap-2 rounded-lg border border-slate-300 bg-white p-3">
              <h5 className="text-sm font-bold text-slate-900">{plan.name}</h5>
              <p className="text-slate-900">
                <span className="text-xl font-bold">{plan.price}</span>
                <span className="text-xs text-slate-700"> / month</span>
              </p>
              <ul className="flex flex-1 flex-col gap-1 text-xs text-slate-700">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-1.5">
                    <Check className="size-3.5 shrink-0 text-green-700" aria-hidden="true" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                className="min-h-11 cursor-pointer rounded-lg bg-blue-700 px-3 text-sm font-semibold text-white hover:bg-blue-800 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
              >
                Choose {plan.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <p
        role="status"
        className={`flex items-start gap-2 text-sm font-semibold ${scrollsSideways ? 'text-red-800' : 'text-green-800'}`}
      >
        {scrollsSideways ? (
          <XCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        ) : (
          <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        )}
        <span>
          {scrollsSideways
            ? `${Math.round(hiddenX)}px of plans are off to the side: you have to scroll in two directions.`
            : narrow
              ? 'The plans stack at 320px, so only vertical scrolling is needed.'
              : 'All plans fit without scrolling sideways.'}
        </span>
      </p>
    </div>
  )
}
