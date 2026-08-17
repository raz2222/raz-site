export function Field({ label, value, onChange }: { label: string; value?: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-dim text-xs uppercase font-mono mb-2 block">{label}</label>
      <input
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent border border-white/30 rounded px-4 py-3 text-sm focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:border-white/50"
      />
    </div>
  )
}

export function TextArea({ label, value, onChange, rows = 3 }: { label: string; value?: string | null; onChange: (v: string) => void; rows?: number }) {
  return (
    <div>
      <label className="text-dim text-xs uppercase font-mono mb-2 block">{label}</label>
      <textarea
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="w-full bg-transparent border border-white/30 rounded px-4 py-3 text-sm focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:border-white/50"
      />
    </div>
  )
}

export function StringListEditor({
  label,
  items,
  onChange,
}: {
  label: string
  items: string[]
  onChange: (items: string[]) => void
}) {
  return (
    <div>
      <label className="text-dim text-xs uppercase font-mono mb-2 block">{label}</label>
      <div className="grid gap-2">
        {items.map((item, i) => (
          <div key={i} className="flex gap-2">
            <input
              value={item}
              onChange={(e) => {
                const next = [...items]
                next[i] = e.target.value
                onChange(next)
              }}
              className="flex-1 bg-transparent border border-white/30 rounded px-3 py-2 text-sm"
            />
            <button onClick={() => onChange(items.filter((_, idx) => idx !== i))} className="text-red-400 text-xs px-2">✕</button>
          </div>
        ))}
      </div>
      <button
        onClick={() => onChange([...items, ""])}
        className="mt-3 font-mono text-xs uppercase tracking-wide underline underline-offset-4 hover:text-[#D1FE17] transition-colors"
      >
        + הוספת שורה
      </button>
    </div>
  )
}

/** Editor for a list of three-field objects, e.g. testimonials {quote, name, role}. */
export function TripleListEditor<A extends string, B extends string, C extends string>({
  label,
  items,
  keyA,
  keyB,
  keyC,
  placeholderA,
  placeholderB,
  placeholderC,
  addLabel,
  emptyItem,
  onChange,
}: {
  label: string
  items: Record<A | B | C, string>[]
  keyA: A
  keyB: B
  keyC: C
  placeholderA: string
  placeholderB: string
  placeholderC: string
  addLabel: string
  emptyItem: Record<A | B | C, string>
  onChange: (items: Record<A | B | C, string>[]) => void
}) {
  return (
    <div>
      <label className="text-dim text-xs uppercase font-mono mb-2 block">{label}</label>
      <div className="grid gap-3">
        {items.map((item, i) => (
          <div key={i} className="border border-white/10 rounded p-3 grid gap-2">
            <div className="flex justify-end">
              <button onClick={() => onChange(items.filter((_, idx) => idx !== i))} className="text-red-400 text-xs px-2">✕</button>
            </div>
            <textarea
              value={item[keyA]}
              onChange={(e) => {
                const next = [...items]
                next[i] = { ...next[i], [keyA]: e.target.value }
                onChange(next)
              }}
              rows={2}
              placeholder={placeholderA}
              className="bg-transparent border border-white/20 rounded px-3 py-2 text-xs"
            />
            <div className="flex gap-2">
              <input
                value={item[keyB]}
                onChange={(e) => {
                  const next = [...items]
                  next[i] = { ...next[i], [keyB]: e.target.value }
                  onChange(next)
                }}
                placeholder={placeholderB}
                className="flex-1 bg-transparent border border-white/30 rounded px-3 py-2 text-sm"
              />
              <input
                value={item[keyC]}
                onChange={(e) => {
                  const next = [...items]
                  next[i] = { ...next[i], [keyC]: e.target.value }
                  onChange(next)
                }}
                placeholder={placeholderC}
                className="flex-1 bg-transparent border border-white/30 rounded px-3 py-2 text-sm"
              />
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={() => onChange([...items, emptyItem])}
        className="mt-3 font-mono text-xs uppercase tracking-wide underline underline-offset-4 hover:text-[#D1FE17] transition-colors"
      >
        {addLabel}
      </button>
    </div>
  )
}

/** Generic editor for a list of two-field objects, e.g. {title, description} / {title, text} / {q, a}. */
export function PairListEditor<A extends string, B extends string>({
  label,
  items,
  keyA,
  keyB,
  placeholderA,
  placeholderB,
  addLabel,
  emptyItem,
  onChange,
}: {
  label: string
  items: Record<A | B, string>[]
  keyA: A
  keyB: B
  placeholderA: string
  placeholderB: string
  addLabel: string
  emptyItem: Record<A | B, string>
  onChange: (items: Record<A | B, string>[]) => void
}) {
  return (
    <div>
      <label className="text-dim text-xs uppercase font-mono mb-2 block">{label}</label>
      <div className="grid gap-3">
        {items.map((item, i) => (
          <div key={i} className="border border-white/10 rounded p-3 grid gap-2">
            <div className="flex gap-2">
              <input
                value={item[keyA]}
                onChange={(e) => {
                  const next = [...items]
                  next[i] = { ...next[i], [keyA]: e.target.value }
                  onChange(next)
                }}
                placeholder={placeholderA}
                className="flex-1 bg-transparent border border-white/30 rounded px-3 py-2 text-sm"
              />
              <button onClick={() => onChange(items.filter((_, idx) => idx !== i))} className="text-red-400 text-xs px-2">✕</button>
            </div>
            <textarea
              value={item[keyB]}
              onChange={(e) => {
                const next = [...items]
                next[i] = { ...next[i], [keyB]: e.target.value }
                onChange(next)
              }}
              rows={2}
              placeholder={placeholderB}
              className="bg-transparent border border-white/20 rounded px-3 py-2 text-xs"
            />
          </div>
        ))}
      </div>
      <button
        onClick={() => onChange([...items, emptyItem])}
        className="mt-3 font-mono text-xs uppercase tracking-wide underline underline-offset-4 hover:text-[#D1FE17] transition-colors"
      >
        {addLabel}
      </button>
    </div>
  )
}
