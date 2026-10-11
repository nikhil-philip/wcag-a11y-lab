import { ChartColumn, Download } from 'lucide-react'
import type { DemoVariant } from './types'

const SALES = [
  { quarter: 'Q1', lakh: 40 },
  { quarter: 'Q2', lakh: 42 },
  { quarter: 'Q3', lakh: 44 },
  { quarter: 'Q4', lakh: 46 },
] as const

/** Builds the chart as a real image, so the only text alternative is whatever alt says. */
function chartSvg(): string {
  const scale = 2.4 // px per lakh, axis starting at 0
  const bars = SALES.map(({ quarter, lakh }, i) => {
    const h = lakh * scale
    const x = 48 + i * 68
    const y = 150 - h
    return `<rect x="${x}" y="${y}" width="40" height="${h}" rx="3" fill="#1d4ed8"/>
<text x="${x + 20}" y="${y - 6}" text-anchor="middle" font-size="12" fill="#0f172a">₹${lakh}L</text>
<text x="${x + 20}" y="168" text-anchor="middle" font-size="12" fill="#334155">${quarter}</text>`
  }).join('')
  return `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180" viewBox="0 0 320 180" font-family="system-ui, sans-serif">
<rect width="320" height="180" fill="#ffffff"/>
<text x="12" y="18" font-size="12" font-weight="700" fill="#0f172a">Sales 2025 (₹ lakh)</text>
<line x1="36" y1="150" x2="312" y2="150" stroke="#475569"/>
${bars}
</svg>`
}

const CHART_SRC = `data:image/svg+xml,${encodeURIComponent(chartSvg())}`

/** Saves the chart's data as a CSV file, so both variants' buttons really work. */
function downloadReport() {
  const csv = ['Quarter,Sales (₹ lakh)', ...SALES.map(({ quarter, lakh }) => `${quarter},${lakh}`)].join('\n')
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = '2025-sales-report.csv'
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 0) // after the browser has started the download
}

const ALT: Record<DemoVariant, { chart: string; headingIcon: string; downloadIcon: string }> = {
  // Intentional failure: a file name for the chart, a label on the decorative icon, and none on the icon-only button.
  fail: { chart: 'chart-final-v2.jpg', headingIcon: 'bar chart icon', downloadIcon: '' },
  pass: {
    chart: 'Bar chart of 2025 sales: up 15%, from ₹40 lakh in Q1 to ₹46 lakh in Q4, rising every quarter.',
    headingIcon: '',
    downloadIcon: 'Download 2025 sales report (CSV)',
  },
}

const HEADING = '2025 sales update'
const INTRO = 'Every quarter beat the one before.'

export function NonTextContentDemo({ variant }: { variant: DemoVariant }) {
  const alt = ALT[variant]

  // What a screen reader reads, in order, when arrowing through the section in browse mode.
  const heard: { text: string; skipped?: boolean }[] = [
    { text: `heading level 5, "${alt.headingIcon ? `${alt.headingIcon} ` : ''}${HEADING}"` },
    ...(alt.headingIcon ? [] : [{ text: 'heading icon (skipped: aria-hidden="true")', skipped: true }]),
    { text: `"${INTRO}"` },
    { text: `graphic, "${alt.chart}"` },
    { text: alt.downloadIcon ? `button, "${alt.downloadIcon}"` : 'button' },
  ]

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-slate-300 bg-white p-4">
      <section className="flex flex-col gap-2 rounded-lg border border-slate-300 bg-slate-50 p-3">
        <h5 className="flex items-center gap-2 text-sm font-bold text-slate-900">
          {/* Decorative: the heading text already says what the icon shows. */}
          {alt.headingIcon ? (
            <ChartColumn className="size-4 shrink-0 text-blue-700" role="img" aria-label={alt.headingIcon} />
          ) : (
            <ChartColumn className="size-4 shrink-0 text-blue-700" aria-hidden="true" />
          )}
          {HEADING}
        </h5>
        <p className="text-sm text-slate-700">{INTRO}</p>
        <img src={CHART_SRC} alt={alt.chart} className="h-auto w-full max-w-80 self-center rounded border border-slate-200" />
        {/* Informative: the icon is the button's only content, so it needs a text alternative. */}
        <button
          type="button"
          onClick={downloadReport}
          aria-label={alt.downloadIcon || undefined}
          className="inline-flex size-11 cursor-pointer items-center justify-center self-end rounded-lg border-2 border-slate-400 bg-white text-lg text-slate-900 hover:bg-slate-100 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
        >
          <Download className="size-5" aria-hidden="true" />
        </button>
      </section>

      <div>
        <p className="mb-2 text-xs font-semibold tracking-wide text-slate-600 uppercase">Screen reader hears</p>
        <ol className="flex list-decimal flex-col gap-1 pl-5 font-mono text-sm">
          {heard.map(({ text, skipped }) => (
            <li key={text} className={skipped ? 'text-slate-600 italic' : 'text-slate-900'}>
              {text}
            </li>
          ))}
        </ol>
        <p className={`mt-2 text-sm font-semibold ${variant === 'fail' ? 'text-red-800' : 'text-green-800'}`}>
          {variant === 'fail'
            ? 'The chart\'s data is lost behind a file name, the decorative icon adds noise, and the button has no name.'
            : 'The chart\'s finding and the button\'s purpose are spoken, and the decorative icon is skipped.'}
        </p>
      </div>
    </div>
  )
}
