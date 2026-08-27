import { useMemo, useState } from "react"
import { PRICE_BOOK_CATEGORIES } from "@/lib/supabase"
import type { QuoteBuilder } from "@/hooks/useQuoteBuilder"
import { cn } from "@/lib/utils"

export function StepServices({ qb }: { qb: QuoteBuilder }) {
  const { priceBook, items, addItem, addCustomItem, removeItem } = qb
  const [catalogSearch, setCatalogSearch] = useState("")
  const [catalogCategory, setCatalogCategory] = useState<string>("הכל")

  const filteredCatalog = useMemo(() => {
    return priceBook.filter((pb) => {
      if (catalogCategory !== "הכל" && pb.category !== catalogCategory) return false
      if (catalogSearch.trim() && !pb.name.includes(catalogSearch.trim())) return false
      return true
    })
  }, [priceBook, catalogCategory, catalogSearch])

  const catalogGrouped = useMemo(() => {
    const map = new Map<string, typeof priceBook>()
    for (const pb of filteredCatalog) {
      if (!map.has(pb.package_slug)) map.set(pb.package_slug, [])
      map.get(pb.package_slug)!.push(pb)
    }
    return [...map.entries()]
  }, [filteredCatalog])

  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-6 items-start">
      <div className="border border-white/10 rounded-lg p-4">
        <input
          value={catalogSearch}
          onChange={(e) => setCatalogSearch(e.target.value)}
          placeholder="חיפוש שירות…"
          className="w-full bg-transparent border border-white/20 rounded px-3 py-2 text-sm mb-3"
        />
        <div className="flex flex-wrap gap-1.5 mb-4">
          <button
            onClick={() => setCatalogCategory("הכל")}
            className={cn(
              "font-mono text-[10px] uppercase tracking-wide rounded-full px-2.5 py-1 border transition-colors",
              catalogCategory === "הכל" ? "border-[#D1FE17] bg-[#D1FE17] text-black" : "border-white/15 text-dim"
            )}
          >
            הכל
          </button>
          {PRICE_BOOK_CATEGORIES.map((c) => (
            <button
              key={c.value}
              onClick={() => setCatalogCategory(c.value)}
              className={cn(
                "font-mono text-[10px] uppercase tracking-wide rounded-full px-2.5 py-1 border transition-colors",
                catalogCategory === c.value ? "border-[#D1FE17] bg-[#D1FE17] text-black" : "border-white/15 text-dim"
              )}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="max-h-[60vh] overflow-y-auto grid gap-4 pr-1">
          {catalogGrouped.map(([slug, groupItems]) => (
            <div key={slug}>
              <div className="text-dim text-[10px] font-mono uppercase mb-1.5">{slug}</div>
              <div className="grid gap-1">
                {groupItems.map((pb) => (
                  <button
                    key={pb.id}
                    onClick={() => addItem(pb)}
                    className="text-right text-xs px-2.5 py-2 rounded hover:bg-white/5 transition-colors flex items-center justify-between gap-2"
                  >
                    <span>{pb.name}</span>
                    <span className="text-dim font-mono flex-none">
                      {pb.base_price != null ? `₪${pb.base_price.toLocaleString("he-IL")}` : "+"}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={addCustomItem}
          className="mt-4 w-full font-mono text-[10px] font-bold uppercase tracking-wide bg-[#D1FE17] text-black rounded-[8px] px-4 py-2.5 hover:scale-105 transition-transform"
        >
          + פריט מותאם אישית
        </button>
      </div>

      <div className="lg:sticky lg:top-24 border border-white/10 rounded-lg p-4">
        <div className="font-mono text-xs uppercase tracking-wide text-dim mb-3">נבחרו ({items.length})</div>
        {items.length === 0 && <p className="text-dim text-sm">בחרו שירותים מהמחירון משמאל.</p>}
        <div className="grid gap-1.5">
          {items.map((it) => (
            <div key={it.localId} className="flex items-center justify-between gap-2 text-sm px-2 py-1.5 rounded bg-white/[0.03]">
              <span className="truncate">{it.name || "פריט ללא שם"}</span>
              <button onClick={() => removeItem(it.localId)} className="font-mono text-[10px] uppercase text-red-400 flex-none">הסרה</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
