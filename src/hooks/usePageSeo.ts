import { useSiteContent } from "@/hooks/useSiteContent"
import { useDocumentMeta } from "@/hooks/useDocumentMeta"
import { PAGE_SEO_DEFAULTS, resolvePageSeo, type PageSeo } from "@/lib/pageSeo"

/** Sets a hand-written page's title, description and share image from the admin,
 * falling back to the values it shipped with.
 *
 * Same call shape as useDocumentMeta, so a page swaps one line for another. */
export function usePageSeo(key: keyof typeof PAGE_SEO_DEFAULTS | string) {
  const fallback = PAGE_SEO_DEFAULTS[key] ?? { meta_title: "RAZ", meta_description: "", og_image: "" }
  const { content } = useSiteContent<PageSeo>(key, fallback)
  const seo = resolvePageSeo(key, content)
  useDocumentMeta(seo.meta_title, seo.meta_description, seo.og_image || undefined)
}
