import { describe, expect, it } from "vitest"
import { renderAsync } from "../entry-server"

// Google's video crawler reads the prerendered HTML, so these assert on the
// snapshot rather than on the helpers that produce it: a poster the component
// drops, or a JSON-LD block that stops being emitted, would leave every test
// in videoSchema.test.ts green while the page went back to "found, not
// indexed" in Search Console.
describe("what the video crawler sees on /work/serve", () => {
  it("declares the film with VideoObject markup", async () => {
    const html = await renderAsync("/work/serve")

    const blocks = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].map(
      (m) => JSON.parse(m[1].replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&amp;/g, "&"))
    )
    const video = blocks.find((b) => b["@type"] === "VideoObject")

    expect(video, "no VideoObject in the prerendered HTML").toBeDefined()
    expect(video.name).toContain("Serve")
    expect(video.description.length).toBeGreaterThan(50)
    expect(video.thumbnailUrl).toMatch(/^https:\/\/madebyraz\.co\.il\/images\//)
    expect(video.uploadDate).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(video.contentUrl).toBe("https://madebyraz.co.il/videos/ai-campaign-ad.mp4")
    expect(video.duration).toBe("PT26S")
  })

  it("gives the player a poster, so a thumbnail exists to index", async () => {
    const html = await renderAsync("/work/serve")
    const player = /<video[^>]*controls[^>]*>/.exec(html)?.[0] ?? ""
    expect(player, "no <video controls> player found").not.toBe("")
    expect(player).toContain("poster=")
  })
})

describe("decorative background clips", () => {
  // The loops behind headlines are not marked up on purpose: Google rejects
  // them under "video is not the main content of the page", and claiming
  // otherwise in structured data would be a false claim. They still carry a
  // poster, which is what stops them painting a black box on load.
  it("carry a poster but no VideoObject", async () => {
    const html = await renderAsync("/experiments")

    expect(html).toContain("/images/video-posters/")
    expect(html).not.toContain('"VideoObject"')
    expect(html).not.toContain("&quot;VideoObject&quot;")
  })
})
