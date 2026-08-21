import { Link, useLocation } from "react-router-dom"
import { useDocumentMeta } from "@/hooks/useDocumentMeta"
import { Reveal } from "@/components/Reveal"

export function NotFound() {
  const isEnglish = useLocation().pathname.startsWith("/en")

  useDocumentMeta(
    isEnglish ? "Page not found · RAZ" : "העמוד לא נמצא · RAZ",
    isEnglish ? "The page you're looking for doesn't exist or has moved." : "העמוד שחיפשתם לא קיים או שהוא הועבר."
  )

  return (
    <section className="pt-32 pb-28 md:pt-40 md:pb-40" dir={isEnglish ? "ltr" : "rtl"}>
      <div className="container max-w-2xl text-center">
        <Reveal className="font-mono text-xs uppercase tracking-wide text-dim mb-4">404</Reveal>
        <Reveal>
          <h1 className="font-display font-black text-[clamp(36px,6.6vw,80px)] leading-[1.05] tracking-tight mb-6">
            {isEnglish ? "Page not found" : "העמוד לא נמצא"}
          </h1>
        </Reveal>
        <Reveal delay={80}>
          <p className="text-lg text-dim leading-relaxed mb-10 max-w-md mx-auto">
            {isEnglish
              ? "This page doesn't exist or may have moved. Try heading back home."
              : "העמוד שחיפשתם לא קיים או שהוא הועבר. אפשר לחזור לדף הבית."}
          </p>
        </Reveal>
        <Reveal delay={140}>
          <Link
            to={isEnglish ? "/en" : "/"}
            className="inline-block font-mono text-[10px] font-bold uppercase tracking-wide bg-[#D1FE17] text-black rounded-full px-7 py-3.5 hover:scale-105 transition-transform"
          >
            {isEnglish ? "Back home ←" : "חזרה לדף הבית ←"}
          </Link>
        </Reveal>
      </div>
    </section>
  )
}
