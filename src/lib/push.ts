/** Turning phone notifications on, from the admin.
 *
 * iOS only delivers web push to a site installed on the home screen, which is
 * how Raz already runs the admin. Everything here is guarded: a browser that
 * refuses any part of this must leave the admin working, which is the lesson
 * the realtime badge taught the hard way. */

export type PushState = "unsupported" | "not-installed" | "off" | "on" | "blocked"

/** iOS grants Notification and PushManager only inside an installed app, so a
 * standalone check is what separates "cannot" from "not yet". */
export function isStandalone(): boolean {
  const iosStandalone = (window.navigator as unknown as { standalone?: boolean }).standalone
  return iosStandalone === true || window.matchMedia?.("(display-mode: standalone)").matches === true
}

export async function pushState(): Promise<PushState> {
  if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
    // On an iPhone this is what a Safari tab reports, so say the useful thing
    // rather than "unsupported": the same phone can do it once installed.
    return isStandalone() ? "unsupported" : "not-installed"
  }
  if (Notification.permission === "denied") return "blocked"
  if (Notification.permission !== "granted") return "off"

  try {
    const registration = await navigator.serviceWorker.getRegistration("/sw.js")
    const subscription = await registration?.pushManager.getSubscription()
    return subscription ? "on" : "off"
  } catch {
    return "off"
  }
}

/** Must be called from a click: iOS refuses a permission prompt that no gesture
 * asked for, and never asks again on that page load. */
export async function enablePush(): Promise<PushState> {
  if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
    return isStandalone() ? "unsupported" : "not-installed"
  }

  const permission = await Notification.requestPermission()
  if (permission === "denied") return "blocked"
  if (permission !== "granted") return "off"

  const keyResponse = await fetch("/api/push")
  if (!keyResponse.ok) return "off"
  const { publicKey } = (await keyResponse.json()) as { publicKey?: string }
  if (!publicKey) return "off"

  const registration = await navigator.serviceWorker.register("/sw.js")
  await navigator.serviceWorker.ready

  const existing = await registration.pushManager.getSubscription()
  const subscription =
    existing ??
    (await registration.pushManager.subscribe({
      // Required by every browser, and the only value Chrome accepts.
      userVisibleOnly: true,
      // .buffer, because the DOM types accept a BufferSource and a
      // Uint8Array<ArrayBufferLike> is not one of them.
      applicationServerKey: urlBase64ToUint8Array(publicKey).buffer as ArrayBuffer,
    }))

  const saved = await fetch("/api/push", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ subscription: subscription.toJSON(), userAgent: navigator.userAgent }),
  })
  return saved.ok ? "on" : "off"
}

export async function disablePush(): Promise<PushState> {
  try {
    const registration = await navigator.serviceWorker.getRegistration("/sw.js")
    const subscription = await registration?.pushManager.getSubscription()
    if (subscription) {
      await fetch("/api/push", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: subscription.endpoint }),
      })
      await subscription.unsubscribe()
    }
  } catch {
    // Nothing to take down, or a browser that will not let us. Either way the
    // server row is what decides whether anything is sent.
  }
  return "off"
}

/** The applicationServerKey has to be raw bytes; the server sends base64url. */
export function urlBase64ToUint8Array(base64Url: string): Uint8Array {
  const padded = base64Url.padEnd(base64Url.length + ((4 - (base64Url.length % 4)) % 4), "=")
  const binary = atob(padded.replace(/-/g, "+").replace(/_/g, "/"))
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i)
  return bytes
}
