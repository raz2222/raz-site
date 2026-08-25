// Pure decision logic for src/../middleware.ts, split out so it can be unit
// tested without needing the Edge runtime. Vercel's declarative vercel.json
// "has" header condition on rewrites was tried first for this but the "Is
// Agentic" audit still saw text/html for `Accept: text/markdown` on "/", so
// this does the negotiation explicitly instead.
export function wantsMarkdown(acceptHeader: string | null): boolean {
  return (acceptHeader ?? "").includes("text/markdown")
}
