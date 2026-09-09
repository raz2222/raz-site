import { describe, expect, it } from "vitest"
import { youtubeId, youtubeEmbedUrl, youtubeThumbnail, youtubeWatchUrl } from "./youtube"

describe("youtubeId", () => {
  it("reads every form someone actually copies", () => {
    expect(youtubeId("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ")
    expect(youtubeId("https://youtu.be/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ")
    expect(youtubeId("https://www.youtube.com/shorts/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ")
    expect(youtubeId("https://www.youtube.com/embed/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ")
    expect(youtubeId("https://www.youtube.com/live/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ")
  })

  it("survives the tracking parameters a share link carries", () => {
    expect(youtubeId("https://youtu.be/dQw4w9WgXcQ?si=abc123&t=42")).toBe("dQw4w9WgXcQ")
    expect(youtubeId("https://www.youtube.com/watch?list=PL1&v=dQw4w9WgXcQ&index=2")).toBe("dQw4w9WgXcQ")
  })

  /** Null is what keeps every existing video working: it means "an ordinary
   * file", and the component falls through to the <video> element. */
  it("returns null for anything that is not YouTube", () => {
    expect(youtubeId("/videos/raz-showreel.mp4")).toBeNull()
    expect(youtubeId("https://madebyraz.co.il/videos/a.mp4")).toBeNull()
    expect(youtubeId("https://vimeo.com/123456")).toBeNull()
    expect(youtubeId("")).toBeNull()
    expect(youtubeId(null)).toBeNull()
    expect(youtubeId(undefined)).toBeNull()
  })

  /** A hostname that merely contains "youtube.com" is not YouTube, and a link
   * this accepted would put an attacker's frame on the page. */
  it("is not fooled by a lookalike hostname", () => {
    expect(youtubeId("https://notyoutube.com.evil.test/watch?v=dQw4w9WgXcQ")).toBeNull()
    expect(youtubeId("https://evil.test/?q=youtube.com/watch?v=dQw4w9WgXcQ")).toBeNull()
  })
})

describe("youtubeEmbedUrl", () => {
  it("plays like the video element it replaces", () => {
    const url = youtubeEmbedUrl("dQw4w9WgXcQ")
    expect(url).toContain("youtube-nocookie.com/embed/dQw4w9WgXcQ")
    expect(url).toContain("mute=1")
    expect(url).toContain("controls=0")
    expect(url).toContain("playsinline=1")
  })

  /** loop without playlist plays once and stops · YouTube's oldest wart, and
   * the whole point here is a loop. */
  it("carries the playlist id that makes loop actually loop", () => {
    expect(youtubeEmbedUrl("dQw4w9WgXcQ")).toContain("playlist=dQw4w9WgXcQ")
  })
})

describe("youtubeThumbnail", () => {
  /** hqdefault, not maxresdefault: maxres does not exist for every video and
   * 404s to a broken image. */
  it("uses the size that always exists", () => {
    expect(youtubeThumbnail("dQw4w9WgXcQ")).toBe("https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg")
  })
})

describe("youtubeWatchUrl", () => {
  /** The opposite of the loop: this one is mounted by a click, so it plays at
   * once, with sound and with controls. */
  it("is a real player, not the silent background loop", () => {
    const url = youtubeWatchUrl("dQw4w9WgXcQ")
    expect(url).toContain("youtube-nocookie.com/embed/dQw4w9WgXcQ")
    expect(url).toContain("autoplay=1")
    expect(url).not.toContain("mute=1")
    expect(url).not.toContain("controls=0")
    expect(url).not.toContain("loop=1")
  })

  /** rel=0 keeps the end screen on this channel rather than handing the page
   * to whatever YouTube wants to show a visitor next. */
  it("does not offer someone else's videos at the end", () => {
    expect(youtubeWatchUrl("dQw4w9WgXcQ")).toContain("rel=0")
  })

  /** Both URLs are built from the same id, and neither may reach the cookie
   * domain. */
  it("stays on the no-cookie domain, like the loop", () => {
    expect(youtubeWatchUrl("dQw4w9WgXcQ").startsWith("https://www.youtube-nocookie.com/")).toBe(true)
  })
})
