import { describe, expect, it } from "vitest"
import { israelToday, toRow } from "./sync-guides.mjs"

describe("sync-guides", () => {
  it("reads the date in Israel, not UTC", () => {
    // 22:30 UTC on the 14th is already the 15th in Jerusalem.
    expect(israelToday(new Date("2026-10-14T22:30:00Z"))).toBe("2026-10-15")
  })

  it("maps a file to a guides row with the category cover and no English", () => {
    const row = toRow(
      {
        slug: "x",
        format: "query",
        title: "t",
        excerpt: "e",
        meta_description: "m",
        category: "אתרים ופיתוח",
        related_service_slug: null,
        read_time: "4 דקות קריאה",
        date_published: "2026-10-29",
        sections: [],
        faq: [],
        en: {},
      },
      44,
    )
    expect(row).toMatchObject({ kind: "article", image: "/images/guides/cover-web-dev.png", sort_order: 44 })
    expect(row).not.toHaveProperty("en")
    expect(row).not.toHaveProperty("format")
  })
})
