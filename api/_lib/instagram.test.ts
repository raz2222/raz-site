import { describe, expect, it, vi, afterEach } from "vitest"
import { advancePost, containerParams, graphErrorMessage } from "./instagram.js"

const CREDENTIALS = { userId: "17841400000000000", accessToken: "token" }
const NO_WAIT = async () => {}

function post(overrides: Partial<Parameters<typeof advancePost>[1]> = {}) {
  return {
    id: "p1",
    media_url: "https://madebyraz.co.il/videos/ad.mp4",
    media_type: "video" as const,
    caption: "כיתוב",
    ig_media_id: null,
    status: "ready",
    ...overrides,
  }
}

/** Every call answers with the next queued body, in order. */
function graph(responses: unknown[]) {
  const calls: string[] = []
  const fetchMock = vi.fn(async (url: string | URL) => {
    calls.push(String(url))
    return { json: async () => responses.shift() ?? {} } as Response
  })
  vi.stubGlobal("fetch", fetchMock)
  return calls
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe("containerParams", () => {
  it("sends a video as a reel, which is the only video container left", () => {
    expect(containerParams({ mediaUrl: "https://x/a.mp4", mediaType: "video", caption: "c" })).toEqual({
      caption: "c",
      media_type: "REELS",
      video_url: "https://x/a.mp4",
    })
  })

  it("sends an image as an image", () => {
    expect(containerParams({ mediaUrl: "https://x/a.jpg", mediaType: "image", caption: "c" })).toEqual({
      caption: "c",
      image_url: "https://x/a.jpg",
    })
  })
})

describe("graphErrorMessage", () => {
  it("prefers the message written for a person", () => {
    expect(graphErrorMessage({ error: { message: "tech", error_user_msg: "אנושי" } })).toBe("אנושי")
  })

  it("is null for a body that carries no error", () => {
    expect(graphErrorMessage({ id: "123" })).toBeNull()
    expect(graphErrorMessage(null)).toBeNull()
  })
})

describe("advancePost", () => {
  it("creates, waits for transcoding and publishes", async () => {
    const calls = graph([
      { id: "container-1" },
      { status_code: "IN_PROGRESS" },
      { status_code: "FINISHED" },
      { id: "media-9" },
      { permalink: "https://instagram.com/p/abc" },
    ])

    const result = await advancePost(CREDENTIALS, post(), 40_000, NO_WAIT)

    expect(result).toEqual({ state: "published", mediaId: "media-9", permalink: "https://instagram.com/p/abc" })
    expect(calls[0]).toContain(`${CREDENTIALS.userId}/media`)
    expect(calls[3]).toContain("media_publish")
  })

  it("stops at the container when the time budget runs out, so the next run resumes", async () => {
    graph([{ id: "container-1" }, { status_code: "IN_PROGRESS" }])

    const result = await advancePost(CREDENTIALS, post(), 0, NO_WAIT)

    expect(result).toEqual({ state: "processing", containerId: "container-1" })
  })

  it("resumes an existing container instead of uploading the film again", async () => {
    const calls = graph([{ status_code: "FINISHED" }, { id: "media-9" }, { permalink: null }])

    const result = await advancePost(
      CREDENTIALS,
      post({ status: "publishing", ig_media_id: "container-1" }),
      40_000,
      NO_WAIT
    )

    expect(result).toEqual({ state: "published", mediaId: "media-9", permalink: null })
    expect(calls.some((url) => url.endsWith("/media"))).toBe(false)
  })

  it("reports a rejected container rather than publishing nothing quietly", async () => {
    graph([{ error: { message: "Invalid image url" } }])
    expect(await advancePost(CREDENTIALS, post(), 40_000, NO_WAIT)).toEqual({
      state: "failed",
      error: "Invalid image url",
    })
  })

  it("fails a container Instagram gave up on", async () => {
    graph([{ id: "container-1" }, { status_code: "ERROR", status: "Media download failed" }])
    expect(await advancePost(CREDENTIALS, post(), 40_000, NO_WAIT)).toEqual({
      state: "failed",
      error: "Media download failed",
    })
  })

  it("refuses a post with no media before it calls anything", async () => {
    const calls = graph([])
    expect(await advancePost(CREDENTIALS, post({ media_url: null }), 40_000, NO_WAIT)).toEqual({
      state: "failed",
      error: "אין מדיה לפרסום",
    })
    expect(calls).toHaveLength(0)
  })
})
