import { Fragment, type ReactNode } from "react"

/**
 * Small Markdown renderer for lesson bodies. Covers exactly what the course
 * content uses: h2–h4, paragraphs, `-` / `1.` lists, fenced code, `---` rules,
 * `>` block-quotes, and inline **bold**, `code`, [links](url). Prompts stay
 * inside fenced blocks and render LTR. No external dependency, no dangerouslySet.
 */

function renderInline(text: string, keyBase: string): ReactNode[] {
  const nodes: ReactNode[] = []
  // Split on **bold**, `code`, and [label](href) while keeping delimiters.
  const re = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g
  let last = 0
  let m: RegExpExecArray | null
  let i = 0
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) nodes.push(<Fragment key={`${keyBase}-t${i}`}>{text.slice(last, m.index)}</Fragment>)
    const tok = m[0]
    if (tok.startsWith("**")) {
      nodes.push(
        <strong key={`${keyBase}-b${i}`} className="font-bold text-foreground">
          {tok.slice(2, -2)}
        </strong>
      )
    } else if (tok.startsWith("`")) {
      nodes.push(
        <code
          key={`${keyBase}-c${i}`}
          dir="ltr"
          className="mx-0.5 rounded bg-white/[0.07] px-1.5 py-0.5 font-mono text-[0.85em] text-foreground"
        >
          {tok.slice(1, -1)}
        </code>
      )
    } else {
      const mm = /\[([^\]]+)\]\(([^)]+)\)/.exec(tok)!
      const href = mm[2]
      const external = /^https?:\/\//.test(href)
      nodes.push(
        <a
          key={`${keyBase}-l${i}`}
          href={href}
          {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          className="underline decoration-1 underline-offset-4 hover:text-[#D1FE17]"
        >
          {mm[1]}
        </a>
      )
    }
    last = m.index + tok.length
    i++
  }
  if (last < text.length) nodes.push(<Fragment key={`${keyBase}-tEnd`}>{text.slice(last)}</Fragment>)
  return nodes
}

type Block =
  | { kind: "heading"; level: 2 | 3 | 4; text: string }
  | { kind: "p"; text: string }
  | { kind: "ul"; items: string[] }
  | { kind: "ol"; items: string[] }
  | { kind: "code"; text: string }
  | { kind: "quote"; text: string }
  | { kind: "hr" }

function parse(md: string): Block[] {
  const lines = md.replace(/\r\n/g, "\n").split("\n")
  const blocks: Block[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    if (line.trim() === "") {
      i++
      continue
    }

    // fenced code
    if (line.startsWith("```")) {
      const buf: string[] = []
      i++
      while (i < lines.length && !lines[i].startsWith("```")) {
        buf.push(lines[i])
        i++
      }
      i++ // closing fence
      blocks.push({ kind: "code", text: buf.join("\n") })
      continue
    }

    if (/^(-{3,}|\*{3,}|_{3,})\s*$/.test(line.trim())) {
      blocks.push({ kind: "hr" })
      i++
      continue
    }

    const h = /^(#{2,4})\s+(.*)$/.exec(line)
    if (h) {
      blocks.push({ kind: "heading", level: h[1].length as 2 | 3 | 4, text: h[2].trim() })
      i++
      continue
    }

    if (/^>\s?/.test(line)) {
      const buf: string[] = []
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        buf.push(lines[i].replace(/^>\s?/, ""))
        i++
      }
      blocks.push({ kind: "quote", text: buf.join(" ") })
      continue
    }

    if (/^\s*[-*]\s+/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*]\s+/, "").trim())
        i++
      }
      blocks.push({ kind: "ul", items })
      continue
    }

    if (/^\s*\d+\.\s+/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+\.\s+/, "").trim())
        i++
      }
      blocks.push({ kind: "ol", items })
      continue
    }

    // paragraph — gather until blank / block starter
    const buf: string[] = []
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !lines[i].startsWith("```") &&
      !/^(#{2,4})\s+/.test(lines[i]) &&
      !/^\s*[-*]\s+/.test(lines[i]) &&
      !/^\s*\d+\.\s+/.test(lines[i]) &&
      !/^>\s?/.test(lines[i]) &&
      !/^(-{3,}|\*{3,}|_{3,})\s*$/.test(lines[i].trim())
    ) {
      buf.push(lines[i].trim())
      i++
    }
    blocks.push({ kind: "p", text: buf.join(" ") })
  }

  return blocks
}

export function Markdown({ source, className = "" }: { source: string; className?: string }) {
  const blocks = parse(source)
  return (
    <div className={`course-prose ${className}`}>
      {blocks.map((b, i) => {
        switch (b.kind) {
          case "heading": {
            const inner = renderInline(b.text, `h${i}`)
            if (b.level === 2)
              return (
                <h2 key={i} className="font-display font-bold text-xl md:text-2xl mt-10 mb-3">
                  {inner}
                </h2>
              )
            if (b.level === 3)
              return (
                <h3 key={i} className="font-display font-bold text-lg mt-8 mb-2">
                  {inner}
                </h3>
              )
            return (
              <h4 key={i} className="font-display font-semibold text-base mt-6 mb-2 text-dim">
                {inner}
              </h4>
            )
          }
          case "p":
            return (
              <p key={i} className="my-4 leading-relaxed text-foreground/90">
                {renderInline(b.text, `p${i}`)}
              </p>
            )
          case "ul":
            return (
              <ul key={i} className="my-4 grid gap-2 pr-5 list-disc marker:text-[#D1FE17]">
                {b.items.map((it, j) => (
                  <li key={j} className="leading-relaxed text-foreground/90">
                    {renderInline(it, `ul${i}-${j}`)}
                  </li>
                ))}
              </ul>
            )
          case "ol":
            return (
              <ol key={i} className="my-4 grid gap-2 pr-5 list-decimal marker:text-dim marker:font-mono">
                {b.items.map((it, j) => (
                  <li key={j} className="leading-relaxed text-foreground/90">
                    {renderInline(it, `ol${i}-${j}`)}
                  </li>
                ))}
              </ol>
            )
          case "code":
            return (
              <pre
                key={i}
                dir="ltr"
                className="my-5 overflow-x-auto rounded border border-white/10 bg-white/[0.04] p-4 text-left font-mono text-[0.82rem] leading-relaxed text-foreground/90"
              >
                {b.text}
              </pre>
            )
          case "quote":
            return (
              <blockquote
                key={i}
                className="my-5 border-r-2 border-[#D1FE17] pr-4 text-dim"
              >
                {renderInline(b.text, `q${i}`)}
              </blockquote>
            )
          case "hr":
            return <hr key={i} className="my-8 border-white/10" />
        }
      })}
    </div>
  )
}
