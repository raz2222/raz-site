import { useEffect } from "react"
import { Link } from "react-router-dom"
import { useDocumentMeta } from "@/hooks/useDocumentMeta"

export function EnglishThankYou() {
  useDocumentMeta("Thank you — RAZ", "Your project was sent successfully, I'll get back to you shortly.")

  useEffect(() => {
    document.documentElement.lang = "en"
    document.documentElement.dir = "ltr"
    return () => {
      document.documentElement.lang = "he"
      document.documentElement.dir = "rtl"
    }
  }, [])

  return (
    <section dir="ltr" className="min-h-[80dvh] flex items-center justify-center pt-24 text-left">
      <div className="container text-center max-w-lg">
        <h1 className="font-display font-black text-3xl md:text-5xl mb-6">We&apos;ll build something great together.</h1>
        <p className="text-dim text-lg mb-10">I&apos;ll get back to you shortly.</p>
        <Link
          to="/en"
          className="inline-block font-mono text-sm uppercase tracking-wide bg-[#D1FE17] text-black rounded-full px-7 py-3.5 hover:scale-105 transition-transform"
        >
          Back home →
        </Link>
      </div>
    </section>
  )
}
