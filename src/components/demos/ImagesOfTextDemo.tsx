import { Contrast, TextCursorInput } from 'lucide-react'
import { useRef, useState } from 'react'
import type { DemoVariant } from './types'

const HEADLINE = 'Summer sale'
const OFFER = '30% off all shoes until 31 July'

/** A real image with the words baked in, as a design tool would export it. */
const BANNER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="200" viewBox="0 0 600 200">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
<stop offset="0" stop-color="#b45309"/><stop offset="1" stop-color="#7c2d12"/>
</linearGradient></defs>
<rect width="600" height="200" fill="url(#g)"/>
<text x="32" y="96" font-family="system-ui, sans-serif" font-size="52" font-weight="800" fill="#ffffff">${HEADLINE}</text>
<text x="32" y="144" font-family="system-ui, sans-serif" font-size="26" fill="#ffedd5">${OFFER}</text>
</svg>`
const BANNER_SRC = `data:image/svg+xml,${encodeURIComponent(BANNER_SVG)}`

const TOGGLE_BASE =
  'inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border-2 px-4 text-sm font-semibold focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-blue-700'
const TOGGLE_OFF = 'border-slate-500 bg-white text-slate-900 hover:bg-slate-100'
const TOGGLE_ON = 'border-blue-700 bg-blue-700 text-white hover:bg-blue-800'

export function ImagesOfTextDemo({ variant }: { variant: DemoVariant }) {
  const bannerRef = useRef<HTMLDivElement>(null)
  const [highContrast, setHighContrast] = useState(false)
  const [selected, setSelected] = useState<string | null>(null)

  // Select the banner exactly as a user dragging across it would, then report what was captured.
  function selectBannerText() {
    const banner = bannerRef.current
    const selection = window.getSelection()
    if (!banner || !selection) return
    selection.selectAllChildren(banner)
    setSelected(selection.toString().replace(/\s+/g, ' ').trim())
  }

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-slate-300 bg-white p-4">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          aria-pressed={highContrast}
          onClick={() => setHighContrast((h) => !h)}
          className={`${TOGGLE_BASE} ${highContrast ? TOGGLE_ON : TOGGLE_OFF}`}
        >
          <Contrast className="size-4" aria-hidden="true" />
          Simulate high contrast
        </button>
        <button type="button" onClick={selectBannerText} className={`${TOGGLE_BASE} ${TOGGLE_OFF}`}>
          <TextCursorInput className="size-4" aria-hidden="true" />
          Select the banner text
        </button>
      </div>

      <div ref={bannerRef}>
        {variant === 'fail' ? (
          // Intentional failure: the words are pixels. Good alt text, but no user colours, fonts or selection.
          <img src={BANNER_SRC} alt={`${HEADLINE}: ${OFFER}`} className="block h-auto w-full rounded-lg" />
        ) : (
          // Real text over a CSS background image. The simulated high-contrast mode swaps in
          // user colours, as forced colours or a user stylesheet would.
          <section
            className={`flex aspect-3/1 flex-col justify-center gap-1 rounded-lg px-[5%] ${
              highContrast
                ? 'border-2 border-yellow-300 bg-black'
                : 'bg-linear-to-br from-[#b45309] to-[#7c2d12]'
            }`}
          >
            <p className={`text-2xl font-extrabold sm:text-3xl ${highContrast ? 'text-yellow-300' : 'text-white'}`}>
              {HEADLINE}
            </p>
            <p className={`text-sm sm:text-base ${highContrast ? 'text-yellow-300' : 'text-orange-100'}`}>{OFFER}</p>
          </section>
        )}
      </div>

      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 text-sm">
        <dt className="font-semibold text-slate-600">High contrast</dt>
        <dd className={highContrast && variant === 'fail' ? 'font-semibold text-red-800' : 'text-slate-900'}>
          {!highContrast
            ? 'Off'
            : variant === 'fail'
              ? 'No change: colour settings cannot reach text inside an image.'
              : 'Text switched to the user\'s colours.'}
        </dd>
        <dt className="font-semibold text-slate-600">Selected text</dt>
        <dd className={selected === '' ? 'font-semibold text-red-800' : 'font-mono break-words text-slate-900'}>
          {/* The live region sits inside the <dd>: a role on the <dd> itself would break the list's structure. */}
          <span role="status">
            {selected === null
              ? 'Nothing yet'
              : selected === ''
                ? 'Nothing: the words are pixels, so they cannot be selected, copied or translated.'
                : `"${selected}"`}
          </span>
        </dd>
      </dl>
    </div>
  )
}
