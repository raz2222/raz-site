import type { VercelRequest, VercelResponse } from "@vercel/node"

const PROMPT_TEMPLATES: Record<string, (subject: string) => string> = {
  service: (subject) =>
    `Editorial, cinematic photograph representing "${subject}" — a creative technology / digital agency service. Dark, moody, high-contrast lighting, minimal composition, no text or logos, 16:9.`,
  "sub-service": (subject) =>
    `Close-up editorial photograph illustrating "${subject}". Dark background, single strong light source, no text, no logos, photorealistic, 16:9.`,
  guide: (subject) =>
    `Abstract editorial illustration representing the concept of "${subject}" for a technology blog. Dark background, minimal, no text, no logos, 16:9.`,
  project: (subject) =>
    `Cinematic still representing the project "${subject}". Moody lighting, high production value, no text, no logos, 16:9.`,
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" })
    return
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    res.status(503).json({ error: "OPENAI_API_KEY is not configured on the server." })
    return
  }

  const { subject, context } = (req.body ?? {}) as { subject?: string; context?: keyof typeof PROMPT_TEMPLATES }
  if (!subject || typeof subject !== "string") {
    res.status(400).json({ error: "Missing 'subject' string in request body." })
    return
  }

  const buildPrompt = PROMPT_TEMPLATES[context ?? "service"] ?? PROMPT_TEMPLATES.service
  const prompt = buildPrompt(subject)

  try {
    const openaiRes = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-image-1",
        prompt,
        size: "1536x1024",
        n: 1,
      }),
    })

    if (!openaiRes.ok) {
      const errText = await openaiRes.text()
      res.status(502).json({ error: "OpenAI request failed", detail: errText })
      return
    }

    const data = await openaiRes.json()
    const b64 = data?.data?.[0]?.b64_json
    if (!b64) {
      res.status(502).json({ error: "No image returned from OpenAI." })
      return
    }

    res.status(200).json({ image: `data:image/png;base64,${b64}` })
  } catch (err) {
    res.status(500).json({ error: "Unexpected server error", detail: String(err) })
  }
}
