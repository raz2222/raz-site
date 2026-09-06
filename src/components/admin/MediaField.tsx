import { useState } from "react"

/** An image field with the thing that makes ACF's useful: you see what is there
 * before you replace it.
 *
 * The site's images are files in `public/`, not uploads · there is no media
 * library and adding one is a bigger decision than this field. So this takes a
 * path or a URL and shows it, which is enough to swap a picture without opening
 * the code, and honest about where the file has to live. */
export function ImageField({
  label,
  value,
  onChange,
  hint,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  hint?: string
}) {
  const [broken, setBroken] = useState(false)
  const trimmed = value.trim()

  return (
    <div>
      <label className="text-dim text-xs uppercase font-mono mb-2 block">{label}</label>

      <div className="flex items-start gap-3 flex-wrap">
        <div className="w-24 h-24 flex-none rounded-lg border border-white/15 overflow-hidden grid place-items-center bg-black/30">
          {trimmed && !broken ? (
            <img
              src={trimmed}
              alt=""
              loading="lazy"
              onError={() => setBroken(true)}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="font-mono text-[9px] uppercase text-dim text-center px-1">
              {trimmed ? "לא נטען" : "אין תמונה"}
            </span>
          )}
        </div>

        <div className="flex-1 min-w-[200px] grid gap-2">
          <input
            value={value}
            onChange={(e) => {
              setBroken(false)
              onChange(e.target.value)
            }}
            placeholder="/images/example.webp"
            className="w-full bg-transparent border border-white/25 rounded px-4 py-3 text-sm focus:outline-none focus-visible:border-white/50"
            dir="ltr"
          />
          {trimmed && (
            <button
              onClick={() => onChange("")}
              className="w-fit font-mono text-[10px] uppercase tracking-wide text-dim underline underline-offset-4 hover:text-lime transition-colors"
            >
              הסרת התמונה
            </button>
          )}
        </div>
      </div>

      <p className="text-dim text-[11px] mt-2 leading-relaxed">
        {hint ?? "נתיב לקובץ בתיקיית התמונות של האתר, למשל /images/hero.webp, או כתובת מלאה."}
      </p>
    </div>
  )
}
