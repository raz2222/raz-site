export function AnnouncementBar({ isEnglish }: { isEnglish: boolean }) {
  return (
    <div
      dir={isEnglish ? "ltr" : "rtl"}
      className="flex items-center justify-center gap-3 bg-black px-4 h-9 overflow-hidden"
    >
      <span className="hidden sm:inline font-mono text-xs text-white/85 truncate">
        {isEnglish
          ? "Book any service now and get a free AI video for your business — up to 15 seconds, no extra charge."
          : "כל מי שמזמין שירות עכשיו מקבל סרטון AI חינם לעסק — עד 15 שניות, בלי תוספת מחיר."}
      </span>
      <span className="sm:hidden font-mono text-[11px] text-white/85 truncate">
        {isEnglish ? "Free AI video with any service" : "סרטון AI חינם בהזמנת שירות"}
      </span>
      <span className="flex-none font-mono text-[10px] font-bold uppercase tracking-wide bg-[#FF4D9E] text-black rounded-full px-2.5 py-1">
        {isEnglish ? "Limited time" : "לזמן מוגבל"}
      </span>
    </div>
  )
}
