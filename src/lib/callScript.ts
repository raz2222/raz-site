/** The call coach is a decision tree. Each node is one thing to say plus the
 * answers it can get, and every answer points at the next node. What Raz reads
 * aloud is assembled from the node's script and from what the lead already said,
 * which is why the tree is data and the assembly lives here. */

export type CallChoice = { label: string; next: string; key: string }

export type CallNode = {
  phase: string
  title: string
  script: string
  tip?: string
  /** Renders the package card under the script. */
  offer?: CallPackageKey
  /** The node asks Raz to type down the lead's correction before moving on. */
  customNote?: boolean
  question: string
  choices: CallChoice[]
}

export type CallOutcome = "pilot" | "monthly" | "custom_quote" | "follow_up" | "not_relevant" | "no_answer"

export type CallEnding = {
  title: string
  sub: string
  outcome?: CallOutcome
  package?: CallPackageKey
}

export type CallGraph = {
  start: string
  nodes: Record<string, CallNode>
  endings: Record<string, CallEnding>
}

export type CallAnswers = Record<string, string>

export type CallPackageKey = "monthly" | "pilot"

/** The two things a call can close on. One definition, used by the offer card in
 * the teleprompter and by the quote and contract built from the call, so the
 * number Raz says out loud and the number on the agreement cannot drift. */
export const CALL_PACKAGES: Record<
  CallPackageKey,
  { name: string; price: number; unit: string; meta: string; bullets: string[]; recurring: boolean; paymentTerms: string }
> = {
  monthly: {
    name: "מסלול חודשי · 5 סרטוני פרסום קצרים",
    price: 6000,
    unit: "לחודש",
    meta: "5 סרטוני פרסום קצרים · מסלול חודשי אחד",
    bullets: ["קריאייטיב ורעיונות", "הפקת AI בהתאמה למותג", "רצף חודשי קבוע"],
    recurring: true,
    paymentTerms: "חודשי",
  },
  pilot: {
    name: "סרטון פיילוט",
    price: 1800,
    unit: "פיילוט",
    meta: "המשך לחבילה: עוד 4,200 ₪ · סה״כ 5 סרטונים",
    bullets: ["קיזוז מלא בתוך 7 ימים", "הפיילוט נחשב סרטון 1 מתוך 5", "אין הנחה על החבילה המלאה"],
    recurring: false,
    paymentTerms: "100% מראש",
  },
}

export const EMPTY_GRAPH: CallGraph = { start: "", nodes: {}, endings: {} }

export function isEndingRef(next: string): boolean {
  return next.startsWith("end:")
}

export function endingKeyOf(next: string): string {
  return next.slice(4)
}

/** The lead's own words, folded back into the summary Raz reads at the reflect
 * step. Mapped from the answers rather than free text so the sentence stays
 * grammatical however the call wandered. */
function painText(answers: CallAnswers): string {
  const { inhouse, impact, sporadic } = answers
  if (inhouse === "volume" || impact === "low_output") return "אין מספיק נפח תוכן"
  if (inhouse === "time" || sporadic === "time") return "ההפקה לוקחת יותר מדי זמן"
  if (inhouse === "cost" || sporadic === "budget") return "הפקות יקרות מקשות על רצף"
  if (inhouse === "ideas" || sporadic === "ideas") return "קשה לייצר מספיק רעיונות חדשים"
  if (impact === "repeat") return "חוזרים על אותם חומרים"
  if (impact === "testing") return "אין מספיק קריאייטיבים לבדיקה"
  return "אין רצף קבוע של תוכן"
}

function consequenceText(answers: CallAnswers): string {
  switch (answers.consequence) {
    case "campaigns": return "יש פחות קמפיינים ופחות הזדמנויות לבדוק מה עובד"
    case "launch": return "המוצרים וההשקות לא מקבלים מספיק במה"
    case "fatigue": return "הקהל נשחק מאותם חומרים"
    case "competition": return "המתחרים תופסים יותר תשומת לב"
    default: return "אין מספיק נוכחות ויזואלית חדשה"
  }
}

function goalText(answers: CallAnswers): string {
  switch (answers.goal) {
    case "attention": return "למשוך יותר תשומת לב"
    case "ads": return "לייצר יותר חומר לקמפיינים"
    case "launch": return "לתמוך בהשקות מוצרים"
    default: return "לשמור על נוכחות עקבית"
  }
}

export type CallSubject = {
  contactName?: string | null
  businessName?: string | null
  callContext?: string | null
}

/** A blank in a line Raz is about to read aloud is worse than a generic word, so
 * every token has a fallback that still reads like a sentence. */
export function callVariables(subject: CallSubject, answers: CallAnswers): Record<string, string> {
  return {
    contact: subject.contactName?.trim() || "___",
    business: subject.businessName?.trim() || "המותג שלכם",
    context: subject.callContext?.trim() || "לאחרונה פנייה קצרה",
    pain: painText(answers),
    consequence: consequenceText(answers),
    goal: goalText(answers),
  }
}

export function renderScript(script: string, subject: CallSubject, answers: CallAnswers): string {
  const variables = callVariables(subject, answers)
  return script.replace(/\{\{\s*([a-z_]+)\s*\}\}/gi, (whole, key: string) => variables[key.toLowerCase()] ?? whole)
}

/** Rough, and deliberately so: a call that wandered through many nodes is not
 * further along than one that went straight to the offer, but the bar filling up
 * tells Raz the call is moving. Capped below 100 until an ending is reached. */
export function callProgress(pathLength: number, finished: boolean): number {
  if (finished) return 100
  return Math.min(94, 8 + pathLength * 7)
}

export function endingFor(graph: CallGraph, endingKey: string | null | undefined): CallEnding | null {
  if (!endingKey) return null
  return graph.endings?.[endingKey] ?? null
}

/** The package a finished call points at, if any. Used to prefill the quote and
 * the contract, so closing on the phone and sending the agreement are one move. */
export function packageForEnding(graph: CallGraph, endingKey: string | null | undefined): CallPackageKey | null {
  const ending = endingFor(graph, endingKey)
  return ending?.package ?? null
}
