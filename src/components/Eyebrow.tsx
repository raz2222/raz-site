export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center font-mono text-[10px] font-bold uppercase tracking-wide text-white border border-[#D1FE17] rounded-md px-2.5 py-1">
      {children}
    </span>
  )
}
