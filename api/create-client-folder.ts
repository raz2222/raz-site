import type { VercelRequest, VercelResponse } from "@vercel/node"
import { createSign } from "crypto"

const OWNER_EMAIL = "razavramov2@gmail.com"

function base64url(input: Buffer | string) {
  return Buffer.from(input).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

async function getAccessToken(clientEmail: string, privateKey: string) {
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }))
  const now = Math.floor(Date.now() / 1000)
  const claims = base64url(
    JSON.stringify({
      iss: clientEmail,
      scope: "https://www.googleapis.com/auth/drive",
      aud: "https://oauth2.googleapis.com/token",
      exp: now + 3600,
      iat: now,
    })
  )
  const unsigned = `${header}.${claims}`
  const signature = createSign("RSA-SHA256").update(unsigned).sign(privateKey)
  const jwt = `${unsigned}.${base64url(signature)}`

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  })
  if (!res.ok) throw new Error(`Token exchange failed: ${await res.text()}`)
  const data = await res.json()
  return data.access_token as string
}

async function verifyAdmin(authHeader: string | undefined) {
  if (!authHeader?.startsWith("Bearer ")) return false
  const token = authHeader.slice(7)
  const url = process.env.VITE_SUPABASE_URL
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY
  if (!url || !anonKey) return false
  const res = await fetch(`${url}/auth/v1/user`, {
    headers: { Authorization: `Bearer ${token}`, apikey: anonKey },
  })
  if (!res.ok) return false
  const user = await res.json()
  return user?.email === OWNER_EMAIL
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" })
    return
  }

  const isAdmin = await verifyAdmin(req.headers.authorization)
  if (!isAdmin) {
    res.status(401).json({ error: "Unauthorized" })
    return
  }

  const keyJson = process.env.GOOGLE_SERVICE_ACCOUNT_KEY
  const rootFolderId = process.env.DRIVE_CLIENTS_ROOT_FOLDER_ID
  if (!keyJson || !rootFolderId) {
    res.status(503).json({ error: "Drive is not configured on the server." })
    return
  }

  const { folderName } = (req.body ?? {}) as { folderName?: string }
  if (!folderName || typeof folderName !== "string") {
    res.status(400).json({ error: "Missing 'folderName' string in request body." })
    return
  }

  try {
    const { client_email, private_key } = JSON.parse(keyJson)
    const accessToken = await getAccessToken(client_email, private_key)

    const createRes = await fetch("https://www.googleapis.com/drive/v3/files?supportsAllDrives=true", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: folderName,
        mimeType: "application/vnd.google-apps.folder",
        parents: [rootFolderId],
      }),
    })

    if (!createRes.ok) {
      res.status(502).json({ error: "Failed to create Drive folder", detail: await createRes.text() })
      return
    }

    const folder = await createRes.json()
    res.status(200).json({
      folderId: folder.id,
      folderUrl: `https://drive.google.com/drive/folders/${folder.id}`,
    })
  } catch (err) {
    res.status(500).json({ error: "Unexpected server error", detail: String(err) })
  }
}
