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

export type ProjectDetailItemEn = { title: string; description: string }

export type ProjectTranslation = {
  slug: string
  category: string
  overview: string
  duration: string
  clientName: string
  challenges: ProjectDetailItemEn[]
  solutions: ProjectDetailItemEn[]
  results: string[]
}

export const projectTranslations: ProjectTranslation[] = [
  {
    slug: "luxury-residence",
    category: "Digital Experience",
    overview: "A conceptual digital experience for a luxury residential property, built to feel like a walkthrough of the property rather than a brochure.",
    duration: "About two weeks",
    clientName: "Luxury Residence (independent concept)",
    challenges: [
      { title: "Background & Problem", description: "Most real estate sites reduce a home to a photo grid. The goal was to turn the space itself into the interface." },
    ],
    solutions: [
      { title: "Design Direction", description: "A calm, cinematic pace. Full-screen motion, minimal interface, letting the architecture lead." },
      { title: "Digital Experience", description: "An interactive single-page experience with scroll-driven reveals and a full-screen hero video." },
    ],
    results: ["Independent concept project — built to demonstrate capability, with no commissioning client."],
  },
  {
    slug: "automotive-2077",
    category: "Creative Direction / AI Film / Interactive Experience",
    overview: "What happens when vehicle design, film, AI and web development become a single project? A futuristic car brand built from scratch.",
    duration: "About a month",
    clientName: "Automotive 2077 (independent concept)",
    challenges: [
      { title: "The Challenge", description: "To prove that one person can take an idea from concept to a complete visual world and a live digital product." },
    ],
    solutions: [
      { title: "The Concept", description: "Creating the language, the vehicle, the characters and the world of a fictional 2077 car brand." },
      { title: "Digital Experience", description: "An interactive site experience presenting the film, the vehicle and the brand world together." },
      { title: "The Process", description: "Sketch → AI generation → design → code → final product, all in one continuous pipeline." },
    ],
    results: ["Independent concept project — not client-commissioned work."],
  },
  {
    slug: "fashion-campaign",
    category: "AI Campaign / E-commerce / Digital Art Direction",
    overview: "A fashion campaign produced entirely with AI — testing how far art direction can carry an image without a physical shoot.",
    duration: "About a week",
    clientName: "Fashion Campaign (independent concept)",
    challenges: [
      { title: "The Challenge", description: "To show that campaign-level visuals don't require a production budget or a studio." },
    ],
    solutions: [
      { title: "Art Direction", description: "Dark, cinematic styling — treating the AI output like location photography, not like an obviously synthetic image." },
    ],
    results: ["Independent concept project."],
  },
  {
    slug: "aura-jewelry",
    category: "AI Visual Campaign",
    overview: "A visual campaign for a jewelry brand produced entirely with AI, from concept to final frame.",
    duration: "About a week",
    clientName: "Aura (independent concept)",
    challenges: [
      { title: "The Challenge", description: "To deliver product-campaign quality without a physical shoot day." },
    ],
    solutions: [
      { title: "Art Direction", description: "Tight, intimate framing that treats the product like a character, not a catalog shot." },
    ],
    results: ["Independent concept project."],
  },
  {
    slug: "second-skin",
    category: "AI Skincare Campaign",
    overview: "A skincare campaign produced entirely with AI — macro skin detail, natural light, zero retouch filters.",
    duration: "About a week",
    clientName: "Second Skin (independent concept)",
    challenges: [
      { title: "The Challenge", description: "To prove AI beauty visuals can hold up to the detail a real macro lens demands." },
    ],
    solutions: [
      { title: "Art Direction", description: "Warm, sun-washed, hyper-realistic skin texture — imperfections preserved, not smoothed away." },
    ],
    results: ["Independent concept project."],
  },
  {
    slug: "no-address",
    category: "Streetwear Film / AI Campaign",
    overview: "A film for a streetwear brand exploring anonymity and movement — a figure disappearing into a back alley, no face, no logos, just presence.",
    duration: "About a week",
    clientName: "No Address (independent concept)",
    challenges: [
      { title: "The Challenge", description: "To build brand mood entirely through absence — no product shots, no faces, just atmosphere and clothing." },
    ],
    solutions: [
      { title: "Camera Direction", description: "Restrained, sun-washed camera language, in a documentary-handheld style." },
    ],
    results: ["Independent concept project."],
  },
]

export function getProjectTranslation(slug: string) {
  return projectTranslations.find((p) => p.slug === slug)
}
