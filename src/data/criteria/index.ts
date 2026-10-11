import type { CriterionData } from '../wcag-schema'
import { operableCriteria } from './operable'
import { perceivableCriteria } from './perceivable'
import { robustCriteria } from './robust'
import { understandableCriteria } from './understandable'

/** Compare "1.4.10" vs "1.4.3" numerically, part by part. */
function compareIds(a: CriterionData, b: CriterionData): number {
  const pa = a.id.split('.').map(Number)
  const pb = b.id.split('.').map(Number)
  for (let i = 0; i < 3; i++) {
    const diff = (pa[i] ?? 0) - (pb[i] ?? 0)
    if (diff !== 0) return diff
  }
  return 0
}

/** What the lab leaves out on purpose, with the reason shown to readers. */
export const EXCLUDED_CRITERIA: readonly { title: string; reason: string }[] = [
  {
    title: 'All Level AAA success criteria',
    reason:
      'The lab covers Level A and AA, the level most accessibility laws and policies require (for example EN 301 549 and the ADA Title II rule). W3C does not recommend requiring Level AAA for entire sites, because some content cannot meet every AAA criterion.',
  },
  {
    title: '1.2.4 Captions (Live)',
    reason:
      'A faithful example needs a real live stream captioned in real time by a human captioner or a live speech-to-text service. A prerecorded clip with timed captions is not live, so it would only repeat 1.2.2 and could suggest that captions written in advance meet 1.2.4.',
  },
  {
    title: '4.1.1 Parsing',
    reason:
      'Removed from WCAG 2.2 as obsolete. Browsers and assistive technologies now handle the markup errors it was about, and the problems that still matter are covered by 1.3.1 and 4.1.2.',
  },
]

/** Every criterion in the lab, in WCAG numbering order. */
export const wcagCriteria: readonly CriterionData[] = [
  ...perceivableCriteria,
  ...operableCriteria,
  ...understandableCriteria,
  ...robustCriteria,
].sort(compareIds)

if (import.meta.env.DEV) {
  const seen = new Set<string>()
  for (const c of wcagCriteria) {
    if (seen.has(c.id)) console.warn(`[criteria] Duplicate criterion id ${c.id}; React keys will collide.`)
    seen.add(c.id)
  }
}
