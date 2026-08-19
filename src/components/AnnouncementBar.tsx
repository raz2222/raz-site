export function AnnouncementBar({ isEnglish, onCtaClick }: { isEnglish: boolean; onCtaClick: () => void }) {
  return (
    <div
      dir={isEnglish ? "ltr" : "rtl"}
      className="flex items-center justify-between gap-3 bg-black px-4 h-9 overflow-hidden"
    >
      <div className="flex items-center gap-3 min-w-0">
        <span className="flex-none font-mono text-[10px] font-bold uppercase tracking-wide text-[#D1FE17]">
          {isEnglish ? "15 SEC AI VIDEO — ON US" : "סרטון AI ל-15 שניות — עלינו"}
        </span>
        <span className="hidden sm:inline font-mono text-xs text-white/70 truncate">
          {isEnglish ? "A free 15-second AI video for your business." : "סרטון AI של 15 שניות לעסק שלכם, ללא עלות."}
        </span>
      </div>
      <button
        onClick={onCtaClick}
        className="flex-none font-mono text-[10px] font-bold uppercase tracking-wide text-black bg-[#D1FE17] rounded-full px-2.5 py-1 hover:scale-105 transition-transform"
      >
        {isEnglish ? "Get my video" : "אני רוצה סרטון"}
      </button>
    </div>
  )
}
