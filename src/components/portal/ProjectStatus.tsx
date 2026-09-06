import { PROJECT_STAGES, stageMeta, stageProgress, type ProjectStage } from "@/lib/projectStage"

/** Where the work is, drawn so it is readable before it is read. Paused work
 * shows no bar at all rather than a bar at nought, because an empty bar looks
 * like a stall rather than a pause. */
export function ProjectStatus({ stage, note }: { stage: ProjectStage; note?: string | null }) {
  const meta = stageMeta(stage)
  const paused = stage === "on_hold"
  const progress = stageProgress(stage)

  return (
    <div className="grid gap-3">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <span className="font-mono text-[11px] uppercase tracking-wide text-[#D1FE17]">{meta.label}</span>
        {!paused && <span className="font-mono text-[10px] text-dim">{progress}%</span>}
      </div>

      {!paused && (
        <>
          <div className="h-1 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full bg-[#D1FE17] rounded-full transition-[width] duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <ol className="flex items-center justify-between gap-1">
            {PROJECT_STAGES.map((s) => {
              const done = stageProgress(s.value) <= progress
              return (
                <li
                  key={s.value}
                  className={
                    done
                      ? "font-mono text-[9px] uppercase text-foreground"
                      : "font-mono text-[9px] uppercase text-dim/60"
                  }
                >
                  {s.label}
                </li>
              )
            })}
          </ol>
        </>
      )}

      <p className="text-sm leading-relaxed">{note?.trim() || meta.client}</p>
    </div>
  )
}
