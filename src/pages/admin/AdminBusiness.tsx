import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { supabase, type PaymentDetailsRow, type QuoteSettingsRow } from "@/lib/supabase"
import { AdminGate } from "@/components/AdminGate"
import { AdminPage, AdminAction } from "@/components/admin/AdminPage"
import { Field, TextArea } from "@/components/admin/FieldEditors"
import { PushToggle } from "@/components/admin/PushToggle"
import { hasAnyPaymentMethod } from "@/lib/contracts"

/** Everything about Raz's own business: who he is on a contract, and where the
 * money goes.
 *
 * Both of these used to live at the bottom of the price book's settings tab, and
 * on 2026-09-07 Raz said there was no way in the admin to put his bank account
 * or his Bit link. The fields were there; nothing about a screen called מחירון
 * says that. A thing nobody can find is not built.
 *
 * They belong together because they are the two answers a signed contract needs:
 * the top of the page says who is selling, and the panel underneath says where
 * to pay. Pricing configuration stays in the price book. */
function AdminBusinessInner() {
  const [settings, setSettings] = useState<QuoteSettingsRow | null>(null)
  const [payment, setPayment] = useState<PaymentDetailsRow | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      supabase.from("quote_settings").select("*").maybeSingle(),
      supabase.from("payment_details").select("*").maybeSingle(),
    ]).then(([s, p]) => {
      setSettings(s.data ?? null)
      setPayment(p.data ?? null)
      setLoading(false)
    })
  }, [])

  async function save() {
    if (!settings) return
    setSaving(true)
    setError(null)
    const { id: _id, ...settingsPayload } = settings
    const { error: settingsError } = await supabase.from("quote_settings").update(settingsPayload).eq("id", true)
    if (settingsError) {
      setSaving(false)
      setError(settingsError.message)
      return
    }
    if (payment) {
      const { id: _paymentId, updated_at: _updatedAt, ...paymentPayload } = payment
      const { error: paymentError } = await supabase
        .from("payment_details")
        .update({ ...paymentPayload, updated_at: new Date().toISOString() })
        .eq("id", true)
      if (paymentError) {
        setSaving(false)
        setError(paymentError.message)
        return
      }
    }
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const missingIdentity = !settings?.provider_id_number?.trim() || !settings?.provider_address?.trim()
  const missingPayment = !hasAnyPaymentMethod(payment)

  return (
    <AdminPage
      title="פרטי העסק"
      description="מי אתה על החוזה, ולאן הלקוח משלם. ממלאים פעם אחת."
      loading={loading}
      action={<AdminAction onClick={save} disabled={saving || !settings}>{saving ? "שומר…" : saved ? "נשמר ✓" : "שמירה"}</AdminAction>}
    >
      {(missingIdentity || missingPayment) && (
        <div className="border border-amber-400/40 bg-amber-400/5 rounded-lg px-5 py-4 mb-8 grid gap-1">
          <div className="font-medium text-sm">חסרים פרטים שהלקוח רואה</div>
          <ul className="text-dim text-xs leading-relaxed list-disc pr-4">
            {missingIdentity && <li>בלי ח.פ וכתובת, כל חוזה שנשלח יוצא בלי מספר עוסק בצד שלך.</li>}
            {missingPayment && (
              <li>
                בלי אף אמצעי תשלום, לקוח שחותם רואה "פרטי התשלום יישלחו אליכם בנפרד" · והרגע שבו הוא הכי מוכן לשלם
                עובר.
              </li>
            )}
          </ul>
        </div>
      )}

      {error && (
        <p role="alert" className="border border-red-400/40 bg-red-400/5 rounded-lg px-5 py-4 mb-8 text-sm text-red-300">
          {error}
        </p>
      )}

      {settings && (
        <div className="grid gap-10 max-w-xl">
          <section className="grid gap-4">
            <div>
              <h2 className="font-display font-medium text-lg">פרטי העסק</h2>
              <p className="text-dim text-xs mt-1">מודפס בראש כל חוזה והצעה, בצד של נותן השירות.</p>
            </div>
            <Field label="שם העסק" value={settings.provider_business_name} onChange={(v) => setSettings({ ...settings, provider_business_name: v })} />
            <Field label="שם מלא" value={settings.provider_name} onChange={(v) => setSettings({ ...settings, provider_name: v })} />
            <Field label="ח.פ / ע.מ" value={settings.provider_id_number} onChange={(v) => setSettings({ ...settings, provider_id_number: v })} />
            <Field label="כתובת" value={settings.provider_address} onChange={(v) => setSettings({ ...settings, provider_address: v })} />
            <Field label="אימייל" value={settings.provider_email} onChange={(v) => setSettings({ ...settings, provider_email: v })} />
            <Field label="טלפון" value={settings.provider_phone} onChange={(v) => setSettings({ ...settings, provider_phone: v })} />
          </section>

          {payment && (
            <section className="grid gap-4">
              <div>
                <h2 className="font-display font-medium text-lg">לאן משלמים</h2>
                <p className="text-dim text-xs mt-1">
                  מה שהלקוח רואה מיד אחרי שהוא חותם, יחד עם סכום התשלום הראשון. מה שנשאר ריק פשוט לא מוצג ·
                  אפשר להסתפק בביט בלבד.
                </p>
              </div>

              <div className="grid gap-4 rounded-lg border border-white/10 p-5">
                <div className="font-mono text-[10px] uppercase tracking-wide text-dim">העברה בנקאית</div>
                <Field label="שם הבנק" value={payment.bank_name} onChange={(v) => setPayment({ ...payment, bank_name: v })} />
                <Field label="סניף" value={payment.bank_branch} onChange={(v) => setPayment({ ...payment, bank_branch: v })} />
                <Field label="מספר חשבון" value={payment.bank_account_number} onChange={(v) => setPayment({ ...payment, bank_account_number: v })} />
                <Field label="שם בעל החשבון" value={payment.bank_account_holder} onChange={(v) => setPayment({ ...payment, bank_account_holder: v })} />
              </div>

              <div className="grid gap-4 rounded-lg border border-white/10 p-5">
                <div className="font-mono text-[10px] uppercase tracking-wide text-dim">ביט ופייבוקס</div>
                <Field label="מספר טלפון לביט" value={payment.bit_phone} onChange={(v) => setPayment({ ...payment, bit_phone: v })} />
                <Field label="קישור אישי לביט (מהאפליקציה, שיתוף בקשת תשלום)" value={payment.bit_link} onChange={(v) => setPayment({ ...payment, bit_link: v })} />
                <Field label="קישור לפייבוקס" value={payment.paybox_link} onChange={(v) => setPayment({ ...payment, paybox_link: v })} />
              </div>

              <div className="grid gap-4 rounded-lg border border-white/10 p-5">
                <div className="font-mono text-[10px] uppercase tracking-wide text-dim">שאלות על התשלום</div>
                <Field label="טלפון ליצירת קשר" value={payment.contact_phone} onChange={(v) => setPayment({ ...payment, contact_phone: v })} />
                <Field label="מספר וואטסאפ (אם שונה)" value={payment.whatsapp_phone} onChange={(v) => setPayment({ ...payment, whatsapp_phone: v })} />
                <TextArea label="הערה שמופיעה מתחת לפרטי התשלום" value={payment.note} onChange={(v) => setPayment({ ...payment, note: v })} rows={2} />
              </div>
            </section>
          )}

          <section className="grid gap-4">
            <div>
              <h2 className="font-display font-medium text-lg">מספור חוזים</h2>
              <p className="text-dim text-xs mt-1">כל חוזה חדש לוקח את המספר הבא ברצף.</p>
            </div>
            <Field label="קידומת" value={settings.contract_number_prefix} onChange={(v) => setSettings({ ...settings, contract_number_prefix: v })} />
            <Field
              label="מספר החוזה הבא"
              value={String(settings.next_contract_number ?? 1)}
              onChange={(v) => setSettings({ ...settings, next_contract_number: Number(v.replace(/\D/g, "")) || 1 })}
            />
          </section>

          <section className="grid gap-4">
            <div>
              <h2 className="font-display font-medium text-lg">התראות</h2>
              <p className="text-dim text-xs mt-1">מה שקורה באתר, על המסך של הטלפון.</p>
            </div>
            <PushToggle />
          </section>

          <p className="text-dim text-xs">
            מחירים, מכפילים ותנאי תשלום ברירת מחדל נמצאים ב<Link to="/admin/price-book" className="underline underline-offset-4 hover:text-lime">מחירון</Link>.
          </p>
        </div>
      )}
    </AdminPage>
  )
}

export function AdminBusiness() {
  return (
    <AdminGate>
      <AdminBusinessInner />
    </AdminGate>
  )
}
