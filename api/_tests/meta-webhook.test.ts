import { describe, expect, it } from "vitest"
import { parseMetaWebhook } from "../_lib/meta-webhook.js"

/** Three shapes arrive at one URL and none looks like the others. */
describe("parseMetaWebhook", () => {
  it("reads an Instagram comment", () => {
    const parsed = parseMetaWebhook({
      object: "instagram",
      entry: [
        {
          id: "17841400000000000",
          time: 1788000000,
          changes: [
            {
              field: "comments",
              value: {
                id: "comment-1",
                text: "כמה עולה סרטון כזה?",
                from: { id: "user-9", username: "dana_biz" },
                media: { id: "media-5" },
              },
            },
          ],
        },
      ],
    })

    expect(parsed).toHaveLength(1)
    expect(parsed[0]).toMatchObject({
      platform: "instagram",
      kind: "comment",
      externalId: "comment-1",
      authorHandle: "dana_biz",
      authorId: "user-9",
      text: "כמה עולה סרטון כזה?",
      mediaId: "media-5",
    })
  })

  it("reads a comment on a Facebook Page post, where every key is different", () => {
    const parsed = parseMetaWebhook({
      object: "page",
      entry: [
        {
          id: "page-1",
          time: 1788000000,
          changes: [
            {
              field: "feed",
              value: {
                item: "comment",
                comment_id: "c-2",
                message: "אני רוצה כזה לעסק שלי",
                from: { id: "u-3", name: "יוסי" },
                post_id: "page-1_post-7",
              },
            },
          ],
        },
      ],
    })

    expect(parsed[0]).toMatchObject({
      platform: "facebook",
      kind: "comment",
      externalId: "c-2",
      authorName: "יוסי",
      mediaId: "page-1_post-7",
    })
  })

  it("reads a direct message", () => {
    const parsed = parseMetaWebhook({
      object: "instagram",
      entry: [
        {
          id: "ig-1",
          time: 1788000000,
          messaging: [
            { sender: { id: "u-4" }, timestamp: 1788000123000, message: { mid: "m-1", text: "אפשר לדבר על מחיר?" } },
          ],
        },
      ],
    })

    expect(parsed[0]).toMatchObject({ kind: "dm", externalId: "m-1", authorId: "u-4" })
    expect(parsed[0].occurredAt).toBe(new Date(1788000123000).toISOString())
  })

  it("ignores Raz's own replies coming back as echoes", () => {
    expect(
      parseMetaWebhook({
        object: "instagram",
        entry: [{ messaging: [{ message: { mid: "m-2", text: "שלחתי לך", is_echo: true } }] }],
      })
    ).toEqual([])
  })

  it("ignores a page feed event that is not somebody commenting", () => {
    const parsed = parseMetaWebhook({
      object: "page",
      entry: [
        { changes: [{ field: "feed", value: { item: "like", post_id: "p", message: "x", id: "l-1" } }] },
        { changes: [{ field: "feed", value: { item: "comment", verb: "remove", comment_id: "c-9", message: "x" } }] },
      ],
    })
    expect(parsed).toEqual([])
  })

  it("survives a payload with nothing usable in it", () => {
    expect(parseMetaWebhook(null)).toEqual([])
    expect(parseMetaWebhook({})).toEqual([])
    expect(parseMetaWebhook({ object: "instagram", entry: [{ changes: [{ field: "comments", value: {} }] }] })).toEqual([])
  })
})
