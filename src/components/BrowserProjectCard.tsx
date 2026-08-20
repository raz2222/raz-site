import { Link } from "react-router-dom"
import type { ProjectRow } from "@/lib/supabase"
import { AutoVideo } from "./AutoVideo"

export function BrowserProjectCard({ project, href }: { project: ProjectRow; href?: string }) {
  return (
    <Link
      to={href ?? `/work/${project.slug}`}
      className="group block rounded-lg border border-white/15 overflow-hidden bg-neutral-950 hover:border-[#D1FE17] transition-colors"
    >
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-white/[0.03]">
        <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
        <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
        <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
        <span className="mr-2 font-mono text-[10px] text-dim truncate" dir="ltr">
          {project.live_url ? project.live_url.replace(/^https?:\/\//, "") : "madebyraz.co.il"}
        </span>
      </div>
      <div className="relative aspect-[16/10] bg-neutral-900 overflow-hidden">
        {project.video ? (
          <AutoVideo
            src={project.video}
            className="absolute inset-0 w-full h-full object-cover contrast-[1.05] brightness-[0.9] transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-neutral-800 to-neutral-950" />
        )}
      </div>
      <div className="px-4 py-3 border-t border-white/10 font-mono text-[11px] uppercase tracking-wide text-dim flex items-center justify-between gap-3">
        <span className="truncate text-foreground">{project.title}</span>
        <span className="text-white/60 flex-none">{project.category}</span>
      </div>
    </Link>
  )
}
