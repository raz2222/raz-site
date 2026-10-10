/** "Tuesday 13/10, 14:00", always on Israel's clock: the call happens there,
 * whichever zone the visitor's browser thinks it is in. */
export function formatSlot(iso: string, lang: "he" | "en"): string {
  return new Intl.DateTimeFormat(lang === "he" ? "he-IL" : "en-GB", {
    timeZone: "Asia/Jerusalem",
    weekday: "long",
    day: "numeric",
    month: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso))
}
