import { ArrowLeft, ArrowRight, Globe, Lock, RotateCw, ShoppingBag, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { DemoVariant } from './types'

const FOCUS = 'focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-blue-700'

type View = 'cart' | 'checkout' | 'settings'

const VIEWS: Record<View, { heading: string; path: string; body: string }> = {
  cart: { heading: 'Your cart', path: '/cart', body: '2 items: Trail running shoes, Water bottle. Subtotal ₹6,480.' },
  checkout: { heading: 'Checkout', path: '/checkout', body: 'Delivery to Asha Rao, Bengaluru 560001. Pay ₹6,480 by card or UPI.' },
  settings: { heading: 'Account settings', path: '/settings', body: 'Email, password and notification preferences.' },
}

const VIEW_ORDER: readonly View[] = ['cart', 'checkout', 'settings']

// What the site puts in <title> for each view. Intentional failure: the fail version never changes the
// build tool's default.
const TITLE: Record<DemoVariant, (view: View) => string> = {
  fail: () => 'React App',
  pass: (view) => `${VIEWS[view].heading} - SuperStore`,
}

// A second tab from the same site, to show whether the two can be told apart.
const OTHER_TAB: Record<DemoVariant, string> = {
  fail: 'React App',
  pass: 'Order history - SuperStore',
}

export function PageTitledDemo({ variant }: { variant: DemoVariant }) {
  const [view, setView] = useState<View>('checkout')
  const headingRef = useRef<HTMLHeadingElement>(null)
  const title = TITLE[variant](view)

  // Not document.title: that would rename the lab's own browser tab. A real single-page app sets it on
  // every view change, e.g. with React 19's <title> element.

  // After in-app navigation, move focus to the new view's heading (not on first render).
  const firstRender = useRef(true)
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    headingRef.current?.focus()
  }, [view])

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-slate-300 bg-white p-4">
      <p className="text-sm text-slate-700">Move between the store's pages and watch the browser tab.</p>

      {/* Mock browser window */}
      <div className="overflow-hidden rounded-lg border border-slate-400 shadow-sm">
        {/* Tab strip */}
        <ul aria-label="Browser tabs (simulated)" className="flex gap-1 bg-slate-300 px-2 pt-2">
          <li
            aria-current="true"
            className="flex max-w-[60%] min-w-0 items-center gap-1.5 rounded-t-lg bg-white px-3 py-1.5 text-xs font-semibold text-slate-900"
          >
            {variant === 'fail' ? (
              <Globe className="size-3.5 shrink-0 text-slate-500" aria-hidden="true" />
            ) : (
              <ShoppingBag className="size-3.5 shrink-0 text-blue-700" aria-hidden="true" />
            )}
            <span className="truncate">{title}</span>
            <X className="ml-1 size-3 shrink-0 text-slate-500" aria-hidden="true" />
          </li>
          <li className="flex max-w-[40%] min-w-0 items-center gap-1.5 rounded-t-lg bg-slate-200 px-3 py-1.5 text-xs text-slate-700">
            <span className="truncate">{OTHER_TAB[variant]}</span>
          </li>
        </ul>

        {/* Address bar */}
        <div className="flex items-center gap-2 border-b border-slate-300 bg-white px-2 py-1.5 text-slate-500" aria-hidden="true">
          <ArrowLeft className="size-4" />
          <ArrowRight className="size-4" />
          <RotateCw className="size-3.5" />
          <span className="flex min-w-0 flex-1 items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">
            <Lock className="size-3 shrink-0" />
            <span className="truncate">superstore.example{VIEWS[view].path}</span>
          </span>
        </div>

        {/* Page */}
        <div className="flex flex-col gap-3 bg-slate-50 p-3">
          <nav aria-label={`SuperStore (${variant} example)`}>
            <ul className="flex flex-wrap gap-x-4 gap-y-1">
              {VIEW_ORDER.map((v) => (
                <li key={v}>
                  <a
                    href={`#${v}`}
                    aria-current={v === view ? 'page' : undefined}
                    onClick={(e) => {
                      e.preventDefault()
                      setView(v)
                    }}
                    className={`rounded text-sm font-semibold underline ${FOCUS} ${
                      v === view ? 'text-slate-900 no-underline' : 'text-blue-800'
                    }`}
                  >
                    {VIEWS[v].heading}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <h5
            ref={headingRef}
            tabIndex={-1}
            className="text-base font-bold text-slate-900 focus:outline-3 focus:outline-offset-2 focus:outline-blue-700"
          >
            {VIEWS[view].heading}
          </h5>
          <p className="text-sm text-slate-800">{VIEWS[view].body}</p>
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold tracking-wide text-slate-600 uppercase">
          Screen reader hears when switching to this tab
        </p>
        <p className="font-mono text-sm text-slate-900">"{title}"</p>
        <p className={`mt-2 text-sm font-semibold ${variant === 'fail' ? 'text-red-800' : 'text-green-800'}`}>
          {variant === 'fail'
            ? 'Every page, and both tabs, are called "React App": the title says nothing about where you are.'
            : 'The title names the page first and the site second, and changes with every view.'}
        </p>
      </div>
    </div>
  )
}
