import { CALL_PACKAGES } from "@/lib/callScript"
import { PILOT_TOPUP, type PilotWindow } from "@/lib/pilotWindow"
import { formatCurrency } from "@/lib/quotePricing"
import { formatContractDate, internationalPhone } from "@/lib/contracts"

/** What the client sees while the seven days are running.
 *
 * It renders only for an open window. An expired one shows nothing at all: a
 * client returning to an old contract should not be told what they missed, and
 * the offer is genuinely gone. */
export function PilotOffsetPanel({
  window: pilot,
  currency,
  providerPhone,
  contractTitle,
}: {
  window: PilotWindow
  currency: string
  providerPhone: string | null | undefined
  contractTitle: string
}) {
  if (pilot.state !== "open") return null

  const wa = internationalPhone(providerPhone)
  const message = `היי רז, לגבי ${contractTitle} · אנחנו רוצים להמשיך לחבילה החודשית.`

  const countdown =
    pilot.daysLeft === 0
      ? "היום הוא היום האחרון"
      : pilot.daysLeft === 1
        ? "נשאר יום אחד"
        : `נשארו ${pilot.daysLeft} ימים`

  return (
    <div className="border border-[#D1FE17]/40 rounded-lg p-5 grid gap-3">
      <div className="font-mono text-xs uppercase tracking-wide text-[#D1FE17]">קיזוז מלא של הפיילוט</div>
      <p className="text-sm leading-relaxed">
        עד {formatContractDate(pilot.deadline)} אפשר להמשיך ל{CALL_PACKAGES.monthly.name} ולשלם רק{" "}
        {formatCurrency(PILOT_TOPUP, currency)} נוספים · הסכום ששילמתם על הפיילוט מתקזז במלואו, והסרטון שכבר קיבלתם
        נחשב הראשון מתוך חמישה.
      </p>
      <p className="font-mono text-xs text-dim">{countdown}</p>
      {wa && (
        <a
          href={`https://wa.me/${wa}?text=${encodeURIComponent(message)}`}
          target="_blank"
          rel="noreferrer"
          className="w-fit font-mono text-[10px] font-bold uppercase tracking-wide bg-[#D1FE17] text-black rounded-full px-5 py-2.5 hover:scale-105 transition-transform"
        >
          רוצים להמשיך ←
        </a>
      )}
    </div>
  )
}
