import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { criterionIdFromPath } from './site.ts'

const root = document.getElementById('root')!
const app = (
  <StrictMode>
    <App initialCriterionId={criterionIdFromPath(window.location.pathname)} />
  </StrictMode>
)

// Built pages arrive pre-rendered by scripts/prerender.mjs; the dev server sends an empty root.
if (root.hasChildNodes()) hydrateRoot(root, app)
else createRoot(root).render(app)
