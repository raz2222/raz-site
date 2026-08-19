import { Link } from "react-router-dom"
import type { ProjectRow } from "@/lib/supabase"
import { AutoVideo } from "./AutoVideo"

export function ProjectVideoCard({ project }: { project: ProjectRow }) {
  return (
    <Link
      to={`/work/${project.slug}`}
      className="group block relative overflow-hidden rounded-2xl surface-raised aspect-[4/3] transition-colors duration-200 hover:bg-white/[0.08]"
    >
      {project.video && (
        <AutoVideo
          src={project.video}
          className="absolute inset-0 w-full h-full object-cover contrast-[1.05] brightness-[0.85] transition-transform duration-500 group-hover:scale-105"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />

      <div className="absolute bottom-4 right-4 left-4">
        <div className="font-display text-lg md:text-xl font-bold text-white">{project.title}</div>
        <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 font-mono text-[11px] text-white/60 uppercase">
          <span>{project.category}</span>
          <span>{project.year}</span>
        </div>
      </div>
    </Link>
  )
}
