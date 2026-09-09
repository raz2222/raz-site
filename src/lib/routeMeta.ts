import { publishedGuidesEn } from "./guidesEn"
import { findSubServiceEn, findServiceHubEn } from "./servicesEn"
import { getProjectTranslation, translateProjectTitle } from "./projectTranslations"
import type { SsrData } from "./ssrData"

// Resolves the <head> tags for a route at build time.
//
// useDocumentMeta/useHreflang set title, description, canonical and hreflang
// by mutating `document` inside a useEffect. React never runs effects during
// renderToString, so a prerendered page would otherwise inherit the
// homepage's <head> — real body content under a wrong title, which is worse
// than no prerendering at all. scripts/prerender.mjs calls this to patch each
// generated file's <head> instead.
//
// The strings here mirror what each page passes to useDocumentMeta. They are
// covered by src/lib/routeMeta.test.ts, so if a page's title changes without
// this being updated, the test fails rather than the two silently drifting.
export const SITE = "https://madebyraz.co.il"

export type RouteMeta = {
  title: string
  description?: string
  canonical: string
  /** Absolute og:image URL. Social crawlers don't run JS, so without this a
   *  shared guide link previews with the homepage image. */
  image?: string
  /** ISO date; when set the page is tagged og:type=article. */
  publishedTime?: string
  /** Hebrew and English counterparts, for <link rel="alternate" hreflang>. */
  alternates?: { he: string; en: string }
  lang: "he" | "en"
  dir: "rtl" | "ltr"
}

function absoluteImage(image?: string | null): string | undefined {
  if (!image) return undefined
  return image.startsWith("http") ? image : `${SITE}${image}`
}

type StaticEntry = {
  title: string
  description?: string
  /** Absolute URL. Only set where the page has a better share image than the site default. */
  image?: string
  alternates?: { he: string; en: string }
}

const HE_STATIC: Record<string, StaticEntry> = {
  // The homepage's <head> is index.html's own, not a generated snapshot, so
  // these two strings are that file's, copied exactly. They are here so the
  // homepage has the same override path as every other page; with nothing
  // written in the admin, patching the head with them is a no-op.
  "/": {
    title: "Made by RAZ | סרטוני AI, פרסומות AI ובניית אתרים",
    description:
      "סרטוני AI, פרסומות וקריאייטיב למותגים, לצד עיצוב ופיתוח אתרים. מעל 200 אתרים ו־6 שנות ניסיון בדיגיטל. בואו ניצור משהו שאי אפשר להתעלם ממנו.",
    image: `${SITE}/images/og-image.png`,
  },
  // Hardcoded rather than resolved from `projects`: /work/serve is its own page
  // (src/pages/case-studies/CaseStudyServe.tsx), not a row rendered by the
  // shared template, and it has no English mirror.
  "/work/serve": {
    title: "Serve · סרט המותג של Made by RAZ | קייס סטאדי",
    description:
      "איך נבנה סרט מותג של 26 שניות בלי סט ובלי צוות: קומפוזיציית המאסטר, האלמנטים והסצנות, שוט אחרי שוט.",
    image: `${SITE}/images/ai-campaign-ad-poster.jpg`,
  },
  "/work": {
    title: "עבודות · אתרים וקריאייטיב AI שבניתי | Made by RAZ",
    description: "כל הפרויקטים של רז אברמוב: אתרים, סרטי AI וקמפיינים ויזואליים.",
    alternates: { he: "/work", en: "/en/work" },
  },
  "/faq": {
    title: "שאלות ותשובות · בניית אתרים ותוכן AI | Made by RAZ",
    description:
      "כל השאלות והתשובות באתר במקום אחד: בניית אתרים, WordPress, איקומרס, תוכן AI, תהליך עבודה ומחירים.",
    alternates: { he: "/faq", en: "/en/faq" },
  },
  "/guides": {
    title: "בלוג · מחירים, השוואות ומדריכים לאתרים ותוכן AI | Made by RAZ",
    description:
      "תשובות אמיתיות על מחירים, לוחות זמנים ובחירה בין אפשרויות: בניית אתרים, WordPress, סרטוני AI ותוכן ויזואלי לעסקים.",
    alternates: { he: "/guides", en: "/en/guides" },
  },
  "/tutorials": {
    title: "מדריכים מעשיים · סרטוני AI, תמונות מוצר ותוכן ויזואלי | Made by RAZ",
    description:
      "מדריכים מעשיים לייצור סרטוני AI, תמונות מוצר ותוכן ויזואלי. איך עושים את זה בפועל, בלי קיצורי דרך.",
  },
  "/services": {
    // A directory, not a third claimant on "בניית אתרים לעסקים". The two hubs
    // it points at own that term and "סרטוני AI לעסקים" respectively.
    title: "שירותים · אתרים, סרטוני AI ותוכן ויזואלי | Made by RAZ",
    description:
      "שני תחומי עבודה ואיפה מתחילים בכל אחד: אתרים ופיתוח מצד אחד, סרטוני AI ותוכן ויזואלי למותגים מצד שני. כל תחום עם עמוד מלא ותת-שירותים.",
    alternates: { he: "/services", en: "/en/services" },
  },
  "/about": {
    title: "רז אברמוב · 200+ אתרים ו-6 שנות פיתוח | Made by RAZ",
    description: "רז אברמוב · מפתח קריאייטיב שעובד בצומת שבין עיצוב, טכנולוגיה ו-AI.",
    alternates: { he: "/about", en: "/en/about" },
  },
  "/contact": {
    title: "צור קשר · בניית אתרים ותוכן AI | Made by RAZ",
    description: "בואו נתחיל פרויקט: אתר, קמפיין AI או סרטון. חבילת יצירת תוכן AI כוללת סרטון מתנה.",
    alternates: { he: "/contact", en: "/en/contact" },
  },
  // These two were written as the authority pages for the head terms, and that
  // is exactly what put five pages in one fight: each head term was claimed by
  // the homepage, the /services hub, the matching sub-service, a guide, and one
  // of these. Google answers a crowd of weak claimants by ranking all of them
  // deep, which is what Search Console showed. The hubs own the head terms now,
  // because the sub-services link up into them and their titles are editable
  // from the admin without a deploy. These two keep a neighbouring intent
  // instead: the craft and the proof here, the stack there.
  // Their content is Supabase-backed, so listPrerenderRoutes only includes them
  // once that data is available.
  "/ai-creative": {
    title: "קריאייטיב AI למותגים · קונספט, בימוי ועבודות | Made by RAZ",
    description:
      "איך נראה קריאייטיב AI כשמישהו מביים אותו: פיתוח קונספט, שפה ויזואלית אחת לקמפיין ובימוי מקצה לקצה. העבודות עצמן, ומה עמד מאחורי כל אחת מהן.",
  },
  "/web-development": {
    title: "פיתוח אתרים ב-React ו-Next.js · קוד מותאם אישית | Made by RAZ",
    description:
      "פיתוח אתרים בקוד: React, Next.js, אינטגרציות ומערכות מותאמות אישית, לפרויקטים שתבנית מוכנה כבר לא מספיקה להם. מעל 200 אתרים ו-6 שנות פיתוח.",
  },
  "/privacy": {
    title: "מדיניות פרטיות · RAZ",
    description: "אילו פרטים נאספים באתר, איך הם נשמרים ומי רואה אותם.",
  },
  "/terms": {
    title: "תנאי שימוש · RAZ",
    description: "תנאי השימוש באתר ותנאי ההתקשרות לפרויקטים מול רז אברמוב.",
  },
  "/tools": {
    title: "הכלים והטכנולוגיות שאני עובד איתם | Made by RAZ",
    description:
      "הכלים שבהם אני משתמש בפועל: פיתוח, WordPress, יצירת תמונות ווידאו AI, אוטומציה, מקוטלגים לפי קטגוריה.",
  },
  "/experiments": {
    title: "ניסויים · עבודות AI אישיות ולא מסחריות | Made by RAZ",
    description:
      "עבודות AI קריאייטיביות של רז אברמוב: סרטים, אתרים מוזרים, דמויות ורעיונות קונספט, חלקן עבודות עצמאיות שלא הוזמנו על ידי לקוח.",
    alternates: { he: "/experiments", en: "/en/experiments" },
  },
}

const EN_STATIC: Record<string, StaticEntry> = {
  "/en": {
    title: "RAZ · Websites, Films & Visuals",
    description:
      "RAZ is a creative developer building digital experiences, websites and AI-powered visuals for brands that want to stand out.",
    alternates: { he: "/", en: "/en" },
  },
  "/en/work": {
    title: "Work · Websites and AI creative | Made by RAZ",
    description: "All of Raz Avramov's projects: websites, AI films and visual campaigns.",
    alternates: { he: "/work", en: "/en/work" },
  },
  "/en/faq": {
    title: "FAQ · RAZ",
    description:
      "Frequently asked questions about website development, WordPress, custom development, and AI content production for businesses.",
    alternates: { he: "/faq", en: "/en/faq" },
  },
  "/en/guides": {
    title: "Blog · Pricing, comparisons and guides | Made by RAZ",
    description:
      "Real guides on building websites, WordPress, AI-powered maintenance, and AI video for businesses. No empty marketing filler.",
    alternates: { he: "/guides", en: "/en/guides" },
  },
  "/en/services": {
    title: "Services · Web design and AI content for business | Made by RAZ",
    description:
      "Website building with AI and WordPress, and AI content creation, two areas of work, each with a full range of services.",
    alternates: { he: "/services", en: "/en/services" },
  },
  "/en/about": {
    title: "Raz Avramov · 200+ websites, 6 years building | Made by RAZ",
    description: "Raz Avramov · a creative developer working at the intersection of design, technology and AI.",
    alternates: { he: "/about", en: "/en/about" },
  },
  "/en/contact": {
    title: "Contact · Websites and AI content | Made by RAZ",
    description: "Start a project: website, AI campaign, or video. AI content packages include a free bonus film.",
    alternates: { he: "/contact", en: "/en/contact" },
  },
  "/en/experiments": {
    title: "Experiments · Personal AI work | Made by RAZ",
    description:
      "AI creative work by Raz Avramov: films, strange websites, characters, and concept ideas, some of them independent work not commissioned by a client.",
    alternates: { he: "/experiments", en: "/en/experiments" },
  },
}

/** Which `site_content` row overrides which Hebrew route. Only routes whose own
 * copy has been moved into the admin belong here. */
export const SEO_KEY_FOR_ROUTE: Record<string, string> = {
  "/": "seo_home",
  "/about": "seo_about",
  "/contact": "seo_contact",
  "/work": "seo_work",
  "/faq": "seo_faq",
  "/guides": "seo_guides",
  "/tutorials": "seo_tutorials",
}

function base(pathname: string, isEn: boolean): Omit<RouteMeta, "title" | "description" | "alternates"> {
  return {
    canonical: `${SITE}${pathname}`,
    lang: isEn ? "en" : "he",
    dir: isEn ? "ltr" : "rtl",
  }
}

/**
 * Returns the <head> metadata for a route, or null when the route has no
 * prerenderable metadata (unknown route, or content missing from `data`).
 * Returning null makes scripts/prerender.mjs skip the route rather than emit
 * a page under the wrong title.
 */
export function resolveRouteMeta(pathname: string, data: SsrData = {}): RouteMeta | null {
  const isEn = pathname === "/en" || pathname.startsWith("/en/")
  const meta = base(pathname, isEn)

  const staticEntry = isEn ? EN_STATIC[pathname] : HE_STATIC[pathname]
  if (staticEntry) {
    // A title written in the admin wins over the one in this file, but only
    // when it is actually filled in. This is the layer crawlers read, so an
    // empty box must never blank a working title.
    const written = !isEn ? data.pageSeo?.[SEO_KEY_FOR_ROUTE[pathname] ?? ""] : undefined
    return {
      ...meta,
      ...staticEntry,
      ...(written?.meta_title?.trim() ? { title: written.meta_title.trim() } : {}),
      ...(written?.meta_description?.trim() ? { description: written.meta_description.trim() } : {}),
      ...(written?.og_image?.trim() ? { image: absoluteImage(written.og_image.trim()) } : {}),
    }
  }

  const segments = pathname.split("/").filter(Boolean)
  const path = isEn ? segments.slice(1) : segments

  // /guides/:slug, /tutorials/:slug and their /en mirrors
  if ((path[0] === "guides" || path[0] === "tutorials") && path.length === 2) {
    const base = path[0]
    const slug = path[1]
    // A slug is only reachable under the section it belongs to. Without this a
    // blog article would resolve at /tutorials/<slug> too, handing Google the
    // same content on two URLs and undoing the split.
    const wantedKind = base === "tutorials" ? "tutorial" : "article"
    if (isEn) {
      const guide = publishedGuidesEn().find((g) => g.slug === slug)
      if (!guide || (guide.kind ?? "article") !== wantedKind) return null
      return {
        ...meta,
        title: `${guide.title} · RAZ`,
        description: guide.excerpt,
        image: absoluteImage(guide.heroImage ?? guide.image),
        publishedTime: guide.datePublished,
        alternates: { he: `/${base}/${slug}`, en: `/en/${base}/${slug}` },
      }
    }
    const guide = data.guides?.find((g) => g.slug === slug)
    if (!guide || (guide.kind ?? "article") !== wantedKind) return null
    return {
      ...meta,
      // The written meta wins here too. Without this the admin fields changed
      // the browser tab and nothing a crawler ever saw.
      title: guide.meta_title?.trim() || `${guide.title} · RAZ`,
      description: guide.meta_description?.trim() || guide.excerpt,
      image: absoluteImage(guide.hero_image ?? guide.image),
      publishedTime: guide.date_published,
      alternates: { he: `/${base}/${slug}`, en: `/en/${base}/${slug}` },
    }
  }

  // /work/:slug and /en/work/:slug
  if (path[0] === "work" && path.length === 2) {
    const slug = path[1]
    const project = data.projects?.find((p) => p.slug === slug)
    if (!project) return null
    const description = isEn
      ? (getProjectTranslation(slug)?.overview ?? undefined)
      : (project.overview ?? undefined)
    const title = isEn ? translateProjectTitle(slug, project.title) : project.title
    return {
      ...meta,
      title: `${title} · RAZ`,
      description,
      alternates: { he: `/work/${slug}`, en: `/en/work/${slug}` },
    }
  }

  // /services/:hub (hub pages) and /services/:hub/:sub (sub-service pages)
  if (path[0] === "services" && (path.length === 2 || path.length === 3)) {
    const hubSlug = path[1]
    const subSlug = path[2]

    if (path.length === 2) {
      if (isEn) {
        const hub = findServiceHubEn(hubSlug)
        if (!hub) return null
        return {
          ...meta,
          title: `${hub.title} · RAZ`,
          description: hub.heroDescription,
          alternates: { he: `/services/${hubSlug}`, en: `/en/services/${hubSlug}` },
        }
      }
      const hub = data.serviceHubs?.find((h) => h.slug === hubSlug)
      if (!hub) return null
      return {
        ...meta,
        title: hub.meta_title || `${hub.title} · RAZ`,
        description: hub.meta_description || hub.hero_description,
        alternates: { he: `/services/${hubSlug}`, en: `/en/services/${hubSlug}` },
      }
    }

    if (isEn) {
      const sub = findSubServiceEn(hubSlug, subSlug)
      if (!sub) return null
      return {
        ...meta,
        title: `${sub.title} · RAZ`,
        description: sub.tagline,
        alternates: { he: `/services/${hubSlug}/${subSlug}`, en: `/en/services/${hubSlug}/${subSlug}` },
      }
    }
    const sub = data.subServices?.find((s) => s.hub_slug === hubSlug && s.slug === subSlug)
    if (!sub) return null
    return {
      ...meta,
      title: sub.meta_title || `${sub.title} · RAZ`,
      description: sub.meta_description || sub.tagline,
      alternates: { he: `/services/${hubSlug}/${subSlug}`, en: `/en/services/${hubSlug}/${subSlug}` },
    }
  }

  return null
}
