import { useReducedMotion } from "@/hooks/useReducedMotion"
import { cn } from "@/lib/utils"

export function AutoVideo({ src, className }: { src: string; className?: string }) {
  const reduced = useReducedMotion()

  if (reduced) {
    return (
      <div className={cn("bg-gradient-to-br from-neutral-800 to-neutral-950", className)} />
    )
  }

  return (
    <video
      src={src}
      muted
      loop
      playsInline
      autoPlay
      className={className}
    />
  )
}
