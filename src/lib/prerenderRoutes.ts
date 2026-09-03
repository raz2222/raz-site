import { publishedGuidesEn } from "./guidesEn"
import { SERVICE_HUBS_EN, SUB_SERVICES_EN } from "./servicesEn"
import type { SsrData } from "./ssrData"

// Every route scripts/prerender.mjs generates a static snapshot for.
//
// Excluded: "/" (served from dist/index.html itself, handled separately),
// /admin/* and /portal/* (private), /thank-you (post-submit only) and /gift
// (deliberately noindex).
//
// Routes whose content comes from Supabase are only listed when that content
// was actually fetched. If a deploy can't reach Supabase, prerendering them
// would ship a page that is empty apart from nav chrome — under a real title,
// which reads as thin content and is worse than falling through to the
// client-rendered SPA shell.
const STATIC_CONTENT_ROUTES = [
  // Hebrew: copy lives in siteContentDefaults.ts, not Supabase.
  "/about",
  "/contact",
  "/privacy",
  "/terms",
  "/tools",
  "/experiments",
  // English: copy lives in guidesEn.ts / servicesEn.ts, bundled at build time.
  "/en",
  "/en/about",
  "/en/contact",
  "/en/experiments",
  "/en/guides",
  "/en/services",
  "/en/faq",
]

export function listPrerenderRoutes(data: SsrData = {}): string[] {
  const routes = [...STATIC_CONTENT_ROUTES]

  const guides = data.guides ?? []
  const projects = data.projects ?? []
  const serviceHubs = data.serviceHubs ?? []
  const subServices = data.subServices ?? []
  const faqGroups = data.faqGroups ?? []

  if (guides.length) {
    const hasTutorials = guides.some((g) => (g.kind ?? "article") === "tutorial")
    routes.push("/guides")
    if (hasTutorials) routes.push("/tutorials")
    for (const guide of guides) {
      if (guide.slug) routes.push(`/${(guide.kind ?? "article") === "tutorial" ? "tutorials" : "guides"}/${guide.slug}`)
    }
  }

  if (projects.length) {
    routes.push("/work", "/en/work")
    for (const project of projects) {
      if (!project.slug) continue
      routes.push(`/work/${project.slug}`)
      routes.push(`/en/work/${project.slug}`)
    }
  }

  // The authority pages render the sub-service grid and their FAQ from
  // Supabase, so without that data they would be a headline and nothing else.
  if (subServices.length) {
    routes.push("/ai-creative", "/web-development")
  }

  if (serviceHubs.length && subServices.length) {
    routes.push("/services")
    for (const hub of serviceHubs) {
      if (hub.slug) routes.push(`/services/${hub.slug}`)
    }
    for (const sub of subServices) {
      if (sub.slug && sub.hub_slug) routes.push(`/services/${sub.hub_slug}/${sub.slug}`)
    }
  }

  // The Hebrew FAQ hub merges faq_groups with the per-sub-service FAQs.
  if (faqGroups.length && subServices.length) {
    routes.push("/faq")
  }

  // English service and guide content is static in the bundle, so these
  // prerender even when Supabase is unreachable.
  for (const guide of publishedGuidesEn()) {
    routes.push(`/en/guides/${guide.slug}`)
  }
  for (const hub of SERVICE_HUBS_EN) {
    routes.push(`/en/services/${hub.slug}`)
  }
  for (const sub of SUB_SERVICES_EN) {
    routes.push(`/en/services/${sub.hubSlug}/${sub.slug}`)
  }

  return [...new Set(routes)]
}
