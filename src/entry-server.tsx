/** Renders the lab to HTML at build time (scripts/prerender.mjs). main.tsx then hydrates it in the browser. */

import { StrictMode } from 'react'
import { prerender } from 'react-dom/static'
import App from './App.tsx'
import { preloadDemos } from './components/demos/InteractiveDemo.tsx'
import { wcagCriteria } from './data/criteria/index.ts'

/**
 * Same tree as main.tsx, so the browser's first render matches this HTML. The open criterion's demos are
 * loaded first, so its fail and pass examples are rendered in place. A demo that throws on the server is
 * reported to onError and left for the browser to render.
 */
export async function render(criterionId: string | null, onError?: (error: unknown) => void): Promise<string> {
  const criterion = wcagCriteria.find((c) => c.id === criterionId)
  if (criterion) {
    await preloadDemos([criterion.failExample.interactiveType, criterion.passExample.interactiveType])
  }

  const { prelude } = await prerender(
    <StrictMode>
      <App initialCriterionId={criterionId} />
    </StrictMode>,
    {
      // Keep every boundary inline. By default React moves large ones to the end of the page, hidden, and
      // swaps them in with a script, which is meant for streaming and hides them from crawlers without JS.
      progressiveChunkSize: Number.POSITIVE_INFINITY,
      ...(onError ? { onError } : {}),
    },
  )
  return new Response(prelude).text()
}
