import { useRef, useState } from "react"
import { Download, Link2, Trash2, Upload } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { adminNotify } from "./AdminToaster"

/** The price book as a file a client can be sent.
 *
 * The screen is for Raz; a client wants one document. It is replaced rather
 * than versioned on purpose · there is one current price list, and a folder of
 * near-identical PDFs is how the wrong one gets sent.
 *
 * Public to read, because the whole point is a link someone opens without an
 * account. Owner-only to write, like every other bucket here. */
const BUCKET = "documents"
const MAX_BYTES = 20 * 1024 * 1024

export function PriceListFile({
  url,
  name,
  onChange,
}: {
  url: string | null
  name: string | null
  onChange: (next: { price_list_url: string | null; price_list_name: string | null }) => void
}) {
  const input = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)

  async function upload(file: File) {
    if (file.size > MAX_BYTES) {
      adminNotify(`הקובץ ${(file.size / 1024 / 1024).toFixed(1)}MB · המקסימום הוא 20MB.`)
      return
    }
    setBusy(true)
    // One stable path, so replacing the file does not leave the old one behind
    // and every link already sent keeps working.
    const ext = file.name.split(".").pop()?.toLowerCase() || "pdf"
    const path = `price-list/current.${ext}`
    const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
      upsert: true,
      contentType: file.type || "application/pdf",
    })
    setBusy(false)
    if (error) {
      adminNotify(error.message)
      return
    }
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
    // A cache-buster, or a replaced file keeps showing the previous one.
    onChange({ price_list_url: `${data.publicUrl}?v=${Date.now()}`, price_list_name: file.name })
  }

  async function copyLink() {
    if (!url) return
    try {
      await navigator.clipboard.writeText(url)
      adminNotify("הקישור הועתק · אפשר לשלוח ללקוח")
    } catch {
      adminNotify("הדפדפן לא נתן להעתיק. אפשר לפתוח ולהעתיק מהכתובת.")
    }
  }

  return (
    <div className="border border-white/10 rounded-lg p-4 grid gap-3">
      <div>
        <div className="text-sm font-medium">קובץ מחירון לשליחה</div>
        <p className="text-dim text-xs mt-1">
          PDF אחד שאפשר לשלוח ללקוח. העלאה חדשה מחליפה את הקודם, וכל קישור שכבר נשלח ממשיך לעבוד.
        </p>
      </div>

      {url ? (
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="font-mono text-[10px] uppercase tracking-wide border border-white/20 rounded-full px-4 min-h-[44px] inline-flex items-center gap-2 hover:border-lime hover:text-lime transition-colors"
          >
            <Download size={14} /> {name || "המחירון"}
          </a>
          <button
            onClick={copyLink}
            className="font-mono text-[10px] uppercase tracking-wide border border-white/20 rounded-full px-4 min-h-[44px] inline-flex items-center gap-2 hover:border-lime hover:text-lime transition-colors"
          >
            <Link2 size={14} /> העתקת קישור
          </button>
          <button
            onClick={() => {
              if (confirm("להסיר את קובץ המחירון?")) onChange({ price_list_url: null, price_list_name: null })
            }}
            aria-label="הסרת הקובץ"
            className="text-red-400 hover:bg-red-500/10 rounded-lg min-w-[44px] min-h-[44px] inline-flex items-center justify-center transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ) : (
        <p className="text-dim text-xs">עדיין לא הועלה קובץ.</p>
      )}

      <div>
        <input
          ref={input}
          type="file"
          accept="application/pdf,image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) upload(file)
            e.target.value = ""
          }}
        />
        <button
          onClick={() => input.current?.click()}
          disabled={busy}
          className="font-mono text-[10px] uppercase tracking-wide border border-white/20 rounded-full px-4 min-h-[44px] inline-flex items-center gap-2 hover:border-lime hover:text-lime transition-colors disabled:opacity-40"
        >
          <Upload size={14} /> {busy ? "מעלה…" : url ? "החלפת הקובץ" : "העלאת קובץ"}
        </button>
      </div>
    </div>
  )
}
