/** What went wrong, in words, when one of our own API routes fails.
 *
 * Both send buttons used to do `await res.json()` and show `data.error`. That
 * works for an error the route chose to return, and not at all for a route that
 * crashed before it could return anything: the body is then a stack trace or an
 * HTML page, so the parse either threw (and the alert never appeared) or yielded
 * nothing (and the alert said "sending failed" with no clue). A function that
 * would not even start looked exactly like a wrong email address.
 *
 * So: read the body as text once, try to read our own shape out of it, and
 * otherwise say plainly that the server failed and show its status. */
export async function apiErrorMessage(res: Response, fallback: string): Promise<string> {
  const body = await res.text().catch(() => "")

  try {
    const parsed = JSON.parse(body) as { error?: string; detail?: string }
    if (parsed?.error) return parsed.detail ? `${parsed.error} · ${parsed.detail}` : parsed.error
  } catch {
    // Not our JSON. Fall through to the status, which is the informative part.
  }

  if (res.status === 401) return "פג תוקף ההתחברות. רענן את הדף והתחבר שוב."
  if (res.status >= 500) return `${fallback} · תקלת שרת (${res.status}). זו לא טעות שלך, זה צד השרת.`
  return `${fallback} (${res.status})`
}
