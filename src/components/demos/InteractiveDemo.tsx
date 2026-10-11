import { MousePointerClick } from 'lucide-react'
import { Suspense, use, type ComponentType } from 'react'
import type { InteractiveType } from '../../data/wcag-schema'
import { ErrorBoundary } from './ErrorBoundary'
import type { DemoVariant } from './types'

type DemoComponent = ComponentType<{ variant: DemoVariant }>

/**
 * Loads a demo from its module's named export. Each demo is its own chunk, downloaded only when its
 * criterion is opened. `name` must be an export of the module that takes `variant`, so a typo is a
 * compile error.
 */
function load<K extends string>(
  importModule: () => Promise<Record<K, DemoComponent>>,
  name: K,
): () => Promise<DemoComponent> {
  return () => importModule().then((module) => module[name])
}

/** Which demo renders each interactive type. Types without an entry show a placeholder. */
const LOADERS: Partial<Record<InteractiveType, () => Promise<DemoComponent>>> = {
  'audio-control': load(() => import('./AudioControlDemo'), 'AudioControlDemo'),
  authentication: load(() => import('./AccessibleAuthDemo'), 'AccessibleAuthDemo'),
  autocomplete: load(() => import('./IdentifyInputPurposeDemo'), 'IdentifyInputPurposeDemo'),
  'bypass-blocks': load(() => import('./BypassBlocksDemo'), 'BypassBlocksDemo'),
  button: load(() => import('./SwitchDemo'), 'SwitchDemo'),
  'character-shortcuts': load(() => import('./KeyShortcutsDemo'), 'KeyShortcutsDemo'),
  'color-only': load(() => import('./ColorOnlyDemo'), 'ColorOnlyDemo'),
  'consistent-help': load(() => import('./ConsistentHelpDemo'), 'ConsistentHelpDemo'),
  'consistent-identification': load(
    () => import('./ConsistentIdentificationDemo'),
    'ConsistentIdentificationDemo',
  ),
  'consistent-navigation': load(() => import('./ConsistentNavigationDemo'), 'ConsistentNavigationDemo'),
  contrast: load(() => import('./ContrastDemo'), 'ContrastDemo'),
  drag: load(() => import('./DraggingMovementsDemo'), 'DraggingMovementsDemo'),
  'error-prevention': load(() => import('./ErrorPreventionDemo'), 'ErrorPreventionDemo'),
  'error-suggestion': load(() => import('./ErrorSuggestionDemo'), 'ErrorSuggestionDemo'),
  flashing: load(() => import('./ThreeFlashesDemo'), 'ThreeFlashesDemo'),
  focus: load(() => import('./FocusDemo'), 'FocusDemo'),
  'focus-obscured': load(() => import('./FocusObscuredDemo'), 'FocusObscuredDemo'),
  'focus-order': load(() => import('./FocusOrderDemo'), 'FocusOrderDemo'),
  'form-error': load(() => import('./FormErrorDemo'), 'FormErrorDemo'),
  'form-labels': load(() => import('./LabelsInstructionsDemo'), 'LabelsInstructionsDemo'),
  'headings-labels': load(() => import('./HeadingsLabelsDemo'), 'HeadingsLabelsDemo'),
  'hover-content': load(() => import('./HoverContentDemo'), 'HoverContentDemo'),
  image: load(() => import('./ImagesOfTextDemo'), 'ImagesOfTextDemo'),
  'info-relationships': load(() => import('./InfoRelationshipsDemo'), 'InfoRelationshipsDemo'),
  instructions: load(() => import('./SensoryCharacteristicsDemo'), 'SensoryCharacteristicsDemo'),
  keyboard: load(() => import('./KeyboardDemo'), 'KeyboardDemo'),
  'keyboard-trap': load(() => import('./KeyboardTrapDemo'), 'KeyboardTrapDemo'),
  'label-in-name': load(() => import('./LabelInNameDemo'), 'LabelInNameDemo'),
  'language-of-page': load(() => import('./LanguageOfPageDemo'), 'LanguageOfPageDemo'),
  'language-of-parts': load(() => import('./LanguageDemo'), 'LanguageDemo'),
  link: load(() => import('./LinkPurposeDemo'), 'LinkPurposeDemo'),
  'media-alternatives': load(() => import('./MediaAlternativesDemo'), 'MediaAlternativesDemo'),
  media: load(() => import('./CaptionsDemo'), 'CaptionsDemo'),
  'motion-actuation': load(() => import('./MotionActuationDemo'), 'MotionActuationDemo'),
  navigation: load(() => import('./MultipleWaysDemo'), 'MultipleWaysDemo'),
  'non-text-content': load(() => import('./NonTextContentDemo'), 'NonTextContentDemo'),
  'non-text-contrast': load(() => import('./NonTextContrastDemo'), 'NonTextContrastDemo'),
  'on-focus': load(() => import('./OnFocusDemo'), 'OnFocusDemo'),
  'on-input': load(() => import('./OnInputDemo'), 'OnInputDemo'),
  orientation: load(() => import('./OrientationDemo'), 'OrientationDemo'),
  'page-title': load(() => import('./PageTitledDemo'), 'PageTitledDemo'),
  'pause-stop-hide': load(() => import('./PauseStopHideDemo'), 'PauseStopHideDemo'),
  'pointer-cancellation': load(() => import('./PointerCancellationDemo'), 'PointerCancellationDemo'),
  'pointer-gestures': load(() => import('./PointerGesturesDemo'), 'PointerGesturesDemo'),
  'reading-order': load(() => import('./MeaningfulSequenceDemo'), 'MeaningfulSequenceDemo'),
  'redundant-entry': load(() => import('./RedundantEntryDemo'), 'RedundantEntryDemo'),
  reflow: load(() => import('./ReflowDemo'), 'ReflowDemo'),
  'status-message': load(() => import('./StatusMessageDemo'), 'StatusMessageDemo'),
  'target-size': load(() => import('./TargetSizeDemo'), 'TargetSizeDemo'),
  'text-resize': load(() => import('./TextResizeDemo'), 'TextResizeDemo'),
  'text-spacing': load(() => import('./TextSpacingDemo'), 'TextSpacingDemo'),
  timing: load(() => import('./TimingAdjustableDemo'), 'TimingAdjustableDemo'),
}

/**
 * One import per type, started on first render and shared by both panels. A rejected promise stays
 * rejected, so Retry drops it and the next render starts a fresh import().
 */
const imports = new Map<InteractiveType, Promise<DemoComponent>>()

function importDemo(type: InteractiveType, loader: () => Promise<DemoComponent>): Promise<DemoComponent> {
  let promise = imports.get(type)
  if (!promise) {
    promise = loader()
    imports.set(type, promise)
  }
  return promise
}

/**
 * Loads demos before rendering, so use() returns them without suspending and the pre-rendered HTML
 * (scripts/prerender.mjs) has them in place instead of a loading message. Marking the promise
 * fulfilled is the convention React's use() reads.
 */
// oxlint-disable-next-line react/only-export-components
export async function preloadDemos(types: readonly InteractiveType[]): Promise<void> {
  await Promise.all(
    types.map(async (type) => {
      const loader = LOADERS[type]
      if (!loader) return
      const promise = importDemo(type, loader)
      const value = await promise
      Object.assign(promise, { status: 'fulfilled', value })
    }),
  )
}

/** Suspends until the demo's chunk has loaded (use() throws a rejection to the error boundary). */
function LoadedDemo({ type, loader, variant }: { type: InteractiveType; loader: () => Promise<DemoComponent>; variant: DemoVariant }) {
  const Demo = use(importDemo(type, loader))
  // Not created during render: the cached promise always resolves to the module's own export, so the
  // component identity is stable across renders and its state is kept.
  // oxlint-disable-next-line react/static-components
  return <Demo variant={variant} />
}

interface InteractiveDemoProps {
  type: InteractiveType
  variant: DemoVariant
}

/** Renders the live demo for an interactive type, or a placeholder if none exists yet. */
export function InteractiveDemo({ type, variant }: InteractiveDemoProps) {
  const loader = LOADERS[type]

  if (loader) {
    return (
      <ErrorBoundary resetKey={type} onRetry={() => imports.delete(type)}>
        <Suspense
          fallback={
            // role="status" so screen-reader users hear that something is on its way.
            <div role="status" className="rounded bg-slate-50 p-8 text-center text-slate-700 motion-safe:animate-pulse">
              Loading interactive demo...
            </div>
          }
        >
          <LoadedDemo type={type} loader={loader} variant={variant} />
        </Suspense>
      </ErrorBoundary>
    )
  }

  return (
    <div className="flex min-h-32 flex-col items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white p-4 text-center text-sm font-medium text-slate-700">
      <MousePointerClick className="size-6" aria-hidden="true" />
      Interactive Demo: {type}
    </div>
  )
}
