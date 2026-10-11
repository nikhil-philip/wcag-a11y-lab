/**
 * Principle: Robust. Level A and AA success criteria.
 */

import { defineCriterion, type CriterionData } from '../wcag-schema'

/* ------------------------------------------------------------------ */
/* 4.1.2 Name, Role, Value                                             */
/* ------------------------------------------------------------------ */

const nameRoleValue = defineCriterion({
  id: '4.1.2',
  name: 'Name, Role, Value',
  version: '2.0',
  level: 'A',
  principle: 'Robust',
  risk: 'High',
  description:
    'For all user interface components, the name and role can be programmatically determined; states, properties and values can be programmatically set; and changes are announced to assistive technologies.',
  failExample: {
    codeSnippet: `// Custom toggle built from a <div> and an icon.
// Keyboard support was added, but nothing tells assistive tech what it is.
function DarkModeToggle() {
  const [on, setOn] = useState(false)
  const toggle = () => setOn(!on)
  return (
    <div
      tabIndex={0}
      className={on ? 'toggle toggle--on' : 'toggle'}
      onClick={toggle}
      onKeyDown={(e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault()
          toggle()
        }
      }}
    >
      <MoonIcon />
    </div>
  )
}
// Screen reader on focus: "clickable" or just silence.`,
    explanation:
      "Keyboard users can Tab to this toggle and operate it, so it passes 2.1.1, but it still fails 4.1.2. It has no role, so assistive technology doesn't know it's a control. It has no accessible name because the only content is an icon. Its on/off state exists only as a CSS class, so it's never announced. Screen-reader users land on something unnamed and can't tell what it does or whether dark mode is on.",
    interactiveType: 'button',
  },
  passExample: {
    codeSnippet: `// Same visual toggle, exposed correctly to assistive tech
function DarkModeToggle() {
  const [on, setOn] = useState(false)
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label="Dark mode"
      className={on ? 'toggle toggle--on' : 'toggle'}
      onClick={() => setOn(!on)}
    >
      <MoonIcon aria-hidden="true" />
    </button>
  )
}
// Screen reader: "Dark mode, switch, off" → "on"`,
    explanation:
      'The <button> makes the control focusable and keyboard-operable. role="switch" gives it the right role, aria-label gives it a name ("Dark mode"), and aria-checked holds its current value. The screen reader announces the state change whenever it is toggled. The icon has aria-hidden="true", so it is not announced twice.',
    interactiveType: 'button',
  },
  testingSteps: [
    "Inspect each custom control in the browser's accessibility tree (Chrome DevTools → Accessibility pane).",
    'Confirm every control exposes a meaningful accessible Name and the correct Role.',
    'Change the state (expand, check, select) and confirm the State/Value updates in the tree.',
    'Navigate with a screen reader (NVDA, JAWS, VoiceOver) and confirm name, role and state are announced, including after changes.',
    'Prefer native HTML elements; flag any ARIA role that is missing its required states (e.g. role="checkbox" without aria-checked).',
  ],
  impactedUsers: [
    'Blind screen-reader users',
    'Voice-control users who activate controls by name',
    'Users of switch devices and other assistive technologies relying on the accessibility API',
  ],
})

/* ------------------------------------------------------------------ */
/* 4.1.3 Status Messages                                               */
/* ------------------------------------------------------------------ */

const statusMessages = defineCriterion({
  id: '4.1.3',
  name: 'Status Messages',
  version: '2.1',
  level: 'AA',
  principle: 'Robust',
  risk: 'Medium',
  description:
    'Status messages (results of an action, progress, waiting states or errors that do not move focus) can be programmatically determined through role or properties, so assistive technologies can announce them without the user moving focus.',
  failExample: {
    codeSnippet: `function AddToCart({ product }) {
  const [message, setMessage] = useState('')

  async function add() {
    await cart.add(product.id)
    setMessage('Item added to cart')
  }

  return (
    <>
      <button type="button" onClick={add}>Add to cart</button>
      {/* Plain text: updates visually, silent for screen readers */}
      <p className="text-green-700">{message}</p>
    </>
  )
}

// Search results count, also silent
<p>{results.length} results found</p>`,
    explanation:
      'Sighted users see "Item added to cart" appear, but the text is not in a live region, so a screen reader says nothing. The user presses the button, hears silence, and cannot tell whether it worked, so they press it again and end up with two items. They would have to leave the button and hunt for the message to find out.',
    interactiveType: 'status-message',
  },
  passExample: {
    codeSnippet: `function AddToCart({ product }) {
  const [message, setMessage] = useState('')

  async function add() {
    await cart.add(product.id)
    setMessage(product.name + ' added. ' + cart.count + ' items in your cart.')
  }

  return (
    <>
      <button type="button" onClick={add}>Add to cart</button>
      {/* Always rendered, so the live region exists before it changes */}
      <p role="status" className="text-green-700">{message}</p>
    </>
  )
}

// Search results count: announced politely after typing stops
<p role="status">{results.length} results found</p>

// Urgent errors that don't move focus
<p role="alert">Couldn't save. Check your connection and try again.</p>`,
    explanation:
      'role="status" is a polite live region (aria-live="polite" plus aria-atomic="true"). The screen reader announces the new text when it has finished speaking, while focus stays on the button, so the user can keep shopping. The container is rendered empty from the start, because many screen readers ignore live regions that are added to the page already filled in. role="alert" is reserved for urgent, time-sensitive messages.',
    interactiveType: 'status-message',
  },
  testingSteps: [
    'List every message that appears without focus moving: "added to cart", "saved", search result counts, progress, form errors shown in a banner.',
    'Trigger each one with a screen reader running (NVDA, JAWS, VoiceOver, TalkBack) and confirm it is announced without moving focus.',
    'Inspect the container: check it has role="status", role="alert", role="log", role="progressbar" or aria-live, as appropriate.',
    'Check the live region is in the DOM before its content changes, not inserted along with the message.',
    'Check repeated identical messages are still announced (e.g. include an item count so the text changes).',
    'Messages that move focus (e.g. a dialog) or appear on a new page are not status messages and are covered elsewhere.',
  ],
  impactedUsers: [
    'Blind screen-reader users',
    'Users with low vision using magnification, who may not see messages outside the zoomed area',
    'Users with cognitive disabilities who need confirmation that an action worked',
    'Braille display users',
  ],
})

/* ------------------------------------------------------------------ */
/* Export                                                              */
/* ------------------------------------------------------------------ */

export const robustCriteria: readonly CriterionData[] = [
  nameRoleValue,
  statusMessages,
]
