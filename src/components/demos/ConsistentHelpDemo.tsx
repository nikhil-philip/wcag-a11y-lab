import { LifeBuoy } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { DemoVariant } from './types'

const FOCUS = 'focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-blue-700'

type Page = 'home' | 'plans' | 'account'
type HelpSpot = 'fab' | 'header' | 'footer'

const PAGES: Record<Page, { title: string; body: string }> = {
  home: { title: 'Home', body: 'Mobile plans with no hidden fees.' },
  plans: { title: 'Plans', body: 'Choose 2 GB, 10 GB or unlimited data per day.' },
  account: { title: 'Account', body: 'Your bill of ₹499 is due on 5 October.' },
}

const PAGE_ORDER: readonly Page[] = ['home', 'plans', 'account']

// Where the help mechanism sits on each page.
const HELP_SPOT: Record<DemoVariant, Record<Page, HelpSpot>> = {
  // Intentional failure: help moves, both on screen and in the page (DOM) order, and changes its name.
  fail: { home: 'fab', plans: 'header', account: 'footer' },
  // One shared component in one slot of the layout: always the last thing on the page, bottom right.
  pass: { home: 'fab', plans: 'fab', account: 'fab' },
}

const SPOT_TEXT: Record<HelpSpot, string> = {
  fab: 'a "Help" button, bottom right (last in the page order)',
  header: 'a "Help" link, top left (first in the page order)',
  footer: 'a small "Support" link inside the footer',
}

export function ConsistentHelpDemo({ variant }: { variant: DemoVariant }) {
  const [page, setPage] = useState<Page>('home')
  const [previous, setPrevious] = useState<Page | null>(null)
  const [helpOpened, setHelpOpened] = useState(false)
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
    setHelpOpened(false)
  }

  const spot = HELP_SPOT[variant][page]
  const previousSpot = previous ? HELP_SPOT[variant][previous] : null
  const moved = previousSpot !== null && previousSpot !== spot

  const openHelp = () => setHelpOpened(true)

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-slate-300 bg-white p-4">
      <p className="text-sm text-slate-700">Visit each page and find the way to get help.</p>

      <div className="relative overflow-hidden rounded-lg border border-slate-300">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-slate-300 bg-slate-100 p-3">
          {spot === 'header' && (
            <a
              href="#help"
              onClick={(e) => {
                e.preventDefault()
                openHelp()
              }}
              className={`inline-flex items-center gap-1 rounded text-sm font-semibold text-blue-800 underline ${FOCUS}`}
            >
              <LifeBuoy className="size-4" aria-hidden="true" />
              Help
            </a>
          )}
          <p className="text-sm font-bold text-slate-900">📶 Skyline Mobile</p>
          <nav aria-label={`Skyline Mobile (${variant} example)`}>
            <ul className="flex flex-wrap gap-x-4 gap-y-1">
              {PAGE_ORDER.map((p) => (
                <li key={p}>
                  <a
                    href={`#${p}`}
                    aria-current={p === page ? 'page' : undefined}
                    onClick={(e) => {
                      e.preventDefault()
                      go(p)
                    }}
                    className={`rounded text-sm font-semibold underline ${FOCUS} ${p === page ? 'text-slate-900 no-underline' : 'text-blue-800'}`}
                  >
                    {PAGES[p].title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="flex min-h-32 flex-col gap-1 bg-white p-3 pb-16">
          <h5
            ref={headingRef}
            tabIndex={-1}
            className="text-base font-bold text-slate-900 focus:outline-3 focus:outline-offset-2 focus:outline-blue-700"
          >
            {PAGES[page].title}
          </h5>
          <p className="text-sm text-slate-800">{PAGES[page].body}</p>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 border-t border-slate-300 bg-slate-100 px-3 py-2 text-xs text-slate-700">
          <span>© 2026 Skyline Mobile · Terms · Privacy</span>
          {spot === 'footer' && (
            <a
              href="#help"
              onClick={(e) => {
                e.preventDefault()
                openHelp()
              }}
              className={`rounded text-xs text-blue-800 underline ${FOCUS}`}
            >
              Support
            </a>
          )}
        </div>

        {/* Last in the DOM, pinned above the footer at the bottom right. */}
        {spot === 'fab' && (
          <button
            type="button"
            onClick={openHelp}
            className={`absolute right-3 bottom-12 inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-full bg-blue-700 px-4 text-sm font-semibold text-white shadow-lg hover:bg-blue-800 ${FOCUS}`}
          >
            <LifeBuoy className="size-4" aria-hidden="true" />
            Help
          </button>
        )}
      </div>

      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
        <dt className="font-semibold text-slate-600">Help on this page</dt>
        <dd className="text-slate-900">{SPOT_TEXT[spot]}</dd>
        <dt className="font-semibold text-slate-600">Previous page</dt>
        <dd className="text-slate-900">{previousSpot ? SPOT_TEXT[previousSpot] : '—'}</dd>
      </dl>

      <p
        role="status"
        className={`min-h-5 text-sm font-semibold ${
          helpOpened ? 'text-slate-900' : moved ? 'text-red-800' : previous ? 'text-green-800' : 'text-slate-900'
        }`}
      >
        {helpOpened
          ? 'Support chat opened.'
          : previous === null
            ? ''
            : moved
              ? 'Help moved. Users who remember where help was have to search for it, often when they need it most.'
              : 'Help is in the same place as on the last page.'}
      </p>
    </div>
  )
}
