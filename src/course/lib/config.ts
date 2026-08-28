import type { CourseConfig } from "./types"

export const DEFAULT_COURSE_CONFIG: CourseConfig = {
  price_agorot: 30000,
  currency: "ILS",
  checkout_mode: "manual",
}

/** site_content row key that holds the editable course config. */
export const COURSE_CONFIG_KEY = "course"

export function formatPrice(agorot: number, currency = "ILS") {
  const n = Math.round(agorot / 100)
  return currency === "ILS" ? `₪${n.toLocaleString("he-IL")}` : `${n.toLocaleString("he-IL")} ${currency}`
}
