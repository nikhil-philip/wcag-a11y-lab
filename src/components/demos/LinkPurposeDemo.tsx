import { ArrowRight } from 'lucide-react'
import type { DemoVariant } from './types'

const ARTICLES = [
  { title: "What's new in WCAG 2.2", date: '21 Oct 2025' },
  { title: 'Five myths about accessibility overlays', date: '3 Sep 2025' },
  { title: 'How we tested our checkout with screen readers', date: '12 Aug 2025' },
] as const

const LINK_CLASSES =
  'inline-flex items-center gap-1 self-start text-sm font-semibold text-blue-800 underline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-blue-700'

export function LinkPurposeDemo({ variant }: { variant: DemoVariant }) {
  const linkNames =
    variant === 'fail' ? ARTICLES.map(() => 'Read more') : ARTICLES.map((a) => `Read more about ${a.title}`)

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-slate-300 bg-white p-4">
      <ul className="flex flex-col gap-3">
        {ARTICLES.map((article) => (
          <li key={article.title} className="flex flex-col gap-1 rounded-lg border border-slate-300 bg-slate-50 p-3">
            {variant === 'fail' ? (
              // Intentional failure: the title only looks like a heading, so the link has no
              // programmatic context, and all three links are called "Read more".
              <>
                <div className="text-sm font-bold text-slate-900">{article.title}</div>
                <p className="text-xs text-slate-700">{article.date}</p>
                <a href="#" onClick={(e) => e.preventDefault()} className={LINK_CLASSES}>
                  Read more
                  <ArrowRight className="size-3.5" aria-hidden="true" />
                </a>
              </>
            ) : (
              // Visible text is unchanged; hidden text completes the name. It still starts with
              // "Read more", so voice users can say what they see (2.5.3 Label in Name).
              <>
                <h5 className="text-sm font-bold text-slate-900">{article.title}</h5>
                <p className="text-xs text-slate-700">{article.date}</p>
                <a href="#" onClick={(e) => e.preventDefault()} className={LINK_CLASSES}>
                  Read more<span className="sr-only"> about {article.title}</span>
                  <ArrowRight className="size-3.5" aria-hidden="true" />
                </a>
              </>
            )}
          </li>
        ))}
      </ul>

      <div>
        <p className="mb-2 text-xs font-semibold tracking-wide text-slate-600 uppercase">
          Screen reader hears (links list)
        </p>
        <ol className="flex list-decimal flex-col gap-1 pl-5 font-mono text-sm text-slate-900">
          {linkNames.map((name, i) => (
            <li key={i}>"{name}, link"</li>
          ))}
        </ol>
        <p className={`mt-2 text-sm font-semibold ${variant === 'fail' ? 'text-red-800' : 'text-green-800'}`}>
          {variant === 'fail'
            ? 'Three identical links, and nothing in the code connects them to an article.'
            : 'Each link says where it goes, even when heard on its own.'}
        </p>
      </div>
    </div>
  )
}
