import type { ReactNode } from 'react'
import { AUTHOR } from '../site'
import { InfoDialog } from './InfoDialog'

// Buttons, not links: they open a dialog on this page rather than going somewhere.
const FOOTER_BUTTON =
  'cursor-pointer rounded text-sm font-semibold text-blue-800 underline hover:text-blue-950 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-blue-700'

const WCAG_URL = 'https://www.w3.org/TR/WCAG22/'

function Section({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-1.5">
      <h3 className="font-semibold text-slate-900">{heading}</h3>
      {children}
    </section>
  )
}

const LIST = 'flex list-disc flex-col gap-1 pl-5'
const LINK = 'font-semibold text-blue-800 underline hover:text-blue-950 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-blue-700'

/** "Made by Name · GitHub · LinkedIn", showing only the parts set in .env. */
function AuthorLine() {
  if (!AUTHOR.name) return null
  const links = [
    { label: 'GitHub', href: AUTHOR.github },
    { label: 'LinkedIn', href: AUTHOR.linkedin },
  ].filter((l) => l.href)

  return (
    <p>
      Made by {AUTHOR.name}
      {links.map((l) => (
        <span key={l.label}>
          {' · '}
          <a href={l.href} className={LINK} rel="me">
            {l.label}
            <span className="sr-only"> ({AUTHOR.name})</span>
          </a>
        </span>
      ))}
    </p>
  )
}

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-300 bg-white">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-6 sm:px-6">
        <div className="flex flex-col gap-1 text-sm text-slate-700">
          <p>WCAG Accessibility Lab: a learning resource.</p>
          <AuthorLine />
        </div>
        <ul className="flex flex-wrap gap-x-6 gap-y-2">
          <li>
            <InfoDialog label="Terms of Use" title="Terms of Use" triggerClassName={FOOTER_BUTTON}>
              <Section heading="Purpose">
                <p>
                  This lab is an educational resource for learning about web accessibility. Use it to study, teach and
                  discuss the WCAG success criteria it demonstrates.
                </p>
              </Section>
              <Section heading="Not legal advice or an audit">
                <ul className={LIST}>
                  <li>The examples are simplified to show one criterion at a time.</li>
                  <li>
                    Matching a pass example does not mean a real site conforms to WCAG. Conformance depends on the whole
                    page, tested with real content, users and assistive technologies.
                  </li>
                  <li>Nothing here is legal advice about accessibility laws or regulations.</li>
                </ul>
              </Section>
              <Section heading="Intentionally inaccessible content">
                <p>
                  Every fail example is broken on purpose and is marked “Intentionally inaccessible”. Do not copy fail
                  examples into real projects.
                </p>
              </Section>
              <Section heading="WCAG text and media">
                <ul className={LIST}>
                  <li>
                    Criterion descriptions are summaries. The normative text is the{' '}
                    <a href={WCAG_URL} className={LINK}>
                      W3C WCAG 2.2 Recommendation
                    </a>
                    .
                  </li>
                  <li>
                    Video and audio clips are included only to demonstrate captions, transcripts and audio description:
                    <ul className={`${LIST} mt-1`}>
                      <li>
                        The film clip is from <cite>Night of the Living Dead</cite> (1968), directed by George A. Romero,
                        which is in the public domain.
                      </li>
                      <li>
                        The cooking video is{' '}
                        <a href="https://www.pexels.com/video/making-homemade-vada-pav-with-spices-39873486/" className={LINK}>
                          “Making Homemade Vada Pav with Spices”
                        </a>{' '}
                        by Mugdha Peter on Pexels, used under the{' '}
                        <a href="https://www.pexels.com/license/" className={LINK}>
                          Pexels License
                        </a>
                        .
                      </li>
                      <li>
                        The audio drama <cite>The Delivery Guy</cite> and the audio description of the cooking video were
                        written{AUTHOR.name && ` by ${AUTHOR.name}`} for this lab and voiced with Clipchamp text-to-speech. The rain, thunder
                        and door-knock sounds are Clipchamp stock sound effects.
                      </li>
                    </ul>
                  </li>
                  <li>
                    Icons are from{' '}
                    <a href="https://lucide.dev" className={LINK}>
                      Lucide
                    </a>
                    .
                  </li>
                  <li>
                    The lab is built with open-source software, including Lucide, React, Radix UI and Tailwind CSS. Their
                    copyright and license notices are in the{' '}
                    <a href={`${import.meta.env.BASE_URL}third-party-licenses.txt`} className={LINK}>
                      third-party software notices
                    </a>
                    .
                  </li>
                </ul>
              </Section>
              <Section heading="Privacy">
                <p>
                  The lab runs entirely in your browser. It does not use cookies and does not collect personal data. It
                  counts visits with Cloudflare Web Analytics, which records anonymous page views (such as the page, the
                  referring site and the country) without cookies and without tracking you across other sites.
                </p>
              </Section>
              <Section heading="Licence">
                <ul className={LIST}>
                  <li>
                    The code, including every code example, is under the MIT License, so you can copy it into your own
                    projects.
                  </li>
                  <li>
                    The written content (descriptions, explanations, testing steps and impacted users) is under{' '}
                    <a href="https://creativecommons.org/licenses/by/4.0/" className={LINK}>
                      CC BY 4.0
                    </a>
                    . You may reuse and adapt it, including commercially, if you credit the WCAG Accessibility Lab
                    {AUTHOR.name && ` by ${AUTHOR.name}`}.
                  </li>
                  <li>The video and audio clips keep their own terms, listed under “WCAG text and media” above.</li>
                </ul>
              </Section>
              <Section heading="No warranty">
                <p>The lab is provided as is, without warranty of any kind.</p>
              </Section>
            </InfoDialog>
          </li>
          <li>
            <InfoDialog label="Accessibility Declaration" title="Accessibility Declaration" triggerClassName={FOOTER_BUTTON}>
              <Section heading="Our commitment">
                <p>
                  This lab aims to meet{' '}
                  <a href={WCAG_URL} className={LINK}>
                    WCAG 2.2
                  </a>{' '}
                  Level AA. That covers the page itself: the search and filters, the criterion panels, the dialogs, and the
                  pass examples.
                </p>
              </Section>
              <Section heading="Deliberate exceptions">
                <p>
                  Each fail example breaks the criterion it demonstrates on purpose, so you can experience the barrier. These
                  examples are labelled “Intentionally inaccessible” and always sit next to a pass example that fixes the
                  problem.
                </p>
              </Section>
              <Section heading="What we have done">
                <ul className={LIST}>
                  <li>Semantic HTML with headings, landmarks and a “Skip to criteria” link.</li>
                  <li>Everything works with a keyboard, with a clearly visible focus indicator.</li>
                  <li>Text and controls meet the AA contrast requirements.</li>
                  <li>Animations respect the “reduce motion” setting.</li>
                  <li>The number of filtered results is announced to screen readers.</li>
                  <li>Pass examples with media come with captions, transcripts or audio description.</li>
                </ul>
              </Section>
              <Section heading="How we checked">
                <p>
                  The lab has been self-assessed with keyboard testing and browser accessibility tools. It has not been
                  independently audited.
                </p>
              </Section>
            </InfoDialog>
          </li>
        </ul>
      </div>
    </footer>
  )
}
