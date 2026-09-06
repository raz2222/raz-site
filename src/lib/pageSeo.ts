/** Editable SEO for the pages that are components rather than rows.
 *
 * Guides, projects and services carry their own meta on their own table row. The
 * hand-written pages had theirs written into the component, so changing either
 * meant a deploy.
 *
 * Every default here is the page's own existing string, copied verbatim, never
 * invented. A page belongs in this list only once its real text has been moved
 * across · a made-up default would show in the admin as if it were the site's,
 * and one save would publish it.
 *
 * The strings are the ones a crawler sees, taken from src/lib/routeMeta.ts (and
 * from index.html for the homepage), not the shorter ones the pages used to pass
 * to useDocumentMeta. Those two had drifted: /about was indexed as
 * "רז אברמוב · 200+ אתרים ו-6 שנות פיתוח" while its own tab said "עליי · RAZ".
 * An SEO editor that shows a title Google never had is worse than no editor, so
 * there is now one string per page and the tab matches the search result. */
export type PageSeo = {
  meta_title: string
  meta_description: string
  og_image: string
}

export const PAGE_SEO_DEFAULTS: Record<string, PageSeo> = {
  seo_home: {
    meta_title: "Made by RAZ | סרטוני AI, פרסומות AI ובניית אתרים",
    meta_description:
      "סרטוני AI, פרסומות וקריאייטיב למותגים, לצד עיצוב ופיתוח אתרים. מעל 200 אתרים ו־6 שנות ניסיון בדיגיטל. בואו ניצור משהו שאי אפשר להתעלם ממנו.",
    og_image: "",
  },
  seo_about: {
    meta_title: "רז אברמוב · 200+ אתרים ו-6 שנות פיתוח | Made by RAZ",
    meta_description: "רז אברמוב · מפתח קריאייטיב שעובד בצומת שבין עיצוב, טכנולוגיה ו-AI.",
    og_image: "",
  },
  seo_work: {
    meta_title: "עבודות · אתרים וקריאייטיב AI שבניתי | Made by RAZ",
    meta_description: "כל הפרויקטים של רז אברמוב: אתרים, סרטי AI וקמפיינים ויזואליים.",
    og_image: "",
  },
  seo_faq: {
    meta_title: "שאלות ותשובות · בניית אתרים ותוכן AI | Made by RAZ",
    meta_description:
      "כל השאלות והתשובות באתר במקום אחד: בניית אתרים, WordPress, איקומרס, תוכן AI, תהליך עבודה ומחירים.",
    og_image: "",
  },
  seo_contact: {
    meta_title: "צור קשר · בניית אתרים ותוכן AI | Made by RAZ",
    meta_description:
      "בואו נתחיל פרויקט: אתר, קמפיין AI או סרטון. חבילת יצירת תוכן AI כוללת סרטון מתנה.",
    og_image: "",
  },
  // /guides and /tutorials are one component with a section prop, but they are
  // two indexed URLs. One key would have handed Google the same title twice.
  seo_guides: {
    meta_title: "בלוג · מחירים, השוואות ומדריכים לאתרים ותוכן AI | Made by RAZ",
    meta_description:
      "תשובות אמיתיות על מחירים, לוחות זמנים ובחירה בין אפשרויות: בניית אתרים, WordPress, סרטוני AI ותוכן ויזואלי לעסקים.",
    og_image: "",
  },
  seo_tutorials: {
    meta_title: "מדריכים מעשיים · סרטוני AI, תמונות מוצר ותוכן ויזואלי | Made by RAZ",
    meta_description:
      "מדריכים מעשיים לייצור סרטוני AI, תמונות מוצר ותוכן ויזואלי. איך עושים את זה בפועל, בלי קיצורי דרך.",
    og_image: "",
  },
}

/** The page's own values where they are filled in, and the shipped ones where
 * they are not. An empty field in the admin means "leave it as it was", not
 * "publish an empty title". */
export function resolvePageSeo(key: string, stored: Partial<PageSeo> | null | undefined): PageSeo {
  const base = PAGE_SEO_DEFAULTS[key] ?? { meta_title: "RAZ", meta_description: "", og_image: "" }
  return {
    meta_title: stored?.meta_title?.trim() || base.meta_title,
    meta_description: stored?.meta_description?.trim() || base.meta_description,
    og_image: stored?.og_image?.trim() || base.og_image,
  }
}
