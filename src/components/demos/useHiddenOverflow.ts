import { useLayoutEffect, useState, type RefObject } from 'react'

/**
 * How many px of an element's content overflow it on one axis (0 if it all fits):
 * vertically ('y', the default) or horizontally ('x').
 * Re-measures when the element resizes and whenever `trigger` changes, since a
 * fixed-size box doesn't resize when its content grows.
 */
export function useHiddenOverflow(
  ref: RefObject<HTMLElement | null>,
  trigger: unknown,
  axis: 'x' | 'y' = 'y',
): number {
  const [hiddenPx, setHiddenPx] = useState(0)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const measure = () =>
      setHiddenPx(
        Math.max(0, axis === 'y' ? el.scrollHeight - el.clientHeight : el.scrollWidth - el.clientWidth),
      )
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [ref, trigger, axis])

  return hiddenPx
}
