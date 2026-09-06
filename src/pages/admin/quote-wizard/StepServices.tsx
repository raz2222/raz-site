import { useMemo, useState } from "react"
import { ChevronDown, Trash2 } from "lucide-react"
import { PRICE_BOOK_CATEGORIES, type PriceBookItemRow } from "@/lib/supabase"
import type { QuoteBuilder } from "@/hooks/useQuoteBuilder"
import { RowActions } from "@/components/admin/RowActions"
import { FEATURED_PACKAGE_SLUG } from "@/lib/packageContract"
import { cn } from "@/lib/utils"

function priceLabel(pb: PriceBookItemRow) {
  return pb.base_price != null ? `₪${pb.base_price.toLocaleString("he-IL")}` : "+"
}

export function StepServices({ qb }: { qb: QuoteBuilder }) {
  const { priceBook, items, addItem, addCustomItem, removeItem } = qb
  const [catalogSearch, setCatalogSearch] = useState("")
  const [catalogCategory, setCatalogCategory] = useState<string>("הכל")

  const [showAll, setShowAll] = useState(false)

  // The three real offers, and everything else. A hundred and thirty four line
  // items are the long tail of what a quote can contain; three of them are what
  // almost every quote actually is.
  const featured = useMemo(
    () => priceBook.filter((pb) => pb.package_slug === FEATURED_PACKAGE_SLUG),
    [priceBook]
  )

  const filteredCatalog = useMemo(() => {
    return priceBook.filter((pb) => {
      if (pb.package_slug === FEATURED_PACKAGE_SLUG) return false
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

  // Searching is the same intent as opening the drawer, so typing opens it
  // rather than filtering a list nobody can see.
  const restOpen = showAll || catalogSearch.trim().length > 0 || catalogCategory !== "הכל"

  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-6 items-start">
      <div className="border border-white/10 rounded-lg p-4">
        <div className="font-mono text-[10px] uppercase tracking-wide text-dim mb-3">החבילות הראשיות</div>
        <div className="grid gap-2">
          {featured.map((pb) => (
            <button
              key={pb.id}
              onClick={() => addItem(pb)}
              className="text-right border border-white/15 rounded-lg px-4 py-3.5 min-h-[56px] hover:border-lime/60 transition-colors flex items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <div className="text-sm font-medium truncate">{pb.name}</div>
                {pb.description && <div className="text-dim text-xs mt-0.5 truncate">{pb.description}</div>}
              </div>
              <span className="font-mono text-sm flex-none">{priceLabel(pb)}</span>
            </button>
          ))}
          {featured.length === 0 && (
            <p className="text-dim text-xs">אין פריטים בחבילות הראשיות. אפשר להגדיר אותן במחירון.</p>
          )}
        </div>

        <button
          onClick={() => setShowAll((v) => !v)}
          aria-expanded={restOpen}
          className="mt-4 w-full flex items-center justify-between gap-2 font-mono text-[10px] uppercase tracking-wide text-dim border border-white/10 rounded-lg px-4 py-3 hover:border-lime/40 hover:text-foreground transition-colors"
        >
          <span>כל שאר השירותים</span>
          <ChevronDown size={14} className={cn("transition-transform", restOpen && "rotate-180")} />
        </button>

        {restOpen && (
          <div className="mt-4">
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
                  catalogCategory === "הכל" ? "border-lime bg-lime text-black" : "border-white/15 text-dim"
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
                    catalogCategory === c.value ? "border-lime bg-lime text-black" : "border-white/15 text-dim"
                  )}
                >
                  {c.label}
                </button>
              ))}
            </div>

            <div className="lg:max-h-[50vh] lg:overflow-y-auto grid gap-4 pr-1">
              {catalogGrouped.length === 0 && <p className="text-dim text-xs">אין שירות תואם.</p>}
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
                        <span className="text-dim font-mono flex-none">{priceLabel(pb)}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={addCustomItem}
          className="mt-4 w-full font-mono text-[10px] font-bold uppercase tracking-wide bg-lime text-black rounded-[8px] px-4 py-2.5 hover:scale-105 transition-transform"
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
              <RowActions actions={[{ icon: Trash2, label: "הסרה", onClick: () => removeItem(it.localId), variant: "danger" }]} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
