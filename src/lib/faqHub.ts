import { faqGroups } from "./faq"
import { subServices } from "./subServices"

export type FaqTopic =
  | "בניית אתרים"
  | "עיצוב"
  | "WordPress"
  | "איקומרס"
  | "AI"
  | "סרטוני AI"
  | "צילום AI"
  | "תהליך עבודה"
  | "מחירים"

export const FAQ_TOPICS: FaqTopic[] = [
  "בניית אתרים",
  "עיצוב",
  "WordPress",
  "איקומרס",
  "AI",
  "סרטוני AI",
  "צילום AI",
  "תהליך עבודה",
  "מחירים",
]

const SUBSERVICE_TOPIC: Record<string, FaqTopic> = {
  "site-design": "עיצוב",
  "creative-development": "עיצוב",
  "interactive-websites": "בניית אתרים",
  "ecommerce": "איקומרס",
  "landing-pages": "בניית אתרים",
  "wordpress-development": "WordPress",
  "custom-development": "בניית אתרים",
  "ai-functionality": "AI",
  "product-videos": "סרטוני AI",
  "campaign-visuals": "סרטוני AI",
  "social-content": "AI",
  "ai-photography": "צילום AI",
  "creative-direction": "AI",
  "concept-development": "AI",
}

export type FaqHubItem = { q: string; a: string; topic: FaqTopic; source?: string; sourceHref?: string }

const PRICE_KEYWORDS = ["עולה", "מחיר", "תקציב", "כלול במחיר"]

function inferTopic(q: string, fallback: FaqTopic): FaqTopic {
  if (PRICE_KEYWORDS.some((k) => q.includes(k))) return "מחירים"
  if (q.includes("זמן") || q.includes("תהליך") || q.includes("שלב")) return "תהליך עבודה"
  return fallback
}

export const faqHub: FaqHubItem[] = [
  ...faqGroups.flatMap((g) =>
    g.items.map((item) => ({
      q: item.q,
      a: item.a,
      topic: inferTopic(item.q, g.title === "אתרים ופיתוח" ? "בניית אתרים" : "AI"),
    }))
  ),
  ...subServices.flatMap((s) =>
    s.faq.map((f) => ({
      q: f.q,
      a: f.a,
      topic: inferTopic(f.q, SUBSERVICE_TOPIC[s.slug] ?? "בניית אתרים"),
      source: s.title,
      sourceHref: `/services/${s.hubSlug}/${s.slug}`,
    }))
  ),
]
