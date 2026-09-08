import { supabase } from "@/lib/supabase"
import { apiErrorMessage } from "@/lib/apiError"
import type { OpportunityIntent } from "@/lib/socialCopy"

/** The admin's half of the social endpoints.
 *
 * Same shape as `sendDocument.ts`: the token is fetched here rather than
 * threaded through a dozen components, and every call comes back as something
 * a screen can render instead of an exception it has to catch. */

async function accessToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession()
  return data.session?.access_token ?? null
}

async function call<T>(path: string, init: RequestInit, fallbackMessage: string): Promise<T | { error: string }> {
  const token = await accessToken()
  if (!token) return { error: "פג תוקף ההתחברות. רענן את הדף והתחבר שוב." }

  const res = await fetch(path, {
    ...init,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...init.headers },
  })
  if (!res.ok) return { error: await apiErrorMessage(res, fallbackMessage) }
  return (await res.json()) as T
}

export type AgentOpportunityDraft = {
  score: number
  intent: OpportunityIntent
  summary: string
  reply: string
  dm: string
}

export type AgentCaptionDraft = { caption: string; hashtags: string[] }

/** The agent's read of a group post. `null` means it is not configured or had
 * nothing to say · the caller has a written fallback either way. */
export async function askAgentForReply(input: {
  postText: string
  groupName?: string | null
  groupRules?: string | null
  linksAllowed: boolean
}): Promise<AgentOpportunityDraft | null> {
  const result = await call<{ configured: boolean; draft: AgentOpportunityDraft | null }>(
    "/api/social?action=draft",
    { method: "POST", body: JSON.stringify({ kind: "opportunity", ...input }) },
    "הסוכן לא הצליח לנסח תגובה"
  )
  if ("error" in result) return null
  return result.draft ?? null
}

export async function askAgentForCaption(input: {
  title: string
  overview?: string | null
  tools?: string[] | null
  categories?: string[] | null
  clientName?: string | null
  mediaType: "image" | "video"
}): Promise<AgentCaptionDraft | null> {
  const result = await call<{ configured: boolean; draft: AgentCaptionDraft | null }>(
    "/api/social?action=draft",
    { method: "POST", body: JSON.stringify({ kind: "caption", ...input }) },
    "הסוכן לא הצליח לנסח כיתוב"
  )
  if ("error" in result) return null
  return result.draft ?? null
}

export type PublishOutcome = { ok: true; state: "published" | "processing" } | { ok: false; message: string }

export async function publishNow(postId: string): Promise<PublishOutcome> {
  const result = await call<{ state: "published" | "processing" | "failed"; detail?: string }>(
    "/api/social?action=publish",
    { method: "POST", body: JSON.stringify({ postId }) },
    "הפרסום נכשל"
  )
  if ("error" in result) return { ok: false, message: result.error }
  if (result.state === "failed") return { ok: false, message: result.detail ?? "הפרסום נכשל" }
  return { ok: true, state: result.state }
}

export type InstagramStatus = { connected: boolean; username?: string; followers?: number; expired?: boolean; error?: string }

export async function instagramStatus(): Promise<InstagramStatus> {
  const result = await call<InstagramStatus>("/api/social?action=connection", { method: "GET" }, "בדיקת החיבור נכשלה")
  return "error" in result && !("connected" in result) ? { connected: false, error: result.error } : (result as InstagramStatus)
}

export async function connectInstagram(userId: string, accessTokenValue: string): Promise<InstagramStatus | { error: string }> {
  return call<InstagramStatus>(
    "/api/social?action=connection",
    { method: "POST", body: JSON.stringify({ userId, accessToken: accessTokenValue }) },
    "החיבור נכשל"
  )
}

export async function disconnectInstagram(): Promise<void> {
  await call("/api/social?action=connection", { method: "DELETE" }, "הניתוק נכשל")
}

/** Copy the reply and open the post it answers, in one tap.
 *
 * This is the whole Facebook flow: a person pastes and presses post. The
 * clipboard write has to happen in the same gesture as the click or Safari
 * refuses it, which is why the window is opened after. */
export async function copyAndOpen(text: string, url: string | null): Promise<boolean> {
  let copied = false
  try {
    await navigator.clipboard.writeText(text)
    copied = true
  } catch {
    copied = false
  }
  if (url) window.open(url, "_blank", "noopener,noreferrer")
  return copied
}
