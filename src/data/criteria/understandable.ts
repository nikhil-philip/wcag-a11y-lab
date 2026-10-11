/**
 * Principle: Understandable. Level A and AA success criteria.
 */

import { defineCriterion, type CriterionData } from '../wcag-schema'

/* ------------------------------------------------------------------ */
/* 3.1.1 Language of Page                                              */
/* ------------------------------------------------------------------ */

const languageOfPage = defineCriterion({
  id: '3.1.1',
  name: 'Language of Page',
  version: '2.0',
  level: 'A',
  principle: 'Understandable',
  risk: 'Medium',
  description:
    'The default human language of each page can be programmatically determined, usually with a valid lang attribute on the <html> element.',
  failExample: {
    explanation:
      'With no lang attribute, the screen reader keeps the user\'s default voice. An English voice reads "Bienvenidos" as "bye-en-ven-eye-doze", and the rest of the page comes out close to unintelligible. A wrong value (lang="en" copied from a template) or an invalid one (lang="spanish") is just as bad. Browsers also use lang for hyphenation, fonts and translation prompts.',
    interactiveType: 'language-of-page',
  },
  passExample: {
    explanation:
      'lang="es" is a valid BCP 47 tag, so screen readers switch to a Spanish voice and pronounce the page correctly. Browsers also apply Spanish hyphenation and spell-checking. In a single-page app the <html> element is never re-rendered, so update its lang whenever the user changes language.',
    interactiveType: 'language-of-page',
  },
  testingSteps: [
    'View the page source and check the <html> element has a lang attribute.',
    'Check the value is a valid BCP 47 tag (e.g. "en", "en-GB", "fr", "hi") and matches the main language of the content.',
    'In a single-page or localised app, switch language and confirm document.documentElement.lang updates.',
    'Listen to the first paragraph with a screen reader and confirm it is pronounced in the right language.',
    'Run an automated checker (axe "html-has-lang", "html-lang-valid") across every template.',
  ],
  impactedUsers: [
    'Blind screen-reader users',
    'Users with dyslexia or low literacy using text-to-speech',
    'Users relying on browser translation and captioning tools',
    'Braille display users (braille tables are language-specific)',
  ],
})

/* ------------------------------------------------------------------ */
/* 3.1.2 Language of Parts                                             */
/* ------------------------------------------------------------------ */

const languageOfParts = defineCriterion({
  id: '3.1.2',
  name: 'Language of Parts',
  version: '2.0',
  level: 'AA',
  principle: 'Understandable',
  risk: 'Low',
  description:
    'The human language of each passage or phrase can be programmatically determined, except for proper names, technical terms, words of indeterminate language and words that have become part of the surrounding language.',
  failExample: {
    codeSnippet: `<html lang="en">
...
<!-- Language switcher: every label is read with an English voice -->
<ul class="lang-switcher">
  <li><a href="/fr/">Français</a></li>
  <li><a href="/de/">Deutsch</a></li>
  <li><a href="/hi/">हिन्दी</a></li>
</ul>

<blockquote>
  <p>La vie est trop courte pour boire du mauvais vin.</p>
</blockquote>`,
    explanation:
      'The page is English, so the screen reader reads "Français" and the French quote with English rules and mispronounces them. Some screen readers skip the Hindi label entirely, or spell it out character by character, because the English voice has no Devanagari support. The users most likely to need the language switcher are the ones who cannot understand it.',
    interactiveType: 'language-of-parts',
  },
  passExample: {
    codeSnippet: `<html lang="en">
...
<ul class="lang-switcher">
  <li><a href="/fr/" lang="fr" hreflang="fr">Français</a></li>
  <li><a href="/de/" lang="de" hreflang="de">Deutsch</a></li>
  <li><a href="/hi/" lang="hi" hreflang="hi">हिन्दी</a></li>
</ul>

<blockquote lang="fr">
  <p>La vie est trop courte pour boire du mauvais vin.</p>
</blockquote>

<!-- No lang needed: "café" and "Wi-Fi" are part of English now -->
<p>Meet us at the café; the Wi-Fi password is on the menu.</p>`,
    explanation:
      'lang on each link and on the quote makes the screen reader switch voice for just that text, then switch back. hreflang describes the language of the linked page. Borrowed words like "café" and proper names do not need marking, which is why the criterion lists them as exceptions.',
    interactiveType: 'language-of-parts',
  },
  testingSteps: [
    'Scan the page for passages, quotes, labels and names of languages written in a language other than the page default.',
    'Check each one (or its container) has a correct lang attribute.',
    'Pay special attention to language switchers, multilingual footers and user-generated content.',
    'Listen with a screen reader and confirm the voice changes for foreign-language passages.',
    'Ignore proper names, technical terms and loanwords that are now part of the surrounding language.',
  ],
  impactedUsers: [
    'Blind screen-reader users',
    'Multilingual users looking for their own language',
    'Users with cognitive disabilities using text-to-speech',
    'Braille display users',
  ],
})

/* ------------------------------------------------------------------ */
/* 3.2.1 On Focus                                                      */
/* ------------------------------------------------------------------ */

const onFocus = defineCriterion({
  id: '3.2.1',
  name: 'On Focus',
  version: '2.0',
  level: 'A',
  principle: 'Understandable',
  risk: 'High',
  description:
    'When any user interface component receives focus, it does not start a change of context, such as opening a new window, submitting a form, moving focus elsewhere or significantly changing the page.',
  failExample: {
    codeSnippet: `<nav aria-label="Site">
  <a href="/">Home</a>
  <a href="/pricing">Pricing</a>
  <button
    type="button"
    aria-haspopup="dialog"
    onClick={openHelp}
    // Opens the moment Tab lands here
    onFocus={() => helpDialog.current.showModal()}
  >
    Help
  </button>
  <a href="/contact">Contact</a>
</nav>`,
    explanation:
      'A keyboard user pressing Tab to reach "Contact" is thrown into a modal chat dialog as soon as focus touches Help, before they can read the label or decide. The dialog covers the page and takes focus. On many sites, closing it returns focus to Help, which opens it again. Screen-reader users in browse mode can trigger it just by reading past it.',
    interactiveType: 'on-focus',
  },
  passExample: {
    codeSnippet: `<nav aria-label="Site">
  <a href="/">Home</a>
  <a href="/pricing">Pricing</a>
  {/* Opens only when activated: Enter, Space or click */}
  <button
    type="button"
    aria-haspopup="dialog"
    onClick={() => helpDialog.current.showModal()}
  >
    Help
  </button>
  <a href="/contact">Contact</a>
</nav>`,
    explanation:
      'Focus only highlights Help; the dialog opens when the user activates it with Enter, Space or a click. Keyboard and screen-reader users can move past it freely. Showing a tooltip or a focus style on focus is fine, because those change content, not context.',
    interactiveType: 'on-focus',
  },
  testingSteps: [
    'Tab slowly through every focusable element on the page without pressing Enter or Space.',
    'Confirm focus never triggers navigation, form submission, a new window or tab, or a dialog.',
    'Confirm focus is never moved somewhere else just because an element received it.',
    'Search the code for onFocus / focus / focusin handlers and check what they do.',
    'Repeat with a screen reader in browse mode, which can move focus as the virtual cursor passes controls.',
  ],
  impactedUsers: [
    'Keyboard-only users',
    'Blind screen-reader users',
    'Users with cognitive disabilities who are disoriented by unexpected changes',
    'Users with low vision using magnification, who may not notice a change outside their viewport',
  ],
})

/* ------------------------------------------------------------------ */
/* 3.2.2 On Input                                                      */
/* ------------------------------------------------------------------ */

const onInput = defineCriterion({
  id: '3.2.2',
  name: 'On Input',
  version: '2.0',
  level: 'A',
  principle: 'Understandable',
  risk: 'High',
  description:
    'Changing the setting of any user interface component (typing, checking a box, choosing an option) does not automatically cause a change of context, unless the user has been told about it beforehand.',
  failExample: {
    codeSnippet: `// Choosing an option immediately reloads the page in that language
<label htmlFor="lang">Choose language</label>
<select
  id="lang"
  value={locale}
  onChange={e => { window.location.href = '/' + e.target.value + '/' }}
>
  <option value="en">English</option>
  <option value="fr" lang="fr">Français</option>
  <option value="de" lang="de">Deutsch</option>
  <option value="es" lang="es">Español</option>
  <option value="hi" lang="hi">हिन्दी</option>
</select>

// Auto-submit and auto-advance
<input type="radio" name="plan" value="pro"
       onChange={() => form.requestSubmit()} />
<input maxLength={4} onChange={e => {
  if (e.target.value.length === 4) nextField.current.focus()
}} />`,
    explanation:
      'Keyboard users browse a <select> with the arrow keys, and in many browsers every arrow press fires onChange, so the page reloads in French before they can reach "Español", and focus is thrown back to the top of the page. The radio button submits the form before the user has reviewed it, and the auto-advancing field jumps focus unexpectedly, which also makes correcting a typo difficult.',
    interactiveType: 'on-input',
  },
  passExample: {
    codeSnippet: `<form onSubmit={e => {
  e.preventDefault()
  window.location.href = '/' + draft + '/'
}}>
  <label htmlFor="lang">Choose language</label>
  <select id="lang" value={draft} onChange={e => setDraft(e.target.value)}>
    <option value="en">English</option>
    <option value="fr" lang="fr">Français</option>
    ...
  </select>
  <button type="submit">Apply</button>
</form>

// Updating dependent content in place is fine
<select id="country" onChange={e => setCountry(e.target.value)}>...</select>
<label htmlFor="state">{country === 'US' ? 'State' : 'Province / region'}</label>
<select id="state">{statesFor(country).map(renderOption)}</select>`,
    explanation:
      'Nothing happens until the user presses "Apply", so choosing an option is safe to explore. Updating the list of states when the country changes is a change of content, not a change of context, so it is allowed. If a control really must act on change, warn users in text before they reach it (e.g. "Choosing a language reloads the page").',
    interactiveType: 'on-input',
  },
  testingSteps: [
    'Change the value of every select, radio group, checkbox and text field using only the keyboard (arrow keys in selects and radio groups).',
    'Confirm none of them navigates, submits the form, opens a window or moves focus automatically.',
    'If a change of context does happen, check the user is told about it in text before the control.',
    'Check auto-advancing fields (OTP, phone number, card number) do not move focus without warning.',
    'Confirm dependent fields that update in place are announced (e.g. via a live region) where it helps.',
  ],
  impactedUsers: [
    'Keyboard-only users',
    'Blind screen-reader users',
    'Users with cognitive disabilities',
    'Users with motor impairments who make accidental selections',
  ],
})

/* ------------------------------------------------------------------ */
/* 3.2.3 Consistent Navigation                                         */
/* ------------------------------------------------------------------ */

const consistentNavigation = defineCriterion({
  id: '3.2.3',
  name: 'Consistent Navigation',
  version: '2.0',
  level: 'AA',
  principle: 'Understandable',
  risk: 'Medium',
  description:
    'Navigation mechanisms that are repeated on multiple pages within a set of pages occur in the same relative order each time they are repeated, unless the user changes the order.',
  failExample: {
    codeSnippet: `// Each page builds its own menu, and the copies have drifted
const HOME_NAV = ['Home', 'Products', 'About']
const PRODUCTS_NAV = ['About', 'Home', 'Products']
const ABOUT_NAV = ['Products', 'About', 'Home']

<nav aria-label="Main">
  {PRODUCTS_NAV.map(label => <a key={label} href={hrefFor(label)}>{label}</a>)}
</nav>`,
    explanation:
      'On Home, "About" is the third link; on Products it is the first; on About it is the second. Keyboard users who learned it takes three Tabs, screen-reader users who learned the menu, and users with cognitive disabilities who remember where things sit all have to find it again on every page.',
    interactiveType: 'consistent-navigation',
  },
  passExample: {
    codeSnippet: `// One list, rendered by the shared layout on every page
const MAIN_NAV = ['Home', 'Products', 'About'] as const

function SiteNav({ current }: { current: string }) {
  return (
    <nav aria-label="Main">
      {MAIN_NAV.map(label => (
        <a key={label} href={hrefFor(label)}
           aria-current={label === current ? 'page' : undefined}>
          {label}
        </a>
      ))}
    </nav>
  )
}`,
    explanation:
      'One shared list guarantees the same order on every page. aria-current marks the current page without moving anything. Adding a link on some pages is allowed, as long as the shared links keep their relative order.',
    interactiveType: 'consistent-navigation',
  },
  testingSteps: [
    'Identify the navigation blocks repeated across pages: header menu, breadcrumbs, sidebar, footer links, skip links.',
    'Visit at least 3–5 representative pages (home, listing, detail, form, account).',
    'Compare the relative order of each repeated block and of the links inside it.',
    'Check with a screen reader\'s landmarks and links lists that the order is the same in code, not just visually.',
    'Allow items added or removed on some pages, as long as the others stay in the same relative order.',
  ],
  impactedUsers: [
    'Users with cognitive, learning or memory disabilities',
    'Blind screen-reader users who learn page layouts',
    'Users with low vision using magnification',
    'Keyboard users who count Tab stops',
  ],
})

/* ------------------------------------------------------------------ */
/* 3.2.4 Consistent Identification                                     */
/* ------------------------------------------------------------------ */

const consistentIdentification = defineCriterion({
  id: '3.2.4',
  name: 'Consistent Identification',
  version: '2.0',
  level: 'AA',
  principle: 'Understandable',
  risk: 'Low',
  description:
    'Components that have the same function within a set of pages are identified consistently: the same labels, names and text alternatives are used each time.',
  failExample: {
    codeSnippet: `// Header: the floppy disk means "save"
<button type="button" aria-label="Save profile" onClick={saveProfile}>
  <SaveIcon aria-hidden="true" />
</button>

// Document editor, just below: the same floppy disk means "download"
<button type="button" aria-label="Download file" onClick={downloadFile}>
  <SaveIcon aria-hidden="true" />
</button>`,
    explanation:
      'The floppy disk saves the profile in the header, but the identical icon in the editor downloads a copy of the file. Users who press it to save their edits get a file on their computer instead, and their changes are not saved. 3.2.4 asks for the same function to be identified the same way every time. Reusing one icon for two different functions breaks that expectation from the other side. Users with cognitive disabilities and low-vision users who navigate by familiar icons are misled most.',
    interactiveType: 'consistent-identification',
  },
  passExample: {
    codeSnippet: `// Header: floppy disk = save, as everywhere else
<button type="button" aria-label="Save profile" onClick={saveProfile}>
  <SaveIcon aria-hidden="true" />
</button>

// Editor: the standard download icon (arrow into a tray)
<button type="button" aria-label="Download file" onClick={downloadFile}>
  <DownloadIcon aria-hidden="true" />
</button>`,
    explanation:
      'Each icon has exactly one meaning across the interface: the floppy disk always saves, and the arrow into a tray always downloads. The accessible names follow the same rule, so a "Save …" button always saves and a "Download …" button always downloads, wherever it appears. A shared icon component per action keeps this consistent automatically.',
    interactiveType: 'consistent-identification',
  },
  testingSteps: [
    'List components that recur across pages: search, login, cart, share, print, download, next/previous, close.',
    'Compare their visible labels, accessible names and alt text on each page.',
    'Check the same icon is never used with different names, or for different functions.',
    'Use a screen reader\'s buttons/links list on several pages and compare the names.',
    'With voice control, say the same command (e.g. "Click Search") on each page and confirm it works.',
  ],
  impactedUsers: [
    'Blind screen-reader users',
    'Voice-control users who speak control names',
    'Users with cognitive or learning disabilities',
    'Users with low vision who rely on recognising familiar icons',
  ],
})

/* ------------------------------------------------------------------ */
/* 3.2.6 Consistent Help                                               */
/* ------------------------------------------------------------------ */

const consistentHelp = defineCriterion({
  id: '3.2.6',
  name: 'Consistent Help',
  version: '2.2',
  level: 'A',
  principle: 'Understandable',
  risk: 'Low',
  description:
    'If a web page contains help (human contact details, a contact mechanism, a self-help option or an automated contact mechanism) that is repeated on multiple pages, it appears in the same order relative to other page content, unless the user changes it.',
  failExample: {
    codeSnippet: `// Home: floating Help button, last in the page, bottom right
<Header /><Main /><Footer />
<button type="button" class="fab">Help</button>

// Plans: Help link moved to the start of the header, top left
<header><a href="/help">Help</a><Logo /><Nav /></header>

// Account: renamed "Support" and tucked into the footer text
<footer>© 2026 Skyline Mobile · Terms · Privacy <a href="/help">Support</a></footer>`,
    explanation:
      'Help is in a different place on each page, both on screen and in the page order, and on the Account page it is renamed "Support". Users with cognitive disabilities, older users and anxious users who remember where help was cannot find it, often on the page where they most need it.',
    interactiveType: 'consistent-help',
  },
  passExample: {
    codeSnippet: `// Layout.tsx: used by every page
export function Layout({ children }) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
      {/* Same component, same slot, same name: always last, bottom right */}
      <button type="button" className="fab" onClick={openHelpChat}>
        Help
      </button>
    </>
  )
}`,
    explanation:
      'The Help button is one component in one slot of the shared layout, so it is always in the same relative order (after the footer) and in the same corner, with the same name. The criterion does not require help to be offered, only that help repeated across pages stays consistent.',
    interactiveType: 'consistent-help',
  },
  testingSteps: [
    'Find every help mechanism on the site: contact details, contact forms, chat, FAQ/help links, chatbots.',
    'Check which ones repeat across pages (especially within a process like checkout or sign-up).',
    'On each page, check they appear in the same order relative to the rest of the content (e.g. always after the main nav).',
    'Check the order in the DOM as well as visually, and at mobile and desktop breakpoints.',
    'Confirm the order within the group of help mechanisms is also consistent.',
  ],
  impactedUsers: [
    'Users with cognitive, learning or memory disabilities',
    'Older users and users less confident with technology',
    'Users with anxiety who need to find help quickly',
    'Screen-reader and magnifier users who rely on predictable layouts',
  ],
})

/* ------------------------------------------------------------------ */
/* 3.3.1 Error Identification                                          */
/* ------------------------------------------------------------------ */

const errorIdentification = defineCriterion({
  id: '3.3.1',
  name: 'Error Identification',
  version: '2.0',
  level: 'A',
  principle: 'Understandable',
  risk: 'High',
  description:
    'If an input error is automatically detected, the item in error is identified and the error is described to the user in text.',
  failExample: {
    codeSnippet: `<label for="email">Email</label>
<input id="email" type="email" class="border-red-600">

<label for="phone">Mobile number</label>
<input id="phone" type="tel" class="border-red-600">

<p class="text-red-600">Please fix the errors above.</p>`,
    explanation:
      'The only sign of which fields are wrong is a red border. Screen-reader users hear nothing about the fields, and colour-blind users may not see the red at all. The generic message says something is wrong but not what or where.',
    interactiveType: 'form-error',
  },
  passExample: {
    codeSnippet: `<div role="alert" tabindex="-1" id="error-summary">
  <h2>There are 2 problems with your details</h2>
  <ul>
    <li><a href="#email">Enter an email address</a></li>
    <li><a href="#phone">Enter a 10-digit mobile number</a></li>
  </ul>
</div>

<label for="email">Email</label>
<input id="email" type="email"
       aria-invalid="true" aria-describedby="email-error">
<p id="email-error" class="text-red-700">
  <span aria-hidden="true">⚠</span> Error: Enter an email address
</p>`,
    explanation:
      'Every error is described in text next to its field, with an icon and the word "Error", so it does not rely on colour. aria-invalid and aria-describedby let screen readers announce "Email, invalid entry, Error: Enter an email address" on focus. The summary is announced on submit and links straight to each field.',
    interactiveType: 'form-error',
  },
  testingSteps: [
    'Submit each form empty, then with invalid data in each field.',
    'Check every field in error is identified in text, not by colour, icon or border alone.',
    'Check the message describes the error (e.g. "Enter an email address"), not just "Invalid".',
    'With a screen reader, confirm the error is announced on submit and when focusing the field (aria-invalid, aria-describedby).',
    'Check inline, on-blur validation and server-side errors behave the same way.',
  ],
  impactedUsers: [
    'Blind screen-reader users',
    'Users with colour-vision deficiencies',
    'Users with cognitive or learning disabilities',
    'Users with low vision who may not see errors outside the magnified area',
  ],
})

/* ------------------------------------------------------------------ */
/* 3.3.2 Labels or Instructions                                        */
/* ------------------------------------------------------------------ */

const labelsOrInstructions = defineCriterion({
  id: '3.3.2',
  name: 'Labels or Instructions',
  version: '2.0',
  level: 'A',
  principle: 'Understandable',
  risk: 'High',
  description:
    'Labels or instructions are provided when content requires user input, so users know what to enter and in what format.',
  failExample: {
    codeSnippet: `<form>
  <input type="text" placeholder="Name">
  <input type="text" placeholder="DOB">
  <input type="password" placeholder="Password">
  <input type="text" placeholder="PAN*">
  <button>Continue</button>
</form>`,
    explanation:
      'The placeholders disappear as soon as the user starts typing, so they have to remember what each field was for. "DOB" does not say what format to use, the password rules are only revealed after a failed attempt, and the asterisk is never explained. Placeholder text is also often too low-contrast to read.',
    interactiveType: 'form-labels',
  },
  passExample: {
    codeSnippet: `<form>
  <p>Fields marked * are required.</p>

  <label for="name">Full name <span aria-hidden="true">*</span></label>
  <input id="name" type="text" autocomplete="name" required>

  <label for="dob">Date of birth <span aria-hidden="true">*</span></label>
  <p id="dob-hint">For example, 26/09/1998</p>
  <input id="dob" type="text" inputmode="numeric" required
         aria-describedby="dob-hint">

  <label for="pw">Create a password <span aria-hidden="true">*</span></label>
  <p id="pw-hint">At least 12 characters, including a number.</p>
  <input id="pw" type="password" autocomplete="new-password" required
         aria-describedby="pw-hint">

  <label for="pan">PAN (10 characters, e.g. ABCDE1234F) <span aria-hidden="true">*</span></label>
  <input id="pan" type="text" required>

  <button type="submit">Continue</button>
</form>`,
    explanation:
      'Every field has a visible label that stays on screen while typing. The expected formats and password rules are shown before the user types, and aria-describedby makes screen readers read them too. The note at the top explains the asterisk, and the required attribute makes screen readers say "required" instead of "star". 1.3.1 covers whether labels are linked in code; this criterion is about whether labels and instructions exist and are clear enough.',
    interactiveType: 'form-labels',
  },
  testingSteps: [
    'Find every form field, including search boxes, filters and inline editors.',
    'Check each has a visible label or instruction that stays visible while typing (not just a placeholder).',
    'Check required fields and required formats (dates, phone numbers, IDs, password rules) are explained up front.',
    'Check that symbols like * are explained, and that grouped fields (e.g. day/month/year) have a group label.',
    'With a screen reader, confirm the labels and hints are announced when each field receives focus.',
  ],
  impactedUsers: [
    'Users with cognitive, learning or memory disabilities',
    'Blind screen-reader users',
    'Users with low vision who lose context when zoomed',
    'Users of voice control who say field labels',
    'Older users and anyone filling in an unfamiliar form',
  ],
})

/* ------------------------------------------------------------------ */
/* 3.3.3 Error Suggestion                                              */
/* ------------------------------------------------------------------ */

const errorSuggestion = defineCriterion({
  id: '3.3.3',
  name: 'Error Suggestion',
  version: '2.0',
  level: 'AA',
  principle: 'Understandable',
  risk: 'Medium',
  description:
    'If an input error is detected and suggestions for correction are known, the suggestions are provided to the user, unless doing so would jeopardise the security or purpose of the content.',
  failExample: {
    codeSnippet: `const valid = /^\\d{2}\\/\\d{2}\\/\\d{4}$/.test(dob) && isRealDate(dob)

<label htmlFor="dob">Date of birth</label>
<input id="dob" autoComplete="bday"
       aria-invalid={!valid} aria-describedby="dob-error" />
{!valid && <p id="dob-error">Invalid date format.</p>}`,
    explanation:
      'The code knows exactly which format it expects, but the message only says that the input is wrong. Users typing 31/10/1990 or 1990-10-31 have to guess what "format" means. That is especially hard for users with cognitive disabilities, and for screen-reader users who cannot scan the page for clues. The error is identified (3.3.1), but no correction is suggested.',
    interactiveType: 'error-suggestion',
  },
  passExample: {
    codeSnippet: `<label htmlFor="dob">Date of birth</label>
<input id="dob" autoComplete="bday"
       aria-invalid={!valid} aria-describedby="dob-error" />
{!valid && (
  <p id="dob-error">
    Invalid date format. Please use MM/DD/YYYY (e.g., 10/31/1990).
    {suggestion && ' Did you mean ' + suggestion + '?'}
  </p>
)}
{suggestion && (
  <button type="button" onClick={() => setDob(suggestion)}>
    Use {suggestion}
  </button>
)}`,
    explanation:
      'The message gives the expected format with an example, and aria-describedby makes screen readers read it with the field. When the intended date is clear, for example day-first 31/10/1990, it also offers the corrected value. Messages may stay vague only for security (a login should not say whether the email or the password was wrong) or purpose (a test).',
    interactiveType: 'error-suggestion',
  },
  testingSteps: [
    'Trigger each validation error in every form (wrong format, out of range, missing value, typos).',
    'Check each message explains how to correct the error, not just that there is one.',
    'Where the valid values are known (formats, ranges, allowed options), check they are suggested.',
    'Check messages avoid jargon and internal error codes.',
    'Confirm deliberately vague messages are justified only by security (e.g. login) or purpose (e.g. a test).',
  ],
  impactedUsers: [
    'Users with cognitive, learning or language disabilities',
    'Blind screen-reader users',
    'Users with dyslexia who make typing errors',
    'Users with motor impairments for whom retrying is costly',
    'Non-native speakers',
  ],
})

/* ------------------------------------------------------------------ */
/* 3.3.4 Error Prevention (Legal, Financial, Data)                     */
/* ------------------------------------------------------------------ */

const errorPreventionLegalFinancialData = defineCriterion({
  id: '3.3.4',
  name: 'Error Prevention (Legal, Financial, Data)',
  version: '2.0',
  level: 'AA',
  principle: 'Understandable',
  risk: 'High',
  description:
    'For pages that cause legal commitments or financial transactions, modify or delete user data, or submit test responses, submissions are reversible, checked for errors with a chance to correct them, or reviewed and confirmed before they are final.',
  failExample: {
    codeSnippet: `// Money leaves the account on the first press
<form onSubmit={e => {
  e.preventDefault()
  api.transfer(draft)
  setStep('done')
}}>
  <label htmlFor="payee">Payee name</label>
  <input id="payee" value={draft.payee} onChange={...} />
  <label htmlFor="acct">Payee account number</label>
  <input id="acct" value={draft.account} onChange={...} />
  <label htmlFor="amt">Amount (USD)</label>
  <input id="amt" value={draft.amount} onChange={...} />
  <button type="submit">Send money</button>
</form>`,
    explanation:
      'One extra zero turns $500 into $5,000, and it is gone the moment "Send money" is pressed: there is no review, no check and no undo. Users with dyslexia or dyscalculia who transpose digits, and users with tremors who press by accident, have no chance to catch the mistake.',
    interactiveType: 'error-prevention',
  },
  passExample: {
    codeSnippet: `type Flow =
  | { step: 'edit' }
  | { step: 'review'; transfer: Transfer }
  | { step: 'done'; transfer: Transfer }

// Continue only moves to the review step; nothing is sent yet
<form onSubmit={e => {
  e.preventDefault()
  setFlow({ step: 'review', transfer: toTransfer(draft) })
}}>...</form>

{flow.step === 'review' && (
  <section aria-labelledby="review-heading">
    <h2 id="review-heading" tabIndex={-1}>Review transfer</h2>
    <dl>
      <dt>To</dt><dd>Jordan Lee</dd>
      <dt>Account</dt><dd>40218821</dd>
      <dt>Amount</dt><dd>$500.00</dd>
    </dl>
    <button type="button" onClick={() => send(flow.transfer)}>
      Confirm &amp; Send $500.00
    </button>
    {/* The draft is kept, so nothing needs retyping */}
    <button type="button" onClick={() => setFlow({ step: 'edit' })}>
      Back to Edit
    </button>
  </section>
)}`,
    explanation:
      '"Continue" only shows a review screen, and focus moves to its heading so screen-reader users know where they are. The amount is shown large and repeated on the confirm button, and "Back to Edit" returns to the form with every field as the user left it. WCAG requires at least one of these: reversible, checked, or confirmed. This flow also checks the fields before the review.',
    interactiveType: 'error-prevention',
  },
  testingSteps: [
    'Identify every flow that creates a legal commitment, moves money, changes or deletes user data, or submits a test.',
    'Complete each flow and check that at least one of these is true: the action can be undone, the input is checked with a chance to fix it, or there is a review-and-confirm step.',
    'On review pages, check all key details are shown and can be edited without re-entering everything.',
    'Check destructive actions (delete, cancel subscription) have a confirmation or an undo period.',
    'Check confirmation dialogs are keyboard accessible and announced by screen readers.',
  ],
  impactedUsers: [
    'Users with cognitive or learning disabilities',
    'Users with dyslexia or dyscalculia',
    'Users with motor impairments or tremors who activate controls by accident',
    'Blind screen-reader users who cannot easily scan a whole form',
    'Older users',
  ],
})

/* ------------------------------------------------------------------ */
/* 3.3.7 Redundant Entry                                               */
/* ------------------------------------------------------------------ */

const redundantEntry = defineCriterion({
  id: '3.3.7',
  name: 'Redundant Entry',
  version: '2.2',
  level: 'A',
  principle: 'Understandable',
  risk: 'Medium',
  description:
    'Information the user has already entered or been given in the same process is filled in automatically or available to select, instead of having to be entered again, unless re-entry is essential, needed for security, or the earlier information is no longer valid.',
  failExample: {
    codeSnippet: `// Step 1: shipping address
<AddressFields section="shipping" value={shipping} onChange={setShipping} />

// Step 2: billing address, empty, with no way to reuse step 1
<fieldset>
  <legend>Billing address</legend>
  <AddressFields section="billing" value={billing} onChange={setBilling} />
</fieldset>
<button type="submit">Place order</button>`,
    explanation:
      'The user typed their address one step ago, and now has to type all four fields again, usually the same values from memory. Browser autofill may help some users, but it depends on their browser having saved the address. The page itself offers no way to reuse what was just entered. Each re-entry is slow for users with motor impairments and another chance of a mistake for users with memory or cognitive disabilities.',
    interactiveType: 'redundant-entry',
  },
  passExample: {
    codeSnippet: `const [sameAsShipping, setSameAsShipping] = useState(true)

// Derived, never copied: editing shipping later can't leave a stale billing copy
const billingAddress = sameAsShipping ? shipping : billing

<fieldset>
  <legend>Billing address</legend>
  <label>
    <input
      type="checkbox"
      checked={sameAsShipping}
      onChange={e => setSameAsShipping(e.target.checked)}
    />
    Billing address is the same as shipping address
  </label>

  {sameAsShipping
    ? <p>Billing to: {formatAddress(shipping)}</p>
    : <AddressFields section="billing" value={billing} onChange={setBilling} />}
</fieldset>`,
    explanation:
      'The billing address is one checkbox, ticked by default, which hides the billing fields and shows the address being used. Unticking it brings the fields back for a genuinely different address. The billing address is computed from the shipping address rather than copied into it, so going back and changing shipping updates billing too. Exceptions still apply: asking for a new password twice is allowed for security.',
    interactiveType: 'redundant-entry',
  },
  testingSteps: [
    'Walk through every multi-step process (checkout, sign-up, applications, bookings) from start to finish.',
    'Note every piece of information entered or shown at each step.',
    'Check that nothing already given is asked for again later in the same process without being pre-filled or selectable.',
    'Check "same as" options (e.g. billing = shipping) and pre-filled values actually work, including after going back a step.',
    'Confirm any remaining re-entry fits an exception: essential, for security, or no longer valid.',
  ],
  impactedUsers: [
    'Users with cognitive, learning or memory disabilities',
    'Users with motor impairments who find typing slow or painful',
    'Screen-reader users for whom long forms take much longer',
    'Users of switch devices and on-screen keyboards',
  ],
})

/* ------------------------------------------------------------------ */
/* 3.3.8 Accessible Authentication (Minimum)                           */
/* ------------------------------------------------------------------ */

const accessibleAuthenticationMinimum = defineCriterion({
  id: '3.3.8',
  name: 'Accessible Authentication (Minimum)',
  version: '2.2',
  level: 'AA',
  principle: 'Understandable',
  risk: 'High',
  description:
    'No step in an authentication process requires a cognitive function test (remembering a password, transcribing a code, solving a puzzle) unless there is an alternative method, a mechanism to help (such as password managers or copy and paste), or the test is recognising objects or the user\'s own content.',
  failExample: {
    codeSnippet: `<label htmlFor="email">Email</label>
<input id="email" type="email" />

<label htmlFor="pw">Password</label>
<input
  id="pw"
  type="password"
  // "For security": blocks pasting from a password manager
  onPaste={e => {
    e.preventDefault()
    setMessage('Pasting is disabled for security reasons.')
  }}
/>
<button type="submit">Sign in</button>`,
    explanation:
      'With paste blocked and no autocomplete hints, a password manager cannot help, so the user has to remember a long password and type it character by character. That is a cognitive function test with no alternative. Blocking paste adds no security: it pushes people towards short, memorable, reused passwords.',
    interactiveType: 'authentication',
  },
  passExample: {
    codeSnippet: `<label htmlFor="email">Email</label>
<input id="email" type="email" autoComplete="username" />

<label htmlFor="pw">Password</label>
<input
  id="pw"
  type={showPassword ? 'text' : 'password'}
  autoComplete="current-password"
  autoCapitalize="none"
  spellCheck={false}
/>
<button
  type="button"
  aria-pressed={showPassword}
  aria-controls="pw"
  onClick={() => setShowPassword(s => !s)}
>
  Show password
</button>
<button type="submit">Sign in</button>`,
    explanation:
      'Pasting works natively, and autocomplete="username" and "current-password" let password managers fill both fields. The Show password toggle lets users check what they typed or pasted instead of holding it in memory. It keeps a constant label and uses aria-pressed to report its state. Passkeys or emailed sign-in links remove the memory test altogether.',
    interactiveType: 'authentication',
  },
  testingSteps: [
    'Go through every authentication step: sign-in, sign-up, 2FA, password reset, re-authentication.',
    'Check the password field accepts paste and has autocomplete="current-password" (or "new-password" when creating one).',
    'Sign in using a password manager and confirm it fills both username and password.',
    'Check one-time codes can be pasted or auto-filled, and are not split into boxes that block paste.',
    'Check any CAPTCHA or puzzle has an alternative, or only asks users to recognise objects or their own content.',
  ],
  impactedUsers: [
    'Users with cognitive, learning or memory disabilities',
    'Users with dyslexia or dyscalculia',
    'Users with motor impairments who find transcription slow',
    'Blind and low-vision users (visual CAPTCHAs)',
    'Anyone using a password manager',
  ],
})

/* ------------------------------------------------------------------ */
/* Export                                                              */
/* ------------------------------------------------------------------ */

export const understandableCriteria: readonly CriterionData[] = [
  languageOfPage,
  languageOfParts,
  onFocus,
  onInput,
  consistentNavigation,
  consistentIdentification,
  consistentHelp,
  errorIdentification,
  labelsOrInstructions,
  errorSuggestion,
  errorPreventionLegalFinancialData,
  redundantEntry,
  accessibleAuthenticationMinimum,
]
