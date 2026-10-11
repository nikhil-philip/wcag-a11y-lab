import { Bold, Download, FileText, Italic, Save, type LucideIcon } from 'lucide-react'
import { useId, useState } from 'react'
import type { DemoVariant } from './types'

const FOCUS = 'focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-blue-700'
const ICON_BUTTON = `inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-lg border-2 border-slate-500 bg-white text-slate-900 hover:bg-slate-100 ${FOCUS}`

const FILE_NAME = 'quarterly-report.txt'

// Intentional failure: the floppy disk that means "save" in the header means "download" in the editor.
const DOWNLOAD_ICON: Record<DemoVariant, LucideIcon> = { fail: Save, pass: Download }

export function ConsistentIdentificationDemo({ variant }: { variant: DemoVariant }) {
  const id = useId()
  const [status, setStatus] = useState({ text: '', surprise: false })
  const report = (text: string, surprise = false) => setStatus({ text, surprise })
  const DownloadIcon = DOWNLOAD_ICON[variant]

  const legend: { Icon: LucideIcon; where: string; does: string }[] = [
    { Icon: Save, where: 'Header', does: 'Save profile' },
    { Icon: DownloadIcon, where: 'Editor', does: 'Download file' },
  ]

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-slate-300 bg-white p-4">
      <p className="text-sm text-slate-700">
        Edit the document, then use the editor's toolbar to save your changes.
      </p>

      <div className="overflow-hidden rounded-lg border border-slate-300">
        {/* Header navbar */}
        <div className="flex flex-wrap items-end justify-between gap-2 border-b border-slate-300 bg-slate-100 p-3">
          <div className="flex min-w-0 flex-col gap-1">
            <label htmlFor={`${id}-name`} className="text-xs font-semibold text-slate-700">
              Display name
            </label>
            <input
              id={`${id}-name`}
              type="text"
              autoComplete="name"
              defaultValue="Asha Rao"
              className={`min-h-11 w-40 max-w-full rounded-lg border-2 border-slate-500 bg-white px-2 text-sm text-slate-900 ${FOCUS}`}
            />
          </div>
          <button type="button" aria-label="Save profile" onClick={() => report('Profile saved.')} className={ICON_BUTTON}>
            <Save className="size-5" aria-hidden="true" />
          </button>
        </div>

        {/* Document editor */}
        <div className="flex flex-col gap-2 bg-white p-3">
          <div role="toolbar" aria-label="Document" className="flex items-center gap-1">
            <p className="mr-auto flex min-w-0 items-center gap-1.5 text-sm font-semibold text-slate-900">
              <FileText className="size-4 shrink-0 text-slate-600" aria-hidden="true" />
              <span className="truncate">{FILE_NAME}</span>
            </p>
            <button type="button" aria-label="Bold" onClick={() => report('Bold applied.')} className={ICON_BUTTON}>
              <Bold className="size-5" aria-hidden="true" />
            </button>
            <button type="button" aria-label="Italic" onClick={() => report('Italic applied.')} className={ICON_BUTTON}>
              <Italic className="size-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label="Download file"
              onClick={() =>
                variant === 'fail'
                  ? report(`Downloaded ${FILE_NAME} to your computer. Your edits were not saved to the document.`, true)
                  : report(`Downloaded ${FILE_NAME} to your computer.`)
              }
              className={ICON_BUTTON}
            >
              <DownloadIcon className="size-5" aria-hidden="true" />
            </button>
          </div>
          <label htmlFor={`${id}-doc`} className="sr-only">
            Document text
          </label>
          <textarea
            id={`${id}-doc`}
            rows={3}
            defaultValue="Q3 revenue grew 12% on the back of strong online sales."
            className={`w-full resize-y rounded-lg border-2 border-slate-500 bg-white p-2 text-sm text-slate-900 ${FOCUS}`}
          />
        </div>
      </div>

      <p role="status" className={`min-h-5 text-sm font-semibold ${status.surprise ? 'text-red-800' : 'text-slate-900'}`}>
        {status.text}
      </p>

      <div>
        <p className="mb-2 text-xs font-semibold tracking-wide text-slate-600 uppercase">What the icons mean</p>
        <ul className="flex flex-col gap-1 text-sm text-slate-900">
          {legend.map(({ Icon, where, does }) => (
            <li key={where} className="flex items-center gap-2">
              <Icon className="size-4 shrink-0" aria-hidden="true" />
              <span>
                <span className="text-slate-600">{where}:</span> {does}
              </span>
            </li>
          ))}
        </ul>
        <p className={`mt-2 text-sm font-semibold ${variant === 'fail' ? 'text-red-800' : 'text-green-800'}`}>
          {variant === 'fail'
            ? 'The same floppy disk means "save" in one place and "download" in the other.'
            : 'Each icon has one meaning everywhere: the floppy disk saves, the tray arrow downloads.'}
        </p>
      </div>
    </div>
  )
}
