import { Link } from "react-router-dom"
import { Reveal } from "./Reveal"
import { AutoVideo } from "./AutoVideo"
import { trackEvent } from "@/lib/analytics"

const FLOATING_CLIPS = [
  { src: "/videos/raz-showreel-2.mp4", className: "hidden lg:block absolute right-[3%] top-[8%] w-40 xl:w-48 -rotate-3" },
  { src: "/videos/no-address.mp4", className: "hidden lg:block absolute left-[4%] bottom-[9%] w-36 xl:w-44 rotate-2" },
]

export function AIVideoOffer() {
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
              className="absolute inset-0 opacity-[0.05]"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(58deg, rgba(255,255,255,0.6) 0px, rgba(255,255,255,0.6) 1px, transparent 1px, transparent 64px), repeating-linear-gradient(-58deg, rgba(255,255,255,0.6) 0px, rgba(255,255,255,0.6) 1px, transparent 1px, transparent 64px)",
              }}
            />

            {FLOATING_CLIPS.map((clip) => (
              <div key={clip.src} className={`${clip.className} aspect-[3/4] rounded-xl overflow-hidden shadow-2xl shadow-black/50`}>
                <AutoVideo src={clip.src} className="w-full h-full object-cover contrast-[1.05] brightness-[0.9]" />
              </div>
            ))}

            <div className="relative max-w-xl mx-auto">
              <h2 className="font-display font-black text-[clamp(28px,4.4vw,44px)] leading-[1.15] tracking-[-0.04em] text-gradient-accent text-shimmer">
                סרטון AI חינם. פשוט כי אני יכול.
              </h2>
              <p className="mt-5 text-[#c5d9a2] text-base md:text-lg leading-relaxed">
                כל לקוח שבונה איתי אתר מקבל גם סרטון AI קצר לעסק — עד 15 שניות, בלי תוספת מחיר.
              </p>
              <Link
                to="/contact"
                onClick={() => trackEvent("contact_click", { location: "ai_video_offer" })}
                className="relative inline-flex items-center justify-center mt-8 rounded-[12px] bg-white px-6 pb-[13px] pt-[11px] text-base font-semibold tracking-[0.1px] text-[#1a1a1a] shadow-[0_9px_22px_0_rgba(0,0,0,0.15),inset_0_-3px_0_0_#c7c7c7] hover:scale-105 transition-transform"
              >
                בואו נסגור ←
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
