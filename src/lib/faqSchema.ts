import type { FaqItem } from "./supabase"

// Guides carried Article and BreadcrumbList structured data but no FAQPage,
// while eight other page types on the site already had one. A guide answering
// "כמה עולה סרטון UGC" is exactly the shape a question query wants, so the
// answers are worth marking up. Note the answers must stay in the HTML: this
// accordion collapses them with grid-rows rather than removing them, which is
// what keeps the markup honest about what a reader can see.
export function faqPageJsonLd(items: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  }
}
