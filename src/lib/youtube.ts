/** Recognising a YouTube link, so a film too big to upload can still play.
 *
 * Supabase's free plan refuses an upload over 50MB, and for a silent loop that
 * ceiling is generous · every clip on the site today is under 5MB. A long film
 * is the real exception, and YouTube is the free host Raz already has, so the
 * media field accepts a link to one and the site plays it.
 *
 * Every form a person actually copies is accepted, because the one they paste
 * is whichever their browser was showing: the watch page, the share link, a
 * Short, or an embed URL someone gave them. */
const PATTERNS = [
  /[?&]v=([A-Za-z0-9_-]{11})/, // youtube.com/watch?v=ID
  /youtu\.be\/([A-Za-z0-9_-]{11})/, // youtu.be/ID
  /\/shorts\/([A-Za-z0-9_-]{11})/, // youtube.com/shorts/ID
  /\/embed\/([A-Za-z0-9_-]{11})/, // youtube.com/embed/ID
  /\/live\/([A-Za-z0-9_-]{11})/, // youtube.com/live/ID
]

/** The eleven-character id, or null when this is not a YouTube link. Null is
 * the signal to treat the value as an ordinary video file, so anything this
 * does not recognise keeps working exactly as before. */
export function youtubeId(url: string | null | undefined): string | null {
  const value = (url ?? "").trim()
  if (!value) return null
  if (!/(?:^|\.)(?:youtube\.com|youtube-nocookie\.com|youtu\.be)\//.test(value.replace(/^https?:\/\//, "."))) {
    return null
  }
  for (const pattern of PATTERNS) {
    const match = value.match(pattern)
    if (match) return match[1]
  }
  return null
}

/** youtube-nocookie.com, because a background loop on a portfolio page should
 * not set an advertising cookie on a visitor who never pressed play.
 *
 * The parameters make it behave like the `<video>` element it replaces: muted,
 * looping, no controls, no related videos at the end, inline on iOS rather
 * than taking over the screen. `loop` needs `playlist` set to the same id ·
 * without it YouTube plays once and stops, which is their API's oldest wart. */
export function youtubeEmbedUrl(id: string): string {
  const params = new URLSearchParams({
    autoplay: "1",
    mute: "1",
    loop: "1",
    playlist: id,
    controls: "0",
    modestbranding: "1",
    rel: "0",
    playsinline: "1",
    disablekb: "1",
  })
  return `https://www.youtube-nocookie.com/embed/${id}?${params}`
}

/** Their thumbnail, so the frame is on screen before the player is fetched.
 * `hqdefault` rather than `maxresdefault`: maxres does not exist for every
 * video and 404s to a broken image, while hqdefault always does. */
export function youtubeThumbnail(id: string): string {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`
}

/** The player a person actually presses play on · controls, sound, no loop.
 *
 * `autoplay` is on because this URL is only ever mounted by a click on the
 * thumbnail: the click is the play, and mounting a paused player would make
 * them press it twice. `rel=0` keeps the end screen to this channel rather
 * than handing the page to whatever YouTube wants to show next. */
export function youtubeWatchUrl(id: string): string {
  const params = new URLSearchParams({
    autoplay: "1",
    rel: "0",
    modestbranding: "1",
    playsinline: "1",
  })
  return `https://www.youtube-nocookie.com/embed/${id}?${params}`
}
