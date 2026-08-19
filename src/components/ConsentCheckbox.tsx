import type { ReactNode } from "react"

export function ConsentCheckbox({
  id,
  checked,
  onChange,
  error,
  dark = true,
  children,
}: {
  id: string
  checked: boolean
  onChange: (checked: boolean) => void
  error?: string
  dark?: boolean
  children: ReactNode
}) {
  return (
    <div>
      <label htmlFor={id} className={`flex items-start gap-3 text-xs leading-relaxed cursor-pointer ${dark ? "text-dim" : "opacity-70"}`}>
        <span className="relative mt-0.5 h-5 w-5 flex-none">
          <input
            id={id}
            type="checkbox"
            required
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-error` : undefined}
            className="peer absolute inset-0 h-full w-full opacity-0 cursor-pointer"
          />
          <span
            className={
              dark
                ? "absolute inset-0 rounded-[6px] border-2 border-[#D1FE17]/50 pointer-events-none transition-colors peer-checked:bg-[#D1FE17] peer-checked:border-[#D1FE17] peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#D1FE17]"
                : "absolute inset-0 rounded-[6px] border-2 border-black/50 pointer-events-none transition-colors peer-checked:bg-black peer-checked:border-black peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-black"
            }
          />
          <svg
            viewBox="0 0 16 16"
            fill="none"
            stroke={dark ? "black" : "#D1FE17"}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="absolute inset-0 m-auto h-3 w-3 opacity-0 pointer-events-none transition-opacity peer-checked:opacity-100"
          >
            <path d="M3 8.5L6.5 12L13 4.5" />
          </svg>
        </span>
        <span>{children}</span>
      </label>
      {error && (
        <p id={`${id}-error`} role="alert" className="text-xs text-red-400 mt-1.5">
          {error}
        </p>
      )}
    </div>
  )
}
