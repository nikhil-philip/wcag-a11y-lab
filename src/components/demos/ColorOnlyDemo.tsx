import { Check, Contrast, X } from 'lucide-react'
import { useState } from 'react'
import type { DemoVariant } from './types'

type Status = 'online' | 'offline'

const SERVICES: readonly { name: string; status: Status }[] = [
  { name: 'API gateway', status: 'online' },
  { name: 'Auth service', status: 'offline' },
  { name: 'Primary database', status: 'online' },
  { name: 'Payments', status: 'offline' },
  { name: 'Search index', status: 'online' },
]

/**
 * red-500 and green-700 are chosen because they turn almost the same grey
 * (≈104 vs ≈100) in greyscale, like red and green do for many colour-blind users.
 * Both still have 3:1+ contrast against white, and against the white icons in the pass version.
 */
const STATUS_STYLE: Record<Status, { dot: string; label: string; Icon: typeof Check }> = {
  online: { dot: 'bg-[#15803d]', label: 'Online', Icon: Check },
  offline: { dot: 'bg-[#ef4444]', label: 'Offline', Icon: X },
}

function StatusDot({ status, variant }: { status: Status; variant: DemoVariant }) {
  const { dot, Icon } = STATUS_STYLE[status]
  if (variant === 'fail') {
    // Intentional failure: colour is the only difference between the two states.
    return <span className={`inline-block size-3 shrink-0 rounded-full ${dot}`} />
  }
  return (
    <span aria-hidden="true" className={`inline-flex size-5 shrink-0 items-center justify-center rounded-full text-white ${dot}`}>
      <Icon className="size-3.5" strokeWidth={3} />
    </span>
  )
}

export function ColorOnlyDemo({ variant }: { variant: DemoVariant }) {
  const [greyscale, setGreyscale] = useState(false)

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-slate-300 bg-white p-4">
      <button
        type="button"
        aria-pressed={greyscale}
        onClick={() => setGreyscale((g) => !g)}
        className={`inline-flex min-h-11 cursor-pointer items-center gap-2 self-start rounded-lg border-2 px-4 text-sm font-semibold focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-blue-700 ${
          greyscale
            ? 'border-blue-700 bg-blue-700 text-white hover:bg-blue-800'
            : 'border-slate-500 bg-white text-slate-900 hover:bg-slate-100'
        }`}
      >
        <Contrast className="size-4" aria-hidden="true" />
        Simulate greyscale
      </button>

      <div className={`flex flex-col gap-3 ${greyscale ? 'grayscale' : ''}`}>
        <h5 className="text-sm font-bold text-slate-900">Service status</h5>
        <ul className="flex flex-col divide-y divide-slate-200 rounded-lg border border-slate-300">
          {SERVICES.map(({ name, status }) => (
            <li key={name} className="flex min-h-11 items-center gap-3 px-3 text-sm text-slate-900">
              <StatusDot status={status} variant={variant} />
              <span className="flex-1">{name}</span>
              {variant === 'pass' && (
                <span className="font-semibold text-slate-800">{STATUS_STYLE[status].label}</span>
              )}
            </li>
          ))}
        </ul>

        <div className="flex flex-wrap gap-4 text-xs text-slate-700" aria-hidden={variant === 'pass' ? true : undefined}>
          {(['online', 'offline'] as const).map((status) => (
            <span key={status} className="inline-flex items-center gap-1.5">
              <StatusDot status={status} variant={variant} />
              {STATUS_STYLE[status].label}
            </span>
          ))}
        </div>
      </div>

      <p className="text-sm text-slate-700">
        {greyscale
          ? variant === 'fail'
            ? 'Which services are offline? Without colour, the dots all look the same.'
            : 'Still clear without colour: each status has an icon and a text label.'
          : 'Turn on greyscale to see the list the way many colour-blind users do.'}
      </p>
    </div>
  )
}
