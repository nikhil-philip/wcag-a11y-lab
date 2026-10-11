/**
 * Principle: Operable. Level A and AA success criteria.
 */

import { defineCriterion, type CriterionData } from '../wcag-schema'

/* ------------------------------------------------------------------ */
/* 2.1.1 Keyboard                                                      */
/* ------------------------------------------------------------------ */

const keyboard = defineCriterion({
  id: '2.1.1',
  name: 'Keyboard',
  version: '2.0',
  level: 'A',
  principle: 'Operable',
  risk: 'Critical',
  description:
    'All functionality is operable through a keyboard interface without requiring specific timings for individual keystrokes.',
  failExample: {
    codeSnippet: `// A "button" that only responds to the mouse
function AddToCart() {
  return (
    <div className="btn" onClick={() => addItem()}>
      Add to cart
    </div>
  )
}

// Hover-only menu: keyboard users can never open it
<li onMouseEnter={openMenu} onMouseLeave={closeMenu}>
  Products
  {isOpen && <SubMenu />}
</li>`,
    explanation:
      "A <div> isn't in the tab order, so keyboard users can't reach it, and Enter and Space do nothing even when it has focus. The hover-only menu only opens on mouse events, so anyone navigating by keyboard, switch device or voice control can't reach its items.",
    interactiveType: 'keyboard',
  },
  passExample: {
    codeSnippet: `// Native <button>: focusable, Enter + Space work for free
function AddToCart() {
  return (
    <button type="button" className="btn" onClick={() => addItem()}>
      Add to cart
    </button>
  )
}

// Disclosure menu driven by a real button
<li>
  <button
    type="button"
    aria-expanded={isOpen}
    aria-controls="products-menu"
    onClick={() => setIsOpen(o => !o)}
  >
    Products
  </button>
  {isOpen && <SubMenu id="products-menu" />}
</li>`,
    explanation:
      'A native <button> is in the tab order and responds to Enter and Space, with no extra code. The menu opens from a real button, so it works with the keyboard, touch and a mouse. aria-expanded tells screen-reader users whether it is open.',
    interactiveType: 'keyboard',
  },
  testingSteps: [
    'Unplug or ignore the mouse; start at the browser address bar.',
    'Press Tab / Shift+Tab through the page and confirm every interactive element is reachable.',
    'Activate each control with Enter and/or Space (and arrow keys for composite widgets like tabs, menus, sliders).',
    'Confirm hover-only content (menus, tooltips) can also be opened and dismissed by keyboard.',
    'Check there are no keyboard traps: focus can always move away from any component (also see 2.1.2).',
  ],
  impactedUsers: [
    'Blind screen-reader users',
    'Users with motor impairments who cannot use a mouse',
    'Switch-device and sip-and-puff users',
    'Voice-control users (commands are mapped to keyboard events)',
    'Power users who prefer the keyboard',
  ],
})

/* ------------------------------------------------------------------ */
/* 2.4.7 Focus Visible                                                 */
/* ------------------------------------------------------------------ */

const focusVisible = defineCriterion({
  id: '2.4.7',
  name: 'Focus Visible',
  version: '2.0',
  level: 'AA',
  principle: 'Operable',
  risk: 'Critical',
  description:
    'Any keyboard-operable user interface has a mode of operation where the keyboard focus indicator is visible.',
  failExample: {
    codeSnippet: `/* "Clean up" the default focus ring globally */
*:focus {
  outline: none;
}

/* Or the Tailwind equivalent on every control */
<button class="rounded bg-blue-600 px-4 py-2 text-white outline-none">
  Save
</button>`,
    explanation:
      "Removing the outline, with nothing to replace it, hides where keyboard focus is. A sighted keyboard user pressing Tab has to guess which element is active, which is like using a mouse with an invisible cursor.",
    interactiveType: 'focus',
  },
  passExample: {
    codeSnippet: `/* Keep a strong, high-contrast indicator for keyboard users */
:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}

/* Tailwind: only style keyboard focus, never remove it */
<button
  class="rounded bg-blue-700 px-4 py-2 text-white
         focus-visible:outline-3
         focus-visible:outline-offset-2
         focus-visible:outline-blue-700"
>
  Save
</button>`,
    explanation:
      ':focus-visible lets the browser show the indicator when focus comes from the keyboard and hide it after mouse clicks. That meets the design goal without hurting accessibility. The 3px blue-700 outline has more than 3:1 contrast against the page, and the offset keeps it clear of the button. An outline also survives Windows High Contrast mode, which removes box-shadow "rings".',
    interactiveType: 'focus',
  },
  testingSteps: [
    'Tab through every interactive element on the page.',
    'Confirm a visible indicator appears on each one and that you can always tell where focus is.',
    'Search stylesheets for "outline: none" / "outline: 0" / "outline-none" and confirm a replacement style exists.',
    'Check the indicator is visible against every background it can appear on (light, dark, image).',
    'Check focus is not hidden behind sticky headers, cookie banners or overlays (see also 2.4.11 in WCAG 2.2).',
  ],
  impactedUsers: [
    'Sighted keyboard-only users',
    'Users with motor impairments',
    'Users with attention or memory limitations who lose their place',
    'Switch-device users',
  ],
})

/* ------------------------------------------------------------------ */
/* 2.1.2 No Keyboard Trap                                              */
/* ------------------------------------------------------------------ */

const noKeyboardTrap = defineCriterion({
  id: '2.1.2',
  name: 'No Keyboard Trap',
  version: '2.0',
  level: 'A',
  principle: 'Operable',
  risk: 'Critical',
  description:
    'If keyboard focus can move into a component, it can also move away using only the keyboard. If that needs more than the standard keys (Tab, Shift+Tab, arrows, Esc), users are told how.',
  failExample: {
    codeSnippet: `// Code editor that turns Tab into indentation
function CodeEditor() {
  function onKeyDown(e) {
    if (e.key === 'Tab') {
      e.preventDefault() // focus can never leave
      const el = e.currentTarget
      el.setRangeText('  ', el.selectionStart, el.selectionEnd, 'end')
    }
  }

  return (
    <>
      <label htmlFor="code">Code editor</label>
      <textarea id="code" onKeyDown={onKeyDown} />
      <button type="button">Run code</button>
    </>
  )
}`,
    explanation:
      'Tab and Shift+Tab insert indentation instead of moving focus, and nothing tells the user another way out. A keyboard user who enters the editor can never reach "Run code" or anything else on the page, and has to reload it, losing their work. A failure here blocks the rest of the page, which is why WCAG treats it as a "non-interference" criterion.',
    interactiveType: 'keyboard-trap',
  },
  passExample: {
    codeSnippet: `// A standard textarea: Tab and Shift+Tab move focus as usual
function CodeEditor() {
  return (
    <>
      <label htmlFor="code">Code editor</label>
      <textarea id="code" spellCheck={false} />
      <button type="button">Run code</button>
    </>
  )
}

// If Tab must indent, give a documented way out, e.g.
// <p id="code-help">Press Esc, then Tab, to leave the editor.</p>
// <textarea id="code" aria-describedby="code-help" ... />`,
    explanation:
      'The browser handles Tab normally, so focus moves on to "Run code" and Shift+Tab moves back. Editors that do need Tab for indentation can still pass, but only if they offer another way out (such as Esc, then Tab) and tell users about it before they enter.',
    interactiveType: 'keyboard-trap',
  },
  testingSteps: [
    'Tab through the whole page, including embedded widgets (video players, maps, editors, iframes).',
    'Confirm you can always Tab forward and Shift+Tab back out of every component.',
    'Open each dialog and confirm Esc and a Close button both work.',
    'If a component needs non-standard keys to exit, check the instructions are shown before you enter it.',
  ],
  impactedUsers: [
    'Keyboard-only users',
    'Blind screen-reader users',
    'Switch-device users',
    'Voice-control users',
  ],
})

/* ------------------------------------------------------------------ */
/* 2.1.4 Character Key Shortcuts                                       */
/* ------------------------------------------------------------------ */

const characterKeyShortcuts = defineCriterion({
  id: '2.1.4',
  name: 'Character Key Shortcuts',
  version: '2.1',
  level: 'A',
  principle: 'Operable',
  risk: 'Medium',
  description:
    'If a keyboard shortcut uses only letters, numbers, punctuation or symbols, users can turn it off, remap it to include a modifier key (Ctrl, Alt), or it only works while the relevant component has focus.',
  failExample: {
    codeSnippet: `// "m" toggles mute anywhere on the page, even while typing
document.addEventListener('keydown', (e) => {
  if (e.key.toLowerCase() === 'm') {
    e.preventDefault() // the typed "m" is swallowed
    toggleMute()
  }
})

<label htmlFor="feedback">Feedback</label>
<textarea id="feedback" />`,
    explanation:
      'Keystrokes in the textarea bubble up to the document listener, which never checks where they came from. Typing "my message" toggles mute twice and leaves "y essage" in the box. Speech-input users dictating text, and keyboard users with tremors, trigger it constantly, and it cannot be turned off.',
    interactiveType: 'character-shortcuts',
  },
  passExample: {
    codeSnippet: `document.addEventListener('keydown', (e) => {
  // Needs modifiers. e.code, because Option+Shift+M reports "Â" on macOS;
  // no Ctrl, because AltGr reports as Ctrl+Alt on Windows.
  if (e.altKey && e.shiftKey && !e.ctrlKey && !e.metaKey && e.code === 'KeyM') {
    e.preventDefault()
    toggleMute()
  }
})

<button type="button" aria-pressed={muted} aria-keyshortcuts="Alt+Shift+M"
        onClick={toggleMute}>
  Mute
</button>`,
    explanation:
      'The shortcut needs Alt and Shift, so typing or dictating "m" in the feedback box just types the letter. Alt + Shift + M still works anywhere, including while typing, and aria-keyshortcuts tells assistive tech about it. A settings option to turn single-key shortcuts on or off would also pass.',
    interactiveType: 'character-shortcuts',
  },
  testingSteps: [
    'Find single-character shortcuts: check the help page, any "?" shortcut list, and keydown handlers in the code.',
    'With focus on the page (not in a field), press letters, numbers and symbols and watch for actions.',
    'For each shortcut, check it can be turned off, remapped to include a modifier, or only works when its component has focus.',
    'Try dictating text with speech input and check nothing is triggered.',
  ],
  impactedUsers: [
    'Speech-input users',
    'Keyboard users with tremors or other motor impairments',
    'Users who often mistype',
    'Screen-reader users whose own single-key commands can clash',
  ],
})

/* ------------------------------------------------------------------ */
/* 2.2.1 Timing Adjustable                                             */
/* ------------------------------------------------------------------ */

const timingAdjustable = defineCriterion({
  id: '2.2.1',
  name: 'Timing Adjustable',
  version: '2.0',
  level: 'A',
  principle: 'Operable',
  risk: 'High',
  description:
    'For each time limit, users can turn it off, adjust it (to at least 10× the default), or extend it: they are warned first and get at least 20 seconds to extend it with a simple action, at least 10 times. Real-time events, essential limits and limits over 20 hours are exempt.',
  failExample: {
    codeSnippet: `// The session ends at the deadline, with no warning first
useEffect(() => {
  if (session.status !== 'active') return
  const timer = setInterval(() => {
    if (Date.now() >= session.expiresAt) {
      setSession({ status: 'expired' }) // logged out; the draft is gone
    }
  }, 250)
  return () => clearInterval(timer)
}, [session])`,
    explanation:
      'The user is logged out mid-sentence with no warning and no way to ask for more time, and their unsent message is lost. Users who type slowly, use a screen reader, need breaks, or take longer to read and understand are hit hardest.',
    interactiveType: 'timing',
  },
  passExample: {
    codeSnippet: `const remainingMs = session.expiresAt - now
const warning = remainingMs <= WARN_AT_MS // at least 20 s on a real site

// Keep a native modal dialog in step with the warning
useEffect(() => {
  const dialog = dialogRef.current
  if (warning && !dialog.open) dialog.showModal() // focus moves into it
  if (!warning && dialog.open) dialog.close()     // focus goes back
}, [warning])

function keepLoggedIn() {
  setSession({ status: 'active', expiresAt: Date.now() + SESSION_MS })
}

<dialog ref={dialogRef} role="alertdialog"
        aria-labelledby="warn-title" aria-describedby="warn-desc"
        onCancel={e => { e.preventDefault(); keepLoggedIn() }}>
  <h2 id="warn-title">Your session is about to expire.</h2>
  <p id="warn-desc">You will be logged out in {seconds} seconds.</p>
  <button type="button" onClick={keepLoggedIn}>Keep me logged in</button>
</dialog>`,
    explanation:
      'Before the time runs out, a modal alert dialog takes focus and is announced, and one button (or Esc) resets the timer. The user can extend as many times as needed. WCAG requires at least 20 seconds to respond and at least 10 extensions; the demo shortens the times so you can see it happen. Better still, let users turn the limit off, or save their draft.',
    interactiveType: 'timing',
  },
  testingSteps: [
    'Find every time limit: session timeouts, timed quizzes, reservation holds, auto-advancing steps.',
    'Let each one run out and check a warning appears with at least 20 seconds to respond.',
    'Check the limit can be extended with a simple action (at least 10 times), or turned off or adjusted.',
    'Check the warning is announced by screen readers and its button is keyboard-reachable.',
    'Check any exemptions: real-time events (e.g. auctions), essential limits, or limits over 20 hours.',
  ],
  impactedUsers: [
    'Users with motor impairments who type slowly',
    'Users with cognitive or learning disabilities',
    'Blind and low-vision users, who often navigate more slowly',
    'Anyone who gets interrupted',
  ],
})

/* ------------------------------------------------------------------ */
/* 2.2.2 Pause, Stop, Hide                                             */
/* ------------------------------------------------------------------ */

const pauseStopHide = defineCriterion({
  id: '2.2.2',
  name: 'Pause, Stop, Hide',
  version: '2.0',
  level: 'A',
  principle: 'Operable',
  risk: 'High',
  description:
    'Moving, blinking or scrolling content that starts automatically, lasts more than 5 seconds and appears alongside other content can be paused, stopped or hidden. Auto-updating content can be paused, stopped, hidden, or have its update rate controlled.',
  failExample: {
    codeSnippet: `// Breaking-news ticker that rotates forever, with no controls
function NewsTicker({ headlines }) {
  const [i, setI] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % headlines.length), 3500)
    return () => clearInterval(t)
  }, [headlines.length])

  return (
    <section aria-labelledby="news-label">
      <h2 id="news-label">Breaking news</h2>
      <p>{headlines[i]}</p>
    </section>
  )
}`,
    explanation:
      'The headline changes every 3.5 seconds for as long as the page is open, and nothing stops it. Slower readers lose each headline mid-sentence, and the constant movement keeps pulling attention away from the rest of the page. That is especially hard for users with ADHD or other attention or cognitive disabilities.',
    interactiveType: 'pause-stop-hide',
  },
  passExample: {
    codeSnippet: `function NewsTicker({ headlines }) {
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches
  const [i, setI] = useState(0)
  const [playing, setPlaying] = useState(!reduceMotion)

  // Pausing (or unmounting) runs the cleanup, which clears the interval
  useEffect(() => {
    if (!playing) return
    const t = setInterval(() => setI((n) => (n + 1) % headlines.length), 3500)
    return () => clearInterval(t)
  }, [playing, headlines.length])

  return (
    <section aria-labelledby="news-label">
      <h2 id="news-label">Breaking news</h2>
      <button type="button" onClick={() => setPlaying((p) => !p)}>
        {playing ? 'Pause' : 'Play'}
        <span className="sr-only"> headlines</span>
      </button>
      <p>{headlines[i]}</p>
    </section>
  )
}`,
    explanation:
      'A native button next to the ticker pauses it from the keyboard or pointer, and its label switches between Pause and Play so it always says what it will do. Because playing is effect state, pausing clears the interval rather than just hiding the change. The ticker starts paused for users who have asked their system to reduce motion. There is no live region, so screen-reader users are not interrupted by each new headline.',
    interactiveType: 'pause-stop-hide',
  },
  testingSteps: [
    'Find content that moves or updates by itself: carousels, marquees, animated banners, live feeds, tickers, looping videos and GIFs.',
    'If it lasts more than 5 seconds, check for a pause, stop or hide control.',
    'Check the control is keyboard accessible and placed near the content.',
    'For auto-updating content, check updates can be paused or their frequency changed.',
  ],
  impactedUsers: [
    'Users with attention disorders such as ADHD',
    'Users with cognitive or learning disabilities',
    'Users with low vision, for whom text moves away before they can read it',
    'Screen-reader users',
  ],
})

/* ------------------------------------------------------------------ */
/* 2.3.1 Three Flashes or Below Threshold                              */
/* ------------------------------------------------------------------ */

const threeFlashes = defineCriterion({
  id: '2.3.1',
  name: 'Three Flashes or Below Threshold',
  version: '2.0',
  level: 'A',
  principle: 'Operable',
  risk: 'Critical',
  description:
    'Nothing on the page flashes more than three times in any one-second period, unless the flashing is below the general flash and red flash thresholds.',
  failExample: {
    codeSnippet: `// Storyboard of one second of the video, at 15 frames per second
const frames = [
  'white', 'red', 'white', 'red', 'white', 'red', 'white', 'red',
  'white', 'red', 'white', 'red', 'white', 'red', 'white',
]

// A flash = a pair of opposite luminance changes (each >= 0.1,
// darker frame below 0.8). 14 changes -> 7 flashes in 1 second.
countFlashes(frames) // 7: exceeds the limit of 3`,
    explanation:
      'The strip shows every frame of one second of video as still squares, so it can be checked without playing it. The picture swaps between bright white and saturated dark red on every frame, which is 7 flashes in a second, more than twice the limit of 3. At full size this could trigger a seizure in someone with photosensitive epilepsy, before they could look away. That is why the lab shows a storyboard and never plays it.',
    interactiveType: 'flashing',
  },
  passExample: {
    codeSnippet: `// Two flashes, then the picture holds steady
const frames = [
  'white', 'red', 'white', 'red',
  'white', 'white', 'white', 'white', 'white', 'white',
  'white', 'white', 'white', 'white', 'white',
]

countFlashes(frames) // 2: no more than 3 in any one-second period

// Better still, signal urgency without flashing at all
.alert-banner { background: #fef2f2; border-left: 6px solid #b91c1c; }`,
    explanation:
      'The same second of video with only 2 flashes, then a steady picture, so it stays within the limit of 3 per second. It is also below the red-flash limit, which counts saturated red separately. Flashing that covers less than about a quarter of a 341 × 256 px area at normal viewing distance is also below the threshold. The safest choice is no flashing at all.',
    interactiveType: 'flashing',
  },
  testingSteps: [
    'Find anything that flashes: animations, videos, GIFs, canvas or WebGL effects.',
    'Count flashes per second (step through video frame by frame if needed).',
    'If there are more than 3 per second, check the flashing area is small enough to be under the thresholds (about a quarter of a 341×256px area at typical viewing distance).',
    'Pay special attention to saturated red flashes.',
    'Use an analysis tool such as PEAT (Photosensitive Epilepsy Analysis Tool) for video.',
  ],
  impactedUsers: [
    'Users with photosensitive epilepsy',
    'Users prone to migraines',
    'Users with vestibular or sensory processing disorders',
  ],
})

/* ------------------------------------------------------------------ */
/* 2.4.1 Bypass Blocks                                                 */
/* ------------------------------------------------------------------ */

const bypassBlocks = defineCriterion({
  id: '2.4.1',
  name: 'Bypass Blocks',
  version: '2.0',
  level: 'A',
  principle: 'Operable',
  risk: 'Medium',
  description:
    'There is a way to skip blocks of content that repeat across pages, such as the header and navigation: a skip link, landmarks or headings.',
  failExample: {
    codeSnippet: `<body>
  <div class="header">
    ...logo, search and 40 navigation links...
  </div>
  <div class="content">
    <div class="title">Article title</div>
    ...
  </div>
</body>`,
    explanation:
      'There is no skip link, no landmarks and no real headings. A keyboard user has to Tab through all 40+ links on every page before reaching the content.',
    interactiveType: 'bypass-blocks',
  },
  passExample: {
    codeSnippet: `<body>
  <a href="#main" class="skip-link">Skip to main content</a>
  <header>
    <nav aria-label="Main">...40 navigation links...</nav>
  </header>
  <main id="main" tabindex="-1">
    <h1>Article title</h1>
    ...
  </main>
</body>`,
    explanation:
      'A skip link, visible when focused, jumps straight to the content. The header, nav and main landmarks and a real <h1> let screen-reader users jump there too. This lab has its own "Skip to criteria" link: press Tab when the page loads to see it.',
    interactiveType: 'bypass-blocks',
  },
  testingSteps: [
    'Load the page and press Tab once: a skip link should appear.',
    'Activate it and press Tab again: focus should continue from the main content, not the top of the page.',
    'Check the page has landmarks (header, nav, main, footer) using a screen reader or a landmarks extension.',
    'Check the main content starts with a heading.',
  ],
  impactedUsers: [
    'Keyboard-only users',
    'Blind screen-reader users',
    'Switch-device users, for whom every step takes effort',
    'Users with low vision using screen magnification',
  ],
})

/* ------------------------------------------------------------------ */
/* 2.4.2 Page Titled                                                   */
/* ------------------------------------------------------------------ */

const pageTitled = defineCriterion({
  id: '2.4.2',
  name: 'Page Titled',
  version: '2.0',
  level: 'A',
  principle: 'Operable',
  risk: 'Low',
  description: 'Each page has a title that describes its topic or purpose.',
  failExample: {
    codeSnippet: `<!-- index.html, never changed from the build tool's default -->
<title>React App</title>

// Single-page app: views change, the title never does
function CheckoutPage() {
  return <h1>Checkout</h1>
}`,
    explanation:
      'The page is clearly a checkout, but the tab, history, bookmarks and the screen reader all say "React App", on every page. With two tabs from the same site open, users cannot tell them apart. Screen-reader users hear the title first when switching tabs, so they have to explore the page to find out where they are.',
    interactiveType: 'page-title',
  },
  passExample: {
    codeSnippet: `// React 19: a <title> rendered anywhere is moved into <head>
function CheckoutPage() {
  return (
    <>
      <title>Checkout - SuperStore</title>
      <h1>Checkout</h1>
    </>
  )
}

function SettingsPage() {
  return (
    <>
      <title>Account settings - SuperStore</title>
      <h1>Account settings</h1>
    </>
  )
}`,
    explanation:
      'Every view sets its own title, and it changes on every in-app navigation. The page name comes first and the site name second, so the useful part survives when the tab is narrow. Each tab from the same site can now be told apart.',
    interactiveType: 'page-title',
  },
  testingSteps: [
    'Check the <title> of each page or view.',
    'Check it is unique and describes the page, with the most specific information first.',
    'In single-page apps, move between views and check the title updates each time.',
    'Good practice: check form error states add a prefix such as "Error:".',
  ],
  impactedUsers: [
    'Blind screen-reader users (the title is announced first)',
    'Users who keep many tabs open',
    'Users with cognitive or memory disabilities',
    'Users with low vision who rely on tab titles to find their place',
  ],
})

/* ------------------------------------------------------------------ */
/* 2.4.3 Focus Order                                                   */
/* ------------------------------------------------------------------ */

const focusOrder = defineCriterion({
  id: '2.4.3',
  name: 'Focus Order',
  version: '2.0',
  level: 'A',
  principle: 'Operable',
  risk: 'High',
  description:
    'When the order of keyboard focus affects meaning or operation, focusable elements receive focus in an order that keeps their meaning and lets them be used.',
  failExample: {
    codeSnippet: `<!-- Source order: Pro, Enterprise, Basic -->
<ul class="plans">
  <li class="order-2">
    <h3>Pro</h3>
    <p>₹499</p>
    <button type="button">Select Pro</button>
  </li>
  <li class="order-3">
    <h3>Enterprise</h3>
    <p>Custom</p>
    <button type="button">Select Enterprise</button>
  </li>
  <li class="order-1">
    <h3>Basic</h3>
    <p>₹0</p>
    <button type="button">Select Basic</button>
  </li>
</ul>
<!-- CSS order shows Basic, Pro, Enterprise; Tab still follows the source -->`,
    explanation:
      "CSS order rearranges what you see, but keyboard focus follows the DOM. Tabbing goes to Pro in the middle, then Enterprise on the right, then jumps back to Basic on the left. Keyboard users and people using magnifiers, whose view follows focus, lose track of where they are. Positive tabindex values scramble focus in the same way.",
    interactiveType: 'focus-order',
  },
  passExample: {
    codeSnippet: `<!-- Source order matches the visual order: no CSS order, no positive tabindex -->
<ul class="plans">
  <li>
    <h3>Basic</h3>
    <p>₹0</p>
    <button type="button">Select Basic</button>
  </li>
  <li>
    <h3>Pro</h3>
    <p>₹499</p>
    <button type="button">Select Pro</button>
  </li>
  <li>
    <h3>Enterprise</h3>
    <p>Custom</p>
    <button type="button">Select Enterprise</button>
  </li>
</ul>`,
    explanation:
      "The plans are in the source in the order they appear, so Tab moves Basic → Pro → Enterprise, left to right, and screen readers read them in the same order. To change the layout, change the source order instead of using CSS order, row-reverse or positive tabindex.",
    interactiveType: 'focus-order',
  },
  testingSteps: [
    'Tab through the whole page and check focus moves in a logical order that matches the visual layout.',
    'Search the code for tabindex values greater than 0.',
    'Open dialogs, menus and disclosures: focus should move into them, then back to the trigger when closed.',
    'Check focus never lands on hidden or off-screen content.',
  ],
  impactedUsers: [
    'Keyboard-only users',
    'Blind screen-reader users',
    'Switch-device users',
    'Users with low vision whose magnified view follows focus',
    'Users with cognitive disabilities',
  ],
})

/* ------------------------------------------------------------------ */
/* 2.4.4 Link Purpose (In Context)                                     */
/* ------------------------------------------------------------------ */

const linkPurposeInContext = defineCriterion({
  id: '2.4.4',
  name: 'Link Purpose (In Context)',
  version: '2.0',
  level: 'A',
  principle: 'Operable',
  risk: 'Medium',
  description:
    'The purpose of each link can be worked out from its text alone, or from its text together with its context in code: the same sentence, paragraph, list item or table cell, or the heading before it.',
  failExample: {
    codeSnippet: `<ul class="cards">
  <li class="card">
    <!-- Styled like a heading, but it's just a div -->
    <div class="card__title">What's new in WCAG 2.2</div>
    <p>21 Oct 2025</p>
    <a href="/blog/wcag-22">Read more</a>
  </li>
  <li class="card">
    <div class="card__title">Five myths about accessibility overlays</div>
    <p>3 Sep 2025</p>
    <a href="/blog/overlay-myths">Read more</a>
  </li>
  <!-- ...every card ends with the same "Read more" -->
</ul>`,
    explanation:
      'Every link is called "Read more", and the titles are plain <div>s, so nothing in the code connects a link to its article. In a screen reader\'s links list the user hears "Read more, Read more, Read more" with no way to tell them apart. Voice-control users saying "Click Read more" get a numbered list of identical choices.',
    interactiveType: 'link',
  },
  passExample: {
    codeSnippet: `<ul class="cards">
  <li class="card">
    <h3>What's new in WCAG 2.2</h3>
    <p>21 Oct 2025</p>
    <a href="/blog/wcag-22">
      Read more<span class="sr-only"> about What's new in WCAG 2.2</span>
    </a>
  </li>
  <li class="card">
    <h3>Five myths about accessibility overlays</h3>
    <p>3 Sep 2025</p>
    <a href="/blog/overlay-myths">
      Read more<span class="sr-only"> about Five myths about accessibility overlays</span>
    </a>
  </li>
</ul>`,
    explanation:
      'Each title is a real heading, which on its own gives the link enough context at Level A. The visually hidden text also makes each link\'s name unique ("Read more about What\'s new in WCAG 2.2"), so it makes sense in a links list. The name still starts with the visible "Read more", so "Click Read more" keeps working for voice users (2.5.3). Prefer this to an aria-label that replaces the visible words.',
    interactiveType: 'link',
  },
  testingSteps: [
    "Open the screen reader's links list, which shows links without their context.",
    'For each link, check its purpose is clear from its text, or from its sentence, paragraph, list item, table cell or preceding heading.',
    'Check image and icon links have accessible names.',
    'Check links with the same text go to the same place, or are told apart by their context.',
  ],
  impactedUsers: [
    'Screen-reader users browsing a links list',
    'Users with cognitive disabilities',
    'Voice-control users ("click Download" is ambiguous)',
    'Users with motor impairments who want to avoid following the wrong link',
  ],
})

/* ------------------------------------------------------------------ */
/* 2.4.5 Multiple Ways                                                 */
/* ------------------------------------------------------------------ */

const multipleWays = defineCriterion({
  id: '2.4.5',
  name: 'Multiple Ways',
  version: '2.0',
  level: 'AA',
  principle: 'Operable',
  risk: 'Low',
  description:
    'There is more than one way to find a page within a site (e.g. navigation, search, a site map), except for pages that are a step in a process.',
  failExample: {
    codeSnippet: `<header>
  <nav aria-label="Main">
    <a href="/">Home</a>
    <a href="/products">Products</a>
    <a href="/services">Services</a>
    <a href="/company">Company</a> <!-- Contact Us is inside here -->
  </nav>
</header>

<footer>© 2026 Brightline</footer>
<!-- No search, no sitemap -->`,
    explanation:
      'The only way to reach "Contact Us" is to guess that it lives under "Company" and click through. Users who think of it as help or support, find menus hard to scan, or navigate slowly with a screen reader or magnifier have no other route.',
    interactiveType: 'navigation',
  },
  passExample: {
    codeSnippet: `<header>
  <nav aria-label="Main">...</nav>
  <form role="search" action="/search">
    <label for="q" class="sr-only">Search site</label>
    <input id="q" name="q" type="search" placeholder="Search site">
    <button type="submit">Search</button>
  </form>
</header>

<footer>
  © 2026 Brightline
  <a href="/sitemap">Sitemap</a>
</footer>`,
    explanation:
      'The same menu, plus a site search that matches words like "phone" and "email", and a sitemap in the footer that lists every page. That gives three independent ways to find any page, so users can pick the one that suits them. Pages that are steps in a process, like checkout, are exempt.',
    interactiveType: 'navigation',
  },
  testingSteps: [
    'Pick several pages that are not steps in a process.',
    'Confirm each can be reached in at least two ways: navigation, search, site map, table of contents, or links from related pages.',
    'Check the search covers all the content.',
    'Check the site map is up to date.',
  ],
  impactedUsers: [
    'Users with cognitive disabilities (some prefer search, others browsing)',
    'Screen-reader users, for whom search is often faster than menus',
    'Users with low vision using magnification',
    'Users with motor impairments',
  ],
})

/* ------------------------------------------------------------------ */
/* 2.4.6 Headings and Labels                                           */
/* ------------------------------------------------------------------ */

const headingsAndLabels = defineCriterion({
  id: '2.4.6',
  name: 'Headings and Labels',
  version: '2.0',
  level: 'AA',
  principle: 'Operable',
  risk: 'Medium',
  description:
    'Headings and labels describe their topic or purpose. (1.3.1 requires them to exist in code; this criterion requires them to be meaningful.)',
  failExample: {
    codeSnippet: `<form>
  <h2>Section 1</h2>
  <label for="f1">Text 1</label>
  <input id="f1" type="email" value="asha@example.com">
  <label for="f2">Value</label>
  <select id="f2">...</select>

  <h2>Section 2</h2>
  <label><input type="checkbox" checked> Option</label>
  <label for="f3">Number</label>
  <input id="f3" type="number">
</form>`,
    explanation:
      'The markup is correct: real headings and properly associated labels, so 1.3.1 is met. But "Section 1", "Text 1", "Value", "Option" and "Number" say nothing about what the fields are for. Screen-reader users jumping by heading or field hear only these words, and sighted users have to guess from the values already in the fields.',
    interactiveType: 'headings-labels',
  },
  passExample: {
    codeSnippet: `<form>
  <h2>Account preferences</h2>
  <label for="email">Email address</label>
  <input id="email" type="email" autocomplete="email">
  <label for="lang">Preferred language</label>
  <select id="lang">...</select>

  <h2>Notifications</h2>
  <label><input type="checkbox" checked> Email me when an order ships</label>
  <label for="digest">Summary emails per week (0–7)</label>
  <input id="digest" type="number" min="0" max="7">
</form>`,
    explanation:
      'The same markup with meaningful words. The headings name their topics, so the headings list works as a table of contents, and each label says exactly what to enter, including the allowed range. Every label makes sense heard on its own.',
    interactiveType: 'headings-labels',
  },
  testingSteps: [
    'List the headings (screen reader headings list, or an extension like HeadingsMap) and read them on their own: do they describe each section?',
    'Check every form label and button label describes its purpose without relying on the layout around it.',
    'Check labels include any required format.',
    'Check headings and labels are not repeated in confusing ways.',
  ],
  impactedUsers: [
    'Blind screen-reader users',
    'Users with cognitive disabilities',
    'Users with low vision using magnification',
    'Anyone scanning a page quickly',
  ],
})

/* ------------------------------------------------------------------ */
/* 2.4.11 Focus Not Obscured (Minimum)                                 */
/* ------------------------------------------------------------------ */

const focusNotObscuredMinimum = defineCriterion({
  id: '2.4.11',
  name: 'Focus Not Obscured (Minimum)',
  version: '2.2',
  level: 'AA',
  principle: 'Operable',
  risk: 'Medium',
  description:
    'When an element receives keyboard focus, it is not entirely hidden by content the author created, such as sticky headers and footers, cookie banners or chat widgets.',
  failExample: {
    codeSnippet: `/* Sticky header covers anything scrolled beneath it */
.site-header {
  position: sticky;
  top: 0;
  height: 96px;
  z-index: 10;
}

/* Cookie banner fixed over the bottom of the page */
.cookie-banner {
  position: fixed;
  bottom: 0;
  inset-inline: 0;
}`,
    explanation:
      "When a keyboard user Tabs to a link that scrolls under the sticky header or behind the cookie banner, the focused element is completely hidden, so they can't see where they are.",
    interactiveType: 'focus-obscured',
  },
  passExample: {
    codeSnippet: `.site-header {
  position: sticky;
  top: 0;
  height: 96px;
  z-index: 10;
}

/* Keep focused elements clear of the header and banner */
html {
  scroll-padding-top: 104px;
  scroll-padding-bottom: 120px;
}

/* And let users dismiss the cookie banner */`,
    explanation:
      'scroll-padding tells the browser to keep focused elements clear of the sticky header and the bottom banner when it scrolls them into view. At AA, focus only fails if it is entirely hidden. 2.4.12 (AAA) requires no part of it to be hidden.',
    interactiveType: 'focus-obscured',
  },
  testingSteps: [
    'Tab through the whole page, including after scrolling down.',
    'Watch for focused elements hidden under sticky headers or footers, cookie banners and chat widgets.',
    'Repeat at 200% zoom and narrow widths, where sticky elements take up more of the screen.',
    'Check banners and pop-ups can be dismissed.',
    'Content the user opened themselves (e.g. an expanded menu they can close with Esc) is acceptable.',
  ],
  impactedUsers: [
    'Sighted keyboard users',
    'Users with low vision using magnification',
    'Switch-device users',
    'Voice-control users',
  ],
})

/* ------------------------------------------------------------------ */
/* 2.5.1 Pointer Gestures                                              */
/* ------------------------------------------------------------------ */

const pointerGestures = defineCriterion({
  id: '2.5.1',
  name: 'Pointer Gestures',
  version: '2.1',
  level: 'A',
  principle: 'Operable',
  risk: 'High',
  description:
    'Anything done with multi-finger gestures (pinch, two-finger swipe) or path-based gestures (swiping, drawing a shape) can also be done with a single tap or click, unless the gesture is essential.',
  failExample: {
    codeSnippet: `<p>Swipe left to delete</p>
<ul>
  {messages.map(m => (
    // The only way to delete is a path-based drag
    <li key={m.id} onPointerDown={startSwipe} onPointerMove={trackSwipe}
        onPointerUp={e => swipedFarEnough(e) && remove(m)}>
      {m.from}: {m.subject}
    </li>
  ))}
</ul>`,
    explanation:
      'Deleting needs a drag along a path. Users with a head pointer, mouth stick, eye tracker or switch, or who have tremors or only one hand free, cannot perform it, and the "Swipe left to delete" hint is plain text, not a control. Keyboard users cannot delete at all (see also 2.1.1).',
    interactiveType: 'pointer-gestures',
  },
  passExample: {
    codeSnippet: `<ul>
  {messages.map(m => (
    <li key={m.id} onPointerDown={startSwipe} onPointerMove={trackSwipe}
        onPointerUp={e => swipedFarEnough(e) && remove(m)}>
      {m.from}: {m.subject}
      {/* Same action, one tap or click */}
      <button type="button" onClick={() => remove(m)}>
        Delete<span className="sr-only"> message from {m.from}</span>
      </button>
    </li>
  ))}
</ul>`,
    explanation:
      'The swipe stays as a shortcut, but a visible Delete button does the same thing with a single tap, click or key press. After a delete, focus moves to the next Delete button so keyboard users are not dropped back at the top of the page. Gestures that are essential, such as drawing a signature, are exempt.',
    interactiveType: 'pointer-gestures',
  },
  testingSteps: [
    'Find gesture interactions: pinch-zoom, swipe, two-finger rotate, drawing a path.',
    'For each, find a single tap or click alternative, such as buttons.',
    'Check the alternatives also work with the keyboard (2.1.1).',
    "The browser's own pinch-zoom is not in scope.",
  ],
  impactedUsers: [
    'Users with motor impairments',
    'Head-pointer, mouth-stick and eye-tracking users',
    'Users with only one hand free',
    'Users with tremors',
  ],
})

/* ------------------------------------------------------------------ */
/* 2.5.2 Pointer Cancellation                                          */
/* ------------------------------------------------------------------ */

const pointerCancellation = defineCriterion({
  id: '2.5.2',
  name: 'Pointer Cancellation',
  version: '2.1',
  level: 'A',
  principle: 'Operable',
  risk: 'Medium',
  description:
    'For single-pointer actions, the action does not fire on the down-event; or it fires on the up-event and can be aborted or undone; or releasing reverses it; or firing on press is essential.',
  failExample: {
    codeSnippet: `// The order is submitted the moment the button is pressed down
<button type="button" onPointerDown={submitOrder}>
  Submit order
</button>

// Same problem with mouse or touch events
<button type="button" onMouseDown={submitOrder}>Submit order</button>
<button type="button" onTouchStart={submitOrder}>Submit order</button>`,
    explanation:
      'A down-event fires before the user has finished the action. Someone who presses by accident, or presses the wrong button, cannot slide off before letting go to cancel: the order is already submitted. Users with tremors, low vision or limited dexterity mis-press most often.',
    interactiveType: 'pointer-cancellation',
  },
  passExample: {
    codeSnippet: `// click fires on release, and only if the press
// started and ended on the button
<button type="button" onClick={submitOrder}>
  Submit order
</button>`,
    explanation:
      'Pressing down does nothing yet. Releasing on the button submits the order, and dragging off before releasing cancels it, exactly as with native buttons. onClick also covers Enter and Space for keyboard users. Firing on press is only allowed where it is essential, such as keys on a virtual piano.',
    interactiveType: 'pointer-cancellation',
  },
  testingSteps: [
    'Press and hold each control, drag the pointer away, then release: nothing should happen.',
    'Search the code for mousedown, pointerdown and touchstart handlers that trigger actions.',
    'Where a down-event is used, check there is an undo, or that it is essential.',
    'For drag and drop, check that dropping outside a valid target cancels the move.',
  ],
  impactedUsers: [
    'Users with motor impairments or tremors',
    'Users with low vision who mis-tap',
    'Users with cognitive disabilities',
    'Older users',
  ],
})

/* ------------------------------------------------------------------ */
/* 2.5.3 Label in Name                                                 */
/* ------------------------------------------------------------------ */

const labelInName = defineCriterion({
  id: '2.5.3',
  name: 'Label in Name',
  version: '2.1',
  level: 'A',
  principle: 'Operable',
  risk: 'High',
  description:
    "For controls with a visible text label, the accessible name contains that visible text. It's best practice for the name to start with it.",
  failExample: {
    codeSnippet: `<!-- Visible "Search", accessible name "Find products" -->
<button aria-label="Find products">Search</button>

<!-- Visible "Send", replaced by a different aria-label -->
<button aria-label="Submit message">Send</button>`,
    explanation:
      'A voice-control user says "Click Search", but the button\'s name is "Find products", so nothing happens. Sighted screen-reader users hear a different name from the one they see.',
    interactiveType: 'label-in-name',
  },
  passExample: {
    codeSnippet: `<button>Search</button>

<!-- Extra context is fine if the visible text comes first -->
<button aria-label="Send message">Send</button>

<!-- Or add hidden context after the visible label -->
<button>Send <span class="sr-only">message to our team</span></button>`,
    explanation:
      'Each accessible name contains the visible words, at the start, so "Click Search" and "Click Send" work. The simplest fix is no aria-label at all: the visible text becomes the name.',
    interactiveType: 'label-in-name',
  },
  testingSteps: [
    "For each control with visible text, check its accessible name in DevTools' Accessibility pane.",
    'Check the name contains the visible text in the same word order, ideally at the start.',
    'Look for aria-label or aria-labelledby that replaces the visible text.',
    'Test with voice control (Voice Control on macOS/iOS, Voice Access on Windows/Android): say "Click" plus the visible label.',
  ],
  impactedUsers: [
    'Speech-input users',
    'Sighted screen-reader users',
    'Users with cognitive disabilities',
    'Users of text-to-speech tools',
  ],
})

/* ------------------------------------------------------------------ */
/* 2.5.4 Motion Actuation                                              */
/* ------------------------------------------------------------------ */

const motionActuation = defineCriterion({
  id: '2.5.4',
  name: 'Motion Actuation',
  version: '2.1',
  level: 'A',
  principle: 'Operable',
  risk: 'Medium',
  description:
    'Anything triggered by moving the device (shaking, tilting) or by gesturing at a camera can also be done with on-screen controls, and responding to motion can be turned off to prevent accidents, unless the motion is essential.',
  failExample: {
    codeSnippet: `// Shaking the device is the only way to clear the note,
// and it can't be turned off
window.addEventListener('devicemotion', (e) => {
  const a = e.accelerationIncludingGravity
  if (Math.hypot(a.x, a.y, a.z) > SHAKE_THRESHOLD) setNotes('')
})

<label htmlFor="notes">Notes</label>
<textarea id="notes" value={notes} onChange={...} />`,
    explanation:
      "A phone bumping in a bag, or a hand with a tremor, wipes the notes by accident, and there's no setting to stop it. Users whose device is mounted to a wheelchair, or who can't shake it, have no way to clear the note at all.",
    interactiveType: 'motion-actuation',
  },
  passExample: {
    codeSnippet: `const [shakeToUndo, setShakeToUndo] = useState(true)

useEffect(() => {
  if (!shakeToUndo) return // turned off: motion does nothing
  const onMotion = (e) => {
    const a = e.accelerationIncludingGravity
    if (Math.hypot(a.x, a.y, a.z) > SHAKE_THRESHOLD) setNotes('')
  }
  window.addEventListener('devicemotion', onMotion)
  return () => window.removeEventListener('devicemotion', onMotion)
}, [shakeToUndo])

<button type="button" onClick={() => setNotes('')}>Clear text</button>
<textarea id="notes" value={notes} onChange={...} />
<label>
  <input type="checkbox" checked={shakeToUndo}
         onChange={e => setShakeToUndo(e.target.checked)} />
  Shake to undo
</label>`,
    explanation:
      'A visible "Clear text" button does the same job without moving the device, and "Shake to undo" can be turned off. Unticking it removes the motion listener entirely, so accidental shakes do nothing.',
    interactiveType: 'motion-actuation',
  },
  testingSteps: [
    'Find features triggered by shaking, tilting or moving the device, or by gestures to a camera.',
    'Check each has an on-screen control that does the same thing.',
    'Check the motion response can be turned off.',
    'Test with the device resting on a table, not moving.',
  ],
  impactedUsers: [
    'Users with devices mounted on wheelchairs or stands',
    'Users with tremors or other motor impairments (accidental triggers)',
    'Users who cannot hold or move a device',
  ],
})

/* ------------------------------------------------------------------ */
/* 2.5.7 Dragging Movements                                            */
/* ------------------------------------------------------------------ */

const draggingMovements = defineCriterion({
  id: '2.5.7',
  name: 'Dragging Movements',
  version: '2.2',
  level: 'AA',
  principle: 'Operable',
  risk: 'High',
  description:
    'Anything done by dragging can also be done with a single pointer without dragging (e.g. clicks or taps), unless dragging is essential or the dragging is handled by the browser.',
  failExample: {
    codeSnippet: `// A card moves between columns only by press, hold and drag
<li
  onPointerDown={startDrag}
  onPointerMove={followPointer}
  onPointerUp={e => {
    const column = columnAt(e.clientX, e.clientY)
    if (column) moveTask(task, column)
  }}
>
  {task.title}
</li>`,
    explanation:
      "Moving a card needs the pointer held down while it travels to the other column. Users with tremors, head pointers, eye-gaze or switch access, and some touch users, can't hold and move at the same time, so they can never mark a task as done. Keyboard support (2.1.1) wouldn't help, because they use a pointer.",
    interactiveType: 'drag',
  },
  passExample: {
    codeSnippet: `<li onPointerDown={startDrag} onPointerMove={followPointer}
    onPointerUp={dropOnColumn}>
  {task.title}
  {/* Same result, one click or tap */}
  <button type="button" onClick={() => moveTask(task, other(task.column))}>
    Move to {title(other(task.column))}
    <span className="sr-only">: {task.title}</span>
  </button>
</li>`,
    explanation:
      'Dragging still works, but each card also has a "Move to Done" (or "Move to To Do") button that does the same with one click or tap. After the move, focus goes to the same card\'s button in its new column. With more columns, a "Move to…" menu does the same job.',
    interactiveType: 'drag',
  },
  testingSteps: [
    'Find dragging interactions: sortable lists, sliders, kanban boards, map panning, file drop zones, resizable panels.',
    'For each, check there is a single click or tap alternative (buttons, a "Move to" menu, click-to-place, a file picker).',
    'Check the alternative works with a mouse, not only with the keyboard.',
  ],
  impactedUsers: [
    'Users with motor impairments',
    'Users with tremors',
    'Head-pointer and eye-gaze users',
    'Touch users with limited dexterity',
  ],
})

/* ------------------------------------------------------------------ */
/* 2.5.8 Target Size (Minimum)                                         */
/* ------------------------------------------------------------------ */

const targetSizeMinimum = defineCriterion({
  id: '2.5.8',
  name: 'Target Size (Minimum)',
  version: '2.2',
  level: 'AA',
  principle: 'Operable',
  risk: 'Medium',
  description:
    "Pointer targets are at least 24×24 CSS pixels. Smaller targets pass if a 24px circle centred on each one doesn't overlap another target or its circle. Links inside sentences, unstyled browser controls, controls with a larger equivalent on the page, and essential sizes are exempt.",
  failExample: {
    codeSnippet: `{/* 16×16px icon buttons, 2px apart */}
<div className="flex gap-0.5">
  <button aria-label="Bold" className="size-4"><BoldIcon /></button>
  <button aria-label="Italic" className="size-4"><ItalicIcon /></button>
  <button aria-label="Underline" className="size-4"><UnderlineIcon /></button>
</div>`,
    explanation:
      "Each button is 16×16px and their centres are only 18px apart, so 24px circles centred on them overlap. Users with tremors or large fingers hit the wrong button. Turn on the test circles in the live preview to see the overlap.",
    interactiveType: 'target-size',
  },
  passExample: {
    codeSnippet: `{/* 24×24px targets, 8px apart */}
<div className="flex gap-2">
  <button aria-label="Bold" className="size-6"><BoldIcon /></button>
  <button aria-label="Italic" className="size-6"><ItalicIcon /></button>
  <button aria-label="Underline" className="size-6"><UnderlineIcon /></button>
</div>`,
    explanation:
      'Each target is at least 24×24px, with extra space between them. For touch screens, 44×44px (2.5.5, Level AAA) is better still.',
    interactiveType: 'target-size',
  },
  testingSteps: [
    'Measure interactive targets in DevTools (or with a bookmarklet that outlines them).',
    'For any target smaller than 24×24 CSS px, imagine a 24px circle centred on it: it must not overlap another target or its circle.',
    'Check the exceptions: links inside sentences, unstyled browser controls, a larger equivalent control on the page, essential sizes.',
    'Repeat at mobile widths.',
  ],
  impactedUsers: [
    'Users with motor impairments or tremors',
    'Touch-screen users with large fingers',
    'Users with low vision who find small targets hard to see',
    'Older users',
  ],
})

/* ------------------------------------------------------------------ */
/* Export                                                              */
/* ------------------------------------------------------------------ */

export const operableCriteria: readonly CriterionData[] = [
  keyboard,
  noKeyboardTrap,
  characterKeyShortcuts,
  timingAdjustable,
  pauseStopHide,
  threeFlashes,
  bypassBlocks,
  pageTitled,
  focusOrder,
  linkPurposeInContext,
  multipleWays,
  headingsAndLabels,
  focusVisible,
  focusNotObscuredMinimum,
  pointerGestures,
  pointerCancellation,
  labelInName,
  motionActuation,
  draggingMovements,
  targetSizeMinimum,
]
