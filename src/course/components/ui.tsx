import { Link } from "react-router-dom"
import type { ComponentProps, ReactNode } from "react"
import { cn } from "@/lib/utils"

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "mb-4 inline-flex items-center gap-2.5 font-mono text-xs font-medium uppercase tracking-[0.12em] text-[#D1FE17]",
        className
      )}
    >
      <span className="h-px w-6 bg-[#D1FE17]" />
      {children}
    </span>
  )
}

const base =
  "inline-flex items-center justify-center gap-2 rounded font-bold transition-[filter,transform,border-color,color] duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:pointer-events-none"

const variants = {
  primary:
    "border border-[#D1FE17] bg-[#D1FE17] text-background hover:brightness-110 hover:-translate-y-px",
  ghost:
    "border border-white/25 bg-transparent text-foreground hover:border-foreground",
}

type BtnVariant = keyof typeof variants
type Size = "md" | "lg"
const sizes: Record<Size, string> = {
  md: "px-5 py-2.5 text-sm",
  lg: "px-6 py-3 text-sm",
}

export function BtnLink({
  to,
  variant = "primary",
  size = "md",
  className,
  children,
  ...rest
}: {
  to: string
  variant?: BtnVariant
  size?: Size
} & Omit<ComponentProps<typeof Link>, "to">) {
  const isHash = to.startsWith("/#") || to.startsWith("#")
  const cls = cn(base, variants[variant], sizes[size], className)
  if (isHash) {
    return (
      <a href={to} className={cls}>
        {children}
      </a>
    )
  }
  return (
    <Link to={to} className={cls} {...rest}>
      {children}
    </Link>
  )
}

export function Btn({
  variant = "primary",
  size = "md",
  className,
  children,
  ...rest
}: { variant?: BtnVariant; size?: Size } & ComponentProps<"button">) {
  return (
    <button className={cn(base, variants[variant], sizes[size], className)} {...rest}>
      {children}
    </button>
  )
}

export function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 18 18"
      fill="none"
      aria-hidden="true"
      className={cn("mt-1 flex-none text-[#D1FE17]", className)}
    >
      <path d="M2 9.5 7 14 16 4" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function LockIcon({ className }: { className?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" className={className}>
      <rect x="2.5" y="6" width="9" height="6.5" rx="1" stroke="currentColor" strokeWidth="1.4" />
      <path d="M4.5 6V4.5a2.5 2.5 0 0 1 5 0V6" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  )
}

export function CourseSection({
  id,
  className,
  children,
}: {
  id?: string
  className?: string
  children: ReactNode
}) {
  return (
    <section id={id} className={cn("px-5 py-16 md:px-8 md:py-20", className)}>
      <div className="mx-auto max-w-5xl">{children}</div>
    </section>
  )
}
