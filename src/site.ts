/**
 * Site-wide settings (from .env) and the URL scheme for linking to one criterion.
 *
 * Every criterion has its own page at /criteria/1-4-3/, written at build time by scripts/prerender.mjs.
 * The short form #1.4.3 also works on any page.
 */

import type { CriterionData } from './data/wcag-schema'

export const SITE_NAME = 'WCAG Accessibility Lab'

/** e.g. "https://example.com", with no trailing slash. */
export const SITE_URL = String(import.meta.env.VITE_SITE_URL ?? '').replace(/\/+$/, '')

export const AUTHOR = {
  name: String(import.meta.env.VITE_AUTHOR_NAME ?? '').trim(),
  github: String(import.meta.env.VITE_AUTHOR_GITHUB ?? '').trim(),
  linkedin: String(import.meta.env.VITE_AUTHOR_LINKEDIN ?? '').trim(),
}

/** "1.4.3" -> "1-4-3". Dots in the last path segment look like a file extension to some static hosts. */
export function criterionSlug(id: string): string {
  return id.replaceAll('.', '-')
}

/** Site-relative path of a criterion's own page, e.g. "/criteria/1-4-3/". */
export function criterionPath(id: string): string {
  return `${import.meta.env.BASE_URL}criteria/${criterionSlug(id)}/`
}

/** DOM id of a criterion's panel. */
export function criterionDomId(id: string): string {
  return `criterion-${criterionSlug(id)}`
}

/** Browser-tab and search-result title of a criterion's page. */
export function criterionPageTitle(c: Pick<CriterionData, 'id' | 'name'>): string {
  return `${c.id} ${c.name}: pass and fail examples | ${SITE_NAME}`
}

/** "/criteria/1-4-3/" -> "1.4.3". Not checked against the criteria list. */
export function criterionIdFromPath(pathname: string): string | null {
  const match = /\/criteria\/(\d+-\d+-\d+)\/?(?:index\.html)?$/.exec(pathname)
  return match?.[1]?.replaceAll('-', '.') ?? null
}

/** "#1.4.3" (or "#1-4-3") -> "1.4.3". Not checked against the criteria list. */
export function criterionIdFromHash(hash: string): string | null {
  const match = /^#(\d+[.-]\d+[.-]\d+)$/.exec(hash)
  return match?.[1]?.replaceAll('-', '.') ?? null
}
