import { Reveal } from "./Reveal"
import { AutoVideo } from "./AutoVideo"
import { trackEvent } from "@/lib/analytics"
import { useContactModal } from "@/hooks/useContactModal"

const FLOATING_CLIPS = [
  { src: "/videos/raz-showreel-2.mp4", className: "hidden lg:block absolute right-[3%] top-[8%] w-40 xl:w-48 -rotate-3" },
  { src: "/videos/no-address.mp4", className: "hidden lg:block absolute left-[4%] bottom-[9%] w-36 xl:w-44 rotate-2" },
]

export function AIVideoOffer() {
  const { openModal } = useContactModal()
  return (
    <section className="py-10 md:py-16">
      <div className="container">
        <Reveal className="block relative overflow-hidden rounded-[24px] shadow-[0_0_60px_-12px_rgba(209,254,23,0.45)]">
          <div
            className="relative px-6 py-16 md:py-24 text-center"
            style={{
              background:
                "linear-gradient(to bottom, rgba(209,254,23,0.5), transparent 20%), linear-gradient(to top, rgba(209,254,23,0.5), transparent 20%), linear-gradient(to right, rgba(209,254,23,0.4), transparent 16%), linear-gradient(to left, rgba(209,254,23,0.4), transparent 16%), #060b00",
            }}
          >
            <div
              aria-hidden="true"
              className="absolute inset-0 opacity-[0.35]"
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI5NjAiIGhlaWdodD0iMzIwIiB2aWV3Qm94PSIwIDAgOTYwIDMyMCI+CiAgPGcgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIxIiB2ZWN0b3ItZWZmZWN0PSJub24tc2NhbGluZy1zdHJva2UiPgogIDxsaW5lIHgxPSIwIiB5MT0iMCIgeDI9IjQ4MC4wIiB5Mj0iMTYwLjAiLz4KICA8bGluZSB4MT0iNjAiIHkxPSIwIiB4Mj0iNDgwLjAiIHkyPSIxNjAuMCIvPgogIDxsaW5lIHgxPSIxMjAiIHkxPSIwIiB4Mj0iNDgwLjAiIHkyPSIxNjAuMCIvPgogIDxsaW5lIHgxPSIxODAiIHkxPSIwIiB4Mj0iNDgwLjAiIHkyPSIxNjAuMCIvPgogIDxsaW5lIHgxPSIyNDAiIHkxPSIwIiB4Mj0iNDgwLjAiIHkyPSIxNjAuMCIvPgogIDxsaW5lIHgxPSIzMDAiIHkxPSIwIiB4Mj0iNDgwLjAiIHkyPSIxNjAuMCIvPgogIDxsaW5lIHgxPSIzNjAiIHkxPSIwIiB4Mj0iNDgwLjAiIHkyPSIxNjAuMCIvPgogIDxsaW5lIHgxPSI0MjAiIHkxPSIwIiB4Mj0iNDgwLjAiIHkyPSIxNjAuMCIvPgogIDxsaW5lIHgxPSI0ODAiIHkxPSIwIiB4Mj0iNDgwLjAiIHkyPSIxNjAuMCIvPgogIDxsaW5lIHgxPSI1NDAiIHkxPSIwIiB4Mj0iNDgwLjAiIHkyPSIxNjAuMCIvPgogIDxsaW5lIHgxPSI2MDAiIHkxPSIwIiB4Mj0iNDgwLjAiIHkyPSIxNjAuMCIvPgogIDxsaW5lIHgxPSI2NjAiIHkxPSIwIiB4Mj0iNDgwLjAiIHkyPSIxNjAuMCIvPgogIDxsaW5lIHgxPSI3MjAiIHkxPSIwIiB4Mj0iNDgwLjAiIHkyPSIxNjAuMCIvPgogIDxsaW5lIHgxPSI3ODAiIHkxPSIwIiB4Mj0iNDgwLjAiIHkyPSIxNjAuMCIvPgogIDxsaW5lIHgxPSI4NDAiIHkxPSIwIiB4Mj0iNDgwLjAiIHkyPSIxNjAuMCIvPgogIDxsaW5lIHgxPSI5MDAiIHkxPSIwIiB4Mj0iNDgwLjAiIHkyPSIxNjAuMCIvPgogIDxsaW5lIHgxPSI5NjAiIHkxPSIwIiB4Mj0iNDgwLjAiIHkyPSIxNjAuMCIvPgogIDxsaW5lIHgxPSIwIiB5MT0iMzIwIiB4Mj0iNDgwLjAiIHkyPSIxNjAuMCIvPgogIDxsaW5lIHgxPSI2MCIgeTE9IjMyMCIgeDI9IjQ4MC4wIiB5Mj0iMTYwLjAiLz4KICA8bGluZSB4MT0iMTIwIiB5MT0iMzIwIiB4Mj0iNDgwLjAiIHkyPSIxNjAuMCIvPgogIDxsaW5lIHgxPSIxODAiIHkxPSIzMjAiIHgyPSI0ODAuMCIgeTI9IjE2MC4wIi8+CiAgPGxpbmUgeDE9IjI0MCIgeTE9IjMyMCIgeDI9IjQ4MC4wIiB5Mj0iMTYwLjAiLz4KICA8bGluZSB4MT0iMzAwIiB5MT0iMzIwIiB4Mj0iNDgwLjAiIHkyPSIxNjAuMCIvPgogIDxsaW5lIHgxPSIzNjAiIHkxPSIzMjAiIHgyPSI0ODAuMCIgeTI9IjE2MC4wIi8+CiAgPGxpbmUgeDE9IjQyMCIgeTE9IjMyMCIgeDI9IjQ4MC4wIiB5Mj0iMTYwLjAiLz4KICA8bGluZSB4MT0iNDgwIiB5MT0iMzIwIiB4Mj0iNDgwLjAiIHkyPSIxNjAuMCIvPgogIDxsaW5lIHgxPSI1NDAiIHkxPSIzMjAiIHgyPSI0ODAuMCIgeTI9IjE2MC4wIi8+CiAgPGxpbmUgeDE9IjYwMCIgeTE9IjMyMCIgeDI9IjQ4MC4wIiB5Mj0iMTYwLjAiLz4KICA8bGluZSB4MT0iNjYwIiB5MT0iMzIwIiB4Mj0iNDgwLjAiIHkyPSIxNjAuMCIvPgogIDxsaW5lIHgxPSI3MjAiIHkxPSIzMjAiIHgyPSI0ODAuMCIgeTI9IjE2MC4wIi8+CiAgPGxpbmUgeDE9Ijc4MCIgeTE9IjMyMCIgeDI9IjQ4MC4wIiB5Mj0iMTYwLjAiLz4KICA8bGluZSB4MT0iODQwIiB5MT0iMzIwIiB4Mj0iNDgwLjAiIHkyPSIxNjAuMCIvPgogIDxsaW5lIHgxPSI5MDAiIHkxPSIzMjAiIHgyPSI0ODAuMCIgeTI9IjE2MC4wIi8+CiAgPGxpbmUgeDE9Ijk2MCIgeTE9IjMyMCIgeDI9IjQ4MC4wIiB5Mj0iMTYwLjAiLz4KICA8bGluZSB4MT0iMCIgeTE9IjAiIHgyPSI0ODAuMCIgeTI9IjE2MC4wIi8+CiAgPGxpbmUgeDE9IjAiIHkxPSI0MCIgeDI9IjQ4MC4wIiB5Mj0iMTYwLjAiLz4KICA8bGluZSB4MT0iMCIgeTE9IjgwIiB4Mj0iNDgwLjAiIHkyPSIxNjAuMCIvPgogIDxsaW5lIHgxPSIwIiB5MT0iMTIwIiB4Mj0iNDgwLjAiIHkyPSIxNjAuMCIvPgogIDxsaW5lIHgxPSIwIiB5MT0iMTYwIiB4Mj0iNDgwLjAiIHkyPSIxNjAuMCIvPgogIDxsaW5lIHgxPSIwIiB5MT0iMjAwIiB4Mj0iNDgwLjAiIHkyPSIxNjAuMCIvPgogIDxsaW5lIHgxPSIwIiB5MT0iMjQwIiB4Mj0iNDgwLjAiIHkyPSIxNjAuMCIvPgogIDxsaW5lIHgxPSIwIiB5MT0iMjgwIiB4Mj0iNDgwLjAiIHkyPSIxNjAuMCIvPgogIDxsaW5lIHgxPSIwIiB5MT0iMzIwIiB4Mj0iNDgwLjAiIHkyPSIxNjAuMCIvPgogIDxsaW5lIHgxPSI5NjAiIHkxPSIwIiB4Mj0iNDgwLjAiIHkyPSIxNjAuMCIvPgogIDxsaW5lIHgxPSI5NjAiIHkxPSI0MCIgeDI9IjQ4MC4wIiB5Mj0iMTYwLjAiLz4KICA8bGluZSB4MT0iOTYwIiB5MT0iODAiIHgyPSI0ODAuMCIgeTI9IjE2MC4wIi8+CiAgPGxpbmUgeDE9Ijk2MCIgeTE9IjEyMCIgeDI9IjQ4MC4wIiB5Mj0iMTYwLjAiLz4KICA8bGluZSB4MT0iOTYwIiB5MT0iMTYwIiB4Mj0iNDgwLjAiIHkyPSIxNjAuMCIvPgogIDxsaW5lIHgxPSI5NjAiIHkxPSIyMDAiIHgyPSI0ODAuMCIgeTI9IjE2MC4wIi8+CiAgPGxpbmUgeDE9Ijk2MCIgeTE9IjI0MCIgeDI9IjQ4MC4wIiB5Mj0iMTYwLjAiLz4KICA8bGluZSB4MT0iOTYwIiB5MT0iMjgwIiB4Mj0iNDgwLjAiIHkyPSIxNjAuMCIvPgogIDxsaW5lIHgxPSI5NjAiIHkxPSIzMjAiIHgyPSI0ODAuMCIgeTI9IjE2MC4wIi8+CiAgPHBvbHlnb24gcG9pbnRzPSIzOC40LDEyLjggOTIxLjYsMTIuOCA5MjEuNiwzMDcuMiAzOC40LDMwNy4yIiBmaWxsPSJub25lIi8+CiAgPHBvbHlnb24gcG9pbnRzPSI4Ni40LDI4LjggODczLjYsMjguOCA4NzMuNiwyOTEuMiA4Ni40LDI5MS4yIiBmaWxsPSJub25lIi8+CiAgPHBvbHlnb24gcG9pbnRzPSIxNDQuMCw0OC4wIDgxNi4wLDQ4LjAgODE2LjAsMjcyLjAgMTQ0LjAsMjcyLjAiIGZpbGw9Im5vbmUiLz4KICA8cG9seWdvbiBwb2ludHM9IjIxMS4yLDcwLjQgNzQ4LjgsNzAuNCA3NDguOCwyNDkuNiAyMTEuMiwyNDkuNiIgZmlsbD0ibm9uZSIvPgogIDxwb2x5Z29uIHBvaW50cz0iMjg4LjAsOTYuMCA2NzIuMCw5Ni4wIDY3Mi4wLDIyNC4wIDI4OC4wLDIyNC4wIiBmaWxsPSJub25lIi8+CiAgPHBvbHlnb24gcG9pbnRzPSIzNzQuNCwxMjQuOCA1ODUuNiwxMjQuOCA1ODUuNiwxOTUuMiAzNzQuNCwxOTUuMiIgZmlsbD0ibm9uZSIvPgogIDwvZz4KPC9zdmc+Cg==\")",
                backgroundSize: "100% 100%",
                backgroundRepeat: "no-repeat",
              }}
            />

            {FLOATING_CLIPS.map((clip) => (
              <div key={clip.src} className={`${clip.className} aspect-[3/4] rounded-xl overflow-hidden shadow-2xl shadow-black/50`}>
                <AutoVideo src={clip.src} className="w-full h-full object-cover contrast-[1.05] brightness-[0.9]" />
              </div>
            ))}

            <div className="relative max-w-xl mx-auto">
              <span className="inline-block font-mono text-[10px] font-bold uppercase tracking-wide bg-white text-black rounded-md px-2.5 py-1 mb-4">
                מבצע
              </span>
              <h2 className="font-display font-black text-[clamp(28px,4.4vw,44px)] leading-[1.15] tracking-[-0.04em] text-gradient-accent text-shimmer">
                סרטון AI חינם. פשוט כי אני יכול.
              </h2>
              <p className="mt-5 text-[#c5d9a2] text-base md:text-lg leading-relaxed">
                כל מי שיזמין עכשיו שירות איתי מקבל סרטון AI חינם לעסק — עד 15 שניות, בלי תוספת מחיר.
              </p>
              <button
                onClick={() => {
                  trackEvent("contact_click", { location: "ai_video_offer" })
                  openModal()
                }}
                className="relative inline-flex items-center justify-center mt-8 rounded-[12px] bg-white px-6 pb-[13px] pt-[11px] text-base font-semibold tracking-[0.1px] text-[#1a1a1a] shadow-[0_9px_22px_0_rgba(0,0,0,0.15),inset_0_-3px_0_0_#c7c7c7] hover:scale-105 transition-transform"
              >
                בואו נסגור ←
              </button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
