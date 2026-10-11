import type { DemoVariant } from './types'

const HEADING = 'Bienvenidos a la Biblioteca Municipal'
const BODY = 'Abrimos de lunes a viernes, de nueve a ocho. La entrada es gratuita.'

/** Approximate respellings of how each voice pronounces the heading and first sentence. */
const SOUNDS: Record<DemoVariant, { voice: string; sounds: string }> = {
  fail: {
    voice: 'English voice (the default)',
    sounds: 'bye-EN-ven-EYE-doze uh luh BIB-lee-oh-teek MEW-nih-sip-ul. uh-BRIM-oss dee LOONZ uh vye-EER-neez…',
  },
  pass: {
    voice: 'Spanish voice (from lang="es")',
    sounds: 'byen-beh-NEE-dohs ah lah bee-blee-oh-TEH-kah moo-nee-see-PAHL. ah-BREE-mohs deh LOO-nehs ah bee-EHR-nehs…',
  },
}

export function LanguageOfPageDemo({ variant }: { variant: DemoVariant }) {
  const { voice: voiceLabel, sounds } = SOUNDS[variant]

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-slate-300 bg-white p-4">
      <p className="text-sm text-slate-700">
        This page is written in Spanish. Compare the markup and how a screen reader would pronounce it.
      </p>

      {/* DOM tree viewer */}
      <pre className="whitespace-pre-wrap wrap-anywhere rounded-lg bg-slate-900 p-3 font-mono text-[13px] leading-relaxed text-slate-100">
        <code>
          {variant === 'fail' ? (
            <>
              <span className="rounded bg-red-900/60 px-0.5">{'<html>'}</span>
              <span className="text-red-300">{'  ← no lang'}</span>
            </>
          ) : (
            <>
              {'<html '}
              <span className="rounded bg-green-900/60 px-0.5 text-green-200">lang="es"</span>
              {'>'}
            </>
          )}
          {`\n  <body>\n    <h1>${HEADING}</h1>\n    <p>${BODY}</p>\n  </body>\n</html>`}
        </code>
      </pre>

      {/* The rendered page. Pass marks it Spanish; fail inherits this lab's lang="en". */}
      <div
        lang={variant === 'pass' ? 'es' : undefined}
        className="flex flex-col gap-1 rounded-lg border border-slate-300 bg-slate-50 p-3"
      >
        <h5 className="text-base font-bold text-slate-900">{HEADING}</h5>
        <p className="text-sm text-slate-800">{BODY}</p>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold tracking-wide text-slate-600 uppercase">
          Screen reader pronunciation (approximate)
        </p>
        <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
          <dt className="text-slate-600">Voice</dt>
          <dd className="text-slate-900">{voiceLabel}</dd>
          <dt className="text-slate-600">Sounds like</dt>
          <dd className="font-mono break-words text-slate-900">"{sounds}"</dd>
        </dl>
        <p className={`mt-2 text-sm font-semibold ${variant === 'fail' ? 'text-red-800' : 'text-green-800'}`}>
          {variant === 'fail'
            ? 'Spanish read with English rules: "Bienvenidos" becomes "bye-en-ven-eye-doze". It is close to unintelligible.'
            : 'The Spanish voice pronounces every word as a Spanish speaker expects.'}
        </p>
      </div>
    </div>
  )
}
