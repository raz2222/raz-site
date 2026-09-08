import { useEffect, useState } from "react"
import { AdminGate } from "@/components/AdminGate"
import { AdminPage, AdminTabs } from "@/components/admin/AdminPage"
import { useSocialData } from "@/hooks/useSocialData"
import { FacebookTab } from "@/pages/admin/social/FacebookTab"
import { GroupsTab } from "@/pages/admin/social/GroupsTab"
import { InstagramTab } from "@/pages/admin/social/InstagramTab"
import { EngagementsTab } from "@/pages/admin/social/EngagementsTab"
import { SettingsTab } from "@/pages/admin/social/SettingsTab"
import { parseSharedPost, type SharedPost } from "@/lib/sharedPost"

/** Two platforms, two honest answers.
 *
 * Instagram has a publishing API, so a finished project reaches the account
 * without Raz doing anything. Facebook groups have none · the permission that
 * allowed it was withdrawn · so the only thing a machine can do there without
 * risking the account is read, draft, and keep the pace human. Both halves live
 * on one screen because they are one job, and the pacing budget is shared. */

const TABS = ["פייסבוק", "תגובות", "קבוצות", "אינסטגרם", "קצב"] as const
type Tab = (typeof TABS)[number]

function AdminSocialInner() {
  const [tab, setTab] = useState<Tab>("פייסבוק")
  const data = useSocialData()

  /** A post shared into the admin from another app opens this screen with it
   * in hand · that is what `share_target` in the manifest points here for.
   *
   * Read once and then wiped from the address bar: a refresh, or the phone
   * restoring the tab tomorrow, must not re-open a capture Raz already dealt
   * with. */
  const [shared, setShared] = useState<SharedPost | null>(null)
  useEffect(() => {
    const post = parseSharedPost(window.location.search)
    if (!post) return
    setShared(post)
    setTab("פייסבוק")
    window.history.replaceState(null, "", window.location.pathname)
  }, [])

  return (
    <AdminPage
      title="סושיאל"
      description="הזדמנויות בקבוצות, מי הגיב על מה שפרסמת, ופרסום העבודות באינסטגרם."
      width="wide"
      loading={data.loading}
    >
      <AdminTabs tabs={TABS} value={tab} onChange={setTab} />

      {tab === "פייסבוק" && <FacebookTab data={data} shared={shared} onSharedConsumed={() => setShared(null)} />}
      {tab === "תגובות" && <EngagementsTab />}
      {tab === "קבוצות" && <GroupsTab data={data} />}
      {tab === "אינסטגרם" && <InstagramTab data={data} />}
      {tab === "קצב" && <SettingsTab data={data} />}
    </AdminPage>
  )
}

export function AdminSocial() {
  return (
    <AdminGate>
      <AdminSocialInner />
    </AdminGate>
  )
}
