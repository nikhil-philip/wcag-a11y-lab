import { Cookie } from 'lucide-react'
import { useLayoutEffect, useRef, useState, type FocusEvent } from 'react'
import type { DemoVariant } from './types'

const LINKS = [
  'Shipping & delivery',
  'Returns and refunds',
  'Track your order',
  'Size guide',
  'Gift cards',
  'Store locator',
  'Student discount',
  'Accessibility statement',
  'Contact us',
] as const

type Visibility = 'visible' | 'partly' | 'hidden'

const VISIBILITY_TEXT: Record<Visibility, { text: string; className: string }> = {
  visible: { text: 'fully visible', className: 'text-green-800' },
  partly: { text: 'partly hidden by the banner', className: 'text-amber-800' },
  hidden: { text: 'completely hidden by the banner', className: 'text-red-800' },
}

export function FocusObscuredDemo({ variant }: { variant: DemoVariant }) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const bannerRef = useRef<HTMLDivElement>(null)
  const [bannerHeight, setBannerHeight] = useState(0)
  const [showBanner, setShowBanner] = useState(true)
  const [focused, setFocused] = useState<{ label: string; visibility: Visibility } | null>(null)

  // Track the banner's real height: it grows when its text wraps on narrow screens.
  useLayoutEffect(() => {
    const banner = bannerRef.current
    if (!banner) return
    const observer = new ResizeObserver(() => setBannerHeight(banner.offsetHeight))
    observer.observe(banner)
    return () => observer.disconnect()
  }, [showBanner])

  const gap = bannerHeight + 8

  function measure(link: HTMLElement) {
    const banner = bannerRef.current
    const scroller = scrollerRef.current
    if (!scroller) return
    const r = link.getBoundingClientRect()
    const visibleBottom = banner && showBanner ? banner.getBoundingClientRect().top : scroller.getBoundingClientRect().bottom
    const visibility: Visibility = r.top >= visibleBottom ? 'hidden' : r.bottom > visibleBottom ? 'partly' : 'visible'
    setFocused({ label: link.textContent ?? '', visibility })
  }

  function onLinkFocus(e: FocusEvent<HTMLAnchorElement>) {
    const link = e.currentTarget
    if (variant === 'pass') {
      // scroll-padding already handles this in most browsers; scrollIntoView (which honours
      // scroll-padding everywhere) covers browsers whose focus scrolling ignores it.
      link.scrollIntoView({ block: 'nearest' })
    }
    requestAnimationFrame(() => measure(link))
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-slate-300 bg-white p-4">
      <p className="text-sm text-slate-700">
        Press <kbd className="rounded border border-slate-400 px-1 font-mono">Tab</kbd> to move
        through the help links. Keep an eye on the focus ring.
      </p>

      <div className="relative overflow-hidden rounded-lg border border-slate-300">
        <div
          ref={scrollerRef}
          className="h-60 overflow-y-auto bg-slate-50 p-2"
          // Pass: keep focused items clear of the banner, and leave room to scroll the last one above it.
          style={variant === 'pass' && showBanner ? { scrollPaddingBottom: gap, paddingBottom: gap } : undefined}
        >
          <h5 className="px-2 pt-1 pb-2 text-sm font-bold text-slate-900">Customer help</h5>
          <ul className="flex flex-col gap-1">
            {LINKS.map((label) => (
              <li key={label}>
                <a
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  onFocus={onLinkFocus}
                  onBlur={() => setFocused(null)}
                  className="flex min-h-11 items-center rounded-md px-3 text-sm font-medium text-blue-800 underline hover:bg-blue-50 focus-visible:outline-3 focus-visible:-outline-offset-3 focus-visible:outline-blue-700"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {showBanner && (
          <div
            ref={bannerRef}
            role="region"
            aria-label="Cookie consent"
            className="absolute inset-x-0 bottom-0 flex flex-wrap items-center gap-2 border-t border-slate-700 bg-slate-800 p-3 text-sm text-white shadow-[0_-4px_12px_rgb(0_0_0/0.2)]"
          >
            <Cookie className="size-5 shrink-0" aria-hidden="true" />
            <p className="min-w-0 flex-1">We use cookies to remember your basket.</p>
            <button
              type="button"
              onClick={() => setShowBanner(false)}
              className="inline-flex min-h-9 cursor-pointer items-center rounded-md bg-white px-3 font-semibold text-slate-900 hover:bg-slate-200 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Accept
            </button>
          </div>
        )}
      </div>

      {!showBanner && (
        <button
          type="button"
          onClick={() => setShowBanner(true)}
          className="inline-flex min-h-11 cursor-pointer items-center self-start rounded-lg border-2 border-slate-500 px-4 text-sm font-semibold text-slate-900 hover:bg-slate-100 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
        >
          Show the banner again
        </button>
      )}

      <p className={`text-sm font-semibold ${focused ? VISIBILITY_TEXT[focused.visibility].className : 'text-slate-700'}`}>
        {focused
          ? `"${focused.label}" is ${VISIBILITY_TEXT[focused.visibility].text}.`
          : 'No help link focused.'}
      </p>
    </div>
  )
}
