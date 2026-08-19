export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center font-mono text-[10px] font-bold uppercase tracking-wide text-[#D1FE17] bg-accent-badge rounded-md px-2.5 py-1">
      {children}
    </span>
  )
}
