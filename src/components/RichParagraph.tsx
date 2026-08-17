import { Link } from "react-router-dom"

const LINK_PATTERN = /\[([^\]]+)\]\(([^)]+)\)/g

const linkClass =
  "underline underline-offset-4 decoration-dim hover:decoration-[#D1FE17] hover:text-[#D1FE17] transition-colors"

export function RichParagraph({ text }: { text: string }) {
  const parts: React.ReactNode[] = []
  let lastIndex = 0
  let key = 0
  LINK_PATTERN.lastIndex = 0

  let match: RegExpExecArray | null
  while ((match = LINK_PATTERN.exec(text))) {
    if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index))
    const [full, label, href] = match
    if (href.startsWith("/")) {
      parts.push(
        <Link key={key++} to={href} className={linkClass}>
          {label}
        </Link>
      )
    } else {
      parts.push(
        <a key={key++} href={href} target="_blank" rel="noopener noreferrer" className={linkClass}>
          {label}
        </a>
      )
    }
    lastIndex = match.index + full.length
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex))

  return <>{parts}</>
}
