/**
 * Principle: Perceivable. Level A and AA success criteria.
 *
 * 1.2.4 Captions (Live) is left out on purpose: see EXCLUDED_CRITERIA in ./index.ts.
 */

import { defineCriterion, type CriterionData } from '../wcag-schema'

/* ------------------------------------------------------------------ */
/* 1.1.1 Non-text Content                                              */
/* ------------------------------------------------------------------ */

const nonTextContent = defineCriterion({
  id: '1.1.1',
  name: 'Non-text Content',
  version: '2.0',
  level: 'A',
  principle: 'Perceivable',
  risk: 'Critical',
  description:
    'All non-text content presented to the user has a text alternative that serves the equivalent purpose. Purely decorative images must be hidden from assistive technology.',
  failExample: {
    codeSnippet: `<!-- Decorative icon given a label, so it is announced as noise -->
<h3>
  <svg role="img" aria-label="bar chart icon" viewBox="0 0 24 24">…</svg>
  2025 sales update
</h3>
<p>Every quarter beat the one before.</p>

<!-- The file name used as "alt text" -->
<img src="chart-final-v2.jpg" alt="chart-final-v2.jpg">

<!-- Also a failure: no alt at all, so screen readers
     fall back to reading the file name -->
<img src="chart-final-v2.jpg">

<!-- Icon-only button with no text alternative -->
<button>
  <svg viewBox="0 0 24 24">…</svg>
</button>`,
    explanation:
      "The chart is the whole point of the section, but a screen-reader user only hears \"chart-final-v2.jpg\", so the data is lost. The download icon is the button's only content and has no text alternative, so the button is announced as just \"button\", with no hint of what it does. Meanwhile the decorative icon in the heading has a label, so the heading is read as \"bar chart icon 2025 sales update\", which is noise.",
    interactiveType: 'non-text-content',
  },
  passExample: {
    codeSnippet: `<!-- Decorative icon: aria-hidden hides it from assistive tech -->
<h3>
  <svg aria-hidden="true" viewBox="0 0 24 24">…</svg>
  2025 sales update
</h3>
<p>Every quarter beat the one before.</p>

<!-- Informative image: alt conveys the same information -->
<img
  src="chart-final-v2.jpg"
  alt="Bar chart of 2025 sales: up 15%, from ₹40 lakh in Q1
       to ₹46 lakh in Q4, rising every quarter."
>

<!-- Informative icon: the button gets the text alternative,
     the icon itself is hidden -->
<button aria-label="Download 2025 sales report (CSV)">
  <svg aria-hidden="true" viewBox="0 0 24 24">…</svg>
</button>`,
    explanation:
      "The chart's alt text gives the key finding and the numbers behind it, so a screen-reader user gets the same information as a sighted user. The icon-only button is named \"Download 2025 sales report (CSV)\", so its purpose is clear without seeing the icon. The heading icon only repeats the heading text, so aria-hidden=\"true\" keeps it silent. For <img> elements the equivalents are a descriptive alt for informative images and alt=\"\" for decorative ones; leaving alt out entirely is not the same, because many screen readers then read the file name.",
    interactiveType: 'non-text-content',
  },
  testingSteps: [
    'List every <img>, <svg>, icon font, <canvas> and CSS background image that conveys meaning.',
    'Confirm each informative image has an alt (or aria-label / aria-labelledby) that conveys the same information or function.',
    'Confirm decorative images use alt="" or aria-hidden="true" and are not focusable.',
    'Turn images off (or use a screen reader) and check that no information or function is lost.',
    'Run an automated checker (axe, WAVE) to catch missing alt attributes, then review alt quality manually.',
  ],
  impactedUsers: [
    'Blind screen-reader users',
    'Users with low vision who disable images',
    'Users on slow connections where images fail to load',
    'Users with cognitive disabilities who benefit from text summaries',
  ],
})

/* ------------------------------------------------------------------ */
/* 1.4.3 Contrast (Minimum)                                            */
/* ------------------------------------------------------------------ */

const contrastMinimum = defineCriterion({
  id: '1.4.3',
  name: 'Contrast (Minimum)',
  version: '2.0',
  level: 'AA',
  principle: 'Perceivable',
  risk: 'High',
  description:
    'Text and images of text have a contrast ratio of at least 4.5:1 against their background, or 3:1 for large text (18pt / 24px regular, or 14pt / ~18.66px bold).',
  failExample: {
    codeSnippet: `<style>
  .hint {
    color: #aaaaaa;        /* light grey */
    background: #ffffff;   /* on white  */
    font-size: 14px;
  }
</style>

<p class="hint">Password must contain at least 12 characters.</p>
<!-- Contrast ratio: 2.32:1  ✗ (needs 4.5:1) -->`,
    explanation:
      'Light grey (#aaaaaa) on white has a contrast ratio of only 2.32:1, well below the 4.5:1 required for body text. This "subtle" style is a common anti-pattern for hints, placeholders and footers. Users with low vision, and anyone reading in bright sunlight, can find it unreadable.',
    interactiveType: 'contrast',
  },
  passExample: {
    codeSnippet: `<style>
  .hint {
    color: #595959;        /* dark grey */
    background: #ffffff;   /* on white  */
    font-size: 14px;
  }
</style>

<p class="hint">Password must contain at least 12 characters.</p>
<!-- Contrast ratio: 7.00:1  ✓ (AA 4.5:1, and even AAA 7:1) -->`,
    explanation:
      'Darkening the text to #595959 gives a 7:1 ratio. That passes AA and also AAA, and it still reads as secondary text. #767676 (4.54:1) is the lightest grey that passes AA on white.',
    interactiveType: 'contrast',
  },
  testingSteps: [
    'Identify the foreground and background colour of each text element, including hover, focus and disabled-looking (but active) states.',
    'Measure the ratio with a contrast checker (e.g. WebAIM, Chrome DevTools colour picker, TPGi CCA).',
    'Verify ≥ 4.5:1 for normal text and ≥ 3:1 for large text (≥ 24px, or ≥ 18.66px bold).',
    'Check text over images or gradients at its lowest-contrast point.',
    'Repeat in dark mode and any alternate themes.',
  ],
  impactedUsers: [
    'Users with low vision',
    'Users with colour-vision deficiencies',
    'Older users with reduced contrast sensitivity',
    'Anyone using a screen in bright light or with low brightness',
  ],
})

/* ------------------------------------------------------------------ */
/* 1.2.1 Audio-only and Video-only (Prerecorded)                       */
/* ------------------------------------------------------------------ */

const audioOnlyVideoOnly = defineCriterion({
  id: '1.2.1',
  name: 'Audio-only and Video-only (Prerecorded)',
  version: '2.0',
  level: 'A',
  principle: 'Perceivable',
  risk: 'High',
  description:
    'Prerecorded audio-only content (such as a podcast) has a text transcript. Prerecorded video-only content (such as a silent animation) has either a text alternative or an audio track that presents the same information.',
  failExample: {
    codeSnippet: `<!-- Audio drama: a player and nothing else -->
<h2>The Delivery Guy</h2>
<audio controls src="the-delivery-guy.m4a"></audio>`,
    explanation:
      'Choose "Audio-only content" in the demo. The short audio drama is only sound, and there is no transcript, so Deaf and hard-of-hearing users get nothing: not the storm, not the knocking, not who is speaking or what they say. The same applies the other way round to silent video, which needs a text description or an audio track.',
    interactiveType: 'media-alternatives',
  },
  passExample: {
    codeSnippet: `<h2>The Delivery Guy</h2>
<audio controls src="the-delivery-guy.m4a"></audio>
<a href="#transcript">Read transcript</a>

<section id="transcript" aria-labelledby="transcript-title">
  <h3 id="transcript-title">Transcript: The Delivery Guy</h3>
  <p>[SFX: Heavy rain falls. Thunder rumbles.]</p>
  <p>[SFX: Someone knocks on a door.]</p>
  <p>Woman (hesitantly): Who is it?</p>
  <p>Man (slowly, in a smooth and deep voice): Food delivery! A pizza and... a coke.</p>
  <!-- … -->
</section>`,
    explanation:
      'A "Read transcript" link right below the player opens the full transcript and moves focus to it. It names each speaker and includes meaningful sounds, so Deaf users, and deafblind users on a braille display, get everything the audio contains.',
    interactiveType: 'media-alternatives',
  },
  testingSteps: [
    'Find every prerecorded audio-only and video-only file on the page.',
    'For audio-only, confirm a transcript is next to it or clearly linked.',
    'For video-only, confirm a text description or an audio track is provided.',
    'Compare the alternative with the media: it should cover all the same information, including speaker names and meaningful sounds.',
    'If the media is itself an alternative to text on the page and is labelled as such, it is exempt.',
  ],
  impactedUsers: [
    'Deaf and hard-of-hearing users (audio-only content)',
    'Blind users and users with low vision (video-only content)',
    'Deafblind users who read transcripts on a braille display',
    'Anyone who cannot play sound in their environment',
  ],
})

/* ------------------------------------------------------------------ */
/* 1.2.2 Captions (Prerecorded)                                        */
/* ------------------------------------------------------------------ */

const captionsPrerecorded = defineCriterion({
  id: '1.2.2',
  name: 'Captions (Prerecorded)',
  version: '2.0',
  level: 'A',
  principle: 'Perceivable',
  risk: 'Critical',
  description:
    'Captions are provided for all prerecorded audio in video (synchronized media), unless the video is a media alternative for text and is clearly labelled as such.',
  failExample: {
    codeSnippet: `<!-- Play, pause and volume, but no captions track and no CC option -->
<video controls src="movie.mp4"></video>`,
    explanation:
      'The player has every control except the one Deaf and hard-of-hearing viewers need. The thunder, the man\'s lines and Barbara\'s reply are all lost, and nothing on screen says what is being said. Auto-generated text that nobody has reviewed would not fix this either: it is often wrong and leaves out speakers and sounds.',
    interactiveType: 'media',
  },
  passExample: {
    codeSnippet: `<video controls src="movie.mp4">
  <track kind="captions" src="movieCaptions.vtt"
         srclang="en" label="English">
</video>

<!-- movieCaptions.vtt -->
WEBVTT

00:00:00.000 --> 00:00:04.000
[Mild Thunder Rumbling][Man exhales]

00:00:04.200 --> 00:00:08.000
Man: Hey, come on Barb church was this morning, Huh?

00:00:09.000 --> 00:00:14.000
[Heavy Thunder Strikes]

00:00:31.951 --> 00:00:34.181
Barbara: I haven't seen you in Church lately`,
    explanation:
      'A captions track (kind="captions") adds a CC / captions option to the browser\'s own video player. When it is on, captions appear over the bottom of the video, in sync with the audio. They name each speaker and describe meaningful sounds such as the thunder, so Deaf viewers get the whole soundtrack, not just the words. The native player\'s captions control can be reached and used with the keyboard.',
    interactiveType: 'media',
  },
  testingSteps: [
    'Play each prerecorded video and turn captions on.',
    'Confirm captions cover all dialogue for the whole video.',
    'Check the captions are accurate and in sync with the speech.',
    'Check that speakers are identified and important sounds (music, laughter, alarms) are described.',
    "Check the player's captions button can be reached and used with the keyboard.",
  ],
  impactedUsers: [
    'Deaf and hard-of-hearing users',
    'Users watching without sound, e.g. in public places',
    'Non-native speakers',
    'Users with auditory processing disorders',
  ],
})

/* ------------------------------------------------------------------ */
/* 1.2.3 Audio Description or Media Alternative (Prerecorded)          */
/* ------------------------------------------------------------------ */

const audioDescriptionOrAlternative = defineCriterion({
  id: '1.2.3',
  name: 'Audio Description or Media Alternative (Prerecorded)',
  version: '2.0',
  level: 'A',
  principle: 'Perceivable',
  risk: 'High',
  description:
    'Prerecorded video has either an audio description of its important visual content, or a full text alternative that describes both what is seen and what is heard.',
  failExample: {
    codeSnippet: `<!-- Campus tour: the narration depends on the picture -->
<video controls src="campus-tour.mp4"></video>

<!-- Narrator: "This is where you'll spend most of your time."
     Narrator: "This is where it all happens." -->`,
    explanation:
      'Choose "Recorded video" in the demo and press Play. A blind viewer hears "This is where it all happens", but never learns that "this" is a library or a robotics lab. There is no audio description and no descriptive transcript.',
    interactiveType: 'media-alternatives',
  },
  passExample: {
    codeSnippet: `<video controls src="campus-tour.mp4">
  <track kind="captions" src="tour.en.vtt" srclang="en" label="English">
</video>
<!-- Player control bar also offers AD (audio description) -->
<a href="#transcript">Read transcript</a>

<!-- Descriptive transcript: dialogue AND what is seen -->
[Upbeat music. A red-brick archway opens onto a sunny lawn.]
Narrator: This is where you'll spend most of your time.
[A glass-roofed library, five floors of books.]
...`,
    explanation:
      'At Level A either option passes, and this player offers both. The AD button adds narration of what is on screen, and "Read transcript" opens a descriptive transcript with the dialogue and the visuals in bracketed descriptions. Each one gives blind users what the picture shows.',
    interactiveType: 'media-alternatives',
  },
  testingSteps: [
    'Watch each prerecorded video with the screen turned off. Can you follow it?',
    'Check for an audio-described version or a full descriptive transcript.',
    'Confirm the alternative covers important visual information: actions, on-screen text, scene changes and who is speaking.',
    'Check the alternative is next to the video or clearly linked from it.',
  ],
  impactedUsers: [
    'Blind users',
    'Users with low vision',
    'Users with cognitive disabilities who benefit from narrated visuals',
    'Deafblind users (via the text alternative)',
  ],
})

/* ------------------------------------------------------------------ */
/* 1.2.5 Audio Description (Prerecorded)                               */
/* ------------------------------------------------------------------ */

const audioDescriptionPrerecorded = defineCriterion({
  id: '1.2.5',
  name: 'Audio Description (Prerecorded)',
  version: '2.0',
  level: 'AA',
  principle: 'Perceivable',
  risk: 'Medium',
  description:
    'Audio description is provided for all prerecorded video content. At Level AA, a text alternative alone is not enough.',
  failExample: {
    codeSnippet: `<!-- Campus tour: play, pause and volume only -->
<video controls src="campus-tour.mp4"></video>`,
    explanation:
      'Choose "Recorded video" in the demo and press Play. The narration only says "This is where it all happens", and there is no audio description to say what "this" is. Even a transcript alone would not be enough here: Level AA requires audio description, so blind users hear the visuals alongside the soundtrack instead of reading a separate document.',
    interactiveType: 'media-alternatives',
  },
  passExample: {
    codeSnippet: `<video controls src="campus-tour.mp4"></video>

<!-- In the control bar -->
<button type="button" aria-pressed={describedOn}
        onClick={() => setDescribedOn(d => !d)}>
  AD<span className="sr-only"> (audio description)</span>
</button>

<!-- With AD on, a narrator fills natural pauses:
     "Inside: a glass-roofed library, five floors of books."
     "A sign reads 'Innovation Lab'. Small robots line the benches." -->`,
    explanation:
      'An AD toggle in the control bar switches to the described soundtrack, where a narrator describes key visuals during natural pauses in the dialogue. The toggle reports its state with aria-pressed and works from the keyboard. The demo shows what blind viewers hear with AD on and off.',
    interactiveType: 'media-alternatives',
  },
  testingSteps: [
    'Check each prerecorded video for an audio-described version or description track.',
    'Watch the described version with the screen off and confirm you can follow it.',
    'Check the descriptions cover on-screen text, actions, scene changes and speakers.',
    'Check the control or link to the described version is labelled and keyboard accessible.',
    "If there's no description, check whether the main soundtrack already conveys all visual information.",
  ],
  impactedUsers: [
    'Blind users',
    'Users with low vision',
    'Users with cognitive disabilities who benefit from narrated visuals',
  ],
})

/* ------------------------------------------------------------------ */
/* 1.3.1 Info and Relationships                                        */
/* ------------------------------------------------------------------ */

const infoAndRelationships = defineCriterion({
  id: '1.3.1',
  name: 'Info and Relationships',
  version: '2.0',
  level: 'A',
  principle: 'Perceivable',
  risk: 'Critical',
  description:
    'Information, structure and relationships shown visually (landmarks, headings, lists, tables, key-value pairs, groups) are also available in code, so assistive technology can convey them, or are available in text.',
  failExample: {
    codeSnippet: `<!-- info-relationships-fail.html (excerpt) -->
<!-- Landmarks: look like a header, nav bar and sidebar -->
<div class="site-header">
  <div class="logo">SuperStore</div>
  <div class="nav-links"><a href="#">Orders</a> …</div>
</div>
<div class="breadcrumb">
  <a href="#">Home</a> <a href="#">Orders</a> <span>Order #4821</span>
</div>
<div class="content">
  <!-- Headings: big bold text -->
  <div class="page-title">Order #4821</div>

  <!-- Key-value pairs: sibling spans -->
  <div class="details">
    <span>Order number</span> <span>#4821</span>
    <span>Status</span> <span>Shipped</span>
  </div>

  <!-- Table: a CSS grid of divs -->
  <div class="items-grid">
    <div class="items-head">Item</div> <div class="items-head">Qty</div> …
    <div>Wireless mouse</div> <div>1</div> <div>₹799</div>
  </div>

  <!-- List: bullets drawn with CSS -->
  <div class="bullet-item">Wireless mouse</div>
  <div class="bullet-item">USB receiver</div>

  <!-- Grouping: the question is not tied to the options -->
  <div class="group-label">Delivery speed</div>
  <label><input type="radio" name="speed"> Standard (3–5 days)</label>
  <label><input type="radio" name="speed"> Express (next day)</label>
</div>
<div class="card">Need help? …</div>
<div class="site-footer">…</div>`,
    explanation:
      'The page looks fully structured, but the structure is only visual. In NVDA there are no landmarks (D), headings (H), tables (T) or lists (L) to jump to; the order details are read as six unconnected lines; and the radio options are heard without the question "Delivery speed". Every link and control still has a name, so this is a structure failure, not a naming one (4.1.2).',
    interactiveType: 'info-relationships',
  },
  passExample: {
    codeSnippet: `<!-- info-relationships-pass.html (excerpt), same CSS classes -->
<header class="site-header">
  <p class="logo">SuperStore</p>
  <nav><ul><li><a href="#">Orders</a></li> …</ul></nav>
</header>
<nav aria-label="Breadcrumb">
  <ol>
    <li><a href="#">Home</a></li>
    <li><a href="#">Orders</a></li>
    <li><span aria-current="page">Order #4821</span></li>
  </ol>
</nav>
<main class="content">
  <h1>Order #4821</h1>

  <h2>Order details</h2>
  <dl>
    <div><dt>Order number</dt> <dd>#4821</dd></div>
    <div><dt>Status</dt> <dd>Shipped</dd></div>
  </dl>

  <table>
    <caption>Items in this order</caption>
    <thead>
      <tr><th scope="col">Item</th> <th scope="col">Qty</th> <th scope="col">Price</th></tr>
    </thead>
    <tbody>
      <tr><th scope="row">Wireless mouse</th> <td>1</td> <td>₹799</td></tr>
    </tbody>
  </table>

  <ul>
    <li>Wireless mouse</li>
    <li>USB receiver</li>
  </ul>

  <fieldset>
    <legend>Delivery speed</legend>
    <label><input type="radio" name="speed"> Standard (3–5 days)</label>
    <label><input type="radio" name="speed"> Express (next day)</label>
  </fieldset>
</main>
<aside aria-label="Order help">…</aside>
<footer>…</footer>`,
    explanation:
      'The same design, built with the elements that carry the structure. <header>, the site <nav> and the "Breadcrumb" <nav>, <main>, <aside> and <footer> are landmarks; the cards are plain <div>s, since their <h2>s already give them structure; <h1>/<h2> fill the headings list; <table> with <caption> and <th scope> reads each cell with its headers; <ul> says "list with 3 items"; and <fieldset>/<legend> announces "Delivery speed, grouping" before the options. For the <dl>, NVDA says "list with 6 items" and does not name terms and values, but the pairs stay together inside one list and the term/definition roles are in the accessibility tree for tools that use them.',
    interactiveType: 'info-relationships',
  },
  testingSteps: [
    'Turn off CSS (or use reader view) and check the structure still makes sense.',
    "Check regions that look like a header, navigation, sidebar or footer are landmarks, using the screen reader's landmarks list.",
    'Check text that looks like a heading uses <h1>–<h6> (or role="heading" with aria-level) at a logical level.',
    'Check lists use <ul>/<ol>/<li>, label-value pairs use <dl>/<dt>/<dd>, and data tables use <th>, scope and <caption>.',
    'Check related form controls, such as radio buttons, are grouped with <fieldset>/<legend> (or role="group" with a name).',
  ],
  impactedUsers: [
    'Blind screen-reader users',
    'Users with low vision using custom stylesheets',
    'Users with cognitive disabilities using reader modes',
    'Voice-control users who select fields by their label',
  ],
})

/* ------------------------------------------------------------------ */
/* 1.3.2 Meaningful Sequence                                           */
/* ------------------------------------------------------------------ */

const meaningfulSequence = defineCriterion({
  id: '1.3.2',
  name: 'Meaningful Sequence',
  version: '2.0',
  level: 'A',
  principle: 'Perceivable',
  risk: 'Medium',
  description:
    'When the order of content affects its meaning, the correct reading order is available in code (the DOM), not just in the visual layout.',
  failExample: {
    codeSnippet: `<!-- Looks like three cards. The DOM is three rows. -->
<div class="grid grid-cols-3">
  <span aria-hidden="true">…</span>
  <span aria-hidden="true">…</span>
  <span aria-hidden="true">…</span>
</div>
<div class="grid grid-cols-3">
  <h5>Fast</h5> <h5>Secure</h5> <h5>Offline</h5>
</div>
<div class="grid grid-cols-3">
  <p>Pages load in under a second.</p>
  <p>Your data is encrypted end to end.</p>
  <p>Keep working without a connection.</p>
</div>`,
    explanation:
      'Splitting the cards into rows made the columns easy to line up, but screen readers follow the DOM: they read all three titles, then all three descriptions. Listeners have to remember which description goes with "Secure". (The icons are decorative and hidden with aria-hidden, so they are not read at all.) The rows also cannot stack into single cards on a narrow screen.',
    interactiveType: 'reading-order',
  },
  passExample: {
    codeSnippet: `<ul class="grid @min-[18rem]:grid-cols-3">
  <li>
    <span aria-hidden="true">…</span>
    <h5>Fast</h5>
    <p>Pages load in under a second.</p>
  </li>
  <li>
    <span aria-hidden="true">…</span>
    <h5>Secure</h5>
    <p>Your data is encrypted end to end.</p>
  </li>
  …
</ul>`,
    explanation:
      'Each card is one element holding its own icon, title and description, so the reading order matches the visual grouping. The same markup stacks cleanly on narrow screens. To rearrange a layout, change the source order or the grid, not the grouping, and avoid CSS order, row-reverse or absolute positioning.',
    interactiveType: 'reading-order',
  },
  testingSteps: [
    'Turn off CSS and compare the reading order with the visual order.',
    'Read the page continuously with a screen reader and check the order makes sense.',
    'Search the CSS for order, flex-direction: *-reverse, grid placement and absolute positioning that reorders content.',
    'Check multi-column layouts and layout tables are read in the intended sequence.',
  ],
  impactedUsers: [
    'Blind screen-reader users',
    'Keyboard users (focus follows the DOM, see also 2.4.3)',
    'Users with low vision whose zoomed layout follows DOM order',
    'Users with cognitive disabilities using text-to-speech',
  ],
})

/* ------------------------------------------------------------------ */
/* 1.3.3 Sensory Characteristics                                       */
/* ------------------------------------------------------------------ */

const sensoryCharacteristics = defineCriterion({
  id: '1.3.3',
  name: 'Sensory Characteristics',
  version: '2.0',
  level: 'A',
  principle: 'Perceivable',
  risk: 'Medium',
  description:
    'Instructions do not rely only on sensory characteristics such as shape, colour, size, visual location, orientation or sound.',
  failExample: {
    codeSnippet: `<p>Click the round button on the right to continue.</p>
<button type="button" class="rounded-full">Next</button>`,
    explanation:
      'A screen reader announces each button by its name, never its shape or position, so its users can\'t tell which one is "round" or "on the right". Sighted users can be misled too: on a phone the buttons stack vertically, so nothing is "on the right" any more.',
    interactiveType: 'instructions',
  },
  passExample: {
    codeSnippet: `<p>Select <strong>Next</strong> (the round button on the right) to continue.</p>
<button type="button" class="rounded-full">Next</button>`,
    explanation:
      'The instruction names the button by its visible label, "Next", so it works with a screen reader and in any layout. The shape and position can stay as extra help for sighted users.',
    interactiveType: 'instructions',
  },
  testingSteps: [
    'Find every instruction on the page, including error messages and help text.',
    'Check each one identifies things by name or label, not only by shape, colour, size, position or sound.',
    'Check at narrow widths and high zoom, where "on the right" or "below" may no longer be true.',
    'Check every audio cue has a visible, text equivalent.',
  ],
  impactedUsers: [
    'Blind screen-reader users',
    'Users with low vision using magnification',
    'Deaf and hard-of-hearing users (sound-only cues)',
    'Users with colour-vision deficiencies',
    'Mobile users whose layout differs from desktop',
  ],
})

/* ------------------------------------------------------------------ */
/* 1.3.4 Orientation                                                   */
/* ------------------------------------------------------------------ */

const orientation = defineCriterion({
  id: '1.3.4',
  name: 'Orientation',
  version: '2.1',
  level: 'AA',
  principle: 'Perceivable',
  risk: 'Medium',
  description:
    'Content does not restrict its view and operation to a single display orientation, such as portrait or landscape, unless a specific orientation is essential.',
  failExample: {
    codeSnippet: `/* Keep the portrait layout no matter how the device is held */
@media (orientation: landscape) {
  .app {
    width: 100vh;
    height: 100vw;
    transform: rotate(-90deg); /* forced back to portrait */
  }
}

/* Or: hide everything behind "Please rotate your device" */`,
    explanation:
      'When the phone is turned to landscape, the app turns its portrait layout on its side, so the messages and the input are sideways. Users whose phone or tablet is mounted in landscape, on a wheelchair or a bed stand, cannot turn it back and cannot use the app.',
    interactiveType: 'orientation',
  },
  passExample: {
    codeSnippet: `.app {
  display: grid;
  grid-template-columns: 1fr;        /* portrait: conversation only */
}

@media (orientation: landscape) {
  .app {
    grid-template-columns: 38% 1fr;  /* landscape: chats beside it */
  }
}`,
    explanation:
      'The same grid adapts to the shape of the screen. In landscape it gains a chats column instead of assuming a tall, narrow screen, and nothing asks the user to rotate. Locking orientation is only allowed when it is essential, such as a piano app or a cheque-scanning camera.',
    interactiveType: 'orientation',
  },
  testingSteps: [
    'Open the page on a phone or tablet (or DevTools device mode) in portrait and in landscape.',
    'Confirm all content and functionality are available in both orientations.',
    'Search the code for screen.orientation.lock, orientation media queries that hide content, and "rotate your device" messages.',
    'For installable web apps, check the manifest "orientation" setting.',
  ],
  impactedUsers: [
    'Users with devices mounted on wheelchairs, beds or stands',
    "Users with limited dexterity who can't rotate a device",
    'Users with low vision who prefer one orientation for larger text',
  ],
})

/* ------------------------------------------------------------------ */
/* 1.3.5 Identify Input Purpose                                        */
/* ------------------------------------------------------------------ */

const identifyInputPurpose = defineCriterion({
  id: '1.3.5',
  name: 'Identify Input Purpose',
  version: '2.1',
  level: 'AA',
  principle: 'Perceivable',
  risk: 'Low',
  description:
    'Form fields that collect information about the user (name, email, address, phone and the other purposes listed in WCAG) identify their purpose in code, usually with the correct autocomplete value.',
  failExample: {
    codeSnippet: `<label for="first">First name</label>
<input id="first" name="field_1" type="text">

<label for="email">Email</label>
<input id="email" name="field_2" type="email">

<label for="phone">Phone</label>
<input id="phone" name="field_3" type="tel">`,
    explanation:
      'Nothing in the code says these fields ask for the user\'s own first name, email and phone number. type="email" and type="tel" only describe the format, not whose details they are. Browsers and password managers have to guess from the label text, and often fill nothing or the wrong thing, so users must remember and type everything themselves.',
    interactiveType: 'autocomplete',
  },
  passExample: {
    codeSnippet: `<label for="first">First name</label>
<input id="first" name="given-name" type="text" autocomplete="given-name">

<label for="email">Email</label>
<input id="email" name="email" type="email" autocomplete="email">

<label for="phone">Phone</label>
<input id="phone" name="tel" type="tel" autocomplete="tel">`,
    explanation:
      'Standard tokens from the HTML spec state each field\'s purpose. Browser autofill and password managers use them to fill in saved details, so users with memory or cognitive disabilities do not have to recall and retype them, and personalisation tools can add familiar icons. This only applies to information about the user themselves, not, for example, a gift recipient\'s address.',
    interactiveType: 'autocomplete',
  },
  testingSteps: [
    "List every field that collects the user's own personal information.",
    'Check each one has the correct autocomplete value (e.g. name, given-name, email, tel, street-address, postal-code).',
    'Check for misspelled or invented values (e.g. "phone" instead of "tel").',
    'Check autocomplete="off" is not used on these fields.',
    'Try browser autofill and confirm the right values go into the right fields.',
  ],
  impactedUsers: [
    'Users with motor impairments (less typing)',
    'Users with cognitive or memory disabilities',
    'Users with dyslexia',
    'Users of symbol-based personalisation tools',
  ],
})

/* ------------------------------------------------------------------ */
/* 1.4.1 Use of Color                                                  */
/* ------------------------------------------------------------------ */

const useOfColor = defineCriterion({
  id: '1.4.1',
  name: 'Use of Color',
  version: '2.0',
  level: 'A',
  principle: 'Perceivable',
  risk: 'High',
  description:
    'Colour is not the only visual means of conveying information, indicating an action, prompting a response or distinguishing an element.',
  failExample: {
    codeSnippet: `<!-- Error shown only by a red border -->
<label for="email">Email</label>
<input id="email" style="border-color: #dc2626">

<!-- Link shown only by colour: #2563eb vs #1f2937 text = 2.84:1 -->
<p style="color: #1f2937">
  Read our <a href="/terms" style="color: #2563eb; text-decoration: none">terms</a>.
</p>`,
    explanation:
      "Users who can't tell red apart can't see that the field has an error, and a screen reader announces nothing. The link differs from the text around it only by hue, and at 2.84:1 against that text it doesn't even meet the 3:1 exception for colour-only links.",
    interactiveType: 'color-only',
  },
  passExample: {
    codeSnippet: `<label for="email">Email</label>
<input id="email" aria-invalid="true" aria-describedby="email-error"
       style="border: 2px solid #dc2626">
<p id="email-error">
  <svg aria-hidden="true"><!-- warning icon --></svg>
  Error: Enter an email address like name@example.com
</p>

<p>Read our <a href="/terms" style="text-decoration: underline">terms</a>.</p>`,
    explanation:
      'The error now has an icon and a text message, linked to the field with aria-describedby, so it is seen and announced. The link is underlined. Colour still helps, but it is no longer the only cue.',
    interactiveType: 'color-only',
  },
  testingSteps: [
    'View the page in greyscale (DevTools → Rendering → Emulate vision deficiencies → Achromatopsia).',
    'Check errors, required fields, links, selected states, status indicators and chart series are still distinguishable.',
    'Check links in text are underlined, or have 3:1 contrast with the text around them plus a non-colour cue on hover and focus.',
    'Check charts use labels, patterns or shapes as well as colour.',
  ],
  impactedUsers: [
    'Users with colour-vision deficiencies (about 1 in 12 men and 1 in 200 women)',
    'Blind screen-reader users (colour is not announced)',
    'Users with low vision',
    'Users on monochrome displays or in bright sunlight',
  ],
})

/* ------------------------------------------------------------------ */
/* 1.4.2 Audio Control                                                 */
/* ------------------------------------------------------------------ */

const audioControl = defineCriterion({
  id: '1.4.2',
  name: 'Audio Control',
  version: '2.0',
  level: 'A',
  principle: 'Perceivable',
  risk: 'Critical',
  description:
    'If audio plays automatically for more than 3 seconds, there is a way to pause or stop it, or to control its volume separately from the system volume.',
  failExample: {
    codeSnippet: `<!-- Background music starts on page load, no controls -->
<audio src="ambient-loop.mp3" autoplay loop></audio>

<!-- Hero video with sound and no controls -->
<video src="brand-film.mp4" autoplay></video>`,
    explanation:
      "The music talks over the screen reader, so a blind user may not be able to hear it well enough to find a way to stop the music, and there are no controls anyway. Browsers often block autoplay with sound, but not always (for example after the user has interacted with the site), so don't rely on it.",
    interactiveType: 'audio-control',
  },
  passExample: {
    codeSnippet: `<!-- Don't autoplay sound: let users start it -->
<audio src="ambient-loop.mp3" controls loop></audio>

<!-- Autoplaying video is muted and has controls -->
<video src="brand-film.mp4" autoplay muted playsinline controls></video>`,
    explanation:
      'Audio only plays when the user chooses to play it. The hero video starts muted and shows its controls. If a page must autoplay sound, put a clearly labelled pause or mute button at the very start of the page so it is found first.',
    interactiveType: 'audio-control',
  },
  testingSteps: [
    'Load each page with sound on and note any audio that starts by itself.',
    'If it lasts more than 3 seconds, check for a pause/stop button or a separate volume control.',
    'Check that control is near the start of the page and works with the keyboard and a screen reader.',
    'Repeat with a screen reader running and confirm you can still hear its speech.',
  ],
  impactedUsers: [
    'Blind screen-reader users',
    'Users with hearing aids or sound sensitivity',
    'Users with attention or cognitive disabilities',
    'Anyone in a quiet environment',
  ],
})

/* ------------------------------------------------------------------ */
/* 1.4.4 Resize Text                                                   */
/* ------------------------------------------------------------------ */

const resizeText = defineCriterion({
  id: '1.4.4',
  name: 'Resize Text',
  version: '2.0',
  level: 'AA',
  principle: 'Perceivable',
  risk: 'High',
  description:
    'Text (except captions and images of text) can be resized up to 200% without assistive technology and without loss of content or functionality.',
  failExample: {
    codeSnippet: `<!-- Blocks pinch-zoom on mobile -->
<meta name="viewport"
      content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">

<style>
  h1 { font-size: 4vw; }   /* doesn't grow with browser zoom */
  .card {
    height: 120px;          /* fixed height... */
    overflow: hidden;       /* ...cuts off the enlarged text */
  }
</style>`,
    explanation:
      "The viewport tag stops mobile users from pinch-zooming. Text sized only in vw stays the same size when the browser zooms, because the viewport shrinks as zoom grows. The fixed-height card cuts off text as soon as it gets bigger.",
    interactiveType: 'text-resize',
  },
  passExample: {
    codeSnippet: `<meta name="viewport" content="width=device-width, initial-scale=1">

<style>
  h1 { font-size: 2.5rem; }   /* scales with zoom and the user's font setting */
  .card {
    min-height: 7.5rem;       /* grows with its content */
  }
</style>`,
    explanation:
      "The viewport tag allows zoom. rem units follow both browser zoom and the user's default font size. min-height lets the card grow instead of cutting off text.",
    interactiveType: 'text-resize',
  },
  testingSteps: [
    'Zoom the browser to 200% (Ctrl/Cmd +) and check no text is cut off, overlapping or hidden.',
    'Set the browser default font size to its largest, or use text-only zoom (Firefox: View → Zoom → Zoom Text Only).',
    'On mobile, check pinch-zoom works.',
    'Check the viewport meta tag does not set user-scalable=no or maximum-scale=1.',
    'Check every control still works at 200%.',
  ],
  impactedUsers: [
    'Users with low vision',
    'Older users',
    'Users with dyslexia or cognitive disabilities who read better at larger sizes',
    'Users on small, high-density screens',
  ],
})

/* ------------------------------------------------------------------ */
/* 1.4.5 Images of Text                                                */
/* ------------------------------------------------------------------ */

const imagesOfText = defineCriterion({
  id: '1.4.5',
  name: 'Images of Text',
  version: '2.0',
  level: 'AA',
  principle: 'Perceivable',
  risk: 'Medium',
  description:
    'If the text can be presented with real text, it is not shown as an image of text. Logos and images where the exact appearance is essential are exempt.',
  failExample: {
    codeSnippet: `<!-- The offer is baked into a JPEG -->
<img src="summer-sale-banner.jpg"
     alt="Summer sale: 30% off all shoes until 31 July">

<!-- A heading exported from a design tool as an image -->
<h2><img src="our-services-heading.png" alt="Our services"></h2>`,
    explanation:
      "Even with good alt text, text inside an image can't be resized without blurring, recoloured by high-contrast modes, restyled with the user's fonts or spacing, selected, or translated.",
    interactiveType: 'image',
  },
  passExample: {
    codeSnippet: `<section class="banner" style="background-image: url(summer-shoes.jpg)">
  <p class="banner__title">Summer sale</p>
  <p class="banner__offer">30% off all shoes until 31 July</p>
</section>

<h2 class="font-display text-3xl">Our services</h2>

<!-- Logos are exempt -->
<img src="acme-logo.svg" alt="Acme Shoes">`,
    explanation:
      'Real text styled with CSS (web fonts, colours, background images) looks just as good, but it stays sharp when zoomed and can be selected, translated and restyled. The logo is exempt.',
    interactiveType: 'image',
  },
  testingSteps: [
    'Zoom to 400% and look for blurry or pixelated text.',
    'Try selecting text with the mouse; image text cannot be selected.',
    'Turn on forced colours (Windows High Contrast) and check all text changes colour.',
    'Inspect images for embedded words, including in banners, buttons and headings.',
    'Allow the exceptions: logos, and images where the exact appearance is essential (e.g. a font sample).',
  ],
  impactedUsers: [
    'Users with low vision who zoom or use magnifiers',
    'Users who change colours, fonts or spacing (e.g. with dyslexia)',
    'Users of high-contrast modes',
    'Users who rely on translation tools',
  ],
})

/* ------------------------------------------------------------------ */
/* 1.4.10 Reflow                                                       */
/* ------------------------------------------------------------------ */

const reflow = defineCriterion({
  id: '1.4.10',
  name: 'Reflow',
  version: '2.1',
  level: 'AA',
  principle: 'Perceivable',
  risk: 'High',
  description:
    'Content can be shown at a width of 320 CSS pixels (400% zoom on a 1280px screen) without scrolling in two directions and without loss of content or functionality. Content that needs a two-dimensional layout, such as data tables, maps, diagrams and code, is exempt.',
  failExample: {
    codeSnippet: `.page {
  width: 1200px;          /* fixed width forces sideways scrolling */
}
.sidebar {
  float: left;
  width: 300px;
}
.article p {
  white-space: nowrap;    /* long lines never wrap */
}`,
    explanation:
      'At 400% zoom the viewport is only 320 CSS pixels wide, but the page is still 1200px wide. Users must scroll sideways for every line of text and constantly lose their place.',
    interactiveType: 'reflow',
  },
  passExample: {
    codeSnippet: `.page {
  max-width: 75rem;
  margin-inline: auto;
  padding-inline: 1rem;
}
.layout {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(18rem, 100%), 1fr));
  gap: 1.5rem;
}
.article p {
  overflow-wrap: break-word;  /* long URLs wrap instead of overflowing */
}`,
    explanation:
      'A flexible max-width and a grid that collapses to one column let content reflow at narrow widths, and long words wrap. Code blocks and data tables may still scroll on their own because they are exempt, which is what this lab\'s code blocks do.',
    interactiveType: 'reflow',
  },
  testingSteps: [
    'Set the browser window to 1280px wide and zoom to 400% (or use a 320px-wide responsive view).',
    'Scroll through the page: there should be no horizontal scrolling except for exempt content.',
    'Check nothing is cut off or overlapping, and all content is still reachable.',
    "Check sticky headers and footers don't take up most of the screen.",
    'Check menus, dialogs and forms still work.',
  ],
  impactedUsers: [
    'Users with low vision who zoom to 400%',
    'Users on small screens',
    'Users with cognitive disabilities who enlarge text',
  ],
})

/* ------------------------------------------------------------------ */
/* 1.4.11 Non-text Contrast                                            */
/* ------------------------------------------------------------------ */

const nonTextContrast = defineCriterion({
  id: '1.4.11',
  name: 'Non-text Contrast',
  version: '2.1',
  level: 'AA',
  principle: 'Perceivable',
  risk: 'High',
  description:
    'The visual parts needed to identify controls and their states (borders, focus indicators, checked states) and meaningful graphics (icons, chart lines) have at least 3:1 contrast against adjacent colours.',
  failExample: {
    codeSnippet: `<style>
  /* Pale input border: #d1d5db on white = 1.47:1 */
  input { border: 1px solid #d1d5db; }

  /* Selected option shown only by a faint tint: #eff6ff = 1.09:1 */
  .option[aria-checked="true"] { background: #eff6ff; }
</style>

<!-- Chart line: #fcd34d on white = 1.44:1 -->
<svg><polyline stroke="#fcd34d" points="..." /></svg>`,
    explanation:
      "Users with low vision can't find the edges of the input, can't tell which option is selected, and can barely see the chart line. All three are below the 3:1 minimum.",
    interactiveType: 'non-text-contrast',
  },
  passExample: {
    codeSnippet: `<style>
  /* #767676 on white = 4.54:1 */
  input { border: 1px solid #767676; }

  /* Selected option gets a strong border: #1d4ed8 = 6.16:1 on its tint */
  .option[aria-checked="true"] {
    border: 2px solid #1d4ed8;
    background: #eff6ff;
  }

  /* Focus indicator: #1d4ed8 on white = 6.70:1 */
  :focus-visible { outline: 3px solid #1d4ed8; outline-offset: 2px; }
</style>

<!-- Chart line: #b45309 on white = 5.02:1 -->
<svg><polyline stroke="#b45309" points="..." /></svg>`,
    explanation:
      'Every boundary, state indicator and graphic now has at least 3:1 contrast against what surrounds it. Disabled controls and purely decorative graphics are exempt.',
    interactiveType: 'non-text-contrast',
  },
  testingSteps: [
    'Find input and button boundaries (where needed to identify them), focus indicators, selected/checked states, meaningful icons and chart elements.',
    'Measure each against its adjacent colours with a contrast checker: at least 3:1.',
    'Check hover, focus, selected and error states, not just the default state.',
    'Remember disabled controls and decorative graphics are exempt.',
    'Repeat in dark mode and other themes.',
  ],
  impactedUsers: [
    'Users with low vision',
    'Users with colour-vision deficiencies',
    'Older users with reduced contrast sensitivity',
    'Anyone using a screen in glare or bright light',
  ],
})

/* ------------------------------------------------------------------ */
/* 1.4.12 Text Spacing                                                 */
/* ------------------------------------------------------------------ */

const textSpacing = defineCriterion({
  id: '1.4.12',
  name: 'Text Spacing',
  version: '2.1',
  level: 'AA',
  principle: 'Perceivable',
  risk: 'Medium',
  description:
    'No content or functionality is lost when users set line height to 1.5× the font size, paragraph spacing to 2×, letter spacing to 0.12× and word spacing to 0.16×.',
  failExample: {
    codeSnippet: `.button {
  width: 120px;
  height: 40px;           /* fixed box... */
  line-height: 40px;
  white-space: nowrap;
  overflow: hidden;       /* ...cuts off the wider text */
}
.card__summary {
  max-height: 3em;
  overflow: hidden;       /* hides the second line */
}`,
    explanation:
      'When a user applies wider spacing (common for people with dyslexia), the text no longer fits the fixed boxes and is cut off, so button labels and summaries become unreadable.',
    interactiveType: 'text-spacing',
  },
  passExample: {
    codeSnippet: `.button {
  min-height: 2.5rem;     /* grows instead of cutting off */
  padding: 0.5rem 1rem;
  line-height: 1.5;
}
.card__summary {
  /* No fixed max-height: the card grows with its text */
  line-height: 1.5;
}`,
    explanation:
      'min-height and padding replace fixed heights, and nothing hides overflowing text, so boxes grow when the user adds spacing. Nothing is lost and nothing overlaps.',
    interactiveType: 'text-spacing',
  },
  testingSteps: [
    'Apply the WCAG spacing values with a text-spacing bookmarklet or this stylesheet: * { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; } p { margin-bottom: 2em !important; }',
    'Check no text is cut off, truncated or overlapping.',
    'Pay attention to buttons, badges, tabs, navigation, tooltips and fixed-height cards.',
    'Repeat at mobile widths.',
  ],
  impactedUsers: [
    'Users with dyslexia',
    'Users with low vision',
    'Users with cognitive disabilities',
    'Users who apply custom stylesheets or reading extensions',
  ],
})

/* ------------------------------------------------------------------ */
/* 1.4.13 Content on Hover or Focus                                    */
/* ------------------------------------------------------------------ */

const contentOnHoverOrFocus = defineCriterion({
  id: '1.4.13',
  name: 'Content on Hover or Focus',
  version: '2.1',
  level: 'AA',
  principle: 'Perceivable',
  risk: 'Medium',
  description:
    'When hover or focus makes extra content appear (tooltips, popovers, submenus), it can be dismissed without moving the pointer or focus (e.g. with Esc), the pointer can move onto it without it disappearing, and it stays visible until the user dismisses it or moves away.',
  failExample: {
    codeSnippet: `function ShippingTip() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        Shipping info
      </button>
      {open && <div className="tooltip">Free over $50</div>}
    </>
  )
}`,
    explanation:
      "The tooltip only opens on mouse hover, so keyboard users never see it. It sits outside the hover area, so moving the pointer onto it (for example to magnify it) closes it. There's no way to dismiss it with Esc if it covers something.",
    interactiveType: 'hover-content',
  },
  passExample: {
    codeSnippet: `function ShippingTip() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  return (
    // The wrapper holds both trigger and tooltip, and positions the tooltip
    <span
      className="relative inline-block"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        aria-describedby="ship-tip"
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      >
        Shipping info
      </button>
      {/* Padding, not margin: the gap is part of the hover area */}
      <div className="absolute top-full left-0 pt-3" hidden={!open}>
        <div id="ship-tip" role="tooltip">Free over $50</div>
      </div>
    </span>
  )
}`,
    explanation:
      "It opens on hover and on keyboard focus. The pointer can move onto the tooltip because the wrapper contains both parts, and the gap below the button is the tooltip wrapper's padding rather than margin, so there is no dead zone on the way (hoverable). The wrapper is also the positioning context, so the tooltip opens right under the button. Esc closes it without moving the pointer or focus (dismissible). It stays until the user moves away (persistent). aria-describedby makes screen readers read the tip with the button.",
    interactiveType: 'hover-content',
  },
  testingSteps: [
    'Hover over each trigger, then move the pointer onto the popup: it should stay open.',
    'With the popup open, press Esc: it should close without moving the pointer or focus.',
    'Wait: it should not disappear on a timer.',
    'Tab to each trigger and check the content also appears on keyboard focus.',
    'Check the popup never permanently covers other content the user needs.',
  ],
  impactedUsers: [
    'Users with low vision using screen magnification',
    'Keyboard-only users',
    'Users with motor impairments such as tremors',
    'Users with cognitive disabilities who need more time to read',
  ],
})

/* ------------------------------------------------------------------ */
/* Export                                                              */
/* ------------------------------------------------------------------ */

export const perceivableCriteria: readonly CriterionData[] = [
  nonTextContent,
  audioOnlyVideoOnly,
  captionsPrerecorded,
  audioDescriptionOrAlternative,
  audioDescriptionPrerecorded,
  infoAndRelationships,
  meaningfulSequence,
  sensoryCharacteristics,
  orientation,
  identifyInputPurpose,
  useOfColor,
  audioControl,
  contrastMinimum,
  resizeText,
  imagesOfText,
  reflow,
  nonTextContrast,
  textSpacing,
  contentOnHoverOrFocus,
]
