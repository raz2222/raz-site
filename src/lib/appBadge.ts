/** The number on the app icon, the way WhatsApp does it.
 *
 * The push notification is the loud channel and the ring on לוח בקרה is the
 * quiet one; this is the third · the one Raz sees without opening anything,
 * from the home screen, hours later.
 *
 * Support is narrower than it looks: iOS grants the Badging API only to a site
 * installed on the home screen and only once notifications are allowed, and a
 * browser may expose `setAppBadge` and still reject the call. So every path
 * here is guarded and none of them throws. A number on an icon is never worth
 * an exception escaping into React · that is exactly how the admin went black
 * once already.
 */

type BadgeCapableNavigator = Navigator & {
  setAppBadge?: (count?: number) => Promise<void>
  clearAppBadge?: () => Promise<void>
}

export function supportsAppBadge(): boolean {
  return typeof navigator !== "undefined" && "setAppBadge" in navigator
}

/** Zero clears the badge rather than drawing a "0", which is what every native
 * app does and what the API asks for. */
export function setAppBadge(count: number): void {
  if (typeof navigator === "undefined") return
  const nav = navigator as BadgeCapableNavigator

  try {
    if (count > 0) {
      nav.setAppBadge?.(count)?.catch(() => {})
    } else {
      nav.clearAppBadge?.()?.catch(() => {})
    }
  } catch {
    // A browser that lists the method and refuses the call. Nothing to do and
    // nothing worth reporting: the count is still on screen in the nav.
  }
}

export function clearAppBadge(): void {
  setAppBadge(0)
}
