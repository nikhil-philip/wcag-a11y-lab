/**
 * WCAG Accessibility Lab — data schema.
 *
 * Every success criterion shown in the lab is described by a `CriterionData`
 * object. The union types below are backed by `as const` arrays so the same
 * values drive both compile-time checks and runtime UI (filters, badges).
 * Adding a value here (e.g. a new WCAG version) updates types, filters and
 * badges together.
 */

/* ------------------------------------------------------------------ */
/* Enumerations                                                        */
/* ------------------------------------------------------------------ */

export const WCAG_VERSIONS = ['2.0', '2.1', '2.2'] as const
export type WCAGVersion = (typeof WCAG_VERSIONS)[number]

export const WCAG_LEVELS = ['A', 'AA'] as const
export type WCAGLevel = (typeof WCAG_LEVELS)[number]

export const WCAG_PRINCIPLES = ['Perceivable', 'Operable', 'Understandable', 'Robust'] as const
export type WCAGPrinciple = (typeof WCAG_PRINCIPLES)[number]

/** Ordered from most to least severe, so index can be used for sorting. */
export const RISK_LEVELS = ['Critical', 'High', 'Medium', 'Low'] as const
export type RiskLevel = (typeof RISK_LEVELS)[number]

/* ------------------------------------------------------------------ */
/* Filter options                                                      */
/* ------------------------------------------------------------------ */

/** The baseline every criterion builds on; it gets no filter pill and no badge. */
export const BASELINE_VERSION = '2.0' satisfies WCAGVersion

export type NewerVersion = Exclude<WCAGVersion, typeof BASELINE_VERSION>

/** Versions offered as filters: everything newer than the baseline. */
export const FILTER_VERSIONS: readonly NewerVersion[] = WCAG_VERSIONS.filter(
  (v): v is NewerVersion => v !== BASELINE_VERSION,
)

export const ALL_PRINCIPLES = 'All'

export const PRINCIPLE_OPTIONS = [ALL_PRINCIPLES, ...WCAG_PRINCIPLES] as const

export type PrincipleFilter = (typeof PRINCIPLE_OPTIONS)[number]

/* ------------------------------------------------------------------ */
/* Tag labels                                                          */
/* ------------------------------------------------------------------ */

export function levelTag(level: WCAGLevel): string {
  return `Level ${level}`
}

export function newInTag(version: NewerVersion): string {
  return `New in ${version}`
}

/** "New in 2.1" etc., or null for the baseline version (no tag shown). */
export function versionTag(version: WCAGVersion): string | null {
  return version === BASELINE_VERSION ? null : newInTag(version)
}

export function riskTag(risk: RiskLevel): string {
  return `${risk} risk`
}

/**
 * Which live demo component renders an example. Each value maps to a
 * component in the (future) interactive demo registry.
 */
export const INTERACTIVE_TYPES = [
  'static', // code + explanation only, no live demo
  'image',
  'media',
  'media-alternatives', // real video and audio files with transcripts and audio description (1.2.1, 1.2.3, 1.2.5)
  'non-text-content',
  'info-relationships', // landmarks, grouping, lists, tables, key-value pairs and headings (1.3.1)
  'button',
  'link',
  'navigation',
  'modal',
  'focus',
  'keyboard',
  'contrast',
  'non-text-contrast',
  'color-only',
  'text-resize',
  'text-spacing',
  'reflow',
  'orientation',
  'reading-order',
  'instructions',
  'autocomplete',
  'audio-control',
  'hover-content',
  'keyboard-trap',
  'character-shortcuts',
  'pause-stop-hide',
  'flashing', // static storyboard only (ThreeFlashesDemo): never render real flashing, it can trigger seizures
  'bypass-blocks',
  'page-title',
  'focus-order',
  'headings-labels',
  'focus-obscured',
  'pointer-gestures',
  'pointer-cancellation',
  'label-in-name',
  'motion-actuation',
  'motion',
  'timing',
  'aria-live',
  'target-size',
  'drag',
  'authentication',
  'language-of-page',
  'language-of-parts',
  'on-focus',
  'on-input',
  'consistent-navigation',
  'consistent-identification',
  'consistent-help',
  'form-error',
  'form-labels',
  'error-suggestion',
  'error-prevention',
  'redundant-entry',
  'status-message',
] as const
export type InteractiveType = (typeof INTERACTIVE_TYPES)[number]

/* ------------------------------------------------------------------ */
/* Core shapes                                                         */
/* ------------------------------------------------------------------ */

/** Success criterion number, e.g. "1.4.3" or "2.5.8". */
export type CriterionId = `${1 | 2 | 3 | 4}.${number}.${number}`

export interface ExampleData {
  /** Source snippet shown in the code viewer (HTML/JSX/CSS). Omit when the live demo already shows the markup. */
  readonly codeSnippet?: string
  /** Why this example passes or fails the criterion. */
  readonly explanation: string
  /** Which live demo component renders this example. */
  readonly interactiveType: InteractiveType
}

export interface CriterionData {
  readonly id: CriterionId
  readonly name: string
  /** WCAG version in which the criterion was introduced. */
  readonly version: WCAGVersion
  readonly level: WCAGLevel
  readonly principle: WCAGPrinciple
  readonly risk: RiskLevel
  readonly description: string
  readonly passExample: ExampleData
  readonly failExample: ExampleData
  /** Ordered, manual/assistive-tech test steps. */
  readonly testingSteps: readonly string[]
  /** User groups affected when the criterion fails. */
  readonly impactedUsers: readonly string[]
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

/** The first digit of a criterion id always identifies its principle. */
export const PRINCIPLE_BY_PREFIX: Readonly<
  Record<CriterionId extends `${infer P}.${string}` ? P : never, WCAGPrinciple>
> = {
  '1': 'Perceivable',
  '2': 'Operable',
  '3': 'Understandable',
  '4': 'Robust',
}

/**
 * Identity helper for authoring criteria with full type-checking and
 * literal inference, e.g. `export const c143 = defineCriterion({ ... })`.
 * Also guards against an id/principle mismatch at runtime in dev.
 */
export function defineCriterion<const T extends CriterionData>(criterion: T): T {
  if (import.meta.env.DEV) {
    const prefix = criterion.id.charAt(0) as keyof typeof PRINCIPLE_BY_PREFIX
    if (PRINCIPLE_BY_PREFIX[prefix] !== criterion.principle) {
      console.warn(
        `[wcag-schema] ${criterion.id} is tagged "${criterion.principle}" but belongs to "${PRINCIPLE_BY_PREFIX[prefix]}".`,
      )
    }
  }
  return criterion
}
