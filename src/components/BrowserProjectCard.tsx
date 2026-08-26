import { Link } from "react-router-dom"
import type { ProjectRow } from "@/lib/supabase"
import { AutoVideo } from "./AutoVideo"
import { cn } from "@/lib/utils"

export function BrowserProjectCard({ project, href, className }: { project: ProjectRow; href?: string; className?: string }) {
  return (
    <Link
      to={href ?? `/work/${project.slug}`}
      className={cn(
        "group flex flex-col rounded-lg border border-white/15 overflow-hidden bg-neutral-950 hover:border-[#D1FE17] transition-colors",
        className
      )}
    >
      <div className="flex-none flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-white/[0.03]">
        <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
        <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
        <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
        <span className="mr-2 font-mono text-[10px] text-dim truncate" dir="ltr">
          {project.live_url ? project.live_url.replace(/^https?:\/\//, "") : "madebyraz.co.il"}
        </span>
      </div>
      <div className="relative flex-1 min-h-0 sm:flex-none sm:aspect-[16/10] bg-neutral-900 overflow-hidden">
        {project.video ? (
          <AutoVideo
            src={project.video}
            className="absolute inset-0 w-full h-full object-cover contrast-[1.05] brightness-[0.9] transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-neutral-800 to-neutral-950" />
        )}
      </div>
      <div className="flex-none px-4 py-3 border-t border-white/10 font-mono text-[11px] uppercase tracking-wide text-dim flex items-center justify-between gap-3">
        <span className="truncate text-foreground">{project.title}</span>
        <span className="text-white/60 flex-none">{project.category}</span>
      </div>
    </Link>
  )
}
