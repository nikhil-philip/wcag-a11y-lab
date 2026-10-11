import { useEffect, useRef, useState } from 'react'
import type { DemoVariant } from './types'

const FOCUS = 'focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-blue-700'

type Page = 'home' | 'products' | 'about'

const PAGES: Record<Page, { title: string; body: string }> = {
  home: { title: 'Home', body: 'Fresh bread and pastries, baked every morning in Pune.' },
  products: { title: 'Products', body: 'Sourdough, croissants, seasonal fruit tarts and more.' },
  about: { title: 'About', body: 'A family bakery since 1998, now with three shops.' },
}

// The order of the main navigation links on each page.
const NAV_ORDER: Record<DemoVariant, Record<Page, readonly Page[]>> = {
  // Intentional failure: each page's menu was built separately, and the order drifted.
  fail: {
    home: ['home', 'products', 'about'],
    products: ['about', 'home', 'products'],
    about: ['products', 'about', 'home'],
  },
  // One shared list, so the order is identical everywhere.
  pass: {
    home: ['home', 'products', 'about'],
    products: ['home', 'products', 'about'],
    about: ['home', 'products', 'about'],
  },
}

const orderText = (order: readonly Page[]) => order.map((p) => PAGES[p].title).join(' → ')

export function ConsistentNavigationDemo({ variant }: { variant: DemoVariant }) {
  const [page, setPage] = useState<Page>('home')
  const [previous, setPrevious] = useState<Page | null>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)

  // After in-app navigation, move focus to the new page's heading (not on first render).
  const firstRender = useRef(true)
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    headingRef.current?.focus()
  }, [page])

  function go(next: Page) {
    if (next === page) return
    setPrevious(page)
    setPage(next)
  }

  const order = NAV_ORDER[variant][page]
  const previousOrder = previous ? NAV_ORDER[variant][previous] : null
  const changed = previousOrder !== null && orderText(previousOrder) !== orderText(order)

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-slate-300 bg-white p-4">
      <p className="text-sm text-slate-700">Visit all three pages and watch the menu.</p>

      <div className="overflow-hidden rounded-lg border border-slate-300">
        <div className="flex flex-col gap-2 border-b border-slate-300 bg-slate-100 p-3">
          <p className="text-sm font-bold text-slate-900">🥐 Crumb &amp; Co.</p>
          <nav aria-label={`Crumb & Co. (${variant} example)`}>
            <ul className="flex flex-wrap gap-2">
              {order.map((p) => (
                <li key={p}>
                  <a
                    href={`#${p}`}
                    aria-current={p === page ? 'page' : undefined}
                    onClick={(e) => {
                      e.preventDefault()
                      go(p)
                    }}
                    className={`inline-flex min-h-11 items-center rounded-lg px-3 text-sm font-semibold ${FOCUS} ${
                      p === page ? 'bg-blue-700 text-white' : 'bg-white text-blue-800 underline hover:bg-blue-50'
                    }`}
                  >
                    {PAGES[p].title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="flex min-h-24 flex-col gap-1 bg-white p-3">
          <h5
            ref={headingRef}
            tabIndex={-1}
            className="text-base font-bold text-slate-900 focus:outline-3 focus:outline-offset-2 focus:outline-blue-700"
          >
            {PAGES[page].title}
          </h5>
          <p className="text-sm text-slate-800">{PAGES[page].body}</p>
        </div>
      </div>

      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
        <dt className="font-semibold text-slate-600">Menu on this page</dt>
        <dd className="text-slate-900">{orderText(order)}</dd>
        <dt className="font-semibold text-slate-600">Previous page</dt>
        <dd className="text-slate-900">{previousOrder ? orderText(previousOrder) : '—'}</dd>
        <dt className="font-semibold text-slate-600">Tabs to reach About</dt>
        <dd className="text-slate-900">{order.indexOf('about') + 1}</dd>
      </dl>

      <p role="status" className={`min-h-5 text-sm font-semibold ${changed ? 'text-red-800' : previous ? 'text-green-800' : 'text-slate-900'}`}>
        {previous === null
          ? ''
          : changed
            ? 'The menu changed order. Anyone who learned where a link sits has to find it again.'
            : 'Same order as the last page: links stay where users expect them.'}
      </p>
    </div>
  )
}
