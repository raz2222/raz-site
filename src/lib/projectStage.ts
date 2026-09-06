/** Where a piece of work is, in the words a client understands.
 *
 * A short ordered list rather than free text, because it drives the bar the
 * client reads at a glance. The sentence Raz types alongside it is the part
 * that actually reassures someone; the stage is what makes it scannable. */
export const PROJECT_STAGES = [
  { value: "brief", label: "איסוף חומרים", client: "אוספים ממך חומרים ומידע" },
  { value: "concept", label: "קריאייטיב", client: "עובדים על הרעיון והכיוון" },
  { value: "production", label: "בהפקה", client: "בהפקה" },
  { value: "review", label: "לאישור", client: "מוכן לצפייה ולאישור שלך" },
  { value: "revisions", label: "תיקונים", client: "מטמיעים את ההערות שלך" },
  { value: "delivered", label: "נמסר", client: "נמסר" },
] as const

export type ProjectStage = (typeof PROJECT_STAGES)[number]["value"] | "on_hold"

/** Paused work sits outside the sequence: it is not progress, and drawing it as
 * a percentage would say something untrue about how far along it is. */
export const ON_HOLD = { value: "on_hold", label: "מושהה", client: "מושהה כרגע" } as const

export function stageMeta(stage: ProjectStage) {
  return PROJECT_STAGES.find((s) => s.value === stage) ?? ON_HOLD
}

export function stageIndex(stage: ProjectStage): number {
  return PROJECT_STAGES.findIndex((s) => s.value === stage)
}

/** 0 to 100. "Delivered" is the only 100, and a stage the list does not know
 * reads as 0 rather than throwing. */
export function stageProgress(stage: ProjectStage): number {
  const index = stageIndex(stage)
  if (index < 0) return 0
  return Math.round((index / (PROJECT_STAGES.length - 1)) * 100)
}

export function isActive(stage: ProjectStage): boolean {
  return stage !== "delivered"
}

/** The next stage along, for the one-tap advance in the admin. Delivered and
 * paused have nowhere automatic to go. */
export function nextStage(stage: ProjectStage): ProjectStage | null {
  const index = stageIndex(stage)
  if (index < 0 || index >= PROJECT_STAGES.length - 1) return null
  return PROJECT_STAGES[index + 1].value
}
