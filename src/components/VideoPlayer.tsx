import { useState } from "react"
import { cn } from "@/lib/utils"
import { youtubeId, youtubeThumbnail, youtubeWatchUrl } from "@/lib/youtube"

/** The player on a case study · the one a visitor presses play on, with sound.
 *
 * `AutoVideo` is the silent loop behind a headline; this is its opposite, and
 * both have to understand a YouTube link now that the media field accepts one.
 * A film too big for the 50MB upload is exactly the film a case study is
 * about, so the page it lands on cannot be the one that shows a black box.
 *
 * Anything that is not a YouTube link falls through to the same `<video>`
 * element these pages already had, attribute for attribute.
 */
export function VideoPlayer({
  src,
  poster,
  className,
  lang = "he",
}: {
  src: string
  poster?: string
  className?: string
  /** The English mirror renders the same component, and the play button is the
   * one piece of it a screen reader reads out. */
  lang?: "he" | "en"
}) {
  const youtube = youtubeId(src)
  if (youtube) return <YouTubeFacade id={youtube} poster={poster} className={className} lang={lang} />
  return <video src={src} poster={poster} controls playsInline preload="metadata" className={className} />
}

const PLAY_LABEL = { he: "הפעלת הסרטון", en: "Play video" } as const
const PLAYER_LABEL = { he: "נגן וידאו", en: "Video player" } as const

/** The thumbnail with a play button over it, and the iframe only after a click.
 *
 * YouTube's embedded player is several hundred kilobytes of someone else's
 * JavaScript, and it loads whether or not anyone watches. `preload="metadata"`
 * on the `<video>` this replaces costs a few kilobytes; matching that means
 * not mounting the iframe until the play is real.
 */
function YouTubeFacade({ id, poster, className, lang }: { id: string; poster?: string; className?: string; lang: "he" | "en" }) {
  const [playing, setPlaying] = useState(false)
  const frame = poster ?? youtubeThumbnail(id)

  if (playing) {
    return (
      <iframe
        src={youtubeWatchUrl(id)}
        title={PLAYER_LABEL[lang]}
        allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
        allowFullScreen
        className={cn("border-0", className)}
      />
    )
  }

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      aria-label={PLAY_LABEL[lang]}
      className={cn("group relative block bg-neutral-900", className)}
    >
      <img src={frame} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
      <span className="absolute inset-0 grid place-items-center">
        <span className="w-16 h-16 rounded-full bg-black/60 border border-white/30 grid place-items-center transition-colors group-hover:bg-black/80 group-hover:border-lime">
          <svg viewBox="0 0 24 24" aria-hidden="true" className="w-6 h-6 translate-x-[2px] fill-white">
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
      </span>
    </button>
  )
}
