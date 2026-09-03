import { useEffect, useState } from "react"

/**
 * A prompt in a box with a copy button. The prompts are English and read
 * left-to-right, so the <pre> forces LTR even though the page around it is RTL
 * — without that, a line starting with "9:16" renders with the ratio thrown to
 * the wrong end and the prompt looks broken.
 */
export function CopyBlock({ label, text }: { label?: string; text: string }) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const t = setTimeout(() => setCopied(false), 2000)
    return () => clearTimeout(t)
  }, [copied])

  async function copy() {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
    } catch {
      // Clipboard is blocked on insecure origins and in some in-app browsers —
      // Instagram's is one of them, and that is where this page gets opened.
      // Selecting the text keeps the manual copy one gesture away.
      const el = document.getElementById(`copy-${label ?? ""}-${text.length}`)
      if (el) {
        const range = document.createRange()
        range.selectNodeContents(el)
        const sel = window.getSelection()
        sel?.removeAllRanges()
        sel?.addRange(range)
      }
    }
  }

  return (
    <div className="surface-raised rounded-lg overflow-hidden">
      <div className="flex items-center justify-between gap-4 px-4 py-2.5 border-b border-white/10">
        <span className="font-mono text-[11px] uppercase tracking-wide text-dim">
          {label ?? "פרומפט"}
        </span>
        <button
          type="button"
          onClick={copy}
          className="font-mono text-[11px] font-bold uppercase tracking-wide text-[#D1FE17] bg-accent-ghost rounded px-3 py-1.5 hover:bg-[#D1FE17] hover:text-black transition-colors"
        >
          {copied ? "הועתק ✓" : "העתק"}
        </button>
      </div>
      <pre
        id={`copy-${label ?? ""}-${text.length}`}
        dir="ltr"
        className="px-4 py-4 text-[13px] leading-relaxed text-foreground/80 whitespace-pre-wrap break-words font-mono max-h-[420px] overflow-y-auto"
      >
        {text}
      </pre>
    </div>
  )
}
