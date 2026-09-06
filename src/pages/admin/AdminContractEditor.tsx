import { useState } from "react"
import { Link } from "react-router-dom"
import { CONTRACT_STATUS_LABELS, type ContractSection, type PaymentScheduleEntry } from "@/lib/supabase"
import { PAYMENT_TERM_PRESETS, formatCurrency } from "@/lib/quotePricing"
import { CONTRACT_VARIABLE_HELP, formatContractDate, scheduleTotal } from "@/lib/contracts"
import { PILOT_TOPUP, PILOT_WINDOW_DAYS, pilotWindow, todayIso } from "@/lib/pilotWindow"
import { AdminGate } from "@/components/AdminGate"
import { AdminNav } from "@/components/AdminNav"
import { Field, TextArea, StringListEditor } from "@/components/admin/FieldEditors"
import { ContractDocument } from "@/components/contract/ContractDocument"
import { useContractEditor } from "@/hooks/useContractEditor"
import { cn } from "@/lib/utils"

const TABS = ["פרטים", "סעיפים", "תצוגה מקדימה", "שליחה"] as const
type Tab = (typeof TABS)[number]

function buildWhatsAppText(title: string, link: string) {
  return `היי! מצורף חוזה העבודה: ${title}.\nאפשר לקרוא ולחתום דיגיטלית כאן: ${link}`
}

/** The seven-day offset, made countable.
 *
 * It only appears on a signed pilot, because that is the only contract the
 * promise was made on. Before delivery it asks for the one fact nobody else
 * knows · the day the video was handed over · and after that it counts down and
 * offers the follow-up contract with the numbers already in it. */
function PilotWindowBlock({ ed }: { ed: ReturnType<typeof useContractEditor> }) {
  const { contract } = ed
  const pilot = pilotWindow({
    package_key: contract.package_key ?? null,
    status: contract.status ?? "draft",
    pilot_delivered_at: contract.pilot_delivered_at ?? null,
  })
  if (pilot.state === "none") return null

  const monthlyHref = `/admin/contracts/new?package=monthly${contract.client_id ? `&clientId=${contract.client_id}` : ""}`

  return (
    <div
      className={cn(
        "border rounded-lg px-5 py-4 mb-6 grid gap-3",
        pilot.state === "open" && pilot.daysLeft <= 2 ? "border-lime bg-lime/10" : "border-white/15"
      )}
    >
      <div className="font-mono text-xs uppercase tracking-wide text-dim">חלון הקיזוז של הפיילוט</div>

      {pilot.state === "awaiting_delivery" && (
        <>
          <p className="text-sm leading-relaxed">
            הפיילוט נחתם. {PILOT_WINDOW_DAYS} הימים מתחילים ביום שהסרטון נמסר ללקוח, לא ביום החתימה · הוא צריך לראות
            אותו כדי להחליט.
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => ed.setPilotDelivered(todayIso())}
              className="font-mono text-[10px] font-bold uppercase tracking-wide bg-lime text-black rounded-full px-5 py-2.5 hover:scale-105 transition-transform"
            >
              נמסר היום
            </button>
            <label className="flex items-center gap-2 text-dim text-xs">
              או בתאריך אחר
              <input
                type="date"
                max={todayIso()}
                onChange={(e) => e.target.value && ed.setPilotDelivered(e.target.value)}
                className="bg-transparent border border-white/25 rounded px-3 py-2 text-sm"
              />
            </label>
          </div>
        </>
      )}

      {pilot.state === "open" && (
        <>
          <p className="text-sm leading-relaxed">
            נמסר ב-{formatContractDate(contract.pilot_delivered_at)}. עד {formatContractDate(pilot.deadline)} הלקוח
            יכול להשלים {formatCurrency(PILOT_TOPUP, contract.currency ?? "ILS")} ולקבל עוד ארבעה סרטונים ·{" "}
            {pilot.daysLeft === 0
              ? "היום הוא היום האחרון"
              : pilot.daysLeft === 1
                ? "נשאר יום אחד"
                : `נשארו ${pilot.daysLeft} ימים`}
            .
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            <Link
              to={monthlyHref}
              className="font-mono text-[10px] uppercase tracking-wide border border-white/25 rounded-full px-5 py-2.5 hover:border-lime transition-colors"
            >
              חוזה חודשי ללקוח הזה ←
            </Link>
            <button
              onClick={() => ed.setPilotDelivered(null)}
              className="font-mono text-[10px] uppercase tracking-wide text-dim underline underline-offset-4 hover:text-lime"
            >
              ביטול תאריך המסירה
            </button>
          </div>
        </>
      )}

      {pilot.state === "expired" && (
        <p className="text-dim text-sm leading-relaxed">
          החלון נסגר ב-{formatContractDate(pilot.deadline)}. הקיזוז כבר לא בתוקף, והלקוח לא רואה אותו יותר בחוזה
          שלו. חבילה חודשית מכאן היא במחיר המלא.
        </p>
      )}
    </div>
  )
}

function AdminContractEditorInner() {
  const ed = useContractEditor()
  const [tab, setTab] = useState<Tab>("פרטים")
  const [copied, setCopied] = useState(false)

  if (ed.loading) return <div className="pt-40 pb-40 container font-mono text-xs text-dim uppercase">טוען…</div>

  const { contract, setContract, locked, provider } = ed
  const contractLink = contract.id ? `${window.location.origin}/portal/contract/${contract.id}` : null
  const whatsappHref =
    contractLink && contract.client_phone
      ? `https://wa.me/${contract.client_phone.replace(/\D/g, "")}?text=${encodeURIComponent(buildWhatsAppText(contract.title || "חוזה עבודה", contractLink))}`
      : null

  function updateSection(index: number, patch: Partial<ContractSection>) {
    const sections = [...(contract.sections ?? [])]
    sections[index] = { ...sections[index], ...patch }
    setContract({ ...contract, sections })
  }

  function moveSection(index: number, dir: -1 | 1) {
    const sections = [...(contract.sections ?? [])]
    const target = index + dir
    if (target < 0 || target >= sections.length) return
    ;[sections[index], sections[target]] = [sections[target], sections[index]]
    setContract({ ...contract, sections })
  }

  function updateScheduleEntry(index: number, patch: Partial<PaymentScheduleEntry>) {
    const schedule = [...(contract.payment_schedule ?? [])]
    schedule[index] = { ...schedule[index], ...patch }
    setContract({ ...contract, payment_schedule: schedule })
  }

  const scheduleSum = scheduleTotal(contract.payment_schedule ?? [])
  // A schedule that does not add up to the agreed total is the kind of thing a
  // client notices at exactly the wrong moment.
  const scheduleMismatch = (contract.payment_schedule ?? []).length > 0 && Math.abs(scheduleSum - (contract.total ?? 0)) > 1

  return (
    <div className="min-h-[100dvh] pt-28 pb-28 md:pb-20 px-6 md:px-12 print:pt-0 print:px-0">
      <div className="print:hidden">
        <AdminNav />

        <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
          <div className="flex-1 min-w-[240px]">
            <Link to="/admin/contracts" className="font-mono text-[10px] uppercase tracking-wide text-dim hover:text-lime transition-colors">
              → כל החוזים
            </Link>
            <div className="flex items-center gap-3 flex-wrap mt-2">
              <input
                value={contract.title ?? ""}
                onChange={(e) => setContract({ ...contract, title: e.target.value })}
                disabled={locked}
                placeholder="שם ההתקשרות"
                className="font-display font-bold text-xl bg-transparent border-b border-white/20 focus:border-lime outline-none px-1 py-1 disabled:opacity-70"
              />
              {contract.contract_number && <span className="font-mono text-xs text-dim">{contract.contract_number}</span>}
              <span className="font-mono text-[11px] uppercase tracking-wide border border-white/20 rounded-full px-3 py-1">
                {CONTRACT_STATUS_LABELS[contract.status ?? "draft"]}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {!locked && (
              <button
                onClick={ed.save}
                disabled={ed.saving}
                className="font-mono text-xs uppercase tracking-wide bg-lime text-black rounded-full px-5 py-2.5 hover:scale-105 transition-transform disabled:opacity-50"
              >
                {ed.saving ? "שומר…" : "שמירה"}
              </button>
            )}
            {contract.id && !ed.signature && (
              <button onClick={ed.remove} className="font-mono text-xs uppercase tracking-wide text-red-400 px-2 py-2">
                מחיקה
              </button>
            )}
          </div>
        </div>

        {locked && (
          <div className="border border-lime/40 bg-lime/5 rounded-lg px-5 py-4 mb-6 text-sm">
            החוזה נחתם על ידי {ed.signature?.full_name} ב-{ed.signature ? new Date(ed.signature.signed_at).toLocaleString("he-IL") : ""}.
            מכאן הוא נעול לעריכה, כדי שהחתימה תמשיך להתייחס למה שנחתם בפועל.
          </div>
        )}

        <PilotWindowBlock ed={ed} />

        <div className="flex items-center gap-1 border-b border-white/10 mb-8 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "font-mono text-[10px] md:text-xs uppercase tracking-wide px-3 md:px-4 py-3 border-b-2 -mb-px whitespace-nowrap transition-colors",
                tab === t ? "border-lime text-foreground" : "border-transparent text-dim hover:text-lime"
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {tab === "פרטים" && (
        <div className="grid gap-8 max-w-2xl print:hidden">
          <section className="grid gap-4">
            <h2 className="font-display font-medium text-lg">מקור</h2>
            <div>
              <label className="text-dim text-xs uppercase font-mono mb-2 block">מבוסס על הצעת מחיר</label>
              <select
                value={contract.quote_id ?? ""}
                onChange={(e) =>
                  e.target.value ? ed.applyQuote(e.target.value) : setContract({ ...contract, quote_id: null })
                }
                disabled={locked}
                className="bg-background border border-white/30 rounded px-4 py-3 text-sm w-full"
              >
                <option value="">ללא הצעה · מילוי ידני</option>
                {ed.quotes.map((q) => (
                  <option key={q.id} value={q.id}>
                    {q.title} · {q.client_name} · {formatCurrency(q.final_total ?? q.calculated_total ?? q.total, q.currency)}
                  </option>
                ))}
              </select>
              <p className="text-dim text-[11px] mt-2">
                בחירה ממלאת אוטומטית לקוח, תוצרים, תמורה ותנאי תשלום מתוך ההצעה.
              </p>
            </div>

            <div>
              <label className="text-dim text-xs uppercase font-mono mb-2 block">תבנית החוזה</label>
              <div className="flex gap-2 flex-wrap">
                <select
                  value={contract.template_id ?? ""}
                  onChange={(e) => setContract({ ...contract, template_id: e.target.value || null })}
                  disabled={locked}
                  className="bg-background border border-white/30 rounded px-4 py-3 text-sm flex-1 min-w-[200px]"
                >
                  <option value="">ללא תבנית</option>
                  {ed.templates.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
                <button
                  onClick={() => contract.template_id && ed.applyTemplate(contract.template_id)}
                  disabled={locked || !contract.template_id}
                  className="font-mono text-xs uppercase tracking-wide border border-white/30 rounded-full px-4 py-2 hover:border-lime transition-colors disabled:opacity-40"
                >
                  טעינת הנוסח
                </button>
              </div>
              <p className="text-dim text-[11px] mt-2">
                טעינה דורסת את הסעיפים הקיימים בחוזה הזה ובונה אותם מחדש מהתבנית, עם פרטי הלקוח והתמורה שמולאו כאן.
              </p>
            </div>
          </section>

          <section className="grid gap-4">
            <h2 className="font-display font-medium text-lg">הלקוח</h2>
            <div>
              <label className="text-dim text-xs uppercase font-mono mb-2 block">בחירה מרשימת הלקוחות</label>
              <select
                value={contract.client_id ?? ""}
                onChange={(e) => e.target.value && ed.applyClient(e.target.value)}
                disabled={locked}
                className="bg-background border border-white/30 rounded px-4 py-3 text-sm w-full"
              >
                <option value="">בחרו לקוח</option>
                {ed.clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.name} · {c.email}</option>
                ))}
              </select>
            </div>
            <Field label="שם מלא" value={contract.client_name ?? ""} onChange={(v) => setContract({ ...contract, client_name: v })} />
            <Field label="אימייל (זו גם הכתובת שאיתה הלקוח נכנס לפורטל)" value={contract.client_email ?? ""} onChange={(v) => setContract({ ...contract, client_email: v })} />
            <Field label="שם החברה" value={contract.client_company ?? ""} onChange={(v) => setContract({ ...contract, client_company: v })} />
            <Field label="ח.פ / ת.ז" value={contract.client_id_number ?? ""} onChange={(v) => setContract({ ...contract, client_id_number: v })} />
            <Field label="כתובת" value={contract.client_address ?? ""} onChange={(v) => setContract({ ...contract, client_address: v })} />
            <Field label="טלפון" value={contract.client_phone ?? ""} onChange={(v) => setContract({ ...contract, client_phone: v })} />
          </section>

          <section className="grid gap-4">
            <h2 className="font-display font-medium text-lg">היקף העבודה</h2>
            <TextArea label="תיאור העבודה" value={contract.scope} onChange={(v) => setContract({ ...contract, scope: v })} rows={4} />
            <StringListEditor
              label="תוצרים"
              items={contract.deliverables ?? []}
              onChange={(items) => setContract({ ...contract, deliverables: items })}
            />
            <Field label="לוח זמנים משוער" value={contract.timeline ?? ""} onChange={(v) => setContract({ ...contract, timeline: v })} />
            <div>
              <label className="text-dim text-xs uppercase font-mono mb-2 block">מועד תחילת העבודה</label>
              <input
                type="date"
                value={contract.start_date ?? ""}
                onChange={(e) => setContract({ ...contract, start_date: e.target.value })}
                disabled={locked}
                className="bg-transparent border border-white/30 rounded px-4 py-3 text-sm"
              />
            </div>
          </section>

          <section className="grid gap-4">
            <h2 className="font-display font-medium text-lg">תמורה</h2>
            <div>
              <label className="text-dim text-xs uppercase font-mono mb-2 block">סה"כ תמורה</label>
              <input
                type="number"
                value={contract.total ?? 0}
                onChange={(e) => setContract({ ...contract, total: Number(e.target.value) })}
                disabled={locked}
                className="bg-transparent border border-white/30 rounded px-4 py-3 text-sm w-full"
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={!!contract.vat_included}
                onChange={(e) => setContract({ ...contract, vat_included: e.target.checked })}
                disabled={locked}
              />
              המחיר כולל מע"מ
            </label>
            <div>
              <label className="text-dim text-xs uppercase font-mono mb-2 block">תנאי תשלום</label>
              <div className="flex gap-2 flex-wrap">
                <select
                  value={contract.payment_terms ?? ""}
                  onChange={(e) => setContract({ ...contract, payment_terms: e.target.value })}
                  disabled={locked}
                  className="bg-background border border-white/30 rounded px-4 py-3 text-sm flex-1 min-w-[200px]"
                >
                  <option value="">לא צוין</option>
                  {PAYMENT_TERM_PRESETS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
                <button
                  onClick={ed.rebuildSchedule}
                  disabled={locked}
                  className="font-mono text-xs uppercase tracking-wide border border-white/30 rounded-full px-4 py-2 hover:border-lime transition-colors disabled:opacity-40"
                >
                  חישוב פריסה
                </button>
              </div>
            </div>
            <div>
              <label className="text-dim text-xs uppercase font-mono mb-2 block">פריסת תשלומים</label>
              <div className="grid gap-2">
                {(contract.payment_schedule ?? []).map((entry, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      value={entry.label}
                      onChange={(e) => updateScheduleEntry(i, { label: e.target.value })}
                      disabled={locked}
                      placeholder="למשל: 50% מקדמה"
                      className="flex-1 bg-transparent border border-white/30 rounded px-3 py-2 text-sm"
                    />
                    <input
                      type="number"
                      value={entry.amount}
                      onChange={(e) => updateScheduleEntry(i, { amount: Number(e.target.value) || 0 })}
                      disabled={locked}
                      placeholder="סכום"
                      className="w-32 bg-transparent border border-white/30 rounded px-3 py-2 text-sm font-mono"
                    />
                    {!locked && (
                      <button
                        onClick={() =>
                          setContract({ ...contract, payment_schedule: (contract.payment_schedule ?? []).filter((_, j) => j !== i) })
                        }
                        aria-label="מחיקה"
                        className="text-red-400 text-xs px-2"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {scheduleMismatch && (
                <p className="text-[11px] text-amber-400 mt-2">
                  סכום הפריסה ({formatCurrency(scheduleSum, contract.currency ?? "ILS")}) שונה מסך התמורה.
                </p>
              )}
              {!locked && (
                <button
                  onClick={() =>
                    setContract({ ...contract, payment_schedule: [...(contract.payment_schedule ?? []), { label: "", amount: 0 }] })
                  }
                  className="mt-3 font-mono text-xs uppercase tracking-wide underline underline-offset-4 hover:text-lime transition-colors"
                >
                  + תשלום
                </button>
              )}
            </div>
          </section>

          <section className="grid gap-4">
            <h2 className="font-display font-medium text-lg">הערות</h2>
            <TextArea label="הערות שמופיעות בחוזה" value={contract.notes} onChange={(v) => setContract({ ...contract, notes: v })} />
            <TextArea label="הערות פנימיות (הלקוח לא רואה)" value={contract.internal_notes} onChange={(v) => setContract({ ...contract, internal_notes: v })} />
          </section>
        </div>
      )}

      {tab === "סעיפים" && (
        <div className="max-w-3xl print:hidden">
          <div className="border border-white/10 rounded p-3 mb-6">
            <div className="text-dim text-[11px] font-mono uppercase mb-2">משתנים זמינים</div>
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {CONTRACT_VARIABLE_HELP.map((v) => (
                <span key={v.token} className="text-[11px] text-dim">
                  <code className="text-foreground">{v.token}</code> {v.label}
                </span>
              ))}
            </div>
            <p className="text-dim text-[11px] mt-2">
              המשתנים מוחלפים בפרטים האמיתיים ברגע טעינת הנוסח מהתבנית. מה שנשמור כאן הוא הנוסח הסופי שהלקוח יראה.
            </p>
          </div>

          {!locked && (
            <div className="flex justify-end mb-4">
              <button
                onClick={() => setContract({ ...contract, sections: [...(contract.sections ?? []), { heading: "", body: "" }] })}
                className="font-mono text-[10px] uppercase tracking-wide border border-white/30 rounded-full px-3 py-1.5 hover:border-lime transition-colors"
              >
                + סעיף
              </button>
            </div>
          )}

          <div className="grid gap-3">
            {(contract.sections ?? []).length === 0 && (
              <p className="text-dim text-sm">אין סעיפים עדיין. בחרו תבנית בלשונית "פרטים" ולחצו על טעינת הנוסח.</p>
            )}
            {(contract.sections ?? []).map((section, i) => (
              <div key={i} className="border border-white/10 rounded p-3 grid gap-2">
                <div className="flex items-center gap-2">
                  <input
                    value={section.heading}
                    onChange={(e) => updateSection(i, { heading: e.target.value })}
                    disabled={locked}
                    placeholder="כותרת הסעיף"
                    className="flex-1 bg-transparent border border-white/20 rounded px-3 py-2 text-sm focus:outline-none focus-visible:border-white/50"
                  />
                  {!locked && (
                    <>
                      <button onClick={() => moveSection(i, -1)} aria-label="העלאה" className="text-dim px-2 py-1 hover:text-lime">↑</button>
                      <button onClick={() => moveSection(i, 1)} aria-label="הורדה" className="text-dim px-2 py-1 hover:text-lime">↓</button>
                      <button
                        onClick={() => setContract({ ...contract, sections: (contract.sections ?? []).filter((_, j) => j !== i) })}
                        aria-label="מחיקה"
                        className="text-red-400 px-2 py-1"
                      >
                        ✕
                      </button>
                    </>
                  )}
                </div>
                <textarea
                  value={section.body}
                  onChange={(e) => updateSection(i, { body: e.target.value })}
                  disabled={locked}
                  rows={6}
                  placeholder="נוסח הסעיף"
                  className="w-full bg-transparent border border-white/20 rounded px-3 py-2 text-sm leading-relaxed focus:outline-none focus-visible:border-white/50"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "תצוגה מקדימה" && (
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-end mb-6 print:hidden">
            <button
              onClick={() => window.print()}
              className="font-mono text-xs uppercase tracking-wide border border-white/30 rounded-full px-4 py-2 hover:border-lime transition-colors"
            >
              הדפסה / שמירה כ-PDF
            </button>
          </div>
          <ContractDocument
            contract={{
              contract_number: contract.contract_number ?? null,
              title: contract.title ?? "",
              client_name: contract.client_name ?? "",
              client_company: contract.client_company ?? null,
              client_id_number: contract.client_id_number ?? null,
              client_address: contract.client_address ?? null,
              client_email: contract.client_email ?? "",
              client_phone: contract.client_phone ?? null,
              scope: contract.scope ?? null,
              deliverables: contract.deliverables ?? [],
              timeline: contract.timeline ?? null,
              start_date: contract.start_date ?? null,
              currency: contract.currency ?? "ILS",
              total: contract.total ?? 0,
              vat_included: !!contract.vat_included,
              payment_terms: contract.payment_terms ?? null,
              payment_schedule: contract.payment_schedule ?? [],
              sections: contract.sections ?? [],
              notes: contract.notes ?? null,
              created_at: contract.created_at ?? new Date().toISOString(),
            }}
            provider={provider}
            signature={ed.signature}
          />
        </div>
      )}

      {tab === "שליחה" && (
        <div className="max-w-xl grid gap-6 print:hidden">
          {!contract.id ? (
            <div className="border border-dashed border-white/15 rounded-lg p-10 text-center text-dim text-sm">
              שמרו את החוזה כדי לקבל קישור לשליחה.
            </div>
          ) : (
            <>
              <div className="text-sm">
                סטטוס: <span className="font-mono uppercase">{CONTRACT_STATUS_LABELS[contract.status ?? "draft"]}</span>
                {contract.sent_at && <span className="text-dim text-xs"> · נשלח ב-{new Date(contract.sent_at).toLocaleString("he-IL")}</span>}
              </div>

              <div className="border border-white/10 rounded-lg p-4 grid gap-3">
                <div className="font-mono text-xs uppercase tracking-wide text-dim">קישור לחוזה</div>
                <div className="flex items-center gap-3 flex-wrap">
                  <code className="text-xs text-dim break-all flex-1 min-w-[200px]">{contractLink}</code>
                  <button
                    onClick={() => {
                      if (!contractLink) return
                      navigator.clipboard.writeText(contractLink)
                      setCopied(true)
                      setTimeout(() => setCopied(false), 1500)
                    }}
                    className="font-mono text-xs uppercase tracking-wide border border-white/30 rounded-full px-4 py-2 hover:border-lime transition-colors flex-none"
                  >
                    {copied ? "הועתק ✓" : "העתקה"}
                  </button>
                </div>
                <p className="text-dim text-[11px]">
                  הלקוח נכנס עם קישור התחברות למייל {contract.client_email}, קורא את החוזה וחותם עליו במקום.
                </p>
                {contract.status === "draft" && (
                  <p className="text-[11px] text-amber-400">
                    כל עוד החוזה בסטטוס טיוטה הלקוח לא יראה אותו גם עם הקישור. שליחה במייל, או סימון כ"נשלח",
                    היא מה שפותח לו אותו.
                  </p>
                )}
              </div>

              <div className="border border-white/10 rounded-lg p-4 grid gap-3">
                <div className="font-mono text-xs uppercase tracking-wide text-dim">מייל</div>
                <p className="text-dim text-xs">שולח ללקוח מייל עם קישור לקריאה ולחתימה, ומסמן את החוזה כ"נשלח".</p>
                <button
                  onClick={ed.sendToClient}
                  disabled={ed.sending || locked}
                  className="w-fit font-mono text-[10px] font-bold uppercase tracking-wide bg-lime text-black rounded-[8px] px-4 py-2.5 hover:scale-105 transition-transform disabled:opacity-50"
                >
                  {ed.sending ? "שולח…" : ed.sendResult === "sent" ? "נשלח ✓" : ed.sendResult === "error" ? "שגיאה, נסו שוב" : "שליחה לחתימה"}
                </button>
              </div>

              <div className="border border-white/10 rounded-lg p-4 grid gap-3">
                <div className="font-mono text-xs uppercase tracking-wide text-dim">וואטסאפ</div>
                {whatsappHref ? (
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noreferrer"
                    className="w-fit font-mono text-xs uppercase tracking-wide border border-white/30 rounded-full px-4 py-2 hover:border-lime transition-colors"
                  >
                    פתיחת וואטסאפ ←
                  </a>
                ) : (
                  <span className="text-dim text-xs">יש להוסיף טלפון ללקוח כדי להשתמש בזה.</span>
                )}
                {whatsappHref && contract.status === "draft" && (
                  <button
                    onClick={ed.markAsSent}
                    className="w-fit font-mono text-[10px] uppercase tracking-wide text-dim underline underline-offset-4 hover:text-lime"
                  >
                    סימון כ"נשלח" (אחרי שליחה ידנית)
                  </button>
                )}
              </div>

              {ed.signature && (
                <div className="border border-lime/40 bg-lime/5 rounded-lg p-5 grid gap-2">
                  <div className="font-mono text-xs uppercase tracking-wide text-dim">החתימה</div>
                  {ed.signature.signature_image && (
                    <img src={ed.signature.signature_image} alt="חתימת הלקוח" className="h-16 w-fit bg-white rounded" />
                  )}
                  <div className="text-sm">{ed.signature.full_name}</div>
                  {ed.signature.id_number && <div className="text-dim text-xs">ת.ז / ח.פ {ed.signature.id_number}</div>}
                  <div className="text-dim text-xs">
                    {new Date(ed.signature.signed_at).toLocaleString("he-IL")}
                    {ed.signature.ip_address ? ` · IP ${ed.signature.ip_address}` : ""}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

export function AdminContractEditor() {
  return (
    <AdminGate>
      <AdminContractEditorInner />
    </AdminGate>
  )
}
