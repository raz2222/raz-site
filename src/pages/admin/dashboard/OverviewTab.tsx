import { useEffect, useMemo, useState } from "react"
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Link } from "react-router-dom"
import {
  supabase,
  QUOTE_STATUS_LABELS,
  CONTRACT_STATUS_LABELS,
  type CallSessionRow,
  type ContractRow,
  type QuoteRow,
  type QuoteStatus,
  type PaymentDetailsRow,
  ENGAGEMENT_INTENT_LABELS,
  type SocialEngagementRow,
} from "@/lib/supabase"
import { formatCurrency } from "@/lib/quotePricing"
import { hasAnyPaymentMethod } from "@/lib/contracts"
import { pilotWindow, pilotWindowLabel, pilotUrgency } from "@/lib/pilotWindow"
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

/** A number Raz cannot click is a number he has to go and find. Every card that
 * counts something links to the screen that holds it. */
function StatCard({ label, value, sub, primary, to, onClick }: { label: string; value: string; sub?: string; primary?: boolean; to?: string; onClick?: () => void }) {
  const className = cn(
    "border rounded-lg p-4 text-right block transition-colors",
    primary ? "border-lime/40 bg-lime/10" : "border-white/10",
    (to || onClick) && "hover:border-lime/50"
  )
  const body = (
    <>
      <div className="text-dim text-[10px] font-mono uppercase tracking-wide mb-2">{label}</div>
      <div className={cn("font-display font-bold text-2xl", primary && "text-lime")}>{value}</div>
      {sub && <div className="text-dim text-xs mt-1">{sub}</div>}
    </>
  )
  if (to) return <Link to={to} className={className}>{body}</Link>
  if (onClick) return <button onClick={onClick} className={cn(className, "w-full")}>{body}</button>
  return <div className={className}>{body}</div>
}

/** One shape for everything in the action zone, so a contract awaiting a
 * signature and a quote awaiting an answer read as the same kind of thing: work
 * sitting still. */
function ActionRow({ to, title, meta, note }: { to: string; title: string; meta?: string; note?: string }) {
  return (
    <Link
      to={to}
      className="flex items-center justify-between gap-4 flex-wrap bg-background/40 rounded px-4 py-3 min-h-[56px] hover:bg-background/70 transition-colors"
    >
      <div className="min-w-0">
        <div className="text-sm font-medium truncate">{title}</div>
        {meta && <div className="text-dim text-xs mt-0.5 truncate">{meta}</div>}
      </div>
      {note && <span className="font-mono text-[10px] uppercase tracking-wide text-dim flex-none">{note}</span>}
    </Link>
  )
}

function daysSince(iso: string | null): string | null {
  if (!iso) return null
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000)
  if (days <= 0) return "היום"
  return `לפני ${days} ימים`
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

export function OverviewTab({ onShowNotifications }: { onShowNotifications?: () => void }) {
  const [quotes, setQuotes] = useState<QuoteRow[]>([])
  const [leads, setLeads] = useState<LeadRow[]>([])
  const [clients, setClients] = useState<ClientRow[]>([])
  const [unreadNotifications, setUnreadNotifications] = useState(0)
  const [dueCalls, setDueCalls] = useState<CallSessionRow[]>([])
  const [openContracts, setOpenContracts] = useState<ContractRow[]>([])
  const [pilots, setPilots] = useState<ContractRow[]>([])
  const [engagements, setEngagements] = useState<SocialEngagementRow[]>([])
  const [payment, setPayment] = useState<PaymentDetailsRow | null>(null)
  const [loading, setLoading] = useState(true)
  const [granularity, setGranularity] = useState<Granularity>("monthly")

  useEffect(() => {
    Promise.all([
      supabase.from("quotes").select("*"),
      supabase.from("leads").select("id,project_type,created_at"),
      supabase.from("clients").select("id"),
      supabase.from("admin_notifications").select("id,read"),
      supabase
        .from("social_engagements")
        .select("*")
        .gte("score", 60)
        .neq("status", "handled")
        .order("occurred_at", { ascending: false })
        .limit(6),
      // A follow-up date the system never mentions again is a note to self, not
      // a reminder. Anything due today or overdue leads the dashboard.
      supabase
        .from("call_sessions")
        .select("*")
        .not("follow_up_at", "is", null)
        .lte("follow_up_at", new Date().toISOString().slice(0, 10))
        .order("follow_up_at"),
      // A contract that was sent and never signed is the most expensive thing
      // on this screen to forget, so it is fetched with the counters, not behind
      // a tab.
      supabase.from("contracts").select("*").in("status", ["sent", "viewed"]).order("sent_at", { ascending: true }),
      // A signed pilot is on a seven-day clock the client cannot see the end of
      // and Raz would otherwise have to remember.
      supabase.from("contracts").select("*").eq("package_key", "pilot").eq("status", "signed"),
      // The client sees this the moment they sign. Empty, and the deal goes
      // quiet at exactly the point it should close.
      supabase.from("payment_details").select("*").maybeSingle(),
    ]).then(([q, l, c, n, eng, f, ct, pl, pay]) => {
      setPayment(pay.data ?? null)
      setQuotes(q.data ?? [])
      setLeads(l.data ?? [])
      setClients(c.data ?? [])
      setUnreadNotifications((n.data ?? []).filter((row) => !row.read).length)
      setEngagements((eng.data ?? []) as SocialEngagementRow[])
      setDueCalls((f.data ?? []) as CallSessionRow[])
      setOpenContracts((ct.data ?? []) as ContractRow[])
      setPilots((pl.data ?? []) as ContractRow[])
      setLoading(false)
    })
  }, [])

  const revenueSeries = useMemo(() => buildRevenueSeries(quotes, granularity), [quotes, granularity])
  const wonQuotes = quotes.filter((q) => WON_STATUSES.includes(q.status))
  const wonRevenue = wonQuotes.reduce((sum, q) => sum + (q.final_total ?? q.calculated_total ?? q.total ?? 0), 0)
  const openQuotes = quotes.filter((q) => OPEN_STATUSES.includes(q.status))
  // Sent and gone quiet: the ball is with the client, and nobody is counting the
  // days but this list.
  const awaitingQuotes = quotes
    .filter((q) => q.status === "sent" || q.status === "viewed")
    .sort((a, b) => (a.sent_at ?? a.created_at).localeCompare(b.sent_at ?? b.created_at))
  const openValue = openQuotes.reduce((sum, q) => sum + (q.final_total ?? q.calculated_total ?? q.total ?? 0), 0)

  // Expired windows drop out entirely: there is nothing left to do about them,
  // and a permanent row for every pilot ever sold would bury the live ones.
  const pilotRows = useMemo(
    () =>
      pilots
        .map((contract) => ({ contract, pilot: pilotWindow(contract) }))
        .filter((row) => row.pilot.state === "open" || row.pilot.state === "awaiting_delivery")
        .sort((a, b) => pilotUrgency(a.pilot) - pilotUrgency(b.pilot)),
    [pilots]
  )

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
      {!hasAnyPaymentMethod(payment) && (
        <Link
          to="/admin/business"
          className="border border-amber-400/40 bg-amber-400/5 rounded-lg p-4 hover:border-amber-400/70 transition-colors"
        >
          <div className="font-mono text-xs uppercase tracking-wide text-amber-300 mb-2">חסרים פרטי תשלום</div>
          <div className="text-sm">לקוח שחותם על חוזה לא רואה לאן לשלם.</div>
          <div className="text-dim text-xs mt-1">מילוי חשבון בנק, ביט או פייבוקס · פרטי העסק ←</div>
        </Link>
      )}

      {dueCalls.length > 0 && (
        <section className="border border-lime/40 bg-lime/[0.04] rounded-lg p-4">
          <div className="font-mono text-xs uppercase tracking-wide text-lime mb-3">
            פולואפ להיום ({dueCalls.length})
          </div>
          <div className="grid gap-2">
            {dueCalls.map((call) => (
              <Link
                key={call.id}
                to={`/admin/calls/${call.id}`}
                className="flex items-center justify-between gap-4 flex-wrap bg-background/40 rounded px-4 py-3 hover:bg-background/70 transition-colors"
              >
                <div className="min-w-0">
                  <div className="text-sm font-medium">
                    {call.contact_name}
                    {call.business_name ? <span className="text-dim"> · {call.business_name}</span> : null}
                  </div>
                  {call.next_step && <div className="text-dim text-xs mt-0.5 truncate">{call.next_step}</div>}
                </div>
                <div className="flex items-center gap-3 flex-none">
                  {call.contact_phone && (
                    <span className="font-mono text-xs text-dim">{call.contact_phone}</span>
                  )}
                  <span className="font-mono text-[10px] uppercase tracking-wide text-dim">
                    {new Date(call.follow_up_at!).toLocaleDateString("he-IL")}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {pilotRows.length > 0 && (
        <section className="border border-lime/40 bg-lime/[0.04] rounded-lg p-4">
          <div className="font-mono text-xs uppercase tracking-wide text-lime mb-3">
            פיילוטים בחלון קיזוז ({pilotRows.length})
          </div>
          <div className="grid gap-2">
            {pilotRows.map(({ contract, pilot }) => (
              <ActionRow
                key={contract.id}
                to={`/admin/contracts/${contract.id}`}
                title={contract.client_name}
                meta={pilotWindowLabel(pilot) ?? undefined}
                note={pilot.state === "open" ? `עד ${new Date(pilot.deadline).toLocaleDateString("he-IL")}` : undefined}
              />
            ))}
          </div>
        </section>
      )}

      {engagements.length > 0 && (
        <section className="border border-lime/40 bg-lime/[0.04] rounded-lg p-4">
          <div className="font-mono text-xs uppercase tracking-wide text-lime mb-3">
            ענו לך ({engagements.length})
          </div>
          <div className="grid gap-2">
            {engagements.map((row) => (
              <a
                key={row.id}
                href={row.permalink ?? "/admin/social"}
                target={row.permalink ? "_blank" : undefined}
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-4 flex-wrap bg-background/40 rounded px-4 py-3 hover:bg-background/70 transition-colors"
              >
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">
                    {row.author_handle ? `@${row.author_handle}` : (row.author_name ?? "מישהו")}
                    <span className="text-dim"> · {ENGAGEMENT_INTENT_LABELS[row.intent]}</span>
                  </div>
                  <div className="text-dim text-xs mt-0.5 truncate">{row.text}</div>
                </div>
                <span className="font-mono text-[10px] uppercase tracking-wide text-dim flex-none">
                  {row.platform === "instagram" ? "אינסטגרם" : "פייסבוק"}
                </span>
              </a>
            ))}
          </div>
        </section>
      )}

      {(openContracts.length > 0 || awaitingQuotes.length > 0) && (
        <section className="border border-white/10 rounded-lg p-4">
          <div className="font-mono text-xs uppercase tracking-wide text-dim mb-3">
            ממתין לתשובה ({openContracts.length + awaitingQuotes.length})
          </div>
          <div className="grid gap-2">
            {openContracts.map((c) => (
              <ActionRow
                key={c.id}
                to={`/admin/contracts/${c.id}`}
                title={c.client_name}
                meta={`${c.title} · ${CONTRACT_STATUS_LABELS[c.status] ?? c.status}`}
                note={daysSince(c.sent_at) ?? undefined}
              />
            ))}
            {awaitingQuotes.map((q) => (
              <ActionRow
                key={q.id}
                to={`/admin/quotes/${q.id}`}
                title={q.title || "הצעת מחיר"}
                meta={`${QUOTE_STATUS_LABELS[q.status]} · ${formatCurrency(q.final_total ?? q.calculated_total ?? q.total ?? 0, q.currency)}`}
                note={daysSince(q.sent_at) ?? undefined}
              />
            ))}
          </div>
        </section>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard label="לידים" value={String(leads.length)} to="/admin/clients" />
        <StatCard label="לקוחות" value={String(clients.length)} to="/admin/clients" />
        <StatCard label="הצעות פתוחות" value={String(openQuotes.length)} sub={formatCurrency(openValue)} to="/admin/quotes" />
        <StatCard label="הכנסות שאושרו" value={formatCurrency(wonRevenue)} sub={`${wonQuotes.length} הצעות`} primary to="/admin/quotes" />
        <StatCard label="דורש מעקב" value={String(unreadNotifications)} onClick={onShowNotifications} />
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
