import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { formatCurrency } from "@/lib/quotePricing"

/** The dashboard's three charts, in their own module so recharts is its own
 * chunk.
 *
 * recharts is 300KB and it was inside AdminDashboard, which made that one
 * screen heavier than the entire public site · 391KB against main's 359KB, or
 * about a second on a phone before anything painted. It is loaded lazily now,
 * so the numbers, the pilot windows and the notice cards are on screen while
 * the library is still arriving. Every chart keeps the height it will occupy,
 * so nothing jumps when it lands.
 *
 * The charts themselves are unchanged.
 */

const GRID = "rgba(255,255,255,0.08)"
const TICK = { fill: "rgba(255,255,255,0.5)", fontSize: 10 }
const LIME = "#D1FE17"

function TooltipBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-white/15 bg-background rounded px-3 py-2 text-xs font-mono">
      <div className="text-dim mb-1">{label}</div>
      <div>{value}</div>
    </div>
  )
}

export function RevenueChart({ data }: { data: { label: string; revenue: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <defs>
          <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={LIME} stopOpacity={0.3} />
            <stop offset="100%" stopColor={LIME} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
        <XAxis dataKey="label" tick={TICK} axisLine={false} tickLine={false} />
        <YAxis tick={TICK} axisLine={false} tickLine={false} width={40} />
        <Tooltip
          content={({ active, payload, label }) =>
            active && payload?.length ? (
              <TooltipBox label={String(label)} value={formatCurrency(payload[0].value as number)} />
            ) : null
          }
        />
        <Area type="monotone" dataKey="revenue" stroke={LIME} strokeWidth={2} fill="url(#revenueFill)" />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export function StatusChart({ data }: { data: { label: string; count: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
        <XAxis dataKey="label" tick={TICK} axisLine={false} tickLine={false} />
        <YAxis allowDecimals={false} tick={TICK} axisLine={false} tickLine={false} width={30} />
        <Tooltip
          content={({ active, payload, label }) =>
            active && payload?.length ? <TooltipBox label={String(label)} value={String(payload[0].value)} /> : null
          }
        />
        <Bar dataKey="count" fill={LIME} radius={[4, 4, 0, 0]} maxBarSize={24} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function LeadTypeChart({ data }: { data: { type: string; count: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} horizontal={false} />
        <XAxis type="number" allowDecimals={false} tick={TICK} axisLine={false} tickLine={false} />
        <YAxis dataKey="type" type="category" width={110} tick={TICK} axisLine={false} tickLine={false} />
        <Tooltip
          content={({ active, payload, label }) =>
            active && payload?.length ? <TooltipBox label={String(label)} value={String(payload[0].value)} /> : null
          }
        />
        <Bar dataKey="count" fill={LIME} radius={[0, 4, 4, 0]} maxBarSize={20} />
      </BarChart>
    </ResponsiveContainer>
  )
}
