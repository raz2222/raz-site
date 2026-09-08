/** A post handed to the admin from another app's share sheet.
 *
 * There is no way to read a Facebook group · no API exists · so the post has to
 * arrive from Raz's own phone. The share sheet is the shortest path that does
 * not involve a robot logged in as him: he taps share on a post and the admin
 * opens with whatever the sheet gave, already analysed.
 *
 * What it gives varies, which is the whole reason this is parsed rather than
 * read. Android's Web Share Target fills `text` and `url` separately. iOS
 * Shortcuts usually hand over one blob with the link inside it, and the
 * Facebook app very often shares only a permalink with no body at all. Each of
 * those has to land somewhere sensible rather than in the wrong field. */

export type SharedPost = { text: string; url: string }

const URL_PATTERN = /https?:\/\/\S+/

export function parseSharedPost(search: string): SharedPost | null {
  const params = new URLSearchParams(search)
  const title = (params.get("title") ?? "").trim()
  let text = (params.get("text") ?? "").trim()
  let url = (params.get("url") ?? "").trim()

  // A share that carried no text at all · the Facebook app's usual behaviour ·
  // still has a title worth keeping.
  if (!text && title) text = title

  // One blob with the link inside it: pull the link out so the post URL field
  // gets it, and leave the body without a stray link at the end.
  if (!url) {
    const found = text.match(URL_PATTERN)?.[0]
    if (found) {
      url = found
      text = text.replace(found, "").trim()
    }
  }

  if (!text && !url) return null
  return { text, url }
}
