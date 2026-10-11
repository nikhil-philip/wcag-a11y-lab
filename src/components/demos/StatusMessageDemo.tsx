import { ShoppingCart } from 'lucide-react'
import { useState } from 'react'
import type { DemoVariant } from './types'

const PRODUCT = 'Wireless headphones'

export function StatusMessageDemo({ variant }: { variant: DemoVariant }) {
  const [count, setCount] = useState(0)

  // The count changes the text each time, so repeated clicks are re-announced.
  const message =
    count === 0 ? '' : `${PRODUCT} added. ${count} ${count === 1 ? 'item' : 'items'} in your cart.`

  const heard =
    count === 0
      ? '—'
      : variant === 'fail'
        ? '(silence: the message is not in a live region)'
        : `"${message}"`

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-slate-300 bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold text-slate-900">{PRODUCT}</p>
        <button
          type="button"
          onClick={() => setCount((c) => c + 1)}
          className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lg bg-blue-700 px-4 text-sm font-semibold text-white hover:bg-blue-800 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
        >
          <ShoppingCart className="size-4" aria-hidden="true" />
          Add to cart
        </button>
      </div>

      {/* Both containers are always rendered, so the live region exists before its text changes. */}
      {variant === 'fail' ? (
        // Intentional failure: visible text only, no live region, so nothing is announced.
        <p className="min-h-5 text-sm font-medium text-green-800">{message}</p>
      ) : (
        <p role="status" className="min-h-5 text-sm font-medium text-green-800">
          {message}
        </p>
      )}

      <div>
        <p className="mb-2 text-xs font-semibold tracking-wide text-slate-600 uppercase">
          Screen reader hears
        </p>
        <p className="font-mono text-sm text-slate-900">{heard}</p>
      </div>
    </div>
  )
}
