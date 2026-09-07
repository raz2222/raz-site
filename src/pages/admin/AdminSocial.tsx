import { useState } from "react"
import { AdminGate } from "@/components/AdminGate"
import { AdminPage } from "@/components/admin/AdminPage"
import { useSocialData } from "@/hooks/useSocialData"
import { FacebookTab } from "@/pages/admin/social/FacebookTab"
import { GroupsTab } from "@/pages/admin/social/GroupsTab"
import { InstagramTab } from "@/pages/admin/social/InstagramTab"
import { SettingsTab } from "@/pages/admin/social/SettingsTab"
import { cn } from "@/lib/utils"

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
      <div className="flex gap-2 mb-8 border-b border-white/10 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "font-mono text-xs uppercase tracking-wide px-4 py-3 border-b-2 -mb-px transition-colors whitespace-nowrap flex-none",
              tab === t ? "border-foreground text-foreground" : "border-transparent text-dim hover:text-foreground"
            )}
          >
            {t}
          </button>
        ))}
      </div>

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
