import type { VercelRequest, VercelResponse } from "@vercel/node"
import { verifyAdmin } from "./_lib/verify-admin.js"
import { agentConfigured, draftCaption, draftOpportunity } from "./_lib/social-agent.js"

/** The agent, asked one question at a time from the admin.
 *
 * It drafts and it scores. It does not send · Facebook cannot be sent to by a
 * machine at all, and Instagram is published by `instagram-publish`, only from
 * a post someone marked ready. */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" })
    return
  }

  if (!(await verifyAdmin(req.headers.authorization))) {
    res.status(401).json({ error: "Unauthorized" })
    return
  }

  // Not an error: the screen has a written fallback for both drafts, and
  // saying so lets it use that instead of showing a failure.
  if (!agentConfigured()) {
    res.status(200).json({ configured: false })
    return
  }

  const body = (req.body ?? {}) as Record<string, unknown>
  const kind = body.kind

  try {
    if (kind === "opportunity") {
      const postText = typeof body.postText === "string" ? body.postText.trim() : ""
      if (!postText) {
        res.status(400).json({ error: "Missing 'postText'." })
        return
      }
      const draft = await draftOpportunity({
        postText,
        groupName: typeof body.groupName === "string" ? body.groupName : null,
        groupRules: typeof body.groupRules === "string" ? body.groupRules : null,
        linksAllowed: body.linksAllowed === true,
      })
      res.status(200).json({ configured: true, draft })
      return
    }

    if (kind === "caption") {
      const title = typeof body.title === "string" ? body.title.trim() : ""
      if (!title) {
        res.status(400).json({ error: "Missing 'title'." })
        return
      }
      const draft = await draftCaption({
        title,
        overview: typeof body.overview === "string" ? body.overview : null,
        tools: Array.isArray(body.tools) ? body.tools.map(String) : null,
        categories: Array.isArray(body.categories) ? body.categories.map(String) : null,
        clientName: typeof body.clientName === "string" ? body.clientName : null,
        mediaType: body.mediaType === "video" ? "video" : "image",
      })
      res.status(200).json({ configured: true, draft })
      return
    }

    res.status(400).json({ error: "Unknown 'kind'." })
  } catch (err) {
    res.status(502).json({ error: "הסוכן לא הצליח לנסח טיוטה", detail: String(err) })
  }
}
