export type LessonResource = { label: string; url: string }

/** Public lesson metadata — safe for anyone, powers the syllabus. */
export type LessonMeta = {
  slug: string
  module_no: number
  lesson_no: number
  order_index: number
  title_he: string
  summary_he: string | null
  duration_min: number | null
  is_free: boolean
  published: boolean
  resources: LessonResource[]
}

/** Full lesson as returned by the get_lesson() RPC. body_he / video_url are
 *  null when the caller is not entitled; `locked` says so explicitly. */
export type LessonFull = LessonMeta & {
  body_he: string | null
  video_url: string | null
  has_access: boolean
  locked: boolean
}

export type CheckoutMode = "manual" | "disabled" | "provider"

export type CourseConfig = {
  price_agorot: number
  currency: string
  checkout_mode: CheckoutMode
}
