import { describe, expect, it } from "vitest"
import {
  CALL_PACKAGES,
  callProgress,
  callVariables,
  endingKeyOf,
  isEndingRef,
  packageForEnding,
  renderScript,
  type CallGraph,
} from "@/lib/callScript"

const graph: CallGraph = {
  start: "opener",
  nodes: {
    opener: {
      phase: "פתיחה",
      title: "קבל רשות",
      script: "היי {{contact}}, לגבי {{business}}",
      question: "מה ענה?",
      choices: [{ label: "כן", next: "close", key: "yes" }],
    },
    close: {
      phase: "סגירה",
      title: "סגור",
      script: "אז {{pain}}",
      question: "נסגר?",
      choices: [{ label: "כן", next: "end:won", key: "won" }],
    },
  },
  endings: {
    won: { title: "התקדמות לסגירה", sub: "שלח חוזה.", outcome: "monthly", package: "monthly" },
    polite: { title: "השיחה הסתיימה", sub: "בכבוד.", outcome: "not_relevant" },
  },
}

describe("isEndingRef", () => {
  it("tells a node apart from an ending", () => {
    expect(isEndingRef("end:won")).toBe(true)
    expect(isEndingRef("close")).toBe(false)
    expect(endingKeyOf("end:won")).toBe("won")
  })
})

describe("renderScript", () => {
  it("fills the contact and the business", () => {
    const line = renderScript(graph.nodes.opener.script, { contactName: "דנה", businessName: "ICONIX" }, {})
    expect(line).toBe("היי דנה, לגבי ICONIX")
  })

  it("never leaves a blank in a line read out loud", () => {
    const line = renderScript(graph.nodes.opener.script, {}, {})
    expect(line).toBe("היי ___, לגבי המותג שלכם")
  })

  it("folds the lead's own answers back into the summary", () => {
    expect(renderScript("אז {{pain}}", {}, { inhouse: "time" })).toBe("אז ההפקה לוקחת יותר מדי זמן")
    expect(renderScript("אז {{pain}}", {}, { impact: "repeat" })).toBe("אז חוזרים על אותם חומרים")
  })

  it("falls back to a sentence that still works when nothing was answered", () => {
    expect(renderScript("{{pain}} · {{consequence}} · {{goal}}", {}, {})).toBe(
      "אין רצף קבוע של תוכן · אין מספיק נוכחות ויזואלית חדשה · לשמור על נוכחות עקבית"
    )
  })

  it("leaves an unknown token visible rather than blanking it", () => {
    expect(renderScript("{{nope}}", {}, {})).toBe("{{nope}}")
  })
})

describe("callVariables", () => {
  it("maps every documented pain answer", () => {
    expect(callVariables({}, { inhouse: "volume" }).pain).toBe("אין מספיק נפח תוכן")
    expect(callVariables({}, { inhouse: "cost" }).pain).toBe("הפקות יקרות מקשות על רצף")
    expect(callVariables({}, { sporadic: "ideas" }).pain).toBe("קשה לייצר מספיק רעיונות חדשים")
    expect(callVariables({}, { impact: "testing" }).pain).toBe("אין מספיק קריאייטיבים לבדיקה")
  })

  it("maps the goal the lead picked", () => {
    expect(callVariables({}, { goal: "ads" }).goal).toBe("לייצר יותר חומר לקמפיינים")
    expect(callVariables({}, { goal: "launch" }).goal).toBe("לתמוך בהשקות מוצרים")
  })
})

describe("callProgress", () => {
  it("moves with the call and never claims to be done early", () => {
    expect(callProgress(0, false)).toBe(8)
    expect(callProgress(5, false)).toBe(43)
    expect(callProgress(40, false)).toBe(94)
    expect(callProgress(2, true)).toBe(100)
  })
})

describe("packageForEnding", () => {
  it("points a closed call at the package it closed on", () => {
    expect(packageForEnding(graph, "won")).toBe("monthly")
    expect(CALL_PACKAGES[packageForEnding(graph, "won")!].price).toBe(6000)
  })

  it("returns nothing for an ending that closed nothing", () => {
    expect(packageForEnding(graph, "polite")).toBeNull()
    expect(packageForEnding(graph, null)).toBeNull()
  })
})

describe("CALL_PACKAGES", () => {
  it("carries the prices the script says out loud", () => {
    expect(CALL_PACKAGES.monthly.price).toBe(6000)
    expect(CALL_PACKAGES.pilot.price).toBe(1800)
    expect(CALL_PACKAGES.monthly.price - CALL_PACKAGES.pilot.price).toBe(4200)
  })
})

describe("painText coverage", () => {
  // Every answer that can lead to the consequence node has to produce a summary
  // sentence of its own. A generic fallback at the trial close is the whole
  // reason the reflect step stops working.
  const answersReachingReflect: [string, Record<string, string>][] = [
    ["inhouse/volume", { inhouse: "volume" }],
    ["inhouse/time", { inhouse: "time" }],
    ["inhouse/cost", { inhouse: "cost" }],
    ["inhouse/ideas", { inhouse: "ideas" }],
    ["impact/low_output", { impact: "low_output" }],
    ["impact/repeat", { impact: "repeat" }],
    ["impact/testing", { impact: "testing" }],
    ["ai_gap/quality", { ai_gap: "quality" }],
    ["ai_gap/consistency", { ai_gap: "consistency" }],
    ["ai_gap/ideas", { ai_gap: "ideas" }],
    ["ai_gap/volume", { ai_gap: "volume" }],
    ["existing_provider/gap", { existing_provider: "gap" }],
    ["no_video/hard", { no_video: "hard" }],
    ["no_video/want", { no_video: "want" }],
  ]

  const GENERIC = "אין רצף קבוע של תוכן"

  it.each(answersReachingReflect)("gives %s its own sentence", (_label, answers) => {
    expect(callVariables({}, answers).pain).not.toBe(GENERIC)
  })

  it("still has a sentence for a call that skipped the diagnosis", () => {
    expect(callVariables({}, {}).pain).toBe(GENERIC)
  })
})

describe("start_when", () => {
  it("drops the timing answer into a spoken sentence", () => {
    expect(renderScript("להתחיל {{start_when}}", {}, { timing_discovery: "asap" })).toBe("להתחיל כמה שיותר מהר")
    expect(renderScript("להתחיל {{start_when}}", {}, { timing_discovery: "event" })).toBe("להתחיל לקראת התאריך שאמרת")
  })

  it("stays sayable when they had no date in mind", () => {
    expect(renderScript("להתחיל {{start_when}}", {}, {})).toBe("להתחיל כשיהיה נכון לכם")
  })
})
