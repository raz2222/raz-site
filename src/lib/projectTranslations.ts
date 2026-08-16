export const LABEL_EN: Record<string, string> = {
  "אסטרטגיה": "Strategy",
  "UI": "UI",
  "פיתוח": "Development",
  "מושן": "Motion",
  "AI": "AI",
  "בימוי קריאייטיבי": "Creative Direction",
  "הפקת AI": "AI Production",
  "UI/UX": "UI/UX",
  "בימוי אמנותי": "Art Direction",
  "סטיילינג": "Styling",
}

export function translateLabels(labels: string[]): string[] {
  return labels.map((l) => LABEL_EN[l] ?? l)
}

export type ProjectTranslation = {
  slug: string
  category: string
  overview: string
  challenge: string | null
  direction: string | null
  digitalExperience: string | null
  behindTheScenes: string | null
  result: string | null
}

export const projectTranslations: ProjectTranslation[] = [
  {
    slug: "luxury-residence",
    category: "Digital Experience",
    overview: "A conceptual digital experience for a luxury residential property, built to feel like a walkthrough of the property rather than a brochure.",
    challenge: "Most real estate sites reduce a home to a photo grid. The goal was to turn the space itself into the interface.",
    direction: "A calm, cinematic pace. Full-screen motion, minimal interface, letting the architecture lead.",
    digitalExperience: "An interactive single-page experience with scroll-driven reveals and a full-screen hero video.",
    behindTheScenes: null,
    result: "Independent concept project.",
  },
  {
    slug: "automotive-2077",
    category: "Creative Direction / AI Film / Interactive Experience",
    overview: "What happens when vehicle design, film, AI and web development become a single project? A futuristic car brand built from scratch.",
    challenge: "To prove that one person can take an idea from concept to a complete visual world and a live digital product.",
    direction: "Creating the language, the vehicle, the characters and the world of a fictional 2077 car brand.",
    digitalExperience: "An interactive site experience presenting the film, the vehicle and the brand world together.",
    behindTheScenes: "Sketch → AI generation → design → code → final product, all in one continuous pipeline.",
    result: "Independent concept project — not client-commissioned work.",
  },
  {
    slug: "fashion-campaign",
    category: "AI Campaign / E-commerce / Digital Art Direction",
    overview: "A fashion campaign produced entirely with AI — testing how far art direction can carry an image without a physical shoot.",
    challenge: "To show that campaign-level visuals don't require a production budget or a studio.",
    direction: "Dark, cinematic styling — treating the AI output like location photography, not like an obviously synthetic image.",
    digitalExperience: null,
    behindTheScenes: null,
    result: "Independent concept project.",
  },
  {
    slug: "aura-jewelry",
    category: "AI Visual Campaign",
    overview: "A visual campaign for a jewelry brand produced entirely with AI, from concept to final frame.",
    challenge: "To deliver product-campaign quality without a physical shoot day.",
    direction: "Tight, intimate framing that treats the product like a character, not a catalog shot.",
    digitalExperience: null,
    behindTheScenes: null,
    result: "Independent concept project.",
  },
  {
    slug: "second-skin",
    category: "AI Skincare Campaign",
    overview: "A skincare campaign produced entirely with AI — macro skin detail, natural light, zero retouch filters.",
    challenge: "To prove AI beauty visuals can hold up to the detail a real macro lens demands.",
    direction: "Warm, sun-washed, hyper-realistic skin texture — imperfections preserved, not smoothed away.",
    digitalExperience: null,
    behindTheScenes: null,
    result: "Independent concept project.",
  },
  {
    slug: "no-address",
    category: "Streetwear Film / AI Campaign",
    overview: "A film for a streetwear brand exploring anonymity and movement — a figure disappearing into a back alley, no face, no logos, just presence.",
    challenge: "To build brand mood entirely through absence — no product shots, no faces, just atmosphere and clothing.",
    direction: "Restrained, sun-washed camera language, in a documentary-handheld style.",
    digitalExperience: null,
    behindTheScenes: null,
    result: "Independent concept project.",
  },
]

export function getProjectTranslation(slug: string) {
  return projectTranslations.find((p) => p.slug === slug)
}
