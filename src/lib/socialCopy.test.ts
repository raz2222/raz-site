import { describe, it, expect } from "vitest"
import {
  absoluteMediaUrl,
  captionWithHashtags,
  looksPromotional,
  projectCaption,
  projectHashtags,
  projectMedia,
  scoreOpportunity,
  stripEmDashes,
} from "./socialCopy"

describe("stripEmDashes", () => {
  it("replaces em and en dashes with the middle dot", () => {
    expect(stripEmDashes("סרטון AI — לעסק שלך")).toBe("סרטון AI · לעסק שלך")
    expect(stripEmDashes("video – for business")).toBe("video · for business")
  })

  it("leaves a hyphen inside a word alone", () => {
    expect(stripEmDashes("אתר שבנוי ב-AI")).toBe("אתר שבנוי ב-AI")
  })
})

describe("scoreOpportunity", () => {
  it("scores a business asking for video highly", () => {
    const result = scoreOpportunity("מחפשת ממליצים על מישהו שיעשה סרטון תדמית לעסק שלי, יש תקציב")
    expect(result.intent).toBe("video")
    expect(result.score).toBeGreaterThanOrEqual(70)
  })

  it("scores a freelancer advertising themselves near zero", () => {
    const result = scoreOpportunity("שלום, אני עורך וידאו ומציע שירותי עריכת וידאו וסרטונים לעסקים, צרו קשר לפרטים")
    expect(result.score).toBeLessThan(30)
  })

  it("scores an unrelated post at zero", () => {
    expect(scoreOpportunity("מישהו יודע איפה יש חניה בתל אביב").score).toBe(0)
  })

  it("tells a website ask from a video ask", () => {
    expect(scoreOpportunity("מחפש מישהו שיבנה דף נחיתה לעסק, כמה עולה").intent).toBe("website")
    expect(scoreOpportunity("מחפש קריאייטיב לקמפיין ממומן, מודעות חדשות").intent).toBe("ads")
  })
})

describe("looksPromotional", () => {
  it("catches a link, the studio name and a price", () => {
    expect(looksPromotional("אפשר לראות כאן https://madebyraz.co.il")).toBe(true)
    expect(looksPromotional("עולה בערך 1800 ₪")).toBe(true)
    expect(looksPromotional("תשלחי לי ל-052-1234567")).toBe(true)
  })

  it("leaves a plain helpful answer alone", () => {
    expect(looksPromotional("תלוי כמה שניות הסרטון · קצר יוצא הרבה יותר זול")).toBe(false)
  })
})

describe("projectCaption", () => {
  const project = {
    title: "Tutti UGC",
    overview: "פרסומת קצרה לחברת Tutti. נעשתה בשלושה ימים מהבריף עד המסירה.",
    ai_tools: ["Higgsfield", "Claude"],
    client_name: "Tutti",
  }

  it("leads with the title and the first sentence of the overview", () => {
    const caption = projectCaption(project)
    expect(caption.startsWith("Tutti UGC")).toBe(true)
    expect(caption).toContain("פרסומת קצרה לחברת Tutti")
    expect(caption).not.toContain("מהבריף עד המסירה")
  })

  it("names the tools and never writes an em dash", () => {
    const caption = projectCaption(project)
    expect(caption).toContain("Higgsfield · Claude")
    expect(caption).not.toMatch(/[—–]/)
  })

  it("survives a project with no overview", () => {
    expect(projectCaption({ ...project, overview: null })).toContain("Tutti UGC")
  })
})

describe("projectHashtags", () => {
  it("adds a tag for a tool it recognises", () => {
    expect(projectHashtags({ ai_tools: ["Higgsfield", "Seedance 2.5"], categories: [] })).toContain("#higgsfield")
  })

  it("turns a category into one tag without spaces", () => {
    expect(projectHashtags({ ai_tools: [], categories: ["פרסומות AI"] })).toContain("#פרסומות_AI")
  })

  it("stays inside Instagram's sane range", () => {
    const many = projectHashtags({ ai_tools: [], categories: Array.from({ length: 20 }, (_, i) => `c${i}`) })
    expect(many.length).toBeLessThanOrEqual(10)
  })
})

describe("media urls", () => {
  it("makes a site-relative path absolute, because Instagram fetches it", () => {
    expect(absoluteMediaUrl("/videos/ad.mp4")).toBe("https://madebyraz.co.il/videos/ad.mp4")
  })

  it("leaves an uploaded storage url alone", () => {
    const url = "https://beobkcttzwiqcawrprgg.supabase.co/storage/v1/object/public/site-media/a.jpg"
    expect(absoluteMediaUrl(url)).toBe(url)
  })

  it("prefers the film over the gallery", () => {
    expect(
      projectMedia({ video: "/videos/ad.mp4", gallery: [{ type: "image", url: "/images/a.jpg", caption: "" }] })
    ).toEqual({ url: "https://madebyraz.co.il/videos/ad.mp4", type: "video" })
  })

  it("falls back to the first gallery item, keeping its type", () => {
    expect(projectMedia({ video: null, gallery: [{ type: "image", url: "/images/a.jpg", caption: "" }] })).toEqual({
      url: "https://madebyraz.co.il/images/a.jpg",
      type: "image",
    })
  })

  it("has nothing to publish for a project with neither", () => {
    expect(projectMedia({ video: null, gallery: [] })).toBeNull()
  })
})

describe("captionWithHashtags", () => {
  it("puts the tags in their own block", () => {
    expect(captionWithHashtags("שורה", ["#a", "#b"])).toBe("שורה\n\n#a #b")
  })

  it("leaves a caption with no tags unchanged", () => {
    expect(captionWithHashtags("שורה", [])).toBe("שורה")
  })
})
