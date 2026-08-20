import type { ReactNode } from "react"
import { AutoVideo } from "@/components/AutoVideo"
import { cn } from "@/lib/utils"

export function PhoneVideoFrame({
  video,
  poster,
  fallback,
  className,
}: {
  video?: string | null
  poster?: string | null
  fallback?: ReactNode
  className?: string
}) {
  return (
    <div className={cn("mx-auto w-full max-w-[320px]", className)}>
      <div className="relative rounded-[2.2rem] border border-white/15 bg-neutral-950 p-2.5 shadow-2xl shadow-black/40">
        <div className="absolute left-1/2 top-2.5 -translate-x-1/2 w-16 h-4 rounded-full bg-black/80 z-10" />
        <div className="relative aspect-[9/16] rounded-[1.6rem] overflow-hidden bg-neutral-900">
          {video ? (
            <AutoVideo
              src={video}
              poster={poster || undefined}
              className="absolute inset-0 w-full h-full object-cover contrast-[1.05] brightness-[0.9]"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center p-6 text-center">{fallback}</div>
          )}
        </div>
      </div>
    </div>
  )
}
