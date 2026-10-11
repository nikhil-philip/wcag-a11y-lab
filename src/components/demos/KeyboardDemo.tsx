import { ShoppingCart } from 'lucide-react'
import { useState } from 'react'
import type { DemoVariant } from './types'

const BUTTON_CLASSES =
  'inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lg bg-blue-700 px-4 text-sm font-semibold text-white hover:bg-blue-800'

const FOCUS_CLASSES =
  'focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-blue-700'

export function KeyboardDemo({ variant }: { variant: DemoVariant }) {
  const [count, setCount] = useState(0)
  const addItem = () => setCount((c) => c + 1)

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-slate-300 bg-white p-4">
      <p className="text-sm text-slate-700">
        Press <kbd className="rounded border border-slate-400 px-1 font-mono">Tab</kbd> to reach
        the button, then <kbd className="rounded border border-slate-400 px-1 font-mono">Enter</kbd>{' '}
        or <kbd className="rounded border border-slate-400 px-1 font-mono">Space</kbd>.
      </p>

      <div>
        {variant === 'fail' ? (
          // Intentional failure: tabIndex makes the <div> focusable, but it still ignores Enter/Space.
          <div
            tabIndex={0}
            className={`${BUTTON_CLASSES} ${FOCUS_CLASSES}`}
            onClick={addItem}
          >
            <ShoppingCart className="size-4" aria-hidden="true" />
            Add to cart
          </div>
        ) : (
          <button
            type="button"
            onClick={addItem}
            className={`${BUTTON_CLASSES} ${FOCUS_CLASSES}`}
          >
            <ShoppingCart className="size-4" aria-hidden="true" />
            Add to cart
          </button>
        )}
      </div>

      <p role="status" className="text-sm font-semibold text-slate-900">
        Items in cart: {count}
      </p>
    </div>
  )
}
