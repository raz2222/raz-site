export const PROJECT_TYPES_EN = [
  "New website",
  "Redesign / upgrade existing site",
  "Migrate existing site to AI",
  "AI-managed website",
  "AI ad / campaign",
  "Product or brand video",
  "Something else",
] as const

export type ProjectTypeEn = (typeof PROJECT_TYPES_EN)[number]

export const BUDGETS_BY_TYPE_EN: Record<ProjectTypeEn, string[]> = {
  "New website": ["Under ₪5,000", "₪5,000–15,000", "₪15,000–30,000", "Over ₪30,000", "Not sure yet"],
  "Redesign / upgrade existing site": ["Under ₪3,000", "₪3,000–8,000", "₪8,000–20,000", "Over ₪20,000", "Not sure yet"],
  "Migrate existing site to AI": ["Under ₪5,000", "₪5,000–15,000", "₪15,000–30,000", "Over ₪30,000", "Not sure yet"],
  "AI-managed website": ["Under ₪500/mo", "₪500–1,500/mo", "₪1,500–3,000/mo", "Over ₪3,000/mo", "Not sure yet"],
  "AI ad / campaign": ["Under ₪1,500", "₪1,500–4,000", "₪4,000–10,000", "Over ₪10,000", "Not sure yet"],
  "Product or brand video": ["Under ₪1,000", "₪1,000–3,000", "₪3,000–7,000", "Over ₪7,000", "Not sure yet"],
  "Something else": ["Under ₪5,000", "₪5,000–15,000", "₪15,000–30,000", "Over ₪30,000", "Not sure yet"],
}

export const QUESTIONS_BY_TYPE_EN: Partial<Record<ProjectTypeEn, { label: string; options: string[] }>> = {
  "New website": {
    label: "Roughly how many pages?",
    options: ["Up to 5 pages", "5–10 pages", "10+ pages", "Not sure yet"],
  },
  "Redesign / upgrade existing site": {
    label: "What bothers you most about the current site?",
    options: ["Looks outdated", "Not mobile-friendly", "Technically slow", "Not generating leads/sales"],
  },
  "Migrate existing site to AI": {
    label: "How much content needs to move over?",
    options: ["A little (up to 5 pages)", "Medium (5–15 pages)", "A lot of content/articles"],
  },
  "AI-managed website": {
    label: "What matters most in ongoing management?",
    options: ["Regular content updates", "Technical & security checks", "Performance & SEO improvements"],
  },
  "AI ad / campaign": {
    label: "Which platform mainly?",
    options: ["Instagram / Facebook", "TikTok", "YouTube", "A few platforms"],
  },
  "Product or brand video": {
    label: "Do you already have raw footage (photos/video)?",
    options: ["Yes, I have material", "No, all AI-generated", "A bit of both"],
  },
}
