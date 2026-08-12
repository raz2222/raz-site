export function Footer() {
  return (
    <footer className="border-t border-white/10 py-10">
      <div className="container flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="font-display font-bold text-lg">RAZ</div>
          <div className="font-mono text-[11px] text-dim uppercase tracking-wide mt-1">
            Design / Development / AI
          </div>
        </div>
        <div className="flex flex-wrap gap-6 font-mono text-xs uppercase tracking-wide text-dim">
          <a href="#work" className="hover:text-foreground transition-colors">Work</a>
          <a href="#services" className="hover:text-foreground transition-colors">Services</a>
          <a href="#about" className="hover:text-foreground transition-colors">About</a>
          <a href="#contact" className="hover:text-foreground transition-colors">Contact</a>
          <a href="#" className="hover:text-foreground transition-colors">Instagram</a>
          <a href="#" className="hover:text-foreground transition-colors">LinkedIn</a>
        </div>
        <div className="font-mono text-[11px] text-dim uppercase tracking-wide">
          © RAZ / Raz Avramov
        </div>
      </div>
    </footer>
  )
}
