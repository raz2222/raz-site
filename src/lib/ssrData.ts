import { createContext, useContext } from "react"
import type { GuideRow, SubServiceRow, ServiceHubRow, FaqGroupRow, ProjectRow } from "./supabase"

// Content pre-fetched at build time by scripts/prerender.mjs and injected by
// src/entry-server.tsx.
//
// React never runs effects during renderToString, so every hook in
// hooks/useContent.ts and hooks/useProjects.ts would otherwise server-render
// its empty "loading" state — a prerendered guide/service page would ship a
// spinner instead of its content. Those hooks seed their initial state from
// this context when a value is present.
//
// On the client this provider is never mounted (src/main.tsx renders <App />
// bare), so the value is always null and every hook fetches exactly as before.
// That keeps runtime behavior for real visitors byte-for-byte unchanged.
export type SsrData = {
  guides?: GuideRow[]
  subServices?: SubServiceRow[]
  serviceHubs?: ServiceHubRow[]
  faqGroups?: FaqGroupRow[]
  projects?: ProjectRow[]
  /** `site_content` rows keyed `seo_*`, so a title written in the admin reaches
   * the prerendered HTML that crawlers actually read. */
  pageSeo?: Record<string, { meta_title?: string; meta_description?: string; og_image?: string }>
}

export const SsrDataContext = createContext<SsrData | null>(null)

export function useSsrData(): SsrData | null {
  return useContext(SsrDataContext)
}
