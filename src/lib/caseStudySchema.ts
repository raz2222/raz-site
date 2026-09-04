import type { ProjectRow } from "./supabase"

const SITE = "https://madebyraz.co.il"

// The six project pages shipped with no structured data at all, while every
// other page type on the site carries some. A case study is a described piece
// of work with a creator, a client and a date, which is what CreativeWork is
// for; Article would claim it is journalism and Product would claim Raz sells
// the project itself.
//
// Every field is omitted when empty rather than filled with a guess. Schema
// that overstates is worse than none: it is a machine-readable claim, and the
// portfolio only earns trust if what it asserts is true.
export function caseStudyJsonLd(project: ProjectRow, lang: "he" | "en") {
  const path = lang === "en" ? `/en/work/${project.slug}` : `/work/${project.slug}`
  const tech = [...(project.tech_stack ?? []), ...(project.ai_tools ?? [])].filter(Boolean)

  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    ...(project.overview ? { description: project.overview } : {}),
    url: `${SITE}${path}`,
    inLanguage: lang,
    creator: { "@type": "Person", name: "Raz Avramov", url: SITE },
    ...(project.year ? { dateCreated: String(project.year) } : {}),
    ...(project.category ? { genre: project.category } : {}),
    ...(tech.length ? { keywords: tech.join(", ") } : {}),
    // A named client is the strongest trust signal a portfolio piece carries,
    // so it is marked up when it exists and silently skipped when it does not.
    ...(project.client_name ? { sourceOrganization: { "@type": "Organization", name: project.client_name } } : {}),
    ...(project.role ? { creditText: project.role } : {}),
  }
}
