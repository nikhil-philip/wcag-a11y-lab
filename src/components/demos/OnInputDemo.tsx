import { useId, useRef, useState } from 'react'
import type { DemoVariant } from './types'

const LANGUAGES = {
  en: { label: 'English', title: 'Welcome to ShopCo', body: 'Free delivery on orders over ₹999.' },
  fr: { label: 'Français', title: 'Bienvenue chez ShopCo', body: 'Livraison gratuite dès 999 ₹ d’achat.' },
  de: { label: 'Deutsch', title: 'Willkommen bei ShopCo', body: 'Kostenlose Lieferung ab 999 ₹.' },
  es: { label: 'Español', title: 'Bienvenido a ShopCo', body: 'Envío gratis en pedidos de más de 999 ₹.' },
  hi: { label: 'हिन्दी', title: 'ShopCo में आपका स्वागत है', body: '₹999 से अधिक के ऑर्डर पर मुफ़्त डिलीवरी।' },
} as const

type Lang = keyof typeof LANGUAGES
const LANG_CODES = Object.keys(LANGUAGES) as Lang[]

const FOCUS = 'focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-blue-700'

export function OnInputDemo({ variant }: { variant: DemoVariant }) {
  const id = useId()
  const pageTopRef = useRef<HTMLHeadingElement>(null)
  const [pageLang, setPageLang] = useState<Lang>('en')
  const [draft, setDraft] = useState<Lang>('en')
  const [reloads, setReloads] = useState(0)

  // Stand-in for a full page load: content changes and focus goes back to the top of the page.
  function reloadPage(lang: Lang) {
    setPageLang(lang)
    setDraft(lang)
    setReloads((n) => n + 1)
    requestAnimationFrame(() => pageTopRef.current?.focus())
  }

  const page = LANGUAGES[pageLang]

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-slate-300 bg-white p-4">
      <p className="text-sm text-slate-700">
        Tab to the language list and browse it with the{' '}
        <kbd className="rounded border border-slate-400 px-1 font-mono">↓</kbd> key, with the list closed.
      </p>

      <div className="flex flex-col gap-3 rounded-lg border border-slate-300 bg-slate-50 p-3">
        <div lang={pageLang} className="flex flex-col gap-1">
          <h5
            ref={pageTopRef}
            tabIndex={-1}
            className="text-base font-bold text-slate-900 focus:outline-3 focus:outline-offset-2 focus:outline-blue-700"
          >
            {page.title}
          </h5>
          <p className="text-sm text-slate-700">{page.body}</p>
        </div>

        <div className="flex flex-wrap items-end gap-2">
          <div className="flex flex-col gap-1">
            <label htmlFor={`${id}-lang`} className="text-sm font-semibold text-slate-900">
              Choose language
            </label>
            <select
              id={`${id}-lang`}
              value={variant === 'fail' ? pageLang : draft}
              onChange={(e) => {
                const lang = e.target.value as Lang
                // Intentional failure: every change, including each arrow press, reloads the page.
                if (variant === 'fail') reloadPage(lang)
                else setDraft(lang)
              }}
              className={`min-h-11 rounded-lg border-2 border-slate-500 bg-white px-2 text-sm text-slate-900 ${FOCUS}`}
            >
              {LANG_CODES.map((code) => (
                <option key={code} value={code} lang={code}>
                  {LANGUAGES[code].label}
                </option>
              ))}
            </select>
          </div>
          {variant === 'pass' && (
            <button
              type="button"
              onClick={() => reloadPage(draft)}
              className={`min-h-11 cursor-pointer rounded-lg bg-blue-700 px-4 text-sm font-semibold text-white hover:bg-blue-800 ${FOCUS}`}
            >
              Apply
            </button>
          )}
        </div>
      </div>

      <p
        role="status"
        className={`min-h-5 text-sm font-semibold ${
          variant === 'fail' && reloads > 0 ? 'text-red-800' : 'text-slate-900'
        }`}
      >
        {reloads === 0
          ? variant === 'pass'
            ? 'Nothing changes until you press Apply.'
            : ''
          : variant === 'fail'
            ? `Page reloaded ${reloads} ${reloads === 1 ? 'time' : 'times'} while you were browsing, and focus jumped to the top.`
            : `Page reloaded in ${LANGUAGES[pageLang].label} because you chose Apply.`}
      </p>
    </div>
  )
}
