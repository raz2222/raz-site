import { useContactModal } from "@/hooks/useContactModal"

export function LegalContactCard() {
  const { openModal } = useContactModal()

  return (
    <div className="lg:sticky lg:top-32 border border-white/10 rounded-2xl p-6 bg-white/[0.02] h-fit">
      <h2 className="font-display font-medium text-lg mb-2">יש לכם שאלה?</h2>
      <p className="text-sm text-dim leading-relaxed mb-5">
        מוזמנים לכתוב לי — אני אחזור אליכם בהקדם.
      </p>
      <button
        onClick={openModal}
        className="font-mono text-[10px] uppercase tracking-wide bg-[#D1FE17] text-black rounded-full px-5 py-2.5 hover:scale-105 transition-transform"
      >
        בואו נדבר ←
      </button>
    </div>
  )
}
