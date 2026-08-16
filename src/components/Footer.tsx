import { Link, useLocation } from "react-router-dom"

export function Footer() {
  const isEnglish = useLocation().pathname.startsWith("/en")

  if (isEnglish) {
    return (
      <footer dir="ltr" className="border-t border-white/10 pt-20 pb-10 text-left">
        <div className="container">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-16">
            <div className="font-mono text-[11px] text-dim uppercase tracking-wide">
              Design / Development / AI
            </div>
            <div className="flex flex-wrap gap-6 font-mono text-xs uppercase tracking-wide text-dim">
              <Link to="/en/work" className="hover:text-[#D1FE17] transition-colors">Work</Link>
              <Link to="/en/services" className="hover:text-[#D1FE17] transition-colors">Services</Link>
              <Link to="/en/about" className="hover:text-[#D1FE17] transition-colors">About</Link>
              <Link to="/en/faq" className="hover:text-[#D1FE17] transition-colors">FAQ</Link>
              <Link to="/en/contact" className="hover:text-[#D1FE17] transition-colors">Contact</Link>
              <a href="https://instagram.com/raz2222" target="_blank" rel="noreferrer" className="hover:text-[#D1FE17] transition-colors">Instagram</a>
            </div>
          </div>

          <div className="flex flex-wrap gap-6 font-mono text-[11px] text-dim uppercase tracking-wide mb-16">
            <a href="mailto:razavramov2@gmail.com" className="hover:text-[#D1FE17] transition-colors">razavramov2@gmail.com</a>
            <Link to="/privacy" className="hover:text-[#D1FE17] transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-[#D1FE17] transition-colors">Terms of Service</Link>
          </div>

          <div className="w-full leading-none select-none">
            <span className="font-display font-bold text-[clamp(60px,15vw,220px)] tracking-tight text-foreground/90">
              RAZ
            </span>
          </div>

          <div className="mt-6 pt-6 border-t border-white/10 font-mono text-[11px] text-dim uppercase tracking-wide">
            © RAZ / Raz Avramov
          </div>
        </div>
      </footer>
    )
  }

  return (
    <footer className="border-t border-white/10 pt-20 pb-10">
      <div className="container">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-16">
          <div className="font-mono text-[11px] text-dim uppercase tracking-wide">
            עיצוב / פיתוח / AI
          </div>
          <div className="flex flex-wrap gap-6 font-mono text-xs uppercase tracking-wide text-dim">
            <Link to="/work" className="hover:text-[#D1FE17] transition-colors">עבודות</Link>
            <Link to="/services" className="hover:text-[#D1FE17] transition-colors">שירותים</Link>
            <Link to="/about" className="hover:text-[#D1FE17] transition-colors">עליי</Link>
            <Link to="/guides" className="hover:text-[#D1FE17] transition-colors">מדריכים</Link>
            <Link to="/faq" className="hover:text-[#D1FE17] transition-colors">שאלות ותשובות</Link>
            <Link to="/tools" className="hover:text-[#D1FE17] transition-colors">כלים</Link>
            <Link to="/contact" className="hover:text-[#D1FE17] transition-colors">צור קשר</Link>
            <a href="https://instagram.com/raz2222" target="_blank" rel="noreferrer" className="hover:text-[#D1FE17] transition-colors">אינסטגרם</a>
          </div>
        </div>

        <div className="flex flex-wrap gap-6 font-mono text-[11px] text-dim uppercase tracking-wide mb-16">
          <a href="mailto:razavramov2@gmail.com" className="hover:text-[#D1FE17] transition-colors">razavramov2@gmail.com</a>
          <Link to="/privacy" className="hover:text-[#D1FE17] transition-colors">מדיניות פרטיות</Link>
          <Link to="/terms" className="hover:text-[#D1FE17] transition-colors">תנאי שימוש</Link>
        </div>

        <div className="w-full leading-none select-none">
          <span className="font-display font-bold text-[clamp(60px,15vw,220px)] tracking-tight text-foreground/90">
            RAZ
          </span>
        </div>

        <div className="mt-6 pt-6 border-t border-white/10 font-mono text-[11px] text-dim uppercase tracking-wide">
          © RAZ / Raz Avramov
        </div>
      </div>
    </footer>
  )
}
