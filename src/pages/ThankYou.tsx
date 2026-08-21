import { Link } from "react-router-dom"
import { useDocumentMeta } from "@/hooks/useDocumentMeta"

export function ThankYou() {
  useDocumentMeta("תודה · RAZ", "הפרויקט נשלח בהצלחה, אחזור אליכם בהקדם.")

  return (
    <section className="min-h-[80dvh] flex items-center justify-center pt-24">
      <div className="container text-center max-w-lg">
        <h1 className="font-display font-black text-3xl md:text-5xl mb-6">
          בקרוב ניצור דברים מדהימים ביחד.
        </h1>
        <p className="text-dim text-lg mb-10">אדאג לחזור אליכם בהקדם.</p>
        <Link
          to="/"
          className="inline-block font-mono text-[10px] font-bold uppercase tracking-wide bg-[#D1FE17] text-black rounded-full px-7 py-3.5 hover:scale-105 transition-transform"
        >
          חזרה לדף הבית ←
        </Link>
      </div>
    </section>
  )
}
