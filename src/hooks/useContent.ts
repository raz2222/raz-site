import { useEffect, useState } from "react"
import { supabase, type SubServiceRow, type GuideRow, type FaqGroupRow, type ServiceHubRow } from "@/lib/supabase"
import { useSsrData } from "@/lib/ssrData"

export function useSubServices(hubSlug?: string) {
  const ssr = useSsrData()
  const preloaded = ssr?.subServices
    ? hubSlug
      ? ssr.subServices.filter((s) => s.hub_slug === hubSlug)
      : ssr.subServices
    : undefined
  const [subServices, setSubServices] = useState<SubServiceRow[]>(preloaded ?? [])
  const [loading, setLoading] = useState(!preloaded)

  useEffect(() => {
    let query = supabase.from("sub_services").select("*").order("sort_order", { ascending: true })
    if (hubSlug) query = query.eq("hub_slug", hubSlug)
    query.then(({ data }) => {
      setSubServices(data ?? [])
      setLoading(false)
    })
  }, [hubSlug])

  return { subServices, loading }
}

export function useSubService(hubSlug: string | undefined, slug: string | undefined) {
  const ssr = useSsrData()
  const preloaded = ssr?.subServices?.find((s) => s.slug === slug)
  const [subService, setSubService] = useState<SubServiceRow | null>(preloaded ?? null)
  const [loading, setLoading] = useState(!preloaded)

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    supabase
      .from("sub_services")
      .select("*")
      .eq("slug", slug)
      .maybeSingle()
      .then(({ data }) => {
        setSubService(data ?? null)
        setLoading(false)
      })
  }, [hubSlug, slug])

  return { subService, loading }
}

export function useGuides() {
  const preloaded = useSsrData()?.guides
  const [guides, setGuides] = useState<GuideRow[]>(preloaded ?? [])
  const [loading, setLoading] = useState(!preloaded)

  useEffect(() => {
    supabase
      .from("guides")
      .select("*")
      .order("date_published", { ascending: false })
      .order("sort_order", { ascending: true })
      .then(({ data }) => {
        setGuides(data ?? [])
        setLoading(false)
      })
  }, [])

  return { guides, loading }
}

export function useGuide(slug: string | undefined) {
  const preloaded = useSsrData()?.guides?.find((g) => g.slug === slug)
  const [guide, setGuide] = useState<GuideRow | null>(preloaded ?? null)
  const [loading, setLoading] = useState(!preloaded)

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    supabase
      .from("guides")
      .select("*")
      .eq("slug", slug)
      .maybeSingle()
      .then(({ data }) => {
        setGuide(data ?? null)
        setLoading(false)
      })
  }, [slug])

  return { guide, loading }
}

export function useFaqGroups() {
  const preloaded = useSsrData()?.faqGroups
  const [faqGroups, setFaqGroups] = useState<FaqGroupRow[]>(preloaded ?? [])
  const [loading, setLoading] = useState(!preloaded)

  useEffect(() => {
    supabase
      .from("faq_groups")
      .select("*")
      .order("sort_order", { ascending: true })
      .then(({ data }) => {
        setFaqGroups(data ?? [])
        setLoading(false)
      })
  }, [])

  return { faqGroups, loading }
}

export type FaqTopic =
  | "בניית אתרים"
  | "עיצוב"
  | "WordPress"
  | "איקומרס"
  | "AI"
  | "סרטוני AI"
  | "צילום AI"
  | "תהליך עבודה"
  | "מחירים"

export const FAQ_TOPICS: FaqTopic[] = [
  "בניית אתרים",
  "עיצוב",
  "WordPress",
  "איקומרס",
  "AI",
  "סרטוני AI",
  "צילום AI",
  "תהליך עבודה",
  "מחירים",
]

const SUBSERVICE_TOPIC: Record<string, FaqTopic> = {
  "site-design": "עיצוב",
  "creative-development": "עיצוב",
  "interactive-websites": "בניית אתרים",
  "ecommerce": "איקומרס",
  "landing-pages": "בניית אתרים",
  "wordpress-development": "WordPress",
  "custom-development": "בניית אתרים",
  "ai-functionality": "AI",
  "product-videos": "סרטוני AI",
  "campaign-visuals": "סרטוני AI",
  "social-content": "AI",
  "ai-photography": "צילום AI",
  "creative-direction": "AI",
  "concept-development": "AI",
}

export type FaqHubItem = { q: string; a: string; topic: FaqTopic; source?: string; sourceHref?: string; serviceSlug?: string }

const PRICE_KEYWORDS = ["עולה", "מחיר", "תקציב", "כלול במחיר"]

function inferTopic(q: string, fallback: FaqTopic): FaqTopic {
  if (PRICE_KEYWORDS.some((k) => q.includes(k))) return "מחירים"
  if (q.includes("זמן") || q.includes("תהליך") || q.includes("שלב")) return "תהליך עבודה"
  return fallback
}

export function useFaqHub() {
  const { faqGroups, loading: loadingGroups } = useFaqGroups()
  const { subServices, loading: loadingSubs } = useSubServices()

  const faqHub: FaqHubItem[] = [
    ...faqGroups.flatMap((g) =>
      g.items.map((item) => ({
        q: item.q,
        a: item.a,
        topic: inferTopic(item.q, g.title === "אתרים ופיתוח" ? ("בניית אתרים" as FaqTopic) : ("AI" as FaqTopic)),
      }))
    ),
    ...subServices.flatMap((s) =>
      s.faq.map((f) => ({
        q: f.q,
        a: f.a,
        topic: inferTopic(f.q, SUBSERVICE_TOPIC[s.slug] ?? "בניית אתרים"),
        source: s.title,
        sourceHref: `/services/${s.hub_slug}/${s.slug}`,
        serviceSlug: s.slug,
      }))
    ),
  ]

  return { faqHub, subServices, loading: loadingGroups || loadingSubs }
}

export function useServiceHubs() {
  const preloaded = useSsrData()?.serviceHubs
  const [serviceHubs, setServiceHubs] = useState<ServiceHubRow[]>(preloaded ?? [])
  const [loading, setLoading] = useState(!preloaded)

  useEffect(() => {
    supabase
      .from("service_hubs")
      .select("*")
      .order("sort_order", { ascending: true })
      .then(({ data }) => {
        setServiceHubs(data ?? [])
        setLoading(false)
      })
  }, [])

  return { serviceHubs, loading }
}
