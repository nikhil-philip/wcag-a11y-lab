import { CheckCircle2, Type, XCircle } from 'lucide-react'
import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import type { DemoVariant } from './types'
import { useHiddenOverflow } from './useHiddenOverflow'

/** The WCAG 1.4.12 user overrides, as a text-spacing bookmarklet would apply them. */
const WCAG_TEXT: CSSProperties = { lineHeight: 1.5, letterSpacing: '0.12em', wordSpacing: '0.16em' }
const WCAG_PARAGRAPH: CSSProperties = { ...WCAG_TEXT, marginBottom: '2em' }

const CARD_CLASSES = 'rounded-lg border border-slate-300 bg-slate-50 p-3'

function CardContent({ spaced }: { spaced: boolean }) {
  return (
    <>
      <h5 className="mb-2 text-base font-bold break-words text-slate-900" style={spaced ? WCAG_TEXT : undefined}>
        Your refund is on its way
      </h5>
      <p className="mb-2 text-sm break-words text-slate-700" style={spaced ? WCAG_PARAGRAPH : undefined}>
        We received your returned item on 24 September. The refund has been sent to your original
        payment method.
      </p>
      <p className="text-sm break-words text-slate-700" style={spaced ? WCAG_PARAGRAPH : undefined}>
        Banks usually take 3–5 working days to show it. Reference: RF-20931.
      </p>
    </>
  )
}

export function TextSpacingDemo({ variant }: { variant: DemoVariant }) {
  const [spaced, setSpaced] = useState(false)
  const cardRef = useRef<HTMLElement>(null)
  const mockupRef = useRef<HTMLElement>(null)
  const [fixedHeight, setFixedHeight] = useState<number>()
  const hiddenPx = useHiddenOverflow(cardRef, spaced)
  const clipped = hiddenPx > 1

  // Fail: the classic bug is a height fixed to fit the design mock-up's text exactly.
  // An invisible copy with default spacing gives that height at the current width, so the
  // card always fits before the toggle and always clips after it, on any screen size.
  useLayoutEffect(() => {
    const mockup = mockupRef.current
    if (variant !== 'fail' || !mockup) return
    const observer = new ResizeObserver(() => setFixedHeight(Math.ceil(mockup.getBoundingClientRect().height)))
    observer.observe(mockup)
    return () => observer.disconnect()
  }, [variant])

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-slate-300 bg-white p-4">
      <button
        type="button"
        aria-pressed={spaced}
        onClick={() => setSpaced((s) => !s)}
        className={`inline-flex min-h-11 cursor-pointer items-center gap-2 self-start rounded-lg border-2 px-4 text-sm font-semibold focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-blue-700 ${
          spaced
            ? 'border-blue-700 bg-blue-700 text-white hover:bg-blue-800'
            : 'border-slate-500 bg-white text-slate-900 hover:bg-slate-100'
        }`}
      >
        <Type className="size-4" aria-hidden="true" />
        Apply WCAG text spacing
      </button>

      <div className="relative">
        {variant === 'fail' && (
          <article ref={mockupRef} aria-hidden="true" className={`invisible absolute inset-x-0 top-0 ${CARD_CLASSES}`}>
            <CardContent spaced={false} />
          </article>
        )}
        <article
          ref={cardRef}
          // Intentional failure: fixed height plus overflow-hidden cuts off the re-spaced text.
          style={variant === 'fail' ? { height: fixedHeight } : undefined}
          className={`${CARD_CLASSES} ${variant === 'fail' ? 'overflow-hidden' : ''}`}
        >
          <CardContent spaced={spaced} />
        </article>
      </div>

      <p
        role="status"
        className={`flex items-start gap-2 text-sm font-semibold ${clipped ? 'text-red-800' : 'text-green-800'}`}
      >
        {clipped ? (
          <XCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        ) : (
          <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        )}
        <span>
          {clipped
            ? `${Math.round(hiddenPx)}px of text is cut off, including the refund reference.`
            : spaced
              ? 'All text is visible with WCAG spacing applied.'
              : 'All text is visible with default spacing.'}
        </span>
      </p>
    </div>
  )
}
