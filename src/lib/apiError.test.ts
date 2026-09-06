import { describe, expect, it } from "vitest"
import { apiErrorMessage } from "@/lib/apiError"

function response(body: string, status: number): Response {
  return new Response(body, { status })
}

describe("apiErrorMessage", () => {
  it("uses the error our own route returned", async () => {
    const res = response(JSON.stringify({ error: "Missing 'clientEmail'" }), 400)
    expect(await apiErrorMessage(res, "נכשל")).toBe("Missing 'clientEmail'")
  })

  it("appends the detail when the route gave one", async () => {
    const res = response(JSON.stringify({ error: "Failed to send", detail: "domain not verified" }), 502)
    expect(await apiErrorMessage(res, "נכשל")).toBe("Failed to send · domain not verified")
  })

  // The case that cost a working send button: the function crashed before it
  // could return anything, so the body is a stack trace. Parsing it threw, and
  // the alert either never appeared or said nothing.
  it("still says something useful when the body is not JSON at all", async () => {
    const res = response("Error [ERR_MODULE_NOT_FOUND]: Cannot find module …", 500)
    const message = await apiErrorMessage(res, "שליחת החוזה במייל נכשלה")
    expect(message).toContain("שליחת החוזה במייל נכשלה")
    expect(message).toContain("500")
  })

  it("names an expired session rather than blaming the send", async () => {
    expect(await apiErrorMessage(response("", 401), "נכשל")).toContain("פג תוקף ההתחברות")
  })

  it("never returns an empty message", async () => {
    for (const [body, status] of [["", 500], ["", 404], ["{}", 502], ["<html>", 503]] as const) {
      expect((await apiErrorMessage(response(body, status), "נכשל")).length).toBeGreaterThan(0)
    }
  })
})
