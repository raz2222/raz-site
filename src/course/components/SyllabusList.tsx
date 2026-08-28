import { Link } from "react-router-dom"
import type { LessonMeta } from "../lib/types"
import { MODULES, moduleLabel } from "../lib/modules"
import { LockIcon } from "./ui"

function fmtDuration(min: number | null) {
  if (!min) return ""
  return `${min}:00`
}

export function SyllabusList({
  lessons,
  done,
  hasAccess = false,
}: {
  lessons: LessonMeta[]
  done: Set<string>
  hasAccess?: boolean
}) {
  const byModule = new Map<number, LessonMeta[]>()
  for (const l of lessons) {
    const arr = byModule.get(l.module_no) ?? []
    arr.push(l)
    byModule.set(l.module_no, arr)
  }
  const moduleNos = [...byModule.keys()].sort((a, b) => a - b)

  return (
    <div className="mt-8">
      {moduleNos.map((no) => {
        const mod = MODULES[no] ?? { title: `מודול ${no}` }
        const items = byModule.get(no)!
        const total = items.reduce((s, l) => s + (l.duration_min ?? 0), 0)
        return (
          <div key={no}>
            <div className="mt-10 mb-2 flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-white/10 pb-2 first:mt-4">
              <span className="font-mono text-xs text-[#D1FE17]">{moduleLabel(no)}</span>
              <h3 className="font-display text-base font-bold md:text-lg">
                {mod.title}
                {mod.note && <span className="text-dim"> · {mod.note}</span>}
              </h3>
              <span className="ms-auto font-mono text-xs text-dim">
                {items.length} {items.length === 1 ? "שיעור" : "שיעורים"} · {total}:00
              </span>
            </div>

            <ul>
              {items.map((l) => {
                const watched = done.has(l.slug)
                const locked = !l.is_free && !hasAccess
                return (
                  <li key={l.slug} className="border-b border-white/10">
                    <Link
                      to={`/lesson/${l.slug}`}
                      className="grid grid-cols-[1.75rem_1fr_auto] items-center gap-3 py-3.5 transition-colors hover:bg-white/[0.02] md:gap-4"
                    >
                      <span className="font-mono text-sm text-dim">
                        {String(l.order_index).padStart(2, "0")}
                      </span>

                      <span className="min-w-0">
                        <span className="flex items-center gap-2">
                          {watched && (
                            <span
                              aria-label="נצפה"
                              title="נצפה"
                              className="grid h-4 w-4 flex-none place-items-center rounded-full bg-[#D1FE17] text-background"
                            >
                              <svg width="10" height="10" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                                <path
                                  d="M2 9.5 7 14 16 4"
                                  stroke="currentColor"
                                  strokeWidth="3"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </span>
                          )}
                          <span
                            className={`truncate font-medium ${locked ? "text-dim" : "text-foreground"}`}
                          >
                            {l.title_he}
                          </span>
                        </span>
                        {l.summary_he && (
                          <span className="mt-0.5 block truncate text-xs text-dim">{l.summary_he}</span>
                        )}
                      </span>

                      <span className="flex items-center gap-2 font-mono text-xs text-dim">
                        {l.is_free ? (
                          <span className="rounded bg-[#D1FE17] px-1.5 py-0.5 text-[0.65rem] font-medium text-background">
                            חינם
                          </span>
                        ) : (
                          locked && <LockIcon className="opacity-60" />
                        )}
                        <span className="hidden sm:inline">{fmtDuration(l.duration_min)}</span>
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        )
      })}
    </div>
  )
}
