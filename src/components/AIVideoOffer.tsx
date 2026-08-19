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
                "radial-gradient(90% 40% at 50% 0%, rgba(209,254,23,0.55), transparent 65%), radial-gradient(90% 40% at 50% 100%, rgba(209,254,23,0.55), transparent 65%), #060b00",
            }}
          >
            <div
              aria-hidden="true"
              className="absolute inset-0 opacity-[0.12]"
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI5MCIgaGVpZ2h0PSI1MiIgdmlld0JveD0iMCAwIDkwIDUyIj4KICA8cGF0aCBkPSJNMCAyNiBMNDUgMCBMOTAgMjYgTDQ1IDUyIFoiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMSIvPgogIDxjaXJjbGUgY3g9IjAiIGN5PSIyNiIgcj0iMS41IiBmaWxsPSJ3aGl0ZSIvPgogIDxjaXJjbGUgY3g9IjQ1IiBjeT0iMCIgcj0iMS41IiBmaWxsPSJ3aGl0ZSIvPgogIDxjaXJjbGUgY3g9IjkwIiBjeT0iMjYiIHI9IjEuNSIgZmlsbD0id2hpdGUiLz4KICA8Y2lyY2xlIGN4PSI0NSIgY3k9IjUyIiByPSIxLjUiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo=\")",
                backgroundSize: "90px 52px",
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
