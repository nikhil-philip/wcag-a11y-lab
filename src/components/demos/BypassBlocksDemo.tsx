import { useId, useRef, useState, type FocusEvent, type KeyboardEvent, type MouseEvent } from 'react'
import type { DemoVariant } from './types'

const NAV_LINKS = [
  'New in',
  'Women',
  'Men',
  'Kids',
  'Home',
  'Beauty',
  'Shoes',
  'Bags',
  'Jewellery',
  'Sportswear',
  'Brands',
  'Gifts',
  'Sale',
  'Stores',
  'Help',
] as const

const noNavigate = (e: MouseEvent) => e.preventDefault()

const LINK_FOCUS = 'focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-blue-700'

export function BypassBlocksDemo({ variant }: { variant: DemoVariant }) {
  const id = useId()
  const mainId = `${id}-main`
  const rootRef = useRef<HTMLDivElement>(null)
  const mainRef = useRef<HTMLDivElement>(null)
  const pressesRef = useRef(0)
  const [reachedAfter, setReachedAfter] = useState<number | null>(null)

  // Start counting when keyboard focus enters the demo; the Tab that entered counts as one.
  function onFocusIn(e: FocusEvent<HTMLDivElement>) {
    const cameFromOutside = !rootRef.current?.contains(e.relatedTarget as Node | null)
    if (cameFromOutside) {
      pressesRef.current = e.target.matches(':focus-visible') ? 1 : 0
      setReachedAfter(null)
    }
    if (mainRef.current?.contains(e.target) && reachedAfter === null) {
      setReachedAfter(pressesRef.current)
    }
  }

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Tab' || e.key === 'Enter') pressesRef.current += 1
  }

  function skipToMain(e: MouseEvent<HTMLAnchorElement>) {
    // Move focus explicitly, so the next Tab continues from the main content in every browser.
    e.preventDefault()
    mainRef.current?.focus()
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-slate-300 bg-white p-4">
      <p className="text-sm text-slate-700">
        Press <kbd className="rounded border border-slate-400 px-1 font-mono">Tab</kbd> into this
        mini page and count the key presses to reach "Shop the sale".
      </p>

      <div
        ref={rootRef}
        onFocus={onFocusIn}
        onKeyDown={onKeyDown}
        className="relative overflow-hidden rounded-lg border border-slate-300"
      >
        {variant === 'pass' && (
          <a
            href={`#${mainId}`}
            onClick={skipToMain}
            className="sr-only rounded-md bg-white px-3 py-2 text-sm font-semibold text-blue-800 shadow-lg focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-10 focus:outline-3 focus:outline-offset-2 focus:outline-blue-700"
          >
            Skip to main content
          </a>
        )}

        <div className="border-b border-slate-300 bg-slate-100 p-3">
          <a href="#" onClick={noNavigate} className={`text-sm font-black text-slate-900 ${LINK_FOCUS}`}>
            ShopCo
          </a>
          {/* A labelled nav inside the lab is fine; a second <main> would not be, so the content below is a region. */}
          <nav aria-label="ShopCo departments" className="mt-2">
            <ul className="flex flex-wrap gap-x-3 gap-y-1">
              {NAV_LINKS.map((label) => (
                <li key={label}>
                  <a href="#" onClick={noNavigate} className={`text-xs text-blue-800 underline ${LINK_FOCUS}`}>
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div
          id={mainId}
          ref={mainRef}
          tabIndex={-1}
          role="region"
          aria-labelledby={`${id}-heading`}
          className="flex flex-col items-start gap-2 p-3 focus:outline-3 focus:-outline-offset-3 focus:outline-blue-700"
        >
          <h5 id={`${id}-heading`} className="text-base font-bold text-slate-900">
            Today's deals
          </h5>
          <p className="text-sm text-slate-700">Up to 40% off winter coats until Sunday.</p>
          <a href="#" onClick={noNavigate} className={`text-sm font-semibold text-blue-800 underline ${LINK_FOCUS}`}>
            Shop the sale
          </a>
        </div>
      </div>

      <p role="status" className="text-sm font-semibold text-slate-900">
        {reachedAfter === null
          ? `Tab stops before the main content: ${variant === 'pass' ? '1 (the skip link)' : NAV_LINKS.length + 1}`
          : `Reached the main content after ${reachedAfter} key ${reachedAfter === 1 ? 'press' : 'presses'}.`}
      </p>
    </div>
  )
}
