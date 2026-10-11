import { Search } from 'lucide-react'
import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from 'react'
import type { DemoVariant } from './types'

const FOCUS = 'focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-blue-700'
const LINK = `rounded text-sm font-semibold text-blue-800 underline ${FOCUS}`

type PageKey = 'home' | 'products' | 'services' | 'company' | 'careers' | 'press' | 'contact' | 'sitemap'

interface PageInfo {
  title: string
  body: string
  /** Pages linked from this one's content. */
  children?: readonly PageKey[]
  /** Extra words the site search matches, besides the title. */
  keywords: readonly string[]
}

const PAGES: Record<PageKey, PageInfo> = {
  home: { title: 'Home', body: 'Brightline makes solar lamps for homes and schools.', keywords: ['welcome'] },
  products: { title: 'Products', body: 'Desk lamps, lanterns and street lights, all solar powered.', keywords: ['lamps', 'buy', 'shop'] },
  services: { title: 'Services', body: 'Installation, repairs and bulk orders for schools.', keywords: ['install', 'repair', 'support'] },
  company: {
    title: 'Company',
    body: 'Founded in 2014 in Pune. Learn more about us:',
    children: ['careers', 'press', 'contact'],
    keywords: ['about', 'us'],
  },
  careers: { title: 'Careers', body: 'We are hiring engineers and field technicians.', keywords: ['jobs', 'hiring'] },
  press: { title: 'Press', body: 'News coverage and our media kit.', keywords: ['news', 'media'] },
  contact: {
    title: 'Contact Us',
    body: 'Email hello@brightline.example or call +91 20 4000 1234, Monday to Friday.',
    keywords: ['email', 'phone', 'call', 'help', 'support', 'address', 'contact'],
  },
  sitemap: { title: 'Sitemap', body: 'Every page on this site:', keywords: ['index', 'all pages'] },
}

const NAV: readonly PageKey[] = ['home', 'products', 'services', 'company']
// Shown on the sitemap page as a tree: top-level pages, with their children nested.
const TREE: readonly PageKey[] = ['home', 'products', 'services', 'company']

type Route = { page: PageKey } | { page: 'search'; query: string }
type Via = 'menus' | 'search' | 'sitemap'

function search(query: string): PageKey[] {
  const q = query.trim().toLowerCase()
  if (q === '') return []
  return (Object.keys(PAGES) as PageKey[]).filter((key) => {
    const { title, keywords } = PAGES[key]
    return title.toLowerCase().includes(q) || keywords.some((k) => k.includes(q) || q.includes(k))
  })
}

export function MultipleWaysDemo({ variant }: { variant: DemoVariant }) {
  const id = useId()
  const [route, setRoute] = useState<Route>({ page: 'home' })
  const [query, setQuery] = useState('')
  const [clicks, setClicks] = useState(0)
  const [found, setFound] = useState<{ via: Via; clicks: number } | null>(null)

  // A new page replaces the old one, so move focus to its heading (not on first render), as a real
  // single-page app should after navigation.
  const headingRef = useRef<HTMLHeadingElement>(null)
  const routeKey = route.page === 'search' ? `search:${route.query}` : route.page
  const firstRender = useRef(true)
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    headingRef.current?.focus()
  }, [routeKey])

  function go(next: Route, via: Via) {
    const count = clicks + 1
    setClicks(count)
    setRoute(next)
    if (next.page === 'contact' && !found) setFound({ via, clicks: count })
  }

  function onSearch(e: FormEvent) {
    e.preventDefault()
    go({ page: 'search', query }, 'search')
  }

  function reset() {
    setRoute({ page: 'home' })
    setQuery('')
    setClicks(0)
    setFound(null)
  }

  /** An in-site link. `via` records how the user got there, for the feedback line. A render function,
   *  not a component: a component declared in here would be a new type each render and remount. */
  function pageLink(to: PageKey, via: Via) {
    const current = route.page === to
    return (
      <a
        href={`#${to}`}
        aria-current={current ? 'page' : undefined}
        onClick={(e) => {
          e.preventDefault()
          go({ page: to }, via)
        }}
        className={`${LINK} ${current ? 'text-slate-900 no-underline' : ''}`}
      >
        {PAGES[to].title}
      </a>
    )
  }

  // The route the user arrived by decides what counts as "via" for links inside the page.
  const contentVia: Via = route.page === 'sitemap' ? 'sitemap' : route.page === 'search' ? 'search' : 'menus'

  let heading: string
  let content: ReactNode
  if (route.page === 'search') {
    const results = search(route.query)
    heading = `Search results for "${route.query.trim()}"`
    content =
      results.length === 0 ? (
        <p className="text-sm text-slate-700">No pages found. Try "contact" or "phone".</p>
      ) : (
        <ul className="flex list-disc flex-col gap-1 pl-5">
          {results.map((key) => (
            <li key={key}>
              {pageLink(key, 'search')}
            </li>
          ))}
        </ul>
      )
  } else if (route.page === 'sitemap') {
    heading = PAGES.sitemap.title
    content = (
      <ul className="flex list-disc flex-col gap-1 pl-5">
        {TREE.map((key) => (
          <li key={key}>
            {pageLink(key, 'sitemap')}
            {PAGES[key].children && (
              <ul className="mt-1 flex list-[circle] flex-col gap-1 pl-5">
                {PAGES[key].children.map((child) => (
                  <li key={child}>
                    {pageLink(child, 'sitemap')}
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    )
  } else {
    const info = PAGES[route.page]
    heading = info.title
    content = (
      <>
        <p className="text-sm text-slate-800">{info.body}</p>
        {info.children && (
          <ul className="flex flex-wrap gap-x-4 gap-y-1">
            {info.children.map((child) => (
              <li key={child}>
                {pageLink(child, contentVia)}
              </li>
            ))}
          </ul>
        )}
      </>
    )
  }

  const VIA_TEXT: Record<Via, string> = {
    menus: 'by hunting through the menus',
    search: 'with the site search',
    sitemap: 'from the sitemap',
  }

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-slate-300 bg-white p-4">
      <p className="text-sm text-slate-700">Find the "Contact Us" page.</p>

      {/* Plain divs, not <header>/<main>/<footer>: this mock site sits inside the lab page, which already
          has those landmarks, and a second <main> would be invalid. */}
      <div className="overflow-hidden rounded-lg border border-slate-300">
        <div className="flex flex-col gap-2 border-b border-slate-300 bg-slate-100 p-3">
          <p className="text-sm font-bold text-slate-900">☀ Brightline</p>
          <nav aria-label={`Brightline (${variant} example)`}>
            <ul className="flex flex-wrap gap-x-4 gap-y-1">
              {NAV.map((key) => (
                <li key={key}>
                  {pageLink(key, 'menus')}
                </li>
              ))}
            </ul>
          </nav>
          {variant === 'pass' && (
            <form role="search" onSubmit={onSearch} className="flex gap-2">
              <label htmlFor={`${id}-q`} className="sr-only">
                Search site
              </label>
              <input
                id={`${id}-q`}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search site"
                className={`min-h-11 min-w-0 flex-1 rounded-lg border-2 border-slate-500 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-600 ${FOCUS}`}
              />
              <button
                type="submit"
                className={`inline-flex min-h-11 shrink-0 cursor-pointer items-center gap-1.5 rounded-lg bg-blue-700 px-3 text-sm font-semibold text-white hover:bg-blue-800 ${FOCUS}`}
              >
                <Search className="size-4" aria-hidden="true" />
                Search
              </button>
            </form>
          )}
        </div>

        <div className="flex min-h-28 flex-col gap-2 bg-white p-3">
          <h5 ref={headingRef} tabIndex={-1} className="text-base font-bold text-slate-900 focus:outline-3 focus:outline-offset-2 focus:outline-blue-700">
            {heading}
          </h5>
          {content}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-300 bg-slate-100 p-3 text-xs text-slate-700">
          <span>© 2026 Brightline</span>
          {variant === 'pass' && pageLink('sitemap', 'sitemap')}
        </div>
      </div>

      <p role="status" className="min-h-5 text-sm font-semibold text-slate-900">
        {found
          ? `Found Contact Us ${VIA_TEXT[found.via]}, after ${found.clicks} ${found.clicks === 1 ? 'step' : 'steps'}.`
          : variant === 'fail'
            ? 'The header menu is the only way to look for a page.'
            : 'Browse the menu, search the site, or open the sitemap in the footer.'}
      </p>

      {clicks > 0 && (
        <button
          type="button"
          onClick={reset}
          className={`inline-flex min-h-11 cursor-pointer items-center self-start rounded-lg border-2 border-slate-500 bg-white px-4 text-sm font-semibold text-slate-900 hover:bg-slate-100 ${FOCUS}`}
        >
          Reset demo
        </button>
      )}
    </div>
  )
}
