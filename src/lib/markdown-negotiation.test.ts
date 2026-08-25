import { describe, expect, it } from "vitest"
import { wantsMarkdown } from "./markdown-negotiation"

describe("wantsMarkdown", () => {
  it("is true for a bare Accept: text/markdown request", () => {
    expect(wantsMarkdown("text/markdown")).toBe(true)
  })

  it("is true when text/markdown appears alongside other types", () => {
    expect(wantsMarkdown("text/markdown, text/html;q=0.9, */*;q=0.8")).toBe(true)
  })

  it("is false for a normal browser Accept header", () => {
    expect(wantsMarkdown("text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8")).toBe(false)
  })

  it("is false when the header is missing", () => {
    expect(wantsMarkdown(null)).toBe(false)
  })
})
