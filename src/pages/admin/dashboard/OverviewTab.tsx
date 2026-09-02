import { useEffect, useMemo, useState } from "react"
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { supabase, QUOTE_STATUS_LABELS, type QuoteRow, type QuoteStatus } from "@/lib/supabase"
import { formatCurrency } from "@/lib/quotePricing"
import { cn } from "@/lib/utils"

type LeadRow = { id: string; project_type: string; created_at: string }
type ClientRow = { id: string }

const WON_STATUSES: QuoteStatus[] = ["signed", "deposit_paid", "in_progress", "completed"]
const OPEN_STATUSES: QuoteStatus[] = ["draft", "ready", "sent", "viewed", "approved"]
const STATUS_ORDER_ALL: QuoteStatus[] = [
  "draft", "ready", "sent", "viewed", "approved", "signed", "deposit_paid", "in_progress", "completed", "declined", "expired",
]

type Granularity = "daily" | "weekly" | "monthly" | "yearly"
const GRANULARITIES: { value: Granularity; label: string; buckets: number }[] = [
  { value: "daily", label: "יומי", buckets: 30 },
  { value: "weekly", label: "שבועי", buckets: 12 },
  { value: "monthly", label: "חודשי", buckets: 12 },
  { value: "yearly", label: "שנתי", buckets: 5 },
]

function bucketKeyAndLabel(d: Date, g: Granularity): { key: string; label: string } {
  const y = d.getFullYear()
  const m = d.getMonth()
  if (g === "daily") return { key: d.toISOString().slice(0, 10), label: `${d.getDate()}/${m + 1}` }
  if (g === "weekly") {
    const weekStart = new Date(d)
    weekStart.setDate(d.getDate() - d.getDay())
    return { key: weekStart.toISOString().slice(0, 10), label: `${weekStart.getDate()}/${weekStart.getMonth() + 1}` }
  }
  if (g === "monthly") return { key: `${y}-${String(m + 1).padStart(2, "0")}`, label: `${m + 1}/${String(y).slice(2)}` }
  return { key: String(y), label: String(y) }
}

function buildRevenueSeries(quotes: QuoteRow[], granularity: Granularity) {
  const config = GRANULARITIES.find((g) => g.value === granularity)!
  const now = new Date()
  const buckets: { key: string; label: string; revenue: number }[] = []
  for (let i = config.buckets - 1; i >= 0; i--) {
    const d = new Date(now)
    if (granularity === "daily") d.setDate(d.getDate() - i)
    else if (granularity === "weekly") d.setDate(d.getDate() - i * 7)
    else if (granularity === "monthly") d.setMonth(d.getMonth() - i)
    else d.setFullYear(d.getFullYear() - i)
    const { key, label } = bucketKeyAndLabel(d, granularity)
    buckets.push({ key, label, revenue: 0 })
  }
  const byKey = new Map(buckets.map((b) => [b.key, b]))
  for (const q of quotes) {
    if (!WON_STATUSES.includes(q.status)) continue
    const { key } = bucketKeyAndLabel(new Date(q.created_at), granularity)
    const bucket = byKey.get(key)
    if (bucket) bucket.revenue += q.final_total ?? q.calculated_total ?? q.total ?? 0
  }
  return buckets
}

function StatCard({ label, value, sub, primary }: { label: string; value: string; sub?: string; primary?: boolean }) {
  return (
    <div className={cn("border rounded-lg p-4", primary ? "border-lime/40 bg-lime/10" : "border-white/10")}>
      <div className="text-dim text-[10px] font-mono uppercase tracking-wide mb-2">{label}</div>
      <div className={cn("font-display font-bold text-2xl", primary && "text-lime")}>{value}</div>
      {sub && <div className="text-dim text-xs mt-1">{sub}</div>}
    </div>
  )
}

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="border border-white/15 bg-background rounded px-3 py-2 text-xs font-mono">
      <div className="text-dim mb-1">{label}</div>
      <div>{formatCurrency(payload[0].value)}</div>
    </div>
  )
}

export function OverviewTab() {
  const [quotes, setQuotes] = useState<QuoteRow[]>([])
  const [leads, setLeads] = useState<LeadRow[]>([])
  const [clients, setClients] = useState<ClientRow[]>([])
  const [unreadNotifications, setUnreadNotifications] = useState(0)
  const [loading, setLoading] = useState(true)
  const [granularity, setGranularity] = useState<Granularity>("monthly")

  useEffect(() => {
    Promise.all([
      supabase.from("quotes").select("*"),
      supabase.from("leads").select("id,project_type,created_at"),
      supabase.from("clients").select("id"),
      supabase.from("admin_notifications").select("id,read"),
    ]).then(([q, l, c, n]) => {
      setQuotes(q.data ?? [])
      setLeads(l.data ?? [])
      setClients(c.data ?? [])
      setUnreadNotifications((n.data ?? []).filter((row) => !row.read).length)
      setLoading(false)
    })
  }, [])

  const revenueSeries = useMemo(() => buildRevenueSeries(quotes, granularity), [quotes, granularity])
  const wonQuotes = quotes.filter((q) => WON_STATUSES.includes(q.status))
  const wonRevenue = wonQuotes.reduce((sum, q) => sum + (q.final_total ?? q.calculated_total ?? q.total ?? 0), 0)
  const openQuotes = quotes.filter((q) => OPEN_STATUSES.includes(q.status))
  const openValue = openQuotes.reduce((sum, q) => sum + (q.final_total ?? q.calculated_total ?? q.total ?? 0), 0)

  const statusCounts = useMemo(() => {
    const map = new Map<QuoteStatus, number>()
    for (const q of quotes) map.set(q.status, (map.get(q.status) ?? 0) + 1)
    return STATUS_ORDER_ALL.filter((s) => (map.get(s) ?? 0) > 0).map((s) => ({ status: s, label: QUOTE_STATUS_LABELS[s], count: map.get(s) ?? 0 }))
  }, [quotes])

  const leadsByType = useMemo(() => {
    const map = new Map<string, number>()
    for (const l of leads) {
      const key = l.project_type || "לא צוין"
      map.set(key, (map.get(key) ?? 0) + 1)
    }
    return [...map.entries()].map(([type, count]) => ({ type, count })).sort((a, b) => b.count - a.count)
  }, [leads])

  if (loading) return <div className="font-mono text-xs text-dim uppercase py-10">טוען…</div>

  return (
    <div className="grid gap-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard label="לידים" value={String(leads.length)} />
        <StatCard label="לקוחות" value={String(clients.length)} />
        <StatCard label="הצעות פתוחות" value={String(openQuotes.length)} sub={formatCurrency(openValue)} />
        <StatCard label="הכנסות שאושרו" value={formatCurrency(wonRevenue)} sub={`${wonQuotes.length} הצעות`} primary />
        <StatCard label="דורש מעקב" value={String(unreadNotifications)} />
      </div>

      <div className="border border-white/10 rounded-lg p-4">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <div className="font-mono text-xs uppercase tracking-wide text-dim">הכנסות לאורך זמן</div>
          <div className="flex gap-1 border border-white/10 rounded-full p-1">
            {GRANULARITIES.map((g) => (
              <button
                key={g.value}
                onClick={() => setGranularity(g.value)}
                className={cn(
                  "font-mono text-[10px] uppercase tracking-wide rounded-full px-3 py-1.5 transition-colors",
                  granularity === g.value ? "bg-lime text-black" : "text-dim hover:text-foreground"
                )}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>
        {wonQuotes.length === 0 ? (
          <div className="py-10 text-center text-dim text-sm">
            עדיין אין הכנסה מאושרת מהצעות מחיר, הגרף יתמלא כשהצעות יעברו לסטטוס "נחתם" ומעלה.
          </div>
        ) : (
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueSeries} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#D1FE17" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#D1FE17" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10 }} axisLine={false} tickLine={false} width={40} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="revenue" stroke="#D1FE17" strokeWidth={2} fill="url(#revenueFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="border border-white/10 rounded-lg p-4">
          <div className="font-mono text-xs uppercase tracking-wide text-dim mb-4">הצעות לפי סטטוס</div>
          {statusCounts.length === 0 ? (
            <p className="text-dim text-sm">אין הצעות עדיין.</p>
          ) : (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusCounts} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
                  <XAxis dataKey="label" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10 }} axisLine={false} tickLine={false} width={30} />
                  <Tooltip
                    content={({ active, payload, label }) =>
                      active && payload?.length ? (
                        <div className="border border-white/15 bg-background rounded px-3 py-2 text-xs font-mono">
                          <div className="text-dim mb-1">{label}</div>
                          <div>{payload[0].value as number}</div>
                        </div>
                      ) : null
                    }
                  />
                  <Bar dataKey="count" fill="#D1FE17" radius={[4, 4, 0, 0]} maxBarSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="border border-white/10 rounded-lg p-4">
          <div className="font-mono text-xs uppercase tracking-wide text-dim mb-4">לידים לפי סוג פרויקט</div>
          {leadsByType.length === 0 ? (
            <p className="text-dim text-sm">אין לידים עדיין.</p>
          ) : (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={leadsByType} layout="vertical" margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" horizontal={false} />
                  <XAxis type="number" allowDecimals={false} tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="type" type="category" width={110} tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    content={({ active, payload, label }) =>
                      active && payload?.length ? (
                        <div className="border border-white/15 bg-background rounded px-3 py-2 text-xs font-mono">
                          <div className="text-dim mb-1">{label}</div>
                          <div>{payload[0].value as number}</div>
                        </div>
                      ) : null
                    }
                  />
                  <Bar dataKey="count" fill="#D1FE17" radius={[0, 4, 4, 0]} maxBarSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
