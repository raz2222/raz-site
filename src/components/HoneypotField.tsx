/** A field only a bot fills in.
 *
 * The three contact forms all write straight into `leads` with the anon key,
 * which ships inside the bundle, so nothing in the browser can be the whole
 * defence · a trigger on the table and a rate limit on the notification
 * endpoint are the parts that hold. This is the cheap first filter, and it
 * costs a visitor nothing.
 *
 * Clipped rather than `display: none` or a negative offset: a hidden field is
 * the one thing the better scrapers know to skip, and the site is RTL, where an
 * element parked at -9999px is on the side the page can actually scroll to.
 * `aria-hidden` and `tabIndex={-1}` keep it away from a screen reader and out
 * of the tab order, and `autoComplete="off"` stops a browser from helpfully
 * filling it for a real person.
 *
 * The name matters: "website" is a field bots expect and fill. Nothing on the
 * site asks a visitor for their website, so anything arriving in it is a bot.
 */
export function HoneypotField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div aria-hidden="true" className="sr-only">
      <label htmlFor="contact-website">Website</label>
      <input
        id="contact-website"
        name="website"
        type="text"
        tabIndex={-1}
        autoComplete="off"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}
