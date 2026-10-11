import * as Accordion from '@radix-ui/react-accordion'
import { useEffect, useMemo, useRef, useState } from 'react'
import { CriterionAccordion } from './components/CriterionAccordion'
import { FilterBar } from './components/FilterBar'
import { InfoDialog } from './components/InfoDialog'
import { SiteFooter } from './components/SiteFooter'
import { EXCLUDED_CRITERIA, wcagCriteria } from './data/criteria'
import {
  ALL_PRINCIPLES,
  type PrincipleFilter,
  type RiskLevel,
  type WCAGLevel,
  type WCAGVersion,
} from './data/wcag-schema'
import { criterionDomId, criterionIdFromHash, criterionPageTitle } from './site'

function findCriterion(id: string | null | undefined) {
  return id ? wcagCriteria.find((c) => c.id === id) : undefined
}

interface AppProps {
  /**
   * Criterion named by the page's path (/criteria/1-4-3/), open from the first render. It must match the
   * pre-rendered HTML, so a #1.4.3 hash is applied after hydration instead.
   */
  initialCriterionId?: string | null
}

function App({ initialCriterionId = null }: AppProps) {
  const initial = findCriterion(initialCriterionId)?.id ?? null
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedVersions, setSelectedVersions] = useState<WCAGVersion[]>([])
  const [selectedLevels, setSelectedLevels] = useState<WCAGLevel[]>([])
  const [selectedPrinciple, setSelectedPrinciple] = useState<PrincipleFilter>(ALL_PRINCIPLES)
  const [selectedRisks, setSelectedRisks] = useState<RiskLevel[]>([])
  const [openIds, setOpenIds] = useState<string[]>(initial ? [initial] : [])
  // A criterion to scroll to and focus once its panel has rendered open.
  const revealId = useRef<string | null>(initial)

  const resetFilters = () => {
    setSearchQuery('')
    setSelectedVersions([])
    setSelectedLevels([])
    setSelectedPrinciple(ALL_PRINCIPLES)
    setSelectedRisks([])
  }

  useEffect(() => {
    const c = findCriterion(revealId.current)
    revealId.current = null
    if (!c) return
    document.title = criterionPageTitle(c)
    const item = document.getElementById(criterionDomId(c.id))
    item?.scrollIntoView({ block: 'start' })
    // Focus the panel's heading button, so keyboard and screen-reader users start where the link pointed.
    item?.querySelector('button')?.focus({ preventScroll: true })
  }, [openIds])

  // #1.4.3 links: on load and whenever the hash changes.
  useEffect(() => {
    function openFromHash() {
      const c = findCriterion(criterionIdFromHash(window.location.hash))
      if (!c) return
      // Clear filters so the criterion is guaranteed to be in the list.
      resetFilters()
      revealId.current = c.id
      // Always a new array, so the reveal effect runs even if the panel was already open.
      setOpenIds((prev) => [...prev.filter((id) => id !== c.id), c.id])
    }
    openFromHash()
    window.addEventListener('hashchange', openFromHash)
    return () => window.removeEventListener('hashchange', openFromHash)
  }, [])

  // AND between categories; OR within a category. An empty selection means
  // "no constraint" for that category.
  const filteredCriteria = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    return wcagCriteria.filter((c) => {
      if (query && !`${c.id} ${c.name} ${c.description}`.toLowerCase().includes(query)) {
        return false
      }
      if (selectedVersions.length > 0 && !selectedVersions.includes(c.version)) return false
      if (selectedLevels.length > 0 && !selectedLevels.includes(c.level)) return false
      if (selectedPrinciple !== ALL_PRINCIPLES && c.principle !== selectedPrinciple) return false
      if (selectedRisks.length > 0 && !selectedRisks.includes(c.risk)) return false
      return true
    })
  }, [searchQuery, selectedVersions, selectedLevels, selectedPrinciple, selectedRisks])

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <a
        href="#results"
        className="sr-only rounded-lg bg-white px-4 py-3 font-semibold text-blue-800 shadow-lg focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:outline-3 focus:outline-offset-2 focus:outline-blue-700"
      >
        Skip to criteria
      </a>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 lg:py-12">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">WCAG Accessibility Lab</h1>
          <p className="mt-2 max-w-2xl text-slate-700">
            Explore WCAG success criteria with side-by-side failing and passing examples.
          </p>
          <InfoDialog
            label="What’s not included"
            title="What’s not included"
            triggerClassName="mt-3 inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border-2 border-slate-400 bg-white px-3 text-sm font-semibold text-slate-900 hover:bg-slate-100 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
          >
            <p>The lab covers every WCAG 2.2 Level A and AA success criterion except the ones below.</p>
            <ul className="flex flex-col gap-3">
              {EXCLUDED_CRITERIA.map((c) => (
                <li key={c.title}>
                  <h3 className="font-semibold text-slate-900">{c.title}</h3>
                  <p>{c.reason}</p>
                </li>
              ))}
            </ul>
          </InfoDialog>
        </header>

        <FilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedVersions={selectedVersions}
          onVersionsChange={setSelectedVersions}
          selectedLevels={selectedLevels}
          onLevelsChange={setSelectedLevels}
          selectedPrinciple={selectedPrinciple}
          onPrincipleChange={setSelectedPrinciple}
          selectedRisks={selectedRisks}
          onRisksChange={setSelectedRisks}
          onReset={resetFilters}
        />

        <section
          id="results"
          tabIndex={-1}
          aria-labelledby="results-heading"
          className="mt-8 scroll-mt-4 focus:outline-none"
        >
          <h2 id="results-heading" className="text-lg font-semibold">
            Criteria
          </h2>
          {/* Polite live region: screen readers announce the new count after each filter change. */}
          <p role="status" className="mt-1 text-sm text-slate-700">
            Showing {filteredCriteria.length} of {wcagCriteria.length} criteria
          </p>

          {filteredCriteria.length > 0 ? (
            <Accordion.Root
              type="multiple"
              value={openIds}
              onValueChange={setOpenIds}
              className="mt-4 flex flex-col gap-4"
            >
              {filteredCriteria.map((c) => (
                <CriterionAccordion key={c.id} criterion={c} />
              ))}
            </Accordion.Root>
          ) : (
            <p className="mt-4 rounded-lg border border-dashed border-slate-300 bg-white px-4 py-6 text-center text-slate-700">
              No criteria match these filters. Try removing a filter or choose "Reset all".
            </p>
          )}
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}

export default App
