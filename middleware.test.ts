import { describe, expect, it } from "vitest"
import middleware from "./middleware"

describe("middleware (homepage markdown negotiation)", () => {
  it("rewrites to /index.md when Accept: text/markdown is sent", () => {
    const request = new Request("https://madebyraz.co.il/", {
      headers: { accept: "text/markdown" },
    })
    const response = middleware(request)
    expect(response.headers.get("x-middleware-rewrite")).toBe("https://madebyraz.co.il/index.md")
  })

  it("passes through (next) for a normal browser request", () => {
    const request = new Request("https://madebyraz.co.il/", {
      headers: { accept: "text/html,application/xhtml+xml" },
    })
    const response = middleware(request)
    expect(response.headers.get("x-middleware-next")).toBe("1")
    expect(response.headers.get("x-middleware-rewrite")).toBeNull()
  })
})
