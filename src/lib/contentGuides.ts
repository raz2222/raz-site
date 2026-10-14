import type { GuideEn, GuideFaqEn, GuideSectionEn } from "./guidesEn"

// Guides written by the daily routine live one per file in content/guides,
// Hebrew and English together. A scheduled session can push to git but cannot
// reach Supabase, so the file is what it produces: scripts/sync-guides.mjs
// inserts the Hebrew half into the `guides` table at build time, and the
// English half is read here, at build time, into guidesEn.
//
// `format` is Raz's rhythm from 2026-10-14: one day a guide that answers a
// question someone types into Google, the next an informative one. The two
// alternate by date, and contentGuides.test.ts holds the queue to that.
export type ContentGuideFormat = "query" | "informative"

export type ContentGuide = {
  slug: string
  format: ContentGuideFormat
  title: string
  excerpt: string
  meta_description: string
  category: string
  related_service_slug: "web-design" | "ai-content" | null
  read_time: string
  date_published: string
  sections: { heading: string; paragraphs: string[] }[]
  faq: { q: string; a: string }[]
  en: {
    title: string
    excerpt: string
    category: string
    readTime: string
    sections: GuideSectionEn[]
    faq: GuideFaqEn[]
  }
}

export const CATEGORY_COVERS: Record<string, string> = {
  "אתרים ופיתוח": "/images/guides/cover-web-dev.png",
  "ויז'ואל ותוכן AI": "/images/guides/cover-ai-visual.png",
  "שדרוג אתרים": "/images/guides/cover-site-upgrades.png",
}

export const CATEGORY_EN: Record<string, string> = {
  "אתרים ופיתוח": "Websites & Development",
  "ויז'ואל ותוכן AI": "AI Visuals & Content",
  "שדרוג אתרים": "Website Upgrades",
}

const files = import.meta.glob<ContentGuide>("../../content/guides/*.json", { eager: true, import: "default" })

export const contentGuides: ContentGuide[] = Object.values(files).sort((a, b) =>
  a.date_published.localeCompare(b.date_published),
)

export function contentGuideToEn(g: ContentGuide): GuideEn {
  return {
    slug: g.slug,
    title: g.en.title,
    excerpt: g.en.excerpt,
    category: g.en.category,
    image: CATEGORY_COVERS[g.category],
    readTime: g.en.readTime,
    datePublished: g.date_published,
    ...(g.related_service_slug ? { relatedServiceSlug: g.related_service_slug } : {}),
    sections: g.en.sections,
    faq: g.en.faq,
  }
}
