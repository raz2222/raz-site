export type Project = {
  slug: string
  number: string
  title: string
  category: string
  disciplines: string[]
  year: string
  video?: string
  thumbClass: string
  concept?: boolean
}

export const projects: Project[] = [
  {
    slug: "luxury-residence",
    number: "PROJECT 01",
    title: "Luxury Residence",
    category: "Digital Experience",
    disciplines: ["Strategy", "UI", "Development", "Motion", "AI"],
    year: "2026",
    video: "/videos/raz-showreel-7.mp4",
    thumbClass: "big",
    concept: true,
  },
  {
    slug: "automotive-2077",
    number: "PROJECT 02",
    title: "Automotive 2077",
    category: "Creative Direction / AI Film / Interactive Experience",
    disciplines: ["Creative Direction", "AI Production", "UI/UX", "Development", "Motion"],
    year: "2026",
    video: "/videos/raz-showreel.mp4",
    thumbClass: "wide",
    concept: true,
  },
  {
    slug: "fashion-campaign",
    number: "PROJECT 03",
    title: "Fashion Campaign",
    category: "AI Campaign / E-commerce / Digital Art Direction",
    disciplines: ["Art Direction", "AI Production", "Styling"],
    year: "2026",
    video: "/videos/raz-showreel-5.mp4",
    thumbClass: "tall",
    concept: true,
  },
  {
    slug: "aura-jewelry",
    number: "PROJECT 04",
    title: "Aura",
    category: "AI Visual Campaign",
    disciplines: ["Art Direction", "AI Production"],
    year: "2026",
    video: "/videos/raz-showreel-2.mp4",
    thumbClass: "normal",
    concept: true,
  },
]

export const featuredCaseStudy = {
  title: "AUTOMOTIVE 2077",
  question:
    "What happens when automotive design, film, AI and web development become one project?",
  video: "/videos/raz-showreel.mp4",
  blocks: [
    { label: "Concept", text: "Building a futuristic car brand from scratch." },
    { label: "Visual Direction", text: "Creating the language, the vehicle, the characters and the world." },
    { label: "Film", text: "AI cinematic production." },
    { label: "Digital", text: "Interactive website experience." },
  ],
  tools: ["Creative Direction", "AI Production", "UI/UX", "Development", "Motion"],
}

export const experiments = [
  { title: "Cyberpunk Film", video: "/videos/raz-showreel-4.mp4" },
  { title: "Hover Car", video: "/videos/raz-showreel.mp4" },
  { title: "AI Characters" },
  { title: "Interactive UI" },
  { title: "Motion Study", video: "/videos/raz-showreel-2.mp4" },
  { title: "Weird Website" },
]
