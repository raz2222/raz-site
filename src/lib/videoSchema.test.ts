import { describe, expect, it } from "vitest"
import { videoObjectJsonLd } from "./videoSchema"
import { VIDEO_ASSETS, durationFor, posterFor } from "./videoPosters"
import { FILM, PREMISE } from "./serveProject"

const serve = {
  src: FILM.video,
  name: FILM.title,
  description: PREMISE,
  uploadDate: FILM.published,
  pagePath: `/work/${FILM.slug}`,
}

describe("videoObjectJsonLd", () => {
  it("carries every field Google requires before it will index a video", () => {
    const json = videoObjectJsonLd(serve)
    for (const key of ["name", "description", "thumbnailUrl", "uploadDate"]) {
      expect(json[key as keyof typeof json], `missing ${key}`).toBeTruthy()
    }
    expect(json["@type"]).toBe("VideoObject")
  })

  it("points thumbnail, content and embed URLs at absolute site URLs", () => {
    const json = videoObjectJsonLd(serve)
    expect(json.contentUrl).toBe("https://madebyraz.co.il/videos/ai-campaign-ad.mp4")
    expect(json.embedUrl).toBe("https://madebyraz.co.il/work/serve")
    expect(json.thumbnailUrl).toMatch(/^https:\/\/madebyraz\.co\.il\//)
  })

  it("uses the measured length rather than a hand-written one", () => {
    expect(videoObjectJsonLd(serve).duration).toBe(durationFor(FILM.video))
  })

  it("prefers an explicit poster over the extracted frame", () => {
    const json = videoObjectJsonLd({ ...serve, poster: "/images/ai-campaign-ad-poster.jpg" })
    expect(json.thumbnailUrl).toBe("https://madebyraz.co.il/images/ai-campaign-ad-poster.jpg")
  })

  // A clip with no manifest entry must still produce valid markup rather than
  // a thumbnailUrl pointing at an image that was never generated.
  it("omits thumbnail and duration for a clip that has no poster", () => {
    const json = videoObjectJsonLd({ ...serve, src: "/videos/does-not-exist.mp4" })
    expect(json).not.toHaveProperty("thumbnailUrl")
    expect(json).not.toHaveProperty("duration")
  })
})

describe("the poster manifest", () => {
  it("gives every clip a poster path and an ISO 8601 duration", () => {
    const entries = Object.entries(VIDEO_ASSETS)
    expect(entries.length).toBeGreaterThan(0)
    for (const [src, asset] of entries) {
      expect(src).toMatch(/^\/videos\/.+\.mp4$/)
      expect(asset.poster).toMatch(/^\/images\/video-posters\/.+\.jpg$/)
      expect(asset.duration).toMatch(/^PT\d+S$/)
    }
  })

  it("looks a clip up by its src and returns nothing for an unknown one", () => {
    expect(posterFor(FILM.video)).toBe(VIDEO_ASSETS[FILM.video].poster)
    expect(posterFor("/videos/nope.mp4")).toBeUndefined()
    expect(durationFor("/videos/nope.mp4")).toBeUndefined()
  })
})
