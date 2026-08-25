import { describe, expect, it } from "vitest"
import { render } from "./entry-server"

function stripTags(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

describe("entry-server render (homepage SSR)", () => {
  it("renders a real <h1> for the homepage without needing JavaScript", () => {
    const html = render("/")
    expect(html).toMatch(/<h1[\s>]/i)
  })

  it("renders at least 500 characters of visible text for the homepage", () => {
    const html = render("/")
    const text = stripTags(html)
    expect(text.length).toBeGreaterThanOrEqual(500)
  })

  it("does not render admin-only content for the homepage", () => {
    const html = render("/")
    expect(html).not.toMatch(/AdminDashboard/)
  })
})
