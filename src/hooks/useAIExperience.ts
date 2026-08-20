import { useEffect, useState } from "react"
import { supabase, type AITalentRow, type AIProductRow, type AICampaignCombinationRow } from "@/lib/supabase"

export function useAIExperience() {
  const [talents, setTalents] = useState<AITalentRow[]>([])
  const [products, setProducts] = useState<AIProductRow[]>([])
  const [combinations, setCombinations] = useState<AICampaignCombinationRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      supabase.from("ai_talents").select("*").eq("active", true).order("sort_order"),
      supabase.from("ai_products").select("*").eq("active", true).order("sort_order"),
      supabase.from("ai_campaign_combinations").select("*").eq("active", true).order("sort_order"),
    ]).then(([{ data: t }, { data: p }, { data: c }]) => {
      setTalents(t ?? [])
      setProducts(p ?? [])
      setCombinations(c ?? [])
      setLoading(false)
    })
  }, [])

  function findCombination(talentId: string | null, productId: string | null) {
    if (!talentId || !productId) return null
    return combinations.find((c) => c.talent_id === talentId && c.product_id === productId) ?? null
  }

  return { talents, products, combinations, findCombination, loading }
}
