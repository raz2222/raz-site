import { useState } from "react"
import { AdminGate } from "@/components/AdminGate"
import { AdminPage, AdminTabs } from "@/components/admin/AdminPage"
import { useSocialData } from "@/hooks/useSocialData"
import { FacebookTab } from "@/pages/admin/social/FacebookTab"
import { GroupsTab } from "@/pages/admin/social/GroupsTab"
import { InstagramTab } from "@/pages/admin/social/InstagramTab"
import { SettingsTab } from "@/pages/admin/social/SettingsTab"

/** Two platforms, two honest answers.
 *
 * Instagram has a publishing API, so a finished project reaches the account
 * without Raz doing anything. Facebook groups have none · the permission that
 * allowed it was withdrawn · so the only thing a machine can do there without
 * risking the account is read, draft, and keep the pace human. Both halves live
 * on one screen because they are one job, and the pacing budget is shared. */

const TABS = ["פייסבוק", "קבוצות", "אינסטגרם", "קצב"] as const
type Tab = (typeof TABS)[number]

function AdminSocialInner() {
  const [tab, setTab] = useState<Tab>("פייסבוק")
  const data = useSocialData()

  return (
    <AdminPage
      title="סושיאל"
      description="הזדמנויות בקבוצות פייסבוק, ופרסום העבודות באינסטגרם."
      width="wide"
      loading={data.loading}
    >
      <AdminTabs tabs={TABS} value={tab} onChange={setTab} />

      {tab === "פייסבוק" && <FacebookTab data={data} />}
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
