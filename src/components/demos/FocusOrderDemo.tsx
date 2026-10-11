import { useRef, useState, type FocusEvent } from 'react'
import type { DemoVariant } from './types'

interface Plan {
  name: string
  price: string
  /** 1-based position on screen, left to right (top to bottom when stacked). */
  position: number
  /** Only used by the fail version to fake the visual order. */
  orderClass: string
}

const PLANS = {
  Basic: { name: 'Basic', price: '₹0', position: 1, orderClass: 'order-1' },
  Pro: { name: 'Pro', price: '₹499', position: 2, orderClass: 'order-2' },
  Enterprise: { name: 'Enterprise', price: 'Custom', position: 3, orderClass: 'order-3' },
} satisfies Record<string, Plan>

const DOM_ORDER: Record<DemoVariant, readonly Plan[]> = {
  // Intentional failure: source order is Pro, Enterprise, Basic; CSS `order` makes it look like Basic, Pro, Enterprise.
  fail: [PLANS.Pro, PLANS.Enterprise, PLANS.Basic],
  pass: [PLANS.Basic, PLANS.Pro, PLANS.Enterprise],
}

const ORDINAL = ['1st', '2nd', '3rd']

export function FocusOrderDemo({ variant }: { variant: DemoVariant }) {
  const rootRef = useRef<HTMLDivElement>(null)
  const [path, setPath] = useState<Plan[]>([])

  // Record each plan button as it receives focus; start again when focus enters from outside.
  function onFocusIn(plan: Plan) {
    return (e: FocusEvent) => {
      const fromOutside = !rootRef.current?.contains(e.relatedTarget as Node | null)
      setPath((p) => (fromOutside ? [plan] : [...p, plan]))
    }
  }

  // A step to anything other than a neighbouring plan is a jump across the layout.
  const jumps = path.some((p, i) => {
    const prev = path[i - 1]
    return prev !== undefined && Math.abs(p.position - prev.position) !== 1
  })

  return (
    <div ref={rootRef} className="flex flex-col gap-4 rounded-lg border border-slate-300 bg-white p-4">
      <p className="text-sm text-slate-700">
        Press <kbd className="rounded border border-slate-400 px-1 font-mono">Tab</kbd> through the
        "Select" buttons and watch where focus goes.
      </p>

      <ul className="@container grid gap-3 @min-[22rem]:grid-cols-3">
        {DOM_ORDER[variant].map((plan) => (
          <li
            key={plan.name}
            className={`flex flex-col gap-2 rounded-lg border border-slate-300 bg-slate-50 p-3 ${
              variant === 'fail' ? plan.orderClass : ''
            }`}
          >
            <h5 className="text-sm font-bold text-slate-900">{plan.name}</h5>
            <p className="text-lg font-bold text-slate-900">{plan.price}</p>
            <button
              type="button"
              onFocus={onFocusIn(plan)}
              className="mt-auto min-h-11 cursor-pointer rounded-lg bg-blue-700 px-3 text-sm font-semibold text-white hover:bg-blue-800 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
            >
              Select {plan.name}
            </button>
          </li>
        ))}
      </ul>

      <div>
        <p className="mb-2 text-xs font-semibold tracking-wide text-slate-600 uppercase">Focus path</p>
        {path.length === 0 ? (
          <p className="text-sm text-slate-700">No plan focused yet.</p>
        ) : (
          <ol className="flex flex-wrap items-center gap-1 text-sm text-slate-900">
            {path.map((plan, i) => (
              <li key={i} className="flex items-center gap-1">
                {i > 0 && <span aria-hidden="true">→</span>}
                <span className="rounded bg-slate-100 px-1.5 py-0.5">
                  {plan.name} <span className="text-slate-600">({ORDINAL[plan.position - 1]} on screen)</span>
                </span>
              </li>
            ))}
          </ol>
        )}
        {path.length > 1 && (
          <p className={`mt-2 text-sm font-semibold ${jumps ? 'text-red-800' : 'text-green-800'}`}>
            {jumps
              ? 'Focus jumps around the screen instead of moving in reading order.'
              : 'Focus moves in the same order you read the plans.'}
          </p>
        )}
      </div>
    </div>
  )
}
