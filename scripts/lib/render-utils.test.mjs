import { describe, expect, it } from "vitest"
import { stripTags, extractMain, htmlToMarkdown, patchHead } from "./render-utils.mjs"

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

describe("patchHead", () => {
  const template = [
    '<!doctype html>',
    '<html lang="he" dir="rtl">',
    "  <head>",
    '    <link rel="canonical" href="https://madebyraz.co.il/" />',
    "    <title>Homepage title</title>",
    '    <meta name="description" content="Homepage description" />',
    '    <meta property="og:title" content="Homepage title" />',
    '    <meta property="og:description" content="Homepage description" />',
    '    <meta property="og:url" content="https://madebyraz.co.il/" />',
    "  </head>",
    '  <body><div id="root"></div></body>',
    "</html>",
  ].join("\n")

  const meta = {
    title: "Guide title · RAZ",
    description: "Guide description.",
    canonical: "https://madebyraz.co.il/guides/example",
    alternates: { he: "/guides/example", en: "/en/guides/example" },
    lang: "he",
    dir: "rtl",
  }

  it("replaces the title, description and canonical with the route's own", () => {
    const html = patchHead(template, meta)
    expect(html).toContain("<title>Guide title · RAZ</title>")
    expect(html).toContain('<meta name="description" content="Guide description." />')
    expect(html).toContain('<link rel="canonical" href="https://madebyraz.co.il/guides/example" />')
    expect(html).not.toContain("Homepage title")
    expect(html).not.toContain("Homepage description")
  })

  it("keeps the OpenGraph tags in sync with the route", () => {
    const html = patchHead(template, meta)
    expect(html).toContain('<meta property="og:title" content="Guide title · RAZ" />')
    expect(html).toContain('<meta property="og:description" content="Guide description." />')
    expect(html).toContain('<meta property="og:url" content="https://madebyraz.co.il/guides/example" />')
  })

  it("adds hreflang alternates including x-default", () => {
    const html = patchHead(template, meta)
    expect(html).toContain('<link rel="alternate" hreflang="he" href="https://madebyraz.co.il/guides/example" />')
    expect(html).toContain('<link rel="alternate" hreflang="en" href="https://madebyraz.co.il/en/guides/example" />')
    expect(html).toContain('hreflang="x-default"')
  })

  it("switches lang and dir for English routes", () => {
    const html = patchHead(template, { ...meta, lang: "en", dir: "ltr" })
    expect(html).toContain('<html lang="en" dir="ltr">')
    expect(html).not.toContain('<html lang="he" dir="rtl">')
  })

  it("leaves the #root placeholder intact for the caller to fill", () => {
    expect(patchHead(template, meta)).toContain('<div id="root"></div>')
  })

  it("removes the description rather than leaving the homepage's under a new title", () => {
    const html = patchHead(template, { ...meta, description: undefined })
    expect(html).not.toContain("Homepage description")
    expect(html).not.toMatch(/<meta name="description"/)
    expect(html).not.toMatch(/<meta property="og:description"/)
  })

  it("sets a route's own og:image and tags dated pages as articles", () => {
    const withTemplate = template.replace(
      "  </head>",
      '    <meta property="og:image" content="https://madebyraz.co.il/images/og-image.png" />\n    <meta name="twitter:image" content="https://madebyraz.co.il/images/og-image.png" />\n  </head>'
    )
    const html = patchHead(withTemplate, {
      ...meta,
      image: "https://madebyraz.co.il/images/guides/cover.png",
      publishedTime: "2026-08-15",
    })
    expect(html).toContain('<meta property="og:image" content="https://madebyraz.co.il/images/guides/cover.png" />')
    expect(html).toContain('<meta name="twitter:image" content="https://madebyraz.co.il/images/guides/cover.png" />')
    expect(html).toContain('<meta property="og:type" content="article" />')
    expect(html).toContain('<meta property="article:published_time" content="2026-08-15" />')
  })

  it("escapes quotes in metadata so attributes can't be broken out of", () => {
    const html = patchHead(template, { ...meta, description: 'He said "hi" & left' })
    expect(html).toContain('content="He said &quot;hi&quot; &amp; left"')
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
