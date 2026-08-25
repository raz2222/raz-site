import { describe, expect, it } from "vitest"
import middleware from "./middleware"

function request(path: string, init?: { accept?: string; host?: string }) {
  const headers: Record<string, string> = {}
  if (init?.accept) headers.accept = init.accept
  if (init?.host) headers.host = init.host
  return new Request(`https://madebyraz.co.il${path}`, { headers })
}

describe("middleware", () => {
  describe("homepage markdown negotiation", () => {
    it("rewrites to /index.md with markdown headers when Accept: text/markdown is sent", () => {
      const response = middleware(request("/", { accept: "text/markdown" }))
      expect(response.headers.get("x-middleware-rewrite")).toBe("https://madebyraz.co.il/index.md")
      expect(response.headers.get("content-type")).toBe("text/markdown; charset=utf-8")
      expect(response.headers.get("vary")).toContain("Accept")
    })

    it("passes through (next) for a normal browser request to /", () => {
      const response = middleware(request("/", { accept: "text/html,application/xhtml+xml" }))
      expect(response.headers.get("x-middleware-next")).toBe("1")
      expect(response.headers.get("x-middleware-rewrite")).toBeNull()
    })
  })

  describe("404 handling for unknown paths", () => {
    it("returns a real 404 with a markdown body for a genuinely unknown path", async () => {
      const response = middleware(request("/some-path-that-does-not-exist"))
      expect(response.status).toBe(404)
      expect(response.headers.get("content-type")).toBe("text/markdown; charset=utf-8")
      expect(response.headers.get("x-robots-tag")).toContain("noindex")
      const body = await response.text()
      expect(body).toMatch(/^# /)
      expect(body).toContain("sitemap.xml")
      expect(body).toContain("llms.txt")
    })

    it("passes through (next) for a known static route", () => {
      const response = middleware(request("/work/luxury-residence"))
      expect(response.headers.get("x-middleware-next")).toBe("1")
    })

    it("passes through (next) for admin/portal routes", () => {
      expect(middleware(request("/admin")).headers.get("x-middleware-next")).toBe("1")
      expect(middleware(request("/portal/quote/abc")).headers.get("x-middleware-next")).toBe("1")
    })
  })

  describe("bypasses", () => {
    it("passes through static assets (has a file extension) without 404ing them", () => {
      expect(middleware(request("/favicon.ico")).headers.get("x-middleware-next")).toBe("1")
      expect(middleware(request("/robots.txt")).headers.get("x-middleware-next")).toBe("1")
      expect(middleware(request("/assets/index-abc123.js")).headers.get("x-middleware-next")).toBe("1")
    })

    it("passes through any path on the web./ai. subdomains, known or not", () => {
      const webResponse = middleware(request("/anything-goes-here", { host: "web.madebyraz.co.il" }))
      expect(webResponse.headers.get("x-middleware-next")).toBe("1")

      const aiResponse = middleware(request("/whatever", { host: "ai.madebyraz.co.il" }))
      expect(aiResponse.headers.get("x-middleware-next")).toBe("1")
    })
  })
})
