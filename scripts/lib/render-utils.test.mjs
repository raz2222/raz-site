import { describe, expect, it } from "vitest"
import { stripTags, extractMain, htmlToMarkdown } from "./render-utils.mjs"

describe("stripTags", () => {
  it("removes markup and collapses whitespace", () => {
    expect(stripTags("<div><h1>Hello</h1>  <p>World</p></div>")).toBe("Hello World")
  })

  it("drops script and style contents entirely", () => {
    const html = "<script>doEvilThings()</script><style>.a{color:red}</style><p>Safe text</p>"
    expect(stripTags(html)).toBe("Safe text")
  })
})

describe("extractMain", () => {
  it("pulls out only the <main id=\"main\"> contents", () => {
    const html = '<nav>Nav links</nav><main id="main"><h1>Title</h1><p>Body</p></main><footer>Footer</footer>'
    expect(extractMain(html)).toBe("<h1>Title</h1><p>Body</p>")
  })

  it("falls back to the full HTML when no <main id=\"main\"> is present", () => {
    const html = "<p>No main wrapper here</p>"
    expect(extractMain(html)).toBe(html)
  })
})

describe("htmlToMarkdown", () => {
  const html = '<main id="main"><h1>Title</h1><p>Some text with a <a href="/work">link</a>.</p></main>'

  it("includes a title header, description blockquote, and canonical line", () => {
    const md = htmlToMarkdown(html, {
      title: "Made by RAZ",
      description: "A short description.",
      canonical: "https://madebyraz.co.il/",
    })
    expect(md).toContain("# Made by RAZ")
    expect(md).toContain("> A short description.")
    expect(md).toContain("Canonical: https://madebyraz.co.il/")
  })

  it("converts the main content to markdown, preserving links", () => {
    const md = htmlToMarkdown(html)
    expect(md).toContain("# Title")
    expect(md).toContain("[link](/work)")
  })
})
