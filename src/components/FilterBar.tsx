import { useId, type ReactNode } from 'react'
import { Check, RotateCcw, Search } from 'lucide-react'
import {
  FILTER_VERSIONS,
  PRINCIPLE_OPTIONS,
  RISK_LEVELS,
  WCAG_LEVELS,
  levelTag,
  newInTag,
  type PrincipleFilter,
  type RiskLevel,
  type WCAGLevel,
  type WCAGVersion,
} from '../data/wcag-schema'
import { RISK_STYLES } from '../lib/risk-styles'

interface FilterBarProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  selectedVersions: readonly WCAGVersion[]
  onVersionsChange: (update: (prev: WCAGVersion[]) => WCAGVersion[]) => void
  selectedLevels: readonly WCAGLevel[]
  onLevelsChange: (update: (prev: WCAGLevel[]) => WCAGLevel[]) => void
  selectedPrinciple: PrincipleFilter
  onPrincipleChange: (value: PrincipleFilter) => void
  selectedRisks: readonly RiskLevel[]
  onRisksChange: (update: (prev: RiskLevel[]) => RiskLevel[]) => void
  onReset: () => void
}

/* ------------------------------------------------------------------ */
/* Pill styling                                                        */
/* ------------------------------------------------------------------ */

interface PillTone {
  off: string
  on: string
  dot: string
}

/**
 * Selected pills are filled AND show a check icon, so state is never
 * conveyed by colour alone (WCAG 1.4.1). Text/background pairs meet 4.5:1.
 */
const NEUTRAL_TONE: PillTone = {
  off: 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100',
  on: 'border-blue-700 bg-blue-700 text-white hover:bg-blue-800',
  dot: 'bg-slate-400',
}

function riskTone(risk: RiskLevel): PillTone {
  const s = RISK_STYLES[risk]
  return { off: `${s.soft} ${s.softHover}`, on: `${s.solid} ${s.solidHover}`, dot: s.dot }
}

const PILL_BASE =
  'inline-flex min-h-11 cursor-pointer select-none items-center gap-1.5 rounded-full border px-4 text-sm font-medium transition-colors ' +
  'peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-blue-700'

/* ------------------------------------------------------------------ */
/* Building blocks                                                     */
/* ------------------------------------------------------------------ */

function toggleValue<T>(list: readonly T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value]
}

function FilterGroup({ legend, children }: { legend: string; children: ReactNode }) {
  return (
    <fieldset className="min-w-0">
      <legend className="mb-2 text-sm font-semibold text-slate-900">{legend}</legend>
      <div className="flex flex-wrap gap-2">{children}</div>
    </fieldset>
  )
}

interface PillProps {
  type: 'checkbox' | 'radio'
  name?: string
  label: string
  checked: boolean
  onChange: () => void
  tone?: PillTone
}

function Pill({ type, name, label, checked, onChange, tone = NEUTRAL_TONE }: PillProps) {
  return (
    <label className="relative">
      <input
        type={type}
        name={name}
        checked={checked}
        onChange={onChange}
        className="peer sr-only"
      />
      <span className={`${PILL_BASE} ${checked ? tone.on : tone.off}`}>
        {checked ? (
          <Check className="size-4" strokeWidth={3} aria-hidden="true" />
        ) : (
          <span className={`size-2 rounded-full ${tone.dot}`} aria-hidden="true" />
        )}
        {label}
      </span>
    </label>
  )
}

/* ------------------------------------------------------------------ */
/* FilterBar                                                           */
/* ------------------------------------------------------------------ */

export function FilterBar({
  searchQuery,
  onSearchChange,
  selectedVersions,
  onVersionsChange,
  selectedLevels,
  onLevelsChange,
  selectedPrinciple,
  onPrincipleChange,
  selectedRisks,
  onRisksChange,
  onReset,
}: FilterBarProps) {
  const id = useId()
  const headingId = `${id}-heading`
  const searchId = `${id}-search`

  return (
    <section
      aria-labelledby={headingId}
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6"
    >
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 id={headingId} className="text-lg font-semibold text-slate-900">
          Filter criteria
        </h2>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
        >
          <RotateCcw className="size-4" aria-hidden="true" />
          Reset all
        </button>
      </div>

      <div className="mb-6">
        <label htmlFor={searchId} className="mb-2 block text-sm font-semibold text-slate-900">
          Search
        </label>
        <div className="relative">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-slate-500"
            aria-hidden="true"
          />
          <input
            id={searchId}
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Name, number or keyword, e.g. contrast, 2.1.1"
            autoComplete="off"
            className="min-h-11 w-full rounded-lg border border-slate-500 bg-white py-2 pr-3 pl-10 text-base text-slate-900 placeholder:text-slate-500 focus-visible:border-blue-700 focus-visible:outline-3 focus-visible:outline-offset-1 focus-visible:outline-blue-700"
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <FilterGroup legend="WCAG version">
          {FILTER_VERSIONS.map((version) => (
            <Pill
              key={version}
              type="checkbox"
              label={newInTag(version)}
              checked={selectedVersions.includes(version)}
              onChange={() => onVersionsChange((prev) => toggleValue(prev, version))}
            />
          ))}
        </FilterGroup>

        <FilterGroup legend="Conformance level">
          {WCAG_LEVELS.map((level) => (
            <Pill
              key={level}
              type="checkbox"
              label={levelTag(level)}
              checked={selectedLevels.includes(level)}
              onChange={() => onLevelsChange((prev) => toggleValue(prev, level))}
            />
          ))}
        </FilterGroup>

        <FilterGroup legend="Principle">
          {PRINCIPLE_OPTIONS.map((principle) => (
            <Pill
              key={principle}
              type="radio"
              name={`${id}-principle`}
              label={principle}
              checked={selectedPrinciple === principle}
              onChange={() => onPrincipleChange(principle)}
            />
          ))}
        </FilterGroup>

        <FilterGroup legend="Risk level">
          {RISK_LEVELS.map((risk) => (
            <Pill
              key={risk}
              type="checkbox"
              label={risk}
              tone={riskTone(risk)}
              checked={selectedRisks.includes(risk)}
              onChange={() => onRisksChange((prev) => toggleValue(prev, risk))}
            />
          ))}
        </FilterGroup>
      </div>
    </section>
  )
}
