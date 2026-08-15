export function Footer() {
  return (
    <footer className="border-t border-white/10 pt-20 pb-10">
      <div className="container">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-16">
          <div className="font-mono text-[11px] text-dim uppercase tracking-wide">
            עיצוב / פיתוח / AI
          </div>
          <div className="flex flex-wrap gap-6 font-mono text-xs uppercase tracking-wide text-dim">
            <a href="#work" className="hover:text-foreground transition-colors">עבודות</a>
            <a href="#services" className="hover:text-foreground transition-colors">שירותים</a>
            <a href="#about" className="hover:text-foreground transition-colors">עליי</a>
            <a href="#contact" className="hover:text-foreground transition-colors">צור קשר</a>
            <a href="#" className="hover:text-foreground transition-colors">אינסטגרם</a>
            <a href="#" className="hover:text-foreground transition-colors">לינקדאין</a>
          </div>
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
