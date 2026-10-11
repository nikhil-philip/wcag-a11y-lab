import { ExternalLink } from 'lucide-react'
import type { DemoVariant } from './types'

const FOCUS = 'focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-blue-700'

// 1.3.1 is about page structure, so each version is a whole standalone page in public/examples. Both
// pages share one stylesheet and look the same; only the markup differs. Testing them in their own
// tab keeps their landmarks and headings separate from the lab's.
const PAGE: Record<DemoVariant, string> = {
  fail: 'examples/info-relationships-fail.html',
  pass: 'examples/info-relationships-pass.html',
}

interface Check {
  structure: string
  /** What to press in NVDA (browse mode). */
  keys: string
  /** What NVDA reports. */
  result: string
}

const CHECKS: Record<DemoVariant, readonly Check[]> = {
  fail: [
    {
      structure: 'Landmarks',
      keys: 'D',
      result: '"No next landmark". The header, nav bar, breadcrumb, sidebar and footer are plain <div>s.',
    },
    { structure: 'Headings', keys: 'H', result: '"No next heading". "Order #4821" and the card titles are only bold text.' },
    {
      structure: 'Key-value pairs',
      keys: 'Down arrow',
      result: 'Six separate lines: "Order number", "#4821", "Placed"… Nothing groups them or pairs a label with its value.',
    },
    { structure: 'Table', keys: 'T', result: '"No next table". Ctrl+Alt+arrows do nothing, so "₹398" is never tied to "Price".' },
    { structure: 'List', keys: 'L', result: '"No next list". The three items are separate lines with no count.' },
    {
      structure: 'Grouping',
      keys: 'Tab to the first radio',
      result: '"Standard (3–5 days), radio button, checked, 1 of 2". The question "Delivery speed" is not announced.',
    },
  ],
  pass: [
    {
      structure: 'Landmarks',
      keys: 'D',
      result: '"banner landmark", "navigation landmark", "Breadcrumb navigation landmark", "main landmark", "Order help complementary landmark", "content info landmark".',
    },
    { structure: 'Headings', keys: 'H', result: '"Order #4821, heading level 1", then each card title as heading level 2.' },
    {
      structure: 'Key-value pairs',
      keys: 'Down arrow',
      result:
        '"list with 6 items", the six terms and values, then "out of list". NVDA counts each <dt> and <dd> as an item and does not say which is the term, but the pairs are kept together, in order.',
    },
    {
      structure: 'Table',
      keys: 'T, then Ctrl+Alt+arrows',
      result: '"Items in this order, table with 3 rows and 3 columns". Each cell is read with its row and column headers, e.g. "USB-C cable, Price, ₹398".',
    },
    { structure: 'List', keys: 'L', result: '"list with 3 items", "bullet Wireless mouse"…, "out of list".' },
    {
      structure: 'Grouping',
      keys: 'Tab to the first radio',
      result: '"Delivery speed, grouping", then "Standard (3–5 days), radio button, checked, 1 of 2".',
    },
  ],
}

export function InfoRelationshipsDemo({ variant }: { variant: DemoVariant }) {
  const href = `${import.meta.env.BASE_URL}${PAGE[variant]}`

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-slate-300 bg-white p-4">
      <p className="text-sm text-slate-700">
        Both pages look the same. Open this one in a new tab and explore it with NVDA in browse mode.
      </p>

      {/* Visual preview only. inert keeps the page's landmarks and headings out of the lab's own, so
          screen-reader users test it in its own tab through the link below. */}
      <iframe
        src={href}
        title={`${variant} example page preview`}
        inert
        aria-hidden="true"
        tabIndex={-1}
        className="h-80 w-full rounded-lg border border-slate-300 bg-slate-100"
      />

      <a
        href={href}
        target="_blank"
        rel="noopener"
        className={`inline-flex min-h-11 items-center gap-2 self-start rounded-lg bg-blue-700 px-4 text-sm font-semibold text-white hover:bg-blue-800 ${FOCUS}`}
      >
        Open the {variant} page
        <ExternalLink className="size-4" aria-hidden="true" />
        <span className="sr-only">(opens in a new tab)</span>
      </a>

      <div>
        <p className="mb-2 text-xs font-semibold tracking-wide text-slate-600 uppercase">What NVDA reports</p>
        <dl className="flex flex-col gap-3 text-sm">
          {CHECKS[variant].map((c) => (
            <div key={c.structure}>
              <dt className="font-semibold text-slate-900">
                {c.structure}{' '}
                <span className="font-normal text-slate-600">
                  (<kbd className="font-mono">{c.keys}</kbd>)
                </span>
              </dt>
              <dd className="text-slate-700">{c.result}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  )
}
