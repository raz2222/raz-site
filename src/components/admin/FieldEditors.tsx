import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { adminNotify } from "@/components/admin/AdminToaster"

const MEDIA_UPLOAD_TYPES = ["video/mp4", "video/webm", "video/quicktime", "image/jpeg", "image/png", "image/webp"]

/** Supabase's own ceiling on the free plan, and not ours to choose: the storage
 * API rejects anything larger whatever this file says. It used to say 100MB,
 * which let an upload start that the server was always going to refuse · a
 * clear "too big" replaced by a confusing failure halfway through.
 *
 * Raising it means the Pro plan. For a portfolio clip it usually should not:
 * 30 seconds of 1080p H.264 is a handful of megabytes, and a 100MB video would
 * cost a phone visitor far more than it costs the admin. The field also accepts
 * a URL, so a film that genuinely has to stay large can be hosted elsewhere and
 * pasted in. */
const MEDIA_MAX_BYTES = 50 * 1024 * 1024

/** Text path input + drag-in file upload to a Supabase Storage bucket, with inline preview. */
export function MediaField({
  label,
  value,
  onChange,
  bucket,
  kind = "auto",
}: {
  label: string
  value: string | null | undefined
  onChange: (url: string) => void
  bucket: string
  kind?: "image" | "video" | "auto"
}) {
  const [uploading, setUploading] = useState(false)

  async function handleUpload(file: File) {
    if (!MEDIA_UPLOAD_TYPES.includes(file.type)) {
      adminNotify("סוג קובץ לא נתמך. אפשר להעלות MP4 / WebM / MOV / JPG / PNG / WebP בלבד.")
      return
    }
    if (file.size > MEDIA_MAX_BYTES) {
      // Say the real number and what to do about it. "Too big" on its own sends
      // someone looking for a setting that is not theirs to change.
      adminNotify(
        `הקובץ ${Math.round(file.size / 1024 / 1024)}MB · המקסימום הוא 50MB. אפשר לדחוס את הסרטון, או להעלות אותו לאן שנוח ולהדביק כאן קישור.`,
        "error"
      )
      return
    }
    setUploading(true)
    const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_")
    const path = `${Date.now()}-${safeName}`
    const { error } = await supabase.storage.from(bucket).upload(path, file)
    setUploading(false)
    if (error) {
      adminNotify(error.message)
      return
    }
    const { data } = supabase.storage.from(bucket).getPublicUrl(path)
    onChange(data.publicUrl)
  }

  const isVideo = kind === "video" || (kind === "auto" && /\.(mp4|webm|mov)$/i.test(value ?? ""))

  return (
    <div>
      <label className="text-dim text-sm mb-2 block">{label}</label>
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="/videos/... או העלאה למטה"
          className="flex-1 bg-transparent border border-white/30 rounded px-4 py-3 text-sm focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:border-white/50"
        />
        <label className="flex-none font-mono text-xs uppercase tracking-wide border border-white/30 rounded px-4 py-3 text-center cursor-pointer hover:border-lime transition-colors">
          {uploading ? "מעלה…" : "העלאת קובץ"}
          <input
            type="file"
            accept="video/*,image/*"
            className="hidden"
            disabled={uploading}
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleUpload(file)
              e.target.value = ""
            }}
          />
        </label>
      </div>
      {value && (
        <div className="mt-2 w-32 aspect-square rounded overflow-hidden border border-white/10 bg-neutral-900">
          {isVideo ? (
            <video src={value} muted loop playsInline autoPlay className="w-full h-full object-cover" />
          ) : (
            <img src={value} alt="" loading="lazy" className="w-full h-full object-cover" />
          )}
        </div>
      )}
    </div>
  )
}

export type GalleryItem = { type: "image" | "video"; url: string; caption: string }

/** Editor for a list of extra project media (images/videos beyond the single hero video), with upload. */
export function GalleryEditor({
  label,
  items,
  bucket,
  onChange,
}: {
  label: string
  items: GalleryItem[]
  bucket: string
  onChange: (items: GalleryItem[]) => void
}) {
  return (
    <div>
      <label className="text-dim text-sm mb-2 block">{label}</label>
      <div className="grid gap-3">
        {items.map((item, i) => (
          <div key={i} className="border border-white/10 rounded p-3 grid gap-2">
            <div className="flex items-center justify-between gap-2">
              <select
                value={item.type}
                onChange={(e) => {
                  const next = [...items]
                  next[i] = { ...next[i], type: e.target.value as GalleryItem["type"] }
                  onChange(next)
                }}
                className="bg-background border border-white/30 rounded px-3 py-2 text-xs"
              >
                <option value="image">תמונה</option>
                <option value="video">וידאו</option>
              </select>
              <button onClick={() => onChange(items.filter((_, idx) => idx !== i))} className="text-red-400 text-xs px-3 py-2.5 leading-none">✕ הסרה</button>
            </div>
            <MediaField
              label="קובץ"
              value={item.url}
              kind={item.type}
              bucket={bucket}
              onChange={(url) => {
                const next = [...items]
                next[i] = { ...next[i], url }
                onChange(next)
              }}
            />
            <input
              value={item.caption}
              onChange={(e) => {
                const next = [...items]
                next[i] = { ...next[i], caption: e.target.value }
                onChange(next)
              }}
              placeholder="כיתוב (אופציונלי)"
              className="bg-transparent border border-white/20 rounded px-3 py-2 text-xs"
            />
          </div>
        ))}
      </div>
      <button
        onClick={() => onChange([...items, { type: "image", url: "", caption: "" }])}
        className="mt-3 font-mono text-xs uppercase tracking-wide underline underline-offset-4 hover:text-lime transition-colors"
      >
        + הוספת מדיה
      </button>
    </div>
  )
}

export function Field({ label, value, onChange }: { label: string; value?: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-dim text-sm mb-2 block">{label}</label>
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
      <label className="text-dim text-sm mb-2 block">{label}</label>
      <textarea
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="w-full bg-transparent border border-white/30 rounded px-4 py-3 text-sm focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:border-white/50"
      />
    </div>
  )
}

/** The one input shape, for the fields that are not free text.
 *
 * A `<select>` with its own classes was copied into four screens before this,
 * each with the label in a different style · the page editor's fields say
 * `text-dim text-sm`, so these do too. */
export function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <div>
      <label className="text-dim text-sm mb-2 block">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-background border border-white/30 rounded px-4 py-3 text-sm focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:border-white/50"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}

/** A number with the sentence that says what it does.
 *
 * The hint is not decoration: every one of these is a rule about how the studio
 * behaves, and a bare number in a box does not say which. */
export function NumberField({
  label,
  hint,
  value,
  onChange,
}: {
  label: string
  hint?: string
  value: number
  onChange: (v: number) => void
}) {
  return (
    <div>
      <label className="text-dim text-sm mb-2 block">{label}</label>
      <input
        inputMode="numeric"
        value={String(value)}
        onChange={(e) => onChange(Number(e.target.value.replace(/\D/g, "")) || 0)}
        className="w-28 bg-transparent border border-white/30 rounded px-4 py-3 text-sm focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:border-white/50"
      />
      {hint && <p className="text-dim text-xs mt-2 max-w-sm leading-relaxed">{hint}</p>}
    </div>
  )
}

/** On or off, in the shape the admin already uses for one · the card from
 * `PushToggle`: what it is, what it does, and a pill that changes it. A bare
 * checkbox was the other option and appears nowhere else in here. */
export function ToggleField({
  label,
  hint,
  checked,
  onChange,
  onLabel = "כיבוי",
  offLabel = "הפעלה",
}: {
  label: string
  hint: string
  checked: boolean
  onChange: (checked: boolean) => void
  onLabel?: string
  offLabel?: string
}) {
  return (
    <div className="border border-white/10 rounded-lg p-5 grid gap-3">
      <div>
        <div className="font-mono text-[10px] uppercase tracking-wide text-dim">{label}</div>
        <p className="text-dim text-xs mt-2 leading-relaxed">{hint}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        aria-pressed={checked}
        className={
          checked
            ? "w-fit font-mono text-[10px] uppercase tracking-wide border border-white/25 rounded-full px-5 min-h-[44px] hover:border-lime transition-colors"
            : "w-fit font-mono text-[10px] font-bold uppercase tracking-wide bg-lime text-black rounded-full px-5 min-h-[44px] hover:scale-105 transition-transform"
        }
      >
        {checked ? onLabel : offLabel}
      </button>
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
      <label className="text-dim text-sm mb-2 block">{label}</label>
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
            <button onClick={() => onChange(items.filter((_, idx) => idx !== i))} aria-label="מחיקת שורה" className="text-red-400 text-xs px-3 py-2.5 leading-none">✕</button>
          </div>
        ))}
      </div>
      <button
        onClick={() => onChange([...items, ""])}
        className="mt-3 font-mono text-xs uppercase tracking-wide underline underline-offset-4 hover:text-lime transition-colors"
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
      <label className="text-dim text-sm mb-2 block">{label}</label>
      <div className="grid gap-3">
        {items.map((item, i) => (
          <div key={i} className="border border-white/10 rounded p-3 grid gap-2">
            <div className="flex justify-end">
              <button onClick={() => onChange(items.filter((_, idx) => idx !== i))} aria-label="מחיקת שורה" className="text-red-400 text-xs px-3 py-2.5 leading-none">✕</button>
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
        className="mt-3 font-mono text-xs uppercase tracking-wide underline underline-offset-4 hover:text-lime transition-colors"
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
      <label className="text-dim text-sm mb-2 block">{label}</label>
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
              <button onClick={() => onChange(items.filter((_, idx) => idx !== i))} aria-label="מחיקת שורה" className="text-red-400 text-xs px-3 py-2.5 leading-none">✕</button>
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
        className="mt-3 font-mono text-xs uppercase tracking-wide underline underline-offset-4 hover:text-lime transition-colors"
      >
        {addLabel}
      </button>
    </div>
  )
}
