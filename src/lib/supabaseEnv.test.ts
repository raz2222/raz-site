import { describe, expect, it } from "vitest"
import { supabaseEnvError } from "./supabase"

/** A build without the Supabase variables produces an app that dies on
 * `undefined is not an object (evaluating 'n.from')` · the client module throws
 * while evaluating, so every chunk that imported it holds undefined. The app is
 * lost either way; this is about what the error boundary gets to print. */
describe("supabaseEnvError", () => {
  it("is silent when both are present", () => {
    expect(supabaseEnvError("https://x.supabase.co", "anon")).toBeNull()
  })

  it("names the one that is missing", () => {
    expect(supabaseEnvError(undefined, "anon")).toContain("VITE_SUPABASE_URL")
    expect(supabaseEnvError(undefined, "anon")).not.toContain("VITE_SUPABASE_ANON_KEY")
    expect(supabaseEnvError("https://x.supabase.co", undefined)).toContain("VITE_SUPABASE_ANON_KEY")
  })

  it("names both when neither is set, and says where to look", () => {
    const message = supabaseEnvError(undefined, undefined)
    expect(message).toContain("VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY")
    expect(message).toContain("Preview")
  })

  it("treats an empty string as missing, which is what an unset variable inlines to", () => {
    expect(supabaseEnvError("", "")).toContain("VITE_SUPABASE_URL")
  })
})
