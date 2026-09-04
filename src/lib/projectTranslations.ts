export const LABEL_EN: Record<string, string> = {
  "אסטרטגיה": "Strategy",
  "UI": "UI",
  "פיתוח": "Development",
  "עיצוב": "Design",
  "מושן": "Motion",
  "תנועה": "Motion",
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

export const CATEGORY_EN: Record<string, string> = {
  "הכל": "All",
  "אתרים": "Websites",
  "דפי נחיתה": "Landing Pages",
  "אתרי WordPress": "WordPress Sites",
  "אתרי AI": "AI Websites",
  "פרסומות AI": "AI Ads",
  "סרטוני AI": "AI Videos",
  "תמונות מוצר": "Product Images",
  "ימי צילום AI": "AI Photoshoots",
  "UGC": "UGC",
}

export function translateCategory(category: string): string {
  return CATEGORY_EN[category] ?? category
}

export const SUB_SERVICE_TITLE_EN: Record<string, string> = {
  "site-design": "Site Design",
  "creative-development": "Creative Development",
  "interactive-websites": "Interactive Websites",
  "ecommerce": "E-commerce",
  "landing-pages": "Landing Pages",
  "wordpress-development": "WordPress Development",
  "custom-development": "Custom Development",
  "ai-functionality": "AI-Powered Functionality",
  "product-videos": "Product Videos",
  "campaign-visuals": "Campaign Visuals",
  "social-content": "Social Content",
  "ai-photography": "AI Photography",
  "creative-direction": "Creative Direction",
  "concept-development": "Concept Development",
}

export function translateSubServiceTitle(slug: string, fallback: string): string {
  return SUB_SERVICE_TITLE_EN[slug] ?? fallback
}

export type ProjectDetailItemEn = { title: string; description: string }

export type ProjectTranslation = {
  slug: string
  category: string
  overview: string
  duration: string
  clientName: string
  role?: string
  title?: string
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
    results: ["Independent concept project, built to demonstrate capability, with no commissioning client."],
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
    results: ["Independent concept project, not client-commissioned work."],
  },
  {
    slug: "fashion-campaign",
    category: "AI Campaign / E-commerce / Digital Art Direction",
    overview: "A fashion campaign produced entirely with AI, testing how far art direction can carry an image without a physical shoot.",
    duration: "About a week",
    clientName: "Fashion Campaign (independent concept)",
    challenges: [
      { title: "The Challenge", description: "To show that campaign-level visuals don't require a production budget or a studio." },
    ],
    solutions: [
      { title: "Art Direction", description: "Dark, cinematic styling: treating the AI output like location photography, not like an obviously synthetic image." },
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
    overview: "A skincare campaign produced entirely with AI: macro skin detail, natural light, zero retouch filters.",
    duration: "About a week",
    clientName: "Second Skin (independent concept)",
    challenges: [
      { title: "The Challenge", description: "To prove AI beauty visuals can hold up to the detail a real macro lens demands." },
    ],
    solutions: [
      { title: "Art Direction", description: "Warm, sun-washed, hyper-realistic skin texture, imperfections preserved, not smoothed away." },
    ],
    results: ["Independent concept project."],
  },
  {
    slug: "no-address",
    category: "Streetwear Film / AI Campaign",
    overview: "A film for a streetwear brand exploring anonymity and movement: a figure disappearing into a back alley, no face, no logos, just presence.",
    duration: "About a week",
    clientName: "No Address (independent concept)",
    challenges: [
      { title: "The Challenge", description: "To build brand mood entirely through absence: no product shots, no faces, just atmosphere and clothing." },
    ],
    solutions: [
      { title: "Camera Direction", description: "Restrained, sun-washed camera language, in a documentary-handheld style." },
    ],
    results: ["Independent concept project."],
  },
  {
    slug: "serve",
    category: "Brand Film / AI Campaign",
    overview: "An idea served like a tennis ball: it goes up, enters the screen, comes out the other side as six finished worlds, and lands back at my feet. The Made by RAZ brand film · 26 seconds, no set, no crew.",
    duration: "26 seconds · 9:16",
    clientName: "Made by RAZ (self-produced)",
    role: "Concept, direction, production and edit",
    challenges: [
      { title: "Show, Don't Explain", description: "AI creative can't be sold in copy, and a reel of client work says nothing about who actually made it." },
      { title: "26 Seconds, Muted", description: "It runs vertical and silent in the feed. The first two seconds are the whole opportunity." },
      { title: "Six Unrelated Worlds", description: "A tennis court, a grey cyc, an alley, a product tube, a beauty macro and a typographic set. Without a through-line that is a collage, not a film." },
    ],
    solutions: [
      { title: "One Object Carries The Film", description: "The ball is served, enters the screen, exits into six worlds and rolls back to my sneaker. Every cut is motivated by its movement." },
      { title: "The Head As The Thesis Image", description: "An idea that stayed in your head becomes one shot of my own head resting on the floor beside me. No voiceover explains it." },
      { title: "Past Work As Its Own B-Roll", description: "The worlds are frames from No Address, tutti, Aura and Nova Skin · work already live on the site." },
    ],
    results: ["Self-produced brand film: no set, no crew, no shoot day."],
  },
  {
    slug: "milk-x-cookies",
    title: "Milk x Cookies · E-commerce Build",
    category: "E-commerce",
    overview: "An online store for a streetwear label. A full WordPress and WooCommerce shop with product pages, cart and checkout, designed around the brand rather than around a template. In streetwear the image is half the product, so the store has to look like the label and not like one more online shop.",
    duration: "",
    clientName: "Milk x Cookies",
    role: "Design and development",
    challenges: [
      { title: "A store that looks like the brand, not like a template", description: "In streetwear the image is half the product. Most WordPress stores start from an off-the-shelf theme, and it shows in a second: same header, same grid, same spacing. A label built on style cannot afford a shop that looks like everyone else." },
      { title: "A product page that closes the decision", description: "In fashion the decision comes down to size, photography and shipping terms. A page that buries that below the fold does not only lose the sale, it creates returns." },
      { title: "Day-to-day management without a developer", description: "Collections change, stock runs out, a weekend sale goes up. A store where every change needs a developer stalls exactly when it needs to move." },
      { title: "Most buyers arrive on a phone", description: "Traffic for a fashion label comes from Instagram, which means a phone screen on a mobile network. A store that loads slowly loses the buyer before they have seen a single product." },
    ],
    solutions: [
      { title: "Design driven by the brand, not by a theme", description: "Typography, colour and page rhythm were built around the label's own language and only then implemented as a dedicated template. The result reads as a continuation of the feed rather than a shop bought off the shelf." },
      { title: "A complete product page", description: "Large image gallery, size and colour selector, stock state, and shipping and returns at eye level. Cart and checkout are localised and built for mobile, keeping the path from product to payment short." },
      { title: "WooCommerce as a real admin", description: "Products, categories, stock, coupons and promotions are managed from the dashboard. The owner changes a price or uploads a collection without writing code and without waiting for me." },
      { title: "Built for mobile speed", description: "Images compressed and served at the right size, scripts kept to what the page actually needs, and loading that starts with the content people see first. That is both what Google measures and what a buyer coming from a feed will or will not tolerate." },
    ],
    results: [],
  },
  {
    slug: "ironshield",
    title: "IronShield · Website for a Security Company",
    category: "Cybersecurity",
    overview: "A website for a security company building browser-level protection for organisations. The browser is where most employees actually work, which makes it where most of an organisation's exposure opens up, and the site has to explain a technical product to an audience that knows exactly what it is reading.",
    duration: "",
    clientName: "IronShield",
    role: "Design and development",
    challenges: [
      { title: "Explaining a technical product to a technical audience", description: "The buyer of a security product is a security person. They spot marketing language instantly, and they are looking for what the product actually does, where it sits in the architecture, and what it does not do. A site that speaks in slogans loses them on the first scroll." },
      { title: "A category where every site looks the same", description: "Dark background, blue grid, a padlock. Almost every cyber company uses the same visual language, and when everyone looks alike nobody is remembered. The differentiation had to come from the design, not only from the copy." },
      { title: "Browser-level security is an idea that needs explaining", description: "The browser is where the SaaS, the data and the extensions live, and therefore where most of the exposure opens up. That is not an obvious point of view, and the site has to land it before it sells anything." },
      { title: "A site that is also a sales tool", description: "A deal like this does not close on the website. The site has to produce the meeting: move someone from understanding the problem to requesting a demo, without dragging them through a ten-field form." },
    ],
    solutions: [
      { title: "A structure that moves from problem to product", description: "The page follows the order the reader thinks in: what the exposure is, why existing tools do not cover it, what the product actually does, and how it lands in an organisation. Each section answers the question the previous one opened." },
      { title: "A visual language that leaves the category", description: "Sharp typography, generous space, and colour used for emphasis rather than decoration. Instead of another matrix background, a design that looks like a serious software product, because that is what this buyer respects." },
      { title: "Technical content without the weight", description: "Short explanations pitched at a professional reader, with a hierarchy that supports both scanning and depth. Headlines for those who want headlines, detail for those who keep reading." },
      { title: "One clear path to contact", description: "A single call to action repeated down the page, and a short form. The point of the site is a meeting, not a pile of form fields." },
    ],
    results: [],
  },
  {
    slug: "kiddoz",
    title: "Kiddoz · A Kindergarten Search Platform",
    category: "Search platform",
    overview: "A platform for finding kindergartens. I was not the developer on this one: I was brought in as a consultant, on the design, on the architecture of the platform and on the features themselves, before the build and during it.",
    duration: "",
    clientName: "Kiddoz",
    role: "Consulting on design, architecture and features",
    challenges: [
      { title: "Two audiences that need opposite things", description: "A parent visits once and wants an answer fast. A kindergarten wants to be listed, manage its profile and receive enquiries. A platform that tries to satisfy both on the same screen usually serves neither." },
      { title: "A search that has to feel simple even though it is not", description: "Area, age, type, hours, price. That is five filters before we start, and every filter added both sharpens the result and raises the chance the parent gives up halfway." },
      { title: "The cold-start problem every marketplace has", description: "With no kindergartens there is nothing to show parents, and with no parents the kindergartens have no reason to sign up. That decision is not a design one: it determines what gets built first and what can wait." },
      { title: "Architecture decisions that are expensive to undo", description: "How a kindergarten is represented, how areas are handled, what happens when information changes. Things settled in the first week that charge a heavy price if they are settled wrong." },
    ],
    solutions: [
      { title: "A specification that separates the two journeys", description: "The parent journey and the kindergarten journey were split into two tracks with their own screens, instead of one interface that compromises. Each side sees what is relevant to it and is not asked to understand the other." },
      { title: "A search that opens with a single question", description: "I recommended opening with area alone and showing results immediately, then allowing a narrowing by age, hours and type. A parent gets an answer in one step, and the advanced filters stay for those who want to refine." },
      { title: "Priority order for the features", description: "We went through the feature list and defined what had to be in the first version, what comes after it, and what sounds good but does not move the platform. That saved building things nobody would have used at this stage." },
      { title: "A data model built to grow", description: "How a kindergarten, an area and a category are represented was settled up front so the platform could expand, to more cities and more kinds of settings, without taking the system apart." },
    ],
    results: [],
  },
  {
    slug: "real-estate-website",
    title: "Website for a Real Estate Company",
    category: "Real estate",
    overview: "Design and development of a website for a real estate company. A company and projects site that has to do two things at once: signal the stability of a firm people buy a multi-million-shekel asset from, and produce real enquiries from the project pages.",
    duration: "",
    clientName: "",
    role: "Design and development",
    challenges: [
      { title: "Trust before anything else", description: "Nobody decides on a property deal from a website, but a great many people rule a company out because of one. A site that looks cheap takes the company off the list before anyone has picked up a phone." },
      { title: "A project is not a content page", description: "Every project has a location, a sales stage, an apartment mix, floor plans, renders and surroundings. All of it has to appear in the order a buyer thinks about it, not the order it was convenient to upload." },
      { title: "Status that keeps changing", description: "Projects move from coming soon to selling to occupied. A site where each of those changes needs a developer stays out of date, and an out-of-date real estate site produces exactly the distrust it is meant to prevent." },
      { title: "The enquiry is the product", description: "A project page with no easy way to leave details is a brochure. The form has to stay present down the page without getting in the way of the renders." },
    ],
    solutions: [
      { title: "Design that leans on the material itself", description: "Renders and photography at scale, restrained typography and plenty of space. In real estate the design should not compete with the asset, it should make room for it." },
      { title: "One consistent template for a project page", description: "A fixed structure for every project: location and surroundings, apartment mix, render gallery, floor plans and a form, so a new project enters the site at the same quality with no fresh design work." },
      { title: "Full project management from the admin", description: "Adding a project, changing its status, updating the mix and uploading renders all happen in the system. The company updates the site at the speed reality changes." },
      { title: "An enquiry form that stays within reach", description: "A short form alongside the project page, with a direct WhatsApp route on mobile. Someone interested should not have to hunt for how to get in touch." },
    ],
    results: [],
  },
]

/**
 * The project title lives in Supabase in Hebrew only, so the English pages
 * printed a Hebrew <h1> and <title>. Falls back to the stored title, which is
 * already English for the concept projects.
 */
export function translateProjectTitle(slug: string, fallback: string): string {
  return getProjectTranslation(slug)?.title ?? fallback
}

export function getProjectTranslation(slug: string) {
  return projectTranslations.find((p) => p.slug === slug)
}
