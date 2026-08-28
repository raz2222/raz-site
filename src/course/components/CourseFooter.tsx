export function CourseFooter() {
  return (
    <footer className="border-t border-white/10">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-5 py-8 font-mono text-xs text-dim md:px-8">
        <span>פריים ראשון · קורס Higgsfield · course.madebyraz.co.il</span>
        <span>
          נבנה על ידי{" "}
          <a href="https://madebyraz.co.il" className="underline underline-offset-4 hover:text-foreground">
            madebyraz.co.il
          </a>
        </span>
      </div>
    </footer>
  )
}
