import { Link, useParams } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import { useLesson, useLessons, useProgress } from "../hooks/useCourse"
import { MODULES, moduleLabel } from "../lib/modules"
import { VideoEmbed } from "../components/VideoEmbed"
import { Markdown } from "../components/Markdown"
import { LockGate } from "../components/LockGate"
import { Btn } from "../components/ui"

function DownloadIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M7 1v9m0 0 3-3M7 10 4 7M2 12h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function CourseLesson() {
  const { slug } = useParams<{ slug: string }>()
  const { lesson, loading, notFound } = useLesson(slug)
  const { lessons } = useLessons()
  const { user } = useAuth()
  const { done, toggle } = useProgress()

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-24 font-mono text-xs uppercase tracking-wide text-dim md:px-8">
        טוען…
      </div>
    )
  }

  if (notFound || !lesson) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-24 md:px-8">
        <h1 className="font-display text-2xl font-bold">השיעור לא נמצא</h1>
        <Link to="/" className="mt-4 inline-block font-mono text-xs uppercase tracking-wide underline underline-offset-4">
          ← חזרה לעמוד הראשי
        </Link>
      </div>
    )
  }

  const mod = MODULES[lesson.module_no] ?? { title: `מודול ${lesson.module_no}` }
  const idx = lessons.findIndex((l) => l.slug === lesson.slug)
  const prev = idx > 0 ? lessons[idx - 1] : null
  const next = idx >= 0 && idx < lessons.length - 1 ? lessons[idx + 1] : null
  const watched = done.has(lesson.slug)

  return (
    <article className="mx-auto max-w-3xl px-5 py-12 md:px-8 md:py-16">
      <Link
        to="/#curriculum"
        className="font-mono text-xs uppercase tracking-wide text-dim transition-colors hover:text-foreground"
      >
        ← תוכנית הקורס
      </Link>

      <div className="mt-6 font-mono text-xs text-[#D1FE17]">
        {moduleLabel(lesson.module_no)} · {mod.title} · שיעור {lesson.lesson_no}
        {lesson.duration_min ? ` · ${lesson.duration_min}:00` : ""}
      </div>
      <h1 className="mt-2 font-display text-[clamp(1.6rem,4.5vw,2.4rem)] font-black leading-tight tracking-tight">
        {lesson.title_he}
      </h1>
      {lesson.summary_he && <p className="mt-3 text-dim">{lesson.summary_he}</p>}

      <div className="mt-6">
        <VideoEmbed url={lesson.video_url} title={lesson.title_he} />
      </div>

      {lesson.locked ? (
        <LockGate />
      ) : (
        <>
          {lesson.body_he ? (
            <Markdown source={lesson.body_he} className="mt-8" />
          ) : (
            <p className="mt-8 text-sm text-dim">התוכן הכתוב של השיעור יעלה בקרוב.</p>
          )}

          {lesson.resources.length > 0 && (
            <div className="mt-10 border-t border-white/10 pt-6">
              <div className="font-mono text-xs uppercase tracking-wide text-dim">קבצים להורדה</div>
              <div className="mt-3 flex flex-wrap gap-2.5">
                {lesson.resources.map((r) => (
                  <a
                    key={r.url}
                    href={r.url}
                    download
                    className="inline-flex items-center gap-1.5 rounded border border-white/20 px-3 py-2 text-sm font-medium transition-colors hover:border-[#D1FE17] hover:text-[#D1FE17]"
                  >
                    <DownloadIcon />
                    {r.label}
                  </a>
                ))}
              </div>
            </div>
          )}

          {user && (
            <div className="mt-10 border-t border-white/10 pt-6">
              <Btn
                variant={watched ? "primary" : "ghost"}
                onClick={() => toggle(lesson.slug)}
                aria-pressed={watched}
              >
                {watched ? (
                  <>
                    <svg width="14" height="14" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                      <path d="M2 9.5 7 14 16 4" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    נצפה
                  </>
                ) : (
                  "סמן כנצפה"
                )}
              </Btn>
            </div>
          )}
        </>
      )}

      <nav className="mt-12 grid grid-cols-2 gap-3 border-t border-white/10 pt-6 font-mono text-xs">
        {prev ? (
          <Link to={`/lesson/${prev.slug}`} className="text-dim transition-colors hover:text-foreground">
            ← {prev.title_he}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link to={`/lesson/${next.slug}`} className="text-left text-dim transition-colors hover:text-foreground">
            {next.title_he} →
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </article>
  )
}
