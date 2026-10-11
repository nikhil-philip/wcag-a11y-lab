/**
 * Visible asterisk for a required field's label. Hidden from screen readers, which
 * hear "required" from the input's `required` attribute instead of "star".
 */
export function RequiredMark() {
  return (
    <span className="ml-0.5 text-red-700" aria-hidden="true">
      *
    </span>
  )
}

/** Explains the asterisk. Place it before the first field so it is read first. */
export function RequiredNote() {
  return (
    <p className="text-sm text-slate-700">
      Fields marked <span className="font-semibold text-red-700">*</span> are required.
    </p>
  )
}
