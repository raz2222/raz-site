/* Push notifications, and deliberately nothing else.
 *
 * There is no `fetch` handler here and there must not be one. A service worker
 * that answers fetches is a cache that outlives every deploy, and this site
 * already spent an afternoon on a black screen caused by a browser holding an
 * index.html older than the bundles it pointed at. A worker that only listens
 * for push cannot serve anything stale, because it never serves anything.
 *
 * skipWaiting and claim so a new version takes over immediately rather than
 * waiting for every tab to close, which on a home-screen app can be days. */
self.addEventListener("install", () => self.skipWaiting())
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()))

self.addEventListener("push", (event) => {
  let payload = {}
  try {
    payload = event.data ? event.data.json() : {}
  } catch {
    payload = { body: event.data ? event.data.text() : "" }
  }

  const title = payload.title || "RAZ"
  const options = {
    body: payload.body || "",
    // The site's own icon, so the notification is recognisably his.
    icon: "/apple-touch-icon.png?v=5",
    badge: "/favicon-32x32.png?v=5",
    dir: "rtl",
    lang: "he",
    // One tag per notification id, so two pushes about the same thing collapse
    // into one line rather than stacking.
    tag: payload.tag || "raz-admin",
    data: { url: payload.url || "/admin" },
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener("notificationclick", (event) => {
  event.notification.close()
  const target = (event.notification.data && event.notification.data.url) || "/admin"

  // Focus the app if it is already open · opening a second window of a
  // home-screen app is disorienting · and only otherwise open a new one.
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((windows) => {
      for (const client of windows) {
        if (client.url.includes("/admin") && "focus" in client) {
          if ("navigate" in client) client.navigate(target).catch(() => {})
          return client.focus()
        }
      }
      return self.clients.openWindow(target)
    })
  )
})
