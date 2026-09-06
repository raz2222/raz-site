/** Editable SEO for the pages that are components rather than rows.
 *
 * Guides, projects and services carry their own meta on their own table row. The
 * hand-written pages · home, about, contact, faq, work, guides index · had their
 * title and description written into the component, so changing either meant a
 * deploy. These are the shipped values; the admin overrides them per page. */
export type PageSeo = {
  meta_title: string
  meta_description: string
  og_image: string
}

export const PAGE_SEO_DEFAULTS: Record<string, PageSeo> = {
  seo_home: {
    meta_title: "RAZ · בניית אתרים ותוכן AI למותגים",
    meta_description:
      "אני בונה אתרים ויוצר סרטונים וקריאייטיב ב-AI למותגים שרוצים להיראות הרבה יותר טוב בדיגיטל.",
    og_image: "",
  },
  seo_about: {
    meta_title: "עליי · RAZ",
    meta_description: "רז אברמוב · מפתח קריאייטיב שעובד בצומת שבין עיצוב, טכנולוגיה ו-AI.",
    og_image: "",
  },
  seo_contact: {
    meta_title: "צור קשר · RAZ",
    meta_description:
      "בואו נתחיל פרויקט: אתר, קמפיין AI או סרטון. חבילת יצירת תוכן AI כוללת סרטון מתנה.",
    og_image: "",
  },
  seo_work: {
    meta_title: "עבודות · RAZ",
    meta_description: "פרויקטים נבחרים: אתרים, קמפיינים ותוכן AI למותגים.",
    og_image: "",
  },
  seo_faq: {
    meta_title: "שאלות ותשובות · RAZ",
    meta_description: "מחירים, לוחות זמנים, תהליך העבודה ומה בדיוק מקבלים.",
    og_image: "",
  },
  seo_guides: {
    meta_title: "מדריכים · RAZ",
    meta_description: "מדריכים על בניית אתרים, תוכן AI ושיווק דיגיטלי, בלי הבטחות ריקות.",
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
