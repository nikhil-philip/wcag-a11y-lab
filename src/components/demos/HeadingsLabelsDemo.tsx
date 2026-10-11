import { useId, useState } from 'react'
import type { DemoVariant } from './types'

const FOCUS = 'focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-blue-700'
const CONTROL = `min-h-11 w-full rounded-lg border-2 border-slate-500 bg-white px-3 text-sm text-slate-900 ${FOCUS}`

// Same structure and markup in both versions (real headings, properly associated labels, so 1.3.1 is
// met); only the wording changes.
const TEXT: Record<
  DemoVariant,
  { account: string; email: string; language: string; notifications: string; orders: string; digest: string }
> = {
  // Intentional failure: headings and labels that don't say what they are for.
  fail: {
    account: 'Section 1',
    email: 'Text 1',
    language: 'Value',
    notifications: 'Section 2',
    orders: 'Option',
    digest: 'Number',
  },
  pass: {
    account: 'Account preferences',
    email: 'Email address',
    language: 'Preferred language',
    notifications: 'Notifications',
    orders: 'Email me when an order ships',
    digest: 'Summary emails per week (0–7)',
  },
}

export function HeadingsLabelsDemo({ variant }: { variant: DemoVariant }) {
  const id = useId()
  const t = TEXT[variant]
  const [saved, setSaved] = useState(false)

  // What a screen reader's headings and form-controls lists show for this form.
  const heard = [
    `heading level 5, "${t.account}"`,
    `"${t.email}", edit text`,
    `"${t.language}", combo box`,
    `heading level 5, "${t.notifications}"`,
    `"${t.orders}", checkbox`,
    `"${t.digest}", spin button`,
  ]

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-slate-300 bg-white p-4">
      <p className="text-sm text-slate-700">
        Read only the headings and field labels below. Could you tell what to change without seeing the values?
      </p>

      <form
        aria-label={`Settings (${variant} example)`}
        onSubmit={(e) => {
          e.preventDefault()
          setSaved(true)
        }}
        onChange={() => setSaved(false)}
        className="flex flex-col gap-4 rounded-lg border border-slate-300 bg-slate-50 p-3"
      >
        <section aria-labelledby={`${id}-account`} className="flex flex-col gap-3">
          <h5 id={`${id}-account`} className="text-base font-bold text-slate-900">
            {t.account}
          </h5>
          <div className="flex flex-col gap-1">
            <label htmlFor={`${id}-email`} className="text-sm font-semibold text-slate-900">
              {t.email}
            </label>
            <input id={`${id}-email`} type="email" autoComplete="email" defaultValue="asha@example.com" className={CONTROL} />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor={`${id}-lang`} className="text-sm font-semibold text-slate-900">
              {t.language}
            </label>
            <select id={`${id}-lang`} defaultValue="en" className={CONTROL}>
              <option value="en">English</option>
              <option value="hi" lang="hi">
                हिन्दी
              </option>
              <option value="ta" lang="ta">
                தமிழ்
              </option>
            </select>
          </div>
        </section>

        <section aria-labelledby={`${id}-notify`} className="flex flex-col gap-3">
          <h5 id={`${id}-notify`} className="text-base font-bold text-slate-900">
            {t.notifications}
          </h5>
          <label className="flex min-h-11 cursor-pointer items-center gap-2 text-sm text-slate-900">
            <input
              type="checkbox"
              defaultChecked
              className="size-5 shrink-0 accent-blue-700 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
            />
            {t.orders}
          </label>
          <div className="flex flex-col gap-1">
            <label htmlFor={`${id}-digest`} className="text-sm font-semibold text-slate-900">
              {t.digest}
            </label>
            <input id={`${id}-digest`} type="number" min={0} max={7} defaultValue={1} className={`${CONTROL} max-w-28`} />
          </div>
        </section>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            className={`inline-flex min-h-11 cursor-pointer items-center rounded-lg bg-blue-700 px-4 text-sm font-semibold text-white hover:bg-blue-800 ${FOCUS}`}
          >
            Save settings
          </button>
          <p role="status" className="text-sm font-medium text-green-800">
            {saved ? 'Settings saved.' : ''}
          </p>
        </div>
      </form>

      <div>
        <p className="mb-2 text-xs font-semibold tracking-wide text-slate-600 uppercase">
          Screen reader headings and form fields
        </p>
        <ol className="flex list-decimal flex-col gap-1 pl-5 font-mono text-sm text-slate-900">
          {heard.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ol>
        <p className={`mt-2 text-sm font-semibold ${variant === 'fail' ? 'text-red-800' : 'text-green-800'}`}>
          {variant === 'fail'
            ? 'The structure is there, but "Section 1", "Text 1" and "Value" say nothing about what they hold.'
            : 'Each heading names its topic and each label says what to enter, even heard out of context.'}
        </p>
      </div>
    </div>
  )
}
