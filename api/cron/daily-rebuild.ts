import type { VercelRequest, VercelResponse } from "@vercel/node"

// Guides are published on a drip: one a day, gated by the `date_published <=
// CURRENT_DATE` RLS policy on the guides table. Human visitors see a new guide
// the moment its date arrives, because the page fetches from Supabase in the
// browser. Crawlers do not: the HTML they read is prerendered at build time and
// dist/sitemap.xml is generated at build time too. Without a rebuild, a guide
// stays invisible to Google until the next unrelated deploy happens to run.
//
// So the schedule needs a deploy of its own. This asks Vercel to rebuild the
// current production commit via a deploy hook; nothing about the code changes,
// only the content baked into it.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret || req.headers.authorization !== `Bearer ${cronSecret}`) {
    res.status(401).json({ error: "Unauthorized" })
    return
  }

  const hookUrl = process.env.VERCEL_DEPLOY_HOOK_URL
  if (!hookUrl) {
    // Not configured is not a failure worth alerting on, but it must not look
    // like a successful rebuild either.
    res.status(200).json({ skipped: "VERCEL_DEPLOY_HOOK_URL is not set" })
    return
  }

  const hookRes = await fetch(hookUrl, { method: "POST" })
  if (!hookRes.ok) {
    res.status(502).json({ error: `Deploy hook responded ${hookRes.status}` })
    return
  }

  res.status(200).json({ triggered: true })
}
