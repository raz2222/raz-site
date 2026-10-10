import { useEffect, useMemo, useState } from "react"
import { googleCalendarUrl, icsFile, type CalendarEvent } from "@/lib/calendarEvent"
import { trackEvent } from "@/lib/analytics"
import { cn } from "@/lib/utils"
import { formatSlot } from "@/lib/slotFormat"

/** The time picker on the thank-you page.
 *
 * The slots come from `/api/notify-lead?action=slots`, which knows Raz's grid
 * and every meeting already booked; booking writes the time onto the lead and
 * pushes a notification to his phone. The visitor gets the meeting into their
 * own calendar from here, with the same builders the admin uses.
 *
 * Every failure falls back to nothing rather than to an error: the page around
 * it still says when Raz will call, which is the promise that matters. */

const TZ = "Asia/Jerusalem"
const LOCALE = { he: "he-IL", en: "en-GB" } as const

const COPY = {
  he: {
    pick: "בחרו יום ושעה",
    confirm: "קביעת שיחה",
    booking: "קובע…",
    taken: "השעה הזו נתפסה הרגע. בחרו שעה אחרת.",
    failed: "לא הצלחתי לקבוע. אפשר לנסות שוב או לכתוב לי בוואטסאפ.",
    booked: "נקבע. נדבר",
    minutes: (m: number) => `שיחת טלפון של ${m} דקות. אני מתקשר אליכם.`,
    google: "הוספה ליומן Google",
    ics: "הוספה ליומן אחר",
    title: "שיחה עם רז · Made by RAZ",
    description: "רז מתקשר אליכם לשיחה קצרה על הפרויקט.",
  },
  en: {
    pick: "Pick a day and time",
    confirm: "Book the call",
    booking: "Booking…",
    taken: "Someone just took that slot. Please pick another.",
    failed: "Could not book it. Try again, or message me on WhatsApp.",
    booked: "Booked. We'll talk",
    minutes: (m: number) => `A ${m}-minute phone call. I'll call you.`,
    google: "Add to Google Calendar",
    ics: "Add to another calendar",
    title: "Call with Raz · Made by RAZ",
    description: "Raz calls you for a short chat about the project.",
  },
} as const

function dayKey(iso: string) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(iso))
}

function dayLabel(iso: string, lang: "he" | "en") {
  const f = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(LOCALE[lang], { timeZone: TZ, ...o }).format(new Date(iso))
  return { weekday: f({ weekday: "short" }), date: f({ day: "numeric", month: "numeric" }) }
}

function timeLabel(iso: string, lang: "he" | "en") {
  return new Intl.DateTimeFormat(LOCALE[lang], { timeZone: TZ, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(new Date(iso))
}

export function BookCall({
  leadId,
  lang = "he",
  onBooked,
}: {
  leadId: string
  lang?: "he" | "en"
  onBooked: (slot: string) => void
}) {
  const t = COPY[lang]
  const [slots, setSlots] = useState<string[] | null>(null)
  const [minutes, setMinutes] = useState(20)
  const [day, setDay] = useState<string | null>(null)
  const [chosen, setChosen] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [booked, setBooked] = useState<string | null>(null)

  async function load() {
    try {
      const res = await fetch("/api/notify-lead?action=slots")
      if (!res.ok) throw new Error(String(res.status))
      const body = (await res.json()) as { slots: string[]; minutes: number }
      setSlots(body.slots)
      setMinutes(body.minutes)
      setDay((d) => (d && body.slots.some((s) => dayKey(s) === d) ? d : body.slots[0] ? dayKey(body.slots[0]) : null))
    } catch {
      setSlots([])
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const days = useMemo(() => {
    const seen = new Map<string, string>()
    for (const s of slots ?? []) if (!seen.has(dayKey(s))) seen.set(dayKey(s), s)
    return [...seen.entries()]
  }, [slots])

  async function book() {
    if (!chosen) return
    setBusy(true)
    setError(null)
    try {
      const res = await fetch("/api/notify-lead?action=book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId, slot: chosen }),
      })
      const body = (await res.json().catch(() => ({}))) as { slot?: string; code?: string }
      if (res.ok && body.slot) {
        setBooked(body.slot)
        trackEvent("call_booked", { location: "thank_you" })
        onBooked(body.slot)
      } else if (res.status === 409 && body.code === "already_booked" && body.slot) {
        setBooked(body.slot)
        onBooked(body.slot)
      } else if (res.status === 409) {
        setError(t.taken)
        setChosen(null)
        load()
      } else {
        setError(t.failed)
      }
    } catch {
      setError(t.failed)
    }
    setBusy(false)
  }

  if (booked) {
    const event: CalendarEvent = { title: t.title, start: new Date(booked), minutes, description: t.description }
    const ics = `data:text/calendar;charset=utf-8,${encodeURIComponent(icsFile(event, `${leadId}@madebyraz.co.il`))}`
    return (
      <div>
        <p className="font-display text-xl md:text-2xl font-medium">
          {t.booked} {formatSlot(booked, lang)}.
        </p>
        <p className="text-dim mt-2">{t.minutes(minutes)}</p>
        <div className="flex flex-wrap gap-3 mt-5">
          <a href={googleCalendarUrl(event)} target="_blank" rel="noreferrer" className="font-mono text-[11px] font-bold uppercase tracking-wide border border-white/20 rounded-full px-5 py-3 hover:border-[#D1FE17]">
            {t.google}
          </a>
          <a href={ics} download="raz-call.ics" className="font-mono text-[11px] font-bold uppercase tracking-wide border border-white/20 rounded-full px-5 py-3 hover:border-[#D1FE17]">
            {t.ics}
          </a>
        </div>
      </div>
    )
  }

  if (slots === null) return <div className="h-40 rounded-[10px] bg-white/[0.03] animate-pulse" aria-hidden="true" />
  if (slots.length === 0) return null

  const daySlots = slots.filter((s) => dayKey(s) === day)

  return (
    <div>
      <div className="text-dim text-sm mb-3">{t.pick}</div>
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1" role="tablist">
        {days.map(([key, iso]) => {
          const { weekday, date } = dayLabel(iso, lang)
          return (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={day === key}
              onClick={() => {
                setDay(key)
                setChosen(null)
              }}
              className={cn(
                "flex-none min-w-[68px] rounded-[10px] border px-3 py-2.5 text-center transition-colors",
                day === key ? "border-[#D1FE17] bg-[#D1FE17] text-black" : "border-white/15 hover:border-white/40"
              )}
            >
              <div className="text-xs">{weekday}</div>
              <div className="font-mono text-sm font-bold">{date}</div>
            </button>
          )
        })}
      </div>
      <div className="grid grid-cols-2 gap-2 mt-3">
        {daySlots.map((s) => (
          <button
            key={s}
            type="button"
            aria-pressed={chosen === s}
            onClick={() => setChosen(s)}
            className={cn(
              "rounded-[10px] border py-3 font-mono text-sm transition-colors",
              chosen === s ? "border-[#D1FE17] text-[#D1FE17] bg-[#D1FE17]/10" : "border-white/15 hover:border-white/40"
            )}
          >
            {timeLabel(s, lang)}
          </button>
        ))}
      </div>
      {error && <p className="text-sm text-red-400 mt-3" role="alert">{error}</p>}
      <button
        type="button"
        onClick={book}
        disabled={!chosen || busy}
        className="mt-4 w-full font-mono text-sm font-bold uppercase tracking-wide bg-[#D1FE17] text-black rounded-[8px] px-7 py-4 disabled:opacity-40 transition-opacity"
      >
        {busy ? t.booking : chosen ? `${t.confirm} · ${timeLabel(chosen, lang)}` : t.confirm}
      </button>
    </div>
  )
}
