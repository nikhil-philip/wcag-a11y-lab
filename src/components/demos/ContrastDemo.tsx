import { CheckCircle2, XCircle } from 'lucide-react'
import { useId, useState } from 'react'
import { contrastRatio, greyHex } from '../../lib/contrast'
import type { DemoVariant } from './types'

const BACKGROUND = '#ffffff'
const AA_NORMAL_TEXT = 4.5

/** Starting grey channel: #aaaaaa (2.32:1) vs #595959 (7.00:1), as in the seed snippets. */
const START_LEVEL: Record<DemoVariant, number> = { fail: 0xaa, pass: 0x59 }

export function ContrastDemo({ variant }: { variant: DemoVariant }) {
  const id = useId()
  const [level, setLevel] = useState(START_LEVEL[variant])

  const color = greyHex(level)
  const ratio = contrastRatio(color, BACKGROUND)
  const passes = ratio >= AA_NORMAL_TEXT
  const ratioText = `${ratio.toFixed(2)}:1`

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-slate-300 bg-white p-4">
      {/* The sample itself deliberately uses the chosen colour; the same text is in the code block above. */}
      <p style={{ color, backgroundColor: BACKGROUND, fontSize: 14 }}>
        Password must contain at least 12 characters.
      </p>

      <div>
        <label htmlFor={`${id}-level`} className="mb-1 block text-sm font-medium text-slate-900">
          Text colour <span className="font-mono">{color}</span>
        </label>
        <input
          id={`${id}-level`}
          type="range"
          min={0}
          max={255}
          value={level}
          onChange={(e) => setLevel(Number(e.target.value))}
          aria-valuetext={`${color}, contrast ${ratioText}`}
          className="w-full accent-blue-700 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
        />
      </div>

      <p
        role="status"
        className={`flex items-center gap-2 text-sm font-semibold ${passes ? 'text-green-800' : 'text-red-800'}`}
      >
        {passes ? (
          <CheckCircle2 className="size-5 shrink-0" aria-hidden="true" />
        ) : (
          <XCircle className="size-5 shrink-0" aria-hidden="true" />
        )}
        {ratioText}: {passes ? 'passes' : 'fails'} AA (needs {AA_NORMAL_TEXT}:1)
      </p>
    </div>
  )
}
