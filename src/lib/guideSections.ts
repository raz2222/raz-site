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
  /** Which `site_content` row holds this index's editable SEO. Two keys, not
   * one, because these are two indexed URLs sharing a renderer. */
  seoKey: string
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
    seoKey: "seo_guides",
  },
  tutorials: {
    kind: "tutorial",
    label: "מדריכים",
    path: "/tutorials",
    enPath: null,
    heading: createElement(Fragment, null, "מדריכים מעשיים,", createElement("br"), "צעד אחר צעד."),
    seoKey: "seo_tutorials",
  },
}
