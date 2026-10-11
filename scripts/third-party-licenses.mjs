/**
 * Writes public/third-party-licenses.txt: the license notice of every package that ships in the site bundle.
 *
 * MIT and ISC require their notices to travel with every copy of the code, and the minified bundle drops them,
 * so this file is published next to the site instead. Runs automatically before `npm run build`.
 */

import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const readJson = (path) => JSON.parse(readFileSync(path, 'utf8'))

// Runtime dependencies end up in the JS bundle; Tailwind's generated CSS ends up in the stylesheet.
const pkg = readJson(join(root, 'package.json'))
const queue = [...Object.keys(pkg.dependencies ?? {}), 'tailwindcss']
const seen = new Map()

while (queue.length > 0) {
  const name = queue.shift()
  if (seen.has(name)) continue
  const dir = join(root, 'node_modules', name)
  const meta = readJson(join(dir, 'package.json'))
  const licenseFile = readdirSync(dir).find((f) => /^licen[cs]e/i.test(f))
  if (!licenseFile) throw new Error(`No license file found for ${name}`)
  seen.set(name, { version: meta.version, license: meta.license, text: readFileSync(join(dir, licenseFile), 'utf8').trim() })
  // Peer dependencies (React) are already in the list, and dev tooling never reaches the browser.
  if (name !== 'tailwindcss') queue.push(...Object.keys(meta.dependencies ?? {}))
}

// Group packages that share an identical notice (for example all the Radix UI packages).
const groups = new Map()
for (const [name, info] of [...seen].sort(([a], [b]) => a.localeCompare(b))) {
  const group = groups.get(info.text) ?? []
  group.push(`${name}@${info.version} (${info.license})`)
  groups.set(info.text, group)
}

const rule = '='.repeat(78)
const sections = [...groups].map(([text, names]) => `${rule}\n${names.join('\n')}\n${rule}\n\n${text}\n`)
const header = `Third-party software notices for WCAG Accessibility Lab

This site includes the open-source software listed below. Each section gives
the package(s) and the license notice they are distributed under.
`

writeFileSync(join(root, 'public', 'third-party-licenses.txt'), `${header}\n${sections.join('\n')}`)
console.log(`Wrote notices for ${seen.size} packages to public/third-party-licenses.txt`)
