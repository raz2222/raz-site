import { describe, expect, it } from "vitest"
import { isLead, LEAD_THRESHOLD, scoreEngagement } from "../_lib/engagement-signal.js"

describe("scoreEngagement", () => {
  it("treats asking the price as the strongest signal there is", () => {
    const signal = scoreEngagement("היי כמה עולה סרטון כזה?")
    expect(signal.intent).toBe("pricing")
    expect(isLead(signal)).toBe(true)
  })

  it("catches someone wanting one for their business", () => {
    expect(isLead(scoreEngagement("וואו, אני רוצה כזה לעסק שלי"))).toBe(true)
    expect(isLead(scoreEngagement("can you make one like this for my business?"))).toBe(true)
  })

  it("scores praise at zero, however enthusiastic", () => {
    expect(scoreEngagement("נראה מדהים!!! 🔥🔥").score).toBe(0)
    expect(scoreEngagement("wow amazing 😍").score).toBe(0)
    expect(scoreEngagement("אש 🔥").score).toBe(0)
  })

  it("scores a comment with no words at all at zero", () => {
    expect(scoreEngagement("🔥🔥🔥").score).toBe(0)
    expect(scoreEngagement("❤️").score).toBe(0)
  })

  it("keeps praise from cancelling a real question in the same message", () => {
    const signal = scoreEngagement("מטורף! כמה עולה משהו כזה")
    expect(signal.intent).toBe("pricing")
    expect(isLead(signal)).toBe(true)
  })

  it("treats how-did-you-make-it as a peer, not a buyer", () => {
    const signal = scoreEngagement("איך עשית את זה? באיזה כלי")
    expect(signal.intent).toBe("how")
    expect(isLead(signal)).toBe(false)
    expect(signal.score).toBeGreaterThan(0)
  })

  it("ranks a private message above the same words in public", () => {
    const comment = scoreEngagement("אני רוצה כזה", "comment")
    const dm = scoreEngagement("אני רוצה כזה", "dm")
    expect(dm.score).toBeGreaterThan(comment.score)
  })

  it("does not promote a short shrug to a lead", () => {
    expect(scoreEngagement("אוקיי תודה").score).toBe(0)
  })

  it("agrees with the threshold the database trigger uses", () => {
    expect(LEAD_THRESHOLD).toBe(60)
    expect(isLead({ score: 60, intent: "wants_one" })).toBe(true)
    expect(isLead({ score: 59, intent: "how" })).toBe(false)
  })
})
