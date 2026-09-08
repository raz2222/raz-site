import { useEffect, useState } from "react"
import type { AITalentRow, AIProductRow, AICampaignCombinationRow } from "@/lib/supabase"
import { getSupabase } from "@/lib/supabaseLazy"

export function useAIExperience() {
  const [talents, setTalents] = useState<AITalentRow[]>([])
  const [products, setProducts] = useState<AIProductRow[]>([])
  const [combinations, setCombinations] = useState<AICampaignCombinationRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getSupabase()
      .then((sb) =>
        Promise.all([
          sb.from("ai_talents").select("*").eq("active", true).order("sort_order"),
          sb.from("ai_products").select("*").eq("active", true).order("sort_order"),
          sb.from("ai_campaign_combinations").select("*").eq("active", true).order("sort_order"),
        ])
      )
      .then(([{ data: t }, { data: p }, { data: c }]) => {
        setTalents(t ?? [])
        setProducts(p ?? [])
        setCombinations(c ?? [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  function findCombination(talentId: string | null, productId: string | null) {
    if (!talentId || !productId) return null
    return combinations.find((c) => c.talent_id === talentId && c.product_id === productId) ?? null
  }

  return { talents, products, combinations, findCombination, loading }
}
