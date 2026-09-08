import { describe, expect, it } from "vitest"
import { parseSharedPost } from "./sharedPost"

describe("parseSharedPost", () => {
  it("takes Android's separate text and url", () => {
    expect(parseSharedPost("?text=מחפש%20סרטון%20לעסק&url=https://facebook.com/groups/1/posts/2")).toEqual({
      text: "מחפש סרטון לעסק",
      url: "https://facebook.com/groups/1/posts/2",
    })
  })

  it("pulls the link out of one blob, which is what iOS hands over", () => {
    expect(parseSharedPost("?text=מחפש%20סרטון%20לעסק%20https://facebook.com/groups/1/posts/2")).toEqual({
      text: "מחפש סרטון לעסק",
      url: "https://facebook.com/groups/1/posts/2",
    })
  })

  it("keeps a share that is only a permalink, which the Facebook app usually gives", () => {
    expect(parseSharedPost("?url=https://facebook.com/groups/1/posts/2")).toEqual({
      text: "",
      url: "https://facebook.com/groups/1/posts/2",
    })
  })

  it("falls back to the title when nothing else carried the words", () => {
    expect(parseSharedPost("?title=מחפשת%20עורך%20וידאו")).toEqual({ text: "מחפשת עורך וידאו", url: "" })
  })

  it("prefers the real text over the title", () => {
    expect(parseSharedPost("?title=פוסט&text=מחפש%20סרטון")).toEqual({ text: "מחפש סרטון", url: "" })
  })

  it("is nothing when the share carried nothing", () => {
    expect(parseSharedPost("")).toBeNull()
    expect(parseSharedPost("?text=%20&url=")).toBeNull()
  })
})
