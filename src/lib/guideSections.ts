import type { ReactNode } from "react"
import { createElement, Fragment } from "react"
import type { GuideKind } from "./supabase"

// Two sections, one renderer. They are split because they are aimed at
// different people arriving by different routes: the blog is written to be
// found in Google by someone pricing a purchase, the tutorials are links Raz
// sends his Instagram followers, who already know who he is. Mixing them in one
// index would blur the blog's topical focus for Google and bury the tutorials
// under content their audience did not come for.
export type GuideSectionKey = "blog" | "tutorials"

type Section = {
  kind: GuideKind
  label: string
  path: string
  enPath: string | null
  heading: ReactNode
  metaTitle: string
  metaDescription: string
}

// /guides is the blog's URL and stays that way. Thirty articles are indexed
// there, 83 links inside article bodies point at it, and renaming a path Google
// has just started crawling costs weeks of re-consolidation to buy nothing: the
// word in the URL is not what ranks. Only the visible label changed.
export const SECTIONS: Record<GuideSectionKey, Section> = {
  blog: {
    kind: "article",
    label: "בלוג",
    path: "/guides",
    enPath: "/en/guides",
    heading: createElement(Fragment, null, "תוכן שנותן תשובות אמיתיות,", createElement("br"), "לא רק מילות מפתח."),
    metaTitle: "בלוג · RAZ",
    metaDescription:
      "תשובות אמיתיות על מחירים, לוחות זמנים ובחירה בין אפשרויות: בניית אתרים, WordPress, סרטוני AI ותוכן ויזואלי לעסקים.",
  },
  tutorials: {
    kind: "tutorial",
    label: "מדריכים",
    path: "/tutorials",
    enPath: null,
    heading: createElement(Fragment, null, "מדריכים מעשיים,", createElement("br"), "צעד אחר צעד."),
    metaTitle: "מדריכים · RAZ",
    metaDescription:
      "מדריכים מעשיים לייצור סרטוני AI, תמונות מוצר ותוכן ויזואלי. איך עושים את זה בפועל, בלי קיצורי דרך.",
  },
}
