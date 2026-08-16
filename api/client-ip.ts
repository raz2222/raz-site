import type { VercelRequest, VercelResponse } from "@vercel/node"

export default function handler(req: VercelRequest, res: VercelResponse) {
  const forwarded = req.headers["x-forwarded-for"]
  const ip = Array.isArray(forwarded) ? forwarded[0] : forwarded?.split(",")[0]?.trim() ?? req.socket?.remoteAddress ?? null
  res.status(200).json({ ip })
}
