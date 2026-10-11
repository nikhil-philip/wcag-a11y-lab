import { CheckCircle2, ShieldAlert, XCircle } from 'lucide-react'
import type { DemoVariant } from './types'

/*
 * SAFETY: this demo must never flash. It is deliberately stateless (no useState, no effects, no
 * handlers), has no animation or transition classes, and draws each frame as a small, separated square
 * rather than a large area, so nothing on it can change colour. It shows a storyboard of one second of
 * video instead of playing it.
 */

const LIGHT = '#f8fafc'
const DARK_RED = '#9f0000'

/** One second of video at 15 frames per second. */
const FPS = 15

const FRAMES: Record<DemoVariant, readonly string[]> = {
  // Alternates every frame: 14 opposing changes, so 7 flashes.
  fail: Array.from({ length: FPS }, (_, i) => (i % 2 === 0 ? LIGHT : DARK_RED)),
  // Two flashes, then holds steady for the rest of the second.
  pass: [LIGHT, DARK_RED, LIGHT, DARK_RED, ...Array.from({ length: FPS - 4 }, () => LIGHT)],
}

const FRAME_NAME: Record<string, string> = { [LIGHT]: 'bright white', [DARK_RED]: 'dark red' }

/** WCAG relative luminance of a #rrggbb colour (0 = black, 1 = white). */
function relativeLuminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }) as [number, number, number]
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

interface Flash {
  /** 0-based index of the first and last frame of the bright-dark-bright (or dark-bright-dark) pair. */
  start: number
  end: number
}

/**
 * Counts flashes the way WCAG defines them: a flash is a pair of opposing changes in relative luminance,
 * each of at least 0.1, where the darker frame is below 0.8. Consecutive changes in the same direction
 * count as one change.
 */
function findFlashes(frames: readonly string[]): Flash[] {
  const lum = frames.map(relativeLuminance)
  const changes: { from: number; to: number; dir: 1 | -1 }[] = []
  for (let i = 1; i < lum.length; i++) {
    const before = lum[i - 1]!
    const after = lum[i]!
    const delta = after - before
    if (Math.abs(delta) < 0.1 || Math.min(before, after) >= 0.8) continue
    const dir = delta > 0 ? 1 : -1
    const last = changes.at(-1)
    if (last && last.dir === dir && last.to === i - 1) last.to = i
    else changes.push({ from: i - 1, to: i, dir })
  }
  const flashes: Flash[] = []
  for (let k = 0; k + 1 < changes.length; k += 2) flashes.push({ start: changes[k]!.from, end: changes[k + 1]!.to })
  return flashes
}

const THRESHOLD = 3

export function ThreeFlashesDemo({ variant }: { variant: DemoVariant }) {
  const frames = FRAMES[variant]
  const flashes = findFlashes(frames)
  const exceeds = flashes.length > THRESHOLD
  const columns = { gridTemplateColumns: `repeat(${frames.length}, minmax(0, 1.75rem))` }

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-slate-300 bg-white p-4">
      <p className="flex items-start gap-2 rounded-lg border border-slate-300 bg-slate-50 p-2 text-xs text-slate-700">
        <ShieldAlert className="mt-0.5 size-4 shrink-0 text-slate-600" aria-hidden="true" />
        Nothing here moves or flashes. This is a still storyboard of one second of video, frame by frame.
      </p>

      {/* Film strip */}
      <div className="flex flex-col items-center gap-2 overflow-x-auto">
        <div className="flex flex-col gap-1 rounded-md bg-slate-900 px-2 py-1.5">
          {/* Sprocket holes, purely decorative */}
          <div className="grid gap-[3px]" style={columns} aria-hidden="true">
            {frames.map((_, i) => (
              <span key={i} className="mx-auto h-1 w-2 rounded-sm bg-slate-600" />
            ))}
          </div>
          <ol aria-label={`Film strip: ${frames.length} frames, 1 second`} className="grid gap-[3px]" style={columns}>
            {frames.map((color, i) => (
              <li key={i} className="aspect-square rounded-sm border border-slate-500" style={{ backgroundColor: color }}>
                <span className="sr-only">
                  Frame {i + 1}: {FRAME_NAME[color]}
                </span>
              </li>
            ))}
          </ol>
          <div className="grid gap-[3px]" style={columns} aria-hidden="true">
            {frames.map((_, i) => (
              <span key={i} className="mx-auto h-1 w-2 rounded-sm bg-slate-600" />
            ))}
          </div>
        </div>

        {/* Brackets: one per flash, on two rows so neighbours that share a frame don't overlap */}
        <div className="grid gap-x-[3px] gap-y-1 px-2" style={columns} aria-hidden="true">
          {flashes.map((f, i) => (
            <div
              key={i}
              style={{ gridColumn: `${f.start + 1} / ${f.end + 2}`, gridRow: (i % 2) + 1 }}
              className="flex flex-col items-center"
            >
              <span className={`h-2 w-full rounded-b border-x-2 border-b-2 ${exceeds ? 'border-red-700' : 'border-green-700'}`} />
              <span className={`text-[11px] leading-tight font-bold ${exceeds ? 'text-red-800' : 'text-green-800'}`}>{i + 1}</span>
            </div>
          ))}
        </div>

        {/* Time axis on the same columns as the frames, so the labels line up with them */}
        <div className="grid gap-x-[3px] px-2 font-mono text-xs whitespace-nowrap text-slate-600" style={columns} aria-hidden="true">
          <span style={{ gridColumn: 1 }}>0 s</span>
          <span style={{ gridColumn: Math.ceil(frames.length / 2) }} className="text-center">
            0.5 s
          </span>
          <span style={{ gridColumn: frames.length }} className="text-right">
            1 s
          </span>
        </div>
      </div>

      <ul className="sr-only">
        {flashes.map((f, i) => (
          <li key={i}>
            Flash {i + 1}: frames {f.start + 1} to {f.end + 1}
          </li>
        ))}
      </ul>

      <p
        className={`flex items-start gap-2 rounded-lg border-2 p-3 text-sm font-bold ${
          exceeds ? 'border-red-700 bg-red-50 text-red-900' : 'border-green-700 bg-green-50 text-green-900'
        }`}
      >
        {exceeds ? (
          <XCircle className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
        ) : (
          <CheckCircle2 className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
        )}
        {exceeds
          ? `${flashes.length} flashes detected in 1 second (Exceeds threshold of ${THRESHOLD})`
          : `${flashes.length} flashes detected in 1 second (Safe)`}
      </p>

      <p className="text-xs text-slate-700">
        A flash is a pair of opposite changes in brightness (bright → dark → bright), each big enough to matter. Dark red
        counts too: saturated red flashes are also limited to 3 per second. Flashing smaller than about a quarter of a
        341 × 256 px area at normal viewing distance is below the threshold.
      </p>
    </div>
  )
}
