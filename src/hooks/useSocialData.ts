import { useCallback, useEffect, useState } from "react"
import { supabase, type FbGroupRow, type SocialActionRow, type SocialSettingsRow } from "@/lib/supabase"
import type { SocialLimits } from "@/lib/socialSafety"

/** The three things every social screen needs before it can say anything:
 * the pacing settings, the groups, and the ledger of what has already gone out.
 *
 * Loaded once for the whole screen rather than per tab · the safety strip on
 * the Facebook tab and the cap on the Instagram tab are reading the same rows,
 * and two fetches would eventually disagree about how much budget is left. */

const LEDGER_DAYS = 60

export type SocialData = {
  settings: SocialSettingsRow | null
  limits: SocialLimits
  groups: FbGroupRow[]
  actions: SocialActionRow[]
  loading: boolean
  refresh: () => Promise<void>
}

const FALLBACK_LIMITS: SocialLimits = {
  fb_daily_cap: 5,
  fb_group_cooldown_days: 7,
  fb_min_gap_minutes: 45,
  fb_value_ratio: 3,
  warmup_started_on: null,
}

export function useSocialData(): SocialData {
  const [settings, setSettings] = useState<SocialSettingsRow | null>(null)
  const [groups, setGroups] = useState<FbGroupRow[]>([])
  const [actions, setActions] = useState<SocialActionRow[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const since = new Date(Date.now() - LEDGER_DAYS * 24 * 60 * 60 * 1000).toISOString()
    const [settingsRes, groupsRes, actionsRes] = await Promise.all([
      supabase.from("social_settings").select("*").limit(1).maybeSingle(),
      supabase.from("fb_groups").select("*").order("name"),
      supabase.from("social_actions").select("*").gte("created_at", since).order("created_at", { ascending: false }),
    ])
    setSettings(settingsRes.data ?? null)
    setGroups(groupsRes.data ?? [])
    setActions(actionsRes.data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return {
    settings,
    limits: settings
      ? {
          fb_daily_cap: settings.fb_daily_cap,
          fb_group_cooldown_days: settings.fb_group_cooldown_days,
          fb_min_gap_minutes: settings.fb_min_gap_minutes,
          fb_value_ratio: settings.fb_value_ratio,
          warmup_started_on: settings.warmup_started_on,
        }
      : FALLBACK_LIMITS,
    groups,
    actions,
    loading,
    refresh,
  }
}
