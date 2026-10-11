import { ShieldCheck, WifiOff, Zap, type LucideIcon } from 'lucide-react'
import type { DemoVariant } from './types'

interface Feature {
  /** Card letter, shown in the readout so you can see which card each line belongs to. */
  card: string
  /** Decorative: the title already says what the card is about, so the icon is hidden from screen readers. */
  Icon: LucideIcon
  title: string
  description: string
}

const FEATURES: readonly Feature[] = [
  { card: 'A', Icon: Zap, title: 'Fast', description: 'Pages load in under a second.' },
  { card: 'B', Icon: ShieldCheck, title: 'Secure', description: 'Your data is encrypted end to end.' },
  { card: 'C', Icon: WifiOff, title: 'Offline', description: 'Keep working without a connection.' },
]

type Part = 'title' | 'description'

const HEARD: Record<Part, (f: Feature) => string> = {
  title: (f) => `heading level 5, "${f.title}"`,
  description: (f) => `"${f.description}"`,
}

// The order a screen reader meets each part in the DOM.
const READING_ORDER: Record<DemoVariant, readonly { part: Part; feature: Feature }[]> = {
  // Row by row: every title, then every description. The icons are decorative, so they are skipped.
  fail: (['title', 'description'] as const).flatMap((part) => FEATURES.map((feature) => ({ part, feature }))),
  // Card by card: each card's title and description together.
  pass: FEATURES.flatMap((feature) => (['title', 'description'] as const).map((part) => ({ part, feature }))),
}

const CELL = 'border-x border-slate-300 bg-slate-50 px-3'

function FeatureIcon({ feature }: { feature: Feature }) {
  return (
    <span aria-hidden="true" className="inline-flex size-9 items-center justify-center rounded-full bg-blue-100 text-blue-800">
      <feature.Icon className="size-5" />
    </span>
  )
}

export function MeaningfulSequenceDemo({ variant }: { variant: DemoVariant }) {
  const order = READING_ORDER[variant]

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-slate-300 bg-white p-4">
      <p className="text-sm text-slate-700">
        Both layouts look the same. Compare what a screen reader reads out, in order, below.
      </p>

      {variant === 'fail' ? (
        // Intentional failure: three separate rows, one per kind of content. Each row draws its slice of
        // every card (top, middle, bottom), so the cards only look whole. This also means they can never
        // stack on a narrow screen without pulling the slices apart.
        <div>
          <div className="grid grid-cols-3 gap-x-2">
            {FEATURES.map((f) => (
              <div key={f.card} className={`${CELL} rounded-t-lg border-t pt-3 pb-2`}>
                <FeatureIcon feature={f} />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-x-2">
            {FEATURES.map((f) => (
              <h5 key={f.card} className={`${CELL} pb-1 text-sm font-bold text-slate-900`}>
                {f.title}
              </h5>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-x-2">
            {FEATURES.map((f) => (
              <p key={f.card} className={`${CELL} rounded-b-lg border-b pb-3 text-xs text-slate-700`}>
                {f.description}
              </p>
            ))}
          </div>
        </div>
      ) : (
        <ul className="@container grid gap-2 @min-[18rem]:grid-cols-3">
          {FEATURES.map((f) => (
            <li key={f.card} className="flex flex-col gap-2 rounded-lg border border-slate-300 bg-slate-50 p-3">
              <FeatureIcon feature={f} />
              <h5 className="text-sm font-bold text-slate-900">{f.title}</h5>
              <p className="text-xs text-slate-700">{f.description}</p>
            </li>
          ))}
        </ul>
      )}

      <div>
        <p className="mb-2 text-xs font-semibold tracking-wide text-slate-600 uppercase">Screen reader hears</p>
        <ol className="flex list-decimal flex-col gap-1 pl-5 font-mono text-sm text-slate-900">
          {order.map(({ part, feature }) => (
            <li key={`${part}-${feature.card}`}>
              {HEARD[part](feature)}{' '}
              <span className="rounded bg-slate-100 px-1 font-sans text-xs text-slate-600">card {feature.card}</span>
            </li>
          ))}
        </ol>
        <p className={`mt-2 text-sm font-semibold ${variant === 'fail' ? 'text-red-800' : 'text-green-800'}`}>
          {variant === 'fail'
            ? 'Titles and descriptions arrive in separate batches, so listeners must work out which belongs to which.'
            : 'Each card is read as a unit, so every title arrives with its own description.'}
        </p>
      </div>
    </div>
  )
}
