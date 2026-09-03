import { useState } from "react"
import { Link } from "react-router-dom"
import { useDocumentMeta } from "@/hooks/useDocumentMeta"
import { AIExperienceSlots } from "@/components/ai-experience/AIExperienceSlots"

// Internal preview for the slot-based variant of the AI experience picker.
// Deliberately not in the nav, not in sitemap-data.ts and not in the prerender
// list, and served noindex — it exists so the idea can be tried on a real
// device before deciding whether it belongs on /services/ai-content.
export function AIExperienceLab() {
  const [drag, setDrag] = useState(true)

  useDocumentMeta("LAB · בחירת דמות ומוצר", undefined, undefined, undefined, { noindex: true })

  return (
    <main className="min-h-dvh bg-black text-white py-16">
      <div className="container max-w-3xl">
        <div className="font-mono text-xs uppercase tracking-wide text-[#D1FE17] mb-2">Lab · לא באתר החי</div>
        <h1 className="font-display font-bold text-3xl md:text-4xl mb-3">בחירת דמות ומוצר — גרסת סלוטים</h1>
        <p className="text-dim text-sm leading-relaxed mb-6">
          שתי קוביות שמתמלאות בזמן אמת במקום שני שלבים נפרדים. גרירה עובדת גם בטלפון וגם בדסקטופ: במגע לוחצים רגע
          על תמונה עד שהיא מתרוממת, ואז גוררים לקובייה. לחיצה רגילה בוחרת כרגיל. הסרטונים כאן הם שילובים קיימים
          מ-Supabase, שום דבר לא נוצר בזמן אמת.
        </p>

        <div className="flex flex-wrap items-center gap-4 mb-12 font-mono text-xs uppercase tracking-wide">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={drag} onChange={(e) => setDrag(e.target.checked)} className="accent-[#D1FE17]" />
            גרירה
          </label>
          <Link to="/services/ai-content#ai-experience" className="text-dim underline underline-offset-4 hover:text-[#D1FE17] transition-colors">
            הגרסה הנוכחית באתר
          </Link>
        </div>

        <AIExperienceSlots enableDrag={drag} />
      </div>
    </main>
  )
}
