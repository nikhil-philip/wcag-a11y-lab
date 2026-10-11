import type { DemoVariant } from './types'

const BEFORE = 'As our sommelier likes to say, '
const QUOTE = 'La vie est trop courte pour boire du mauvais vin.'
const AFTER = ' (Life is too short to drink bad wine.)'

/** Approximate respellings of how each voice pronounces the quote. */
const PRONUNCIATION: Record<DemoVariant, { voice: string; sounds: string }> = {
  fail: { voice: 'English voice', sounds: 'lah VYE est TROP kort POR BOY-er DOO maw-VAYZ VIN' },
  pass: { voice: 'French voice', sounds: 'lah VEE ay TROH koort POOR BWAHR dü moh-VEH VAN(nasal)' },
}

export function LanguageDemo({ variant }: { variant: DemoVariant }) {
  const { voice, sounds } = PRONUNCIATION[variant]

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-slate-300 bg-white p-4">
      {/* The page (and this lab) is lang="en"; only the pass version marks the French quote. */}
      <p className="rounded-lg border border-slate-300 bg-slate-50 p-3 text-sm leading-relaxed text-slate-900">
        {BEFORE}"
        {variant === 'fail' ? (
          // Intentional failure: no lang, so the quote inherits English.
          <span className="italic">{QUOTE}</span>
        ) : (
          <span lang="fr" className="italic">
            {QUOTE}
          </span>
        )}
        "{AFTER}
      </p>

      <div>
        <p className="mb-2 text-xs font-semibold tracking-wide text-slate-600 uppercase">
          Screen reader pronunciation (approximate)
        </p>
        <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
          <dt className="text-slate-600">Voice</dt>
          <dd className="text-slate-900">
            {variant === 'fail' ? 'English for the whole paragraph' : 'English → French for the quote → English'}
          </dd>
          <dt className="text-slate-600">Quote</dt>
          <dd className="font-mono break-words text-slate-900">
            <span className="sr-only">{voice}: </span>"{sounds}"
          </dd>
        </dl>
        <p className={`mt-2 text-sm font-semibold ${variant === 'fail' ? 'text-red-800' : 'text-green-800'}`}>
          {variant === 'fail'
            ? 'French read with English rules: "vie" becomes "vye" and "boire" becomes "boy-er".'
            : '"Sommelier" needs no lang: loanwords that are now part of English are exempt.'}
        </p>
      </div>
    </div>
  )
}
