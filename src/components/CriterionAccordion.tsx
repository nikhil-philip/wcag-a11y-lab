import * as Accordion from '@radix-ui/react-accordion'
import {
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  Link2,
  Sparkles,
  TriangleAlert,
  Users,
  XCircle,
  type LucideIcon,
} from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import {
  levelTag,
  riskTag,
  versionTag,
  type CriterionData,
  type ExampleData,
} from '../data/wcag-schema'
import { RISK_STYLES } from '../lib/risk-styles'
import { criterionDomId, criterionPath } from '../site'
import { InteractiveDemo } from './demos/InteractiveDemo'

interface CriterionAccordionProps {
  criterion: CriterionData
}

/* ------------------------------------------------------------------ */
/* Badges                                                              */
/* ------------------------------------------------------------------ */

function Badge({ className, children }: { className: string; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${className}`}
    >
      {children}
    </span>
  )
}

/* ------------------------------------------------------------------ */
/* Fail / Pass example panel                                           */
/* ------------------------------------------------------------------ */

const VARIANTS = {
  fail: {
    title: 'Fail example',
    Icon: XCircle,
    panel: 'border-red-200 bg-red-50/40',
    accent: 'border-t-red-600',
    iconColor: 'text-red-700',
  },
  pass: {
    title: 'Pass example',
    Icon: CheckCircle2,
    panel: 'border-green-200 bg-green-50/40',
    accent: 'border-t-green-600',
    iconColor: 'text-green-700',
  },
} as const

function ExamplePanel({
  variant,
  example,
}: {
  variant: keyof typeof VARIANTS
  example: ExampleData
}) {
  const v = VARIANTS[variant]
  return (
    <section
      className={`flex min-w-0 flex-col gap-4 rounded-xl border border-t-4 p-4 lg:row-span-3 lg:grid lg:grid-rows-subgrid ${v.panel} ${v.accent}`}
    >
      <h4 className="flex items-center gap-2 text-base font-semibold text-slate-900">
        <v.Icon className={`size-5 shrink-0 ${v.iconColor}`} aria-hidden="true" />
        {v.title}
      </h4>

      <div data-a11y-demo={variant}>
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <p className="text-xs font-semibold tracking-wide text-slate-600 uppercase">Live preview</p>
          {variant === 'fail' && (
            <span className="inline-flex items-center gap-1 rounded-full border border-red-300 bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
              <TriangleAlert className="size-3.5" aria-hidden="true" />
              Intentionally inaccessible
            </span>
          )}
        </div>
        <InteractiveDemo type={example.interactiveType} variant={variant} />
      </div>

      <p className="text-sm leading-relaxed text-slate-700">{example.explanation}</p>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Shared code comparison                                              */
/* ------------------------------------------------------------------ */

function CodeComparison({ fail, pass }: { fail: string | undefined; pass: string | undefined }) {
  const snippets = (
    [
      ['fail', fail],
      ['pass', pass],
    ] as const
  ).filter((s): s is readonly ['fail' | 'pass', string] => Boolean(s[1]))
  if (snippets.length === 0) return null

  const label = snippets.length === 2 ? 'Show code for both examples' : 'Show code'

  return (
    // One native <details> for both snippets: a single tab stop that announces expanded/collapsed,
    // with the code directly after it in reading order.
    <details className="group">
      <summary className="inline-flex cursor-pointer list-none items-center gap-1.5 rounded text-sm font-medium text-slate-800 hover:text-slate-950 hover:underline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-blue-700 [&::-webkit-details-marker]:hidden">
        <ChevronDown
          className="size-4 shrink-0 -rotate-90 transition-transform group-open:rotate-0 motion-reduce:transition-none"
          aria-hidden="true"
        />
        {label}
      </summary>
      <div className={`mt-3 grid gap-4 ${snippets.length === 2 ? 'lg:grid-cols-2' : ''}`}>
        {snippets.map(([variant, code]) => {
          const v = VARIANTS[variant]
          return (
            <figure key={variant} className="min-w-0">
              <figcaption className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-slate-900">
                <v.Icon className={`size-4 shrink-0 ${v.iconColor}`} aria-hidden="true" />
                {v.title} code
              </figcaption>
              {/* Code wraps instead of scrolling, so no scroll container (and no extra tab stop) is needed. */}
              <pre
                className={`whitespace-pre-wrap wrap-anywhere rounded-lg border-t-4 bg-slate-900 p-4 text-[13px] leading-relaxed text-slate-100 ${v.accent}`}
              >
                <code>{code}</code>
              </pre>
            </figure>
          )
        })}
      </div>
    </details>
  )
}

/* ------------------------------------------------------------------ */
/* Supporting lists                                                    */
/* ------------------------------------------------------------------ */

function InfoList({
  title,
  Icon,
  items,
  ordered = false,
}: {
  title: string
  Icon: LucideIcon
  items: readonly string[]
  ordered?: boolean
}) {
  const List = ordered ? 'ol' : 'ul'
  return (
    <section className="min-w-0">
      <h4 className="mb-3 flex items-center gap-2 text-base font-semibold text-slate-900">
        <Icon className="size-5 shrink-0 text-blue-700" aria-hidden="true" />
        {title}
      </h4>
      <List
        className={`space-y-2 pl-5 text-sm leading-relaxed text-slate-700 marker:text-slate-500 ${
          ordered ? 'list-decimal' : 'list-disc'
        }`}
      >
        {items.map((item, i) => (
          <li key={i} className="pl-1">
            {item}
          </li>
        ))}
      </List>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Copy link                                                           */
/* ------------------------------------------------------------------ */

function CopyLinkButton({ id }: { id: string }) {
  const [message, setMessage] = useState('')

  // Clear the message after a while, so copying again is announced again.
  useEffect(() => {
    if (!message) return
    const timer = setTimeout(() => setMessage(''), 5000)
    return () => clearTimeout(timer)
  }, [message])

  async function copy() {
    const url = `${window.location.origin}${criterionPath(id)}`
    try {
      await navigator.clipboard.writeText(url)
      setMessage('Link copied.')
    } catch {
      // No clipboard access (e.g. an insecure context): show the link so it can be copied by hand.
      setMessage(`Copy this link: ${url}`)
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
      <button
        type="button"
        onClick={copy}
        className="inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-lg border border-slate-400 bg-white px-3 text-sm font-medium text-slate-800 hover:bg-slate-100 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
      >
        <Link2 className="size-4" aria-hidden="true" />
        Copy link<span className="sr-only"> to {id}</span>
      </button>
      <p role="status" className="text-sm break-all text-slate-700">
        {message}
      </p>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* CriterionAccordion                                                  */
/* ------------------------------------------------------------------ */

export function CriterionAccordion({ criterion: c }: CriterionAccordionProps) {
  const risk = RISK_STYLES[c.risk]
  const newIn = versionTag(c.version) // null for the 2.0 baseline

  return (
    <Accordion.Item
      value={c.id}
      id={criterionDomId(c.id)}
      className="scroll-mt-4 rounded-2xl border border-slate-200 bg-white shadow-sm"
    >
      <Accordion.Header asChild>
        <h3>
          <Accordion.Trigger className="group flex w-full items-start justify-between gap-4 rounded-2xl p-4 text-left transition-colors hover:bg-slate-50 focus-visible:outline-3 focus-visible:-outline-offset-3 focus-visible:outline-blue-700 data-[state=open]:rounded-b-none sm:p-5">
            <span className="flex min-w-0 flex-col gap-2">
              <span className="text-lg font-semibold text-slate-900">
                {c.id}: {c.name}
              </span>
              <span className="flex flex-wrap gap-2">
                {newIn && (
                  <Badge className="border-violet-700 bg-violet-700 text-white">
                    <Sparkles className="size-3.5" aria-hidden="true" />
                    {newIn}
                  </Badge>
                )}
                <Badge className="border-indigo-200 bg-indigo-50 text-indigo-800">
                  {levelTag(c.level)}
                </Badge>
                <Badge className="border-teal-200 bg-teal-50 text-teal-800">{c.principle}</Badge>
                <Badge className={risk.soft}>
                  <span className={`size-2 rounded-full ${risk.dot}`} aria-hidden="true" />
                  {riskTag(c.risk)}
                </Badge>
              </span>
            </span>
            <ChevronDown
              className="mt-1 size-5 shrink-0 text-slate-600 group-data-[state=open]:rotate-180 motion-safe:transition-transform motion-safe:duration-200"
              aria-hidden="true"
            />
          </Accordion.Trigger>
        </h3>
      </Accordion.Header>

      <Accordion.Content className="overflow-hidden motion-safe:data-[state=closed]:animate-accordion-up motion-safe:data-[state=open]:animate-accordion-down">
        <div className="flex flex-col gap-6 border-t border-slate-200 p-4 sm:p-5">
          <div className="flex flex-col gap-3">
            <p className="max-w-3xl leading-relaxed text-slate-800">{c.description}</p>
            <CopyLinkButton id={c.id} />
          </div>

          {/* On large screens each panel is a 3-row subgrid (heading, preview, explanation),
              so matching sections line up side by side even when the demos differ in height. */}
          <div className="grid gap-4 lg:grid-cols-2">
            <ExamplePanel variant="fail" example={c.failExample} />
            <ExamplePanel variant="pass" example={c.passExample} />
          </div>

          <CodeComparison fail={c.failExample.codeSnippet} pass={c.passExample.codeSnippet} />

          <div className="grid gap-6 rounded-xl bg-slate-50 p-4 md:grid-cols-2">
            <InfoList title="How to test it" Icon={ClipboardCheck} items={c.testingSteps} ordered />
            <InfoList title="Impacted users" Icon={Users} items={c.impactedUsers} />
          </div>
        </div>
      </Accordion.Content>
    </Accordion.Item>
  )
}
