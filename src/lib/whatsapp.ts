import { attributionTag } from "./attribution"

export const WHATSAPP_BASE_URL = "https://wa.me/972506944443"

// An empty WhatsApp thread is a real drop-off point: people tap the button, land on a
// blank chat and close it. Prefilling an opener removes that hesitation, and appending
// the campaign tag is the only way a WhatsApp lead can be traced back to the ad that
// produced it (WhatsApp itself reports nothing back to the site).
const DEFAULT_OPENER = {
  he: "היי רז, הגעתי מהמודעה ואשמח לשמוע פרטים.",
  en: "Hi Raz, I came from your ad and I'd like to hear more.",
}

export function whatsappHref(opts?: { message?: string; isEnglish?: boolean; baseUrl?: string }) {
  // baseUrl can come from editable site content, so drop any query it already carries
  // rather than producing a second "?text=" that WhatsApp would ignore.
  const base = (opts?.baseUrl || WHATSAPP_BASE_URL).split("?")[0]
  const tag = attributionTag()
  // Page-specific message wins. Otherwise an opener is only worth adding when there's a
  // campaign tag to carry: organic visitors get the plain, untouched WhatsApp link.
  const message = opts?.message ?? (tag ? DEFAULT_OPENER[opts?.isEnglish ? "en" : "he"] : undefined)
  const body = [message, tag ? `[${tag}]` : null].filter(Boolean).join("\n\n")
  return body ? `${base}?text=${encodeURIComponent(body)}` : base
}
