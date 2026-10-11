/**
 * Pre-renders the built site so search engines and link previews see real content without running JavaScript:
 *
 * - dist/index.html: the lab with every criterion closed.
 * - dist/criteria/<id>/index.html: one page per criterion, opened, with its own title, description and
 *   canonical link (e.g. /criteria/1-4-3/).
 * - dist/sitemap.xml and dist/robots.txt.
 *
 * The browser then hydrates the HTML (src/main.tsx). Runs automatically after `npm run build`.
 */

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'dist')

const escapeHtml = (s) =>
  s.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')

/** Replaces the value of a tag that must already be in index.html, so the two files cannot drift apart silently. */
function replaceOnce(html, pattern, value, what) {
  if (!pattern.test(html)) throw new Error(`index.html has no ${what}; keep it in sync with scripts/prerender.mjs`)
  return html.replace(pattern, (_, before, after) => `${before}${escapeHtml(value)}${after}`)
}

function setMeta(html, key, value) {
  const attr = key.includes(':') && !key.startsWith('twitter:') ? 'property' : 'name'
  return replaceOnce(html, new RegExp(`(<meta\\s+${attr}="${key}"\\s+content=")[^"]*(")`), value, `<meta ${attr}="${key}">`)
}

function withRoot(html, appHtml) {
  const empty = '<div id="root"></div>'
  if (!html.includes(empty)) throw new Error('index.html has no empty <div id="root"></div>')
  return html.replace(empty, () => `<div id="root">${appHtml}</div>`)
}

const vite = await createServer({ root, logLevel: 'error', appType: 'custom', server: { middlewareMode: true } })
try {
  const { render } = await vite.ssrLoadModule('/src/entry-server.tsx')
  const { wcagCriteria } = await vite.ssrLoadModule('/src/data/criteria/index.ts')
  const site = await vite.ssrLoadModule('/src/site.ts')

  if (!site.SITE_URL || site.SITE_URL.includes('your-site.example')) {
    console.warn('\n⚠  VITE_SITE_URL in .env is not set to the real address. Canonical links, social previews and the sitemap will be wrong.\n')
  }

  const template = readFileSync(join(dist, 'index.html'), 'utf8')
  writeFileSync(join(dist, 'index.html'), withRoot(template, await render(null)))

  const failures = []
  const paths = ['/']
  for (const c of wcagCriteria) {
    const path = site.criterionPath(c.id)
    const url = `${site.SITE_URL}${path}`
    const title = site.criterionPageTitle(c)
    const description = `WCAG ${c.id} ${c.name} (Level ${c.level}): ${c.description}`

    let html
    try {
      // A demo that fails here still works: the browser renders it instead. Reported so it can be fixed.
      html = await render(c.id, (error) =>
        console.warn(`${c.id}: rendered in the browser only: ${error instanceof Error ? error.message : error}`),
      )
    } catch (error) {
      failures.push(`${c.id}: ${error instanceof Error ? error.message : error}`)
      continue
    }

    let page = replaceOnce(template, /(<title>)[^<]*(<\/title>)/, title, '<title>')
    page = replaceOnce(page, /(<link rel="canonical" href=")[^"]*(")/, url, '<link rel="canonical">')
    page = setMeta(page, 'description', description)
    page = setMeta(page, 'og:url', url)
    page = setMeta(page, 'og:title', title)
    page = setMeta(page, 'og:description', description)
    page = setMeta(page, 'twitter:title', title)
    page = setMeta(page, 'twitter:description', description)

    const dir = join(dist, ...path.split('/').filter(Boolean))
    mkdirSync(dir, { recursive: true })
    writeFileSync(join(dir, 'index.html'), withRoot(page, html))
    paths.push(path)
  }

  if (failures.length > 0) {
    throw new Error(`Could not pre-render ${failures.length} page(s):\n  ${failures.join('\n  ')}`)
  }

  const urls = paths.map((p) => `  <url><loc>${escapeHtml(`${site.SITE_URL}${p}`)}</loc></url>`).join('\n')
  writeFileSync(
    join(dist, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
  )
  writeFileSync(join(dist, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${site.SITE_URL}/sitemap.xml\n`)

  console.log(`Pre-rendered ${paths.length} pages and wrote sitemap.xml and robots.txt.`)
} finally {
  await vite.close()
}
