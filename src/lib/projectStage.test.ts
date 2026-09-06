import { describe, expect, it } from "vitest"
import { PROJECT_STAGES, isActive, nextStage, stageMeta, stageProgress } from "@/lib/projectStage"

describe("stageProgress", () => {
  it("starts at nothing and ends at everything", () => {
    expect(stageProgress("brief")).toBe(0)
    expect(stageProgress("delivered")).toBe(100)
  })

  it("only ever reaches 100 on delivery", () => {
    for (const stage of PROJECT_STAGES) {
      if (stage.value !== "delivered") expect(stageProgress(stage.value)).toBeLessThan(100)
    }
  })

  it("rises through the sequence", () => {
    const values = PROJECT_STAGES.map((s) => stageProgress(s.value))
    for (let i = 1; i < values.length; i++) expect(values[i]).toBeGreaterThan(values[i - 1])
  })

  // Paused work is not progress. Drawing it as a percentage would claim
  // something about how far along it is that is not true.
  it("reads paused work as no progress rather than throwing", () => {
    expect(stageProgress("on_hold")).toBe(0)
  })
})

describe("nextStage", () => {
  it("walks the sequence one at a time", () => {
    expect(nextStage("brief")).toBe("concept")
    expect(nextStage("review")).toBe("revisions")
  })

  it("stops at delivered", () => {
    expect(nextStage("delivered")).toBeNull()
  })

  it("has nowhere automatic to send paused work", () => {
    expect(nextStage("on_hold")).toBeNull()
  })

  it("reaches delivered from the start without a dead end", () => {
    let stage = PROJECT_STAGES[0].value as ReturnType<typeof nextStage>
    const seen: string[] = []
    while (stage) {
      seen.push(stage)
      stage = nextStage(stage)
    }
    expect(seen[seen.length - 1]).toBe("delivered")
    expect(seen).toHaveLength(PROJECT_STAGES.length)
  })
})

describe("stageMeta", () => {
  it("gives every stage a client-facing sentence", () => {
    for (const stage of PROJECT_STAGES) {
      expect(stageMeta(stage.value).client.length).toBeGreaterThan(0)
    }
    expect(stageMeta("on_hold").label).toBe("מושהה")
  })

  it("never uses an em dash", () => {
    for (const stage of PROJECT_STAGES) {
      expect(stage.client).not.toContain("—")
      expect(stage.label).not.toContain("—")
    }
  })
})

describe("isActive", () => {
  it("counts everything but a delivered project", () => {
    expect(isActive("production")).toBe(true)
    expect(isActive("on_hold")).toBe(true)
    expect(isActive("delivered")).toBe(false)
  })
})
