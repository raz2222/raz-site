export type SubServiceEn = {
  slug: string
  hubSlug: "web-design" | "ai-content"
  title: string
  tagline: string
  heroVideo: string
  explanation: string
  whoFor: string[]
  problem: string
  benefits: string[]
  process: { title: string; text: string }[]
  deliverables: string[]
  useCases: string[]
  faq: { q: string; a: string }[]
  relatedSlugs: string[]
  relatedGuideSlug: string | null
}

export type ServiceHubEn = {
  slug: "web-design" | "ai-content"
  title: string
  tagline: string
  heroDescription: string
  ctaLabel: string
}

export const SERVICE_HUBS_EN: ServiceHubEn[] = [
  {
    slug: "ai-content",
    title: "AI Content Creation",
    tagline: "Cinema-grade ads, without a shoot day.",
    heroDescription:
      "Product videos, ads, visuals, and content for social media.\n\nI use AI to make things that used to require a much bigger production, but AI is just the tool. The idea, the concept, the direction, and the editing are what make the difference.",
    ctaLabel: "Start a visual project",
  },
  {
    slug: "web-design",
    title: "Web Design",
    tagline: "A site that looks like your business — not like a template.",
    heroDescription:
      "I design and build websites for businesses and brands, from WordPress and e-commerce to interactive sites and AI-built sites.\n\nI've already built over 200 websites, so to me a good website isn't just good-looking design. It has to be fast, clear, easy to use, and keep working properly after it goes live.",
    ctaLabel: "Start a website project",
  },
]

export const SUB_SERVICES_EN: SubServiceEn[] = [
  // ---------- AI Content ----------
  {
    slug: "product-videos",
    hubSlug: "ai-content",
    title: "Product Videos",
    tagline: "Product footage in motion, from every angle, studio quality — without a studio shoot.",
    heroVideo: "/videos/raz-showreel-5.mp4",
    explanation:
      "A complete product video — angles, motion, detail — produced with AI from your existing product photos. The result can look like a professional production, without booking a studio shoot.",
    whoFor: [
      "Brands who want to show a product in motion, not just a static photo",
      "Online stores that want video content for product pages",
      "Businesses with an existing product photo archive who want to turn it into video",
    ],
    problem:
      "Professional studio product photography is expensive and takes time to schedule. AI production gets a similar-quality result from photos you already have, at a fraction of the cost and time.",
    benefits: [
      "Quality video content without a shoot day",
      "Multiple angles and versions from the same product",
      "Significantly lower cost and turnaround than traditional production",
    ],
    process: [
      { title: "Base Images", text: "Quality product photos as the starting point." },
      { title: "Motion Concept", text: "Which angles and movements show the product best." },
      { title: "Production", text: "Generating the actual video with AI tools." },
      { title: "Editing", text: "Color, pacing, and sound for the final result." },
    ],
    deliverables: [
      "A finished product video, in the right format for the platform",
      "Multiple angles/versions if needed",
      "Full professional editing",
    ],
    useCases: ["A product page in an online store", "A short ad for social media", "Content for a new product launch"],
    faq: [
      { q: "Do you need the physical product?", a: "No — quality photos of the product are enough as a starting point." },
      { q: "How long does it take?", a: "Usually a few days, depending on complexity and number of versions." },
    ],
    relatedSlugs: ["campaign-visuals", "ai-photography"],
    relatedGuideSlug: null,
  },
  {
    slug: "campaign-visuals",
    hubSlug: "ai-content",
    title: "Campaign Visuals",
    tagline: "Multiple visual variations for a campaign, without coordinating a new shoot for each one.",
    heroVideo: "/videos/raz-showreel-2.mp4",
    explanation:
      "Building a consistent visual set for a full campaign — images and short videos that share one visual language, adapted for multiple platforms and formats.",
    whoFor: [
      "Brands running a multi-platform ad campaign",
      "Businesses who want to test several message directions before committing to a full production",
      "Marketing teams that need visual assets at a fast pace",
    ],
    problem:
      "Traditional campaign production needs a separate shoot day for every variation. AI lets you produce a whole set of consistent visuals in parallel, at a significantly lower cost.",
    benefits: [
      "One consistent visual language across the whole campaign",
      "Multiple variations for A/B testing",
      "Fast adaptation to different formats (story, feed, ad)",
    ],
    process: [
      { title: "Campaign Brief", text: "Message, audience, and target platforms." },
      { title: "Visual Direction", text: "Building one consistent language for the whole campaign." },
      { title: "Producing the Set", text: "Creating every required asset in parallel." },
      { title: "Platform Adaptation", text: "Cropping and editing for every required format." },
    ],
    deliverables: ["A consistent set of visual assets", "Versions adapted for each platform", "Files ready to publish"],
    useCases: ["A multi-platform product launch campaign", "A seasonal campaign with several message variations", "A/B testing between creative directions"],
    faq: [
      { q: "How many variations can you produce?", a: "AI allows producing a meaningful number of versions quickly — set by the specific campaign's needs." },
      { q: "Does this work for a brand with an existing visual language?", a: "Yes, the existing direction is used as the base for the new language, not a blank slate." },
    ],
    relatedSlugs: ["product-videos", "concept-development"],
    relatedGuideSlug: "how-many-campaign-variations",
  },
  {
    slug: "social-content",
    hubSlug: "ai-content",
    title: "Social Content",
    tagline: "An ongoing content pipeline, not a one-off project.",
    heroVideo: "/videos/raz-showreel-4.mp4",
    explanation:
      "Ongoing visual content production for social media — short videos, creatives, and UGC-style content — at a pace that matches real publishing needs, not traditional video-production pace.",
    whoFor: [
      "Businesses that need a steady stream of social content at a fast pace",
      "Brands who want a mix of polished ad content and more natural content",
      "Marketing teams who want to reduce production load without sacrificing quality",
    ],
    problem:
      "Consistent social posting needs a volume of content traditional production can't supply at the required pace. AI keeps the publishing rate high without hurting quality.",
    benefits: ["A higher publishing rate", "A mix of content styles (ad-like, UGC, editorial)", "Significantly lower cost relative to content volume"],
    process: [
      { title: "Content Planning", text: "Building a monthly content calendar around publishing needs." },
      { title: "Production", text: "Creating the content with dedicated AI tools." },
      { title: "Editing", text: "Adapting to each platform's format and style." },
      { title: "Delivery", text: "Files ready to publish at the agreed pace." },
    ],
    deliverables: ["An ongoing monthly content package", "A mix of formats (story, reel, feed)", "Visual consistency across all content"],
    useCases: ["A fixed monthly content package for a business", "UGC-style content to build trust", "Seasonal or event-based content"],
    faq: [
      { q: "Are there monthly content packages?", a: "Yes, a fixed monthly volume can be agreed on — more efficient than one-off projects." },
      { q: "How much content can you produce per month?", a: "Depends on the agreed scope, but AI allows a significantly higher publishing pace than traditional production." },
    ],
    relatedSlugs: ["ai-photography", "campaign-visuals"],
    relatedGuideSlug: null,
  },
  {
    slug: "ai-photography",
    hubSlug: "ai-content",
    title: "AI Photography",
    tagline: "Professional product and brand photography without a studio shoot.",
    heroVideo: "/videos/raz-showreel.mp4",
    explanation:
      "Creating professional-grade product and brand images with AI — changing backgrounds, virtual lighting, extra angles — from photos you already have, without booking a re-shoot.",
    whoFor: [
      "Businesses that need product photos in several backgrounds or contexts",
      "Brands who want to refresh existing photos without a new shoot",
      "Stores that need consistent images across a full catalog",
    ],
    problem:
      "A studio shoot for every background or context variation is expensive and slow. AI generates multiple variations from one quality base photo.",
    benefits: ["Many variations from a single base photo", "Significantly lower cost than a re-shoot", "Visual consistency across a full catalog"],
    process: [
      { title: "Base Images", text: "Choosing quality product photos as the starting point." },
      { title: "Defining Variations", text: "Which backgrounds, angles, and contexts are needed." },
      { title: "Production", text: "Generating the actual images." },
      { title: "Quality Control", text: "Making sure every image is consistent and clean." },
    ],
    deliverables: ["A finished set of product images", "Background/angle variations as needed", "High-quality files ready to use"],
    useCases: ["Refreshing an existing product catalog", "Images for a seasonal campaign", "Brand images for the site and social"],
    faq: [
      { q: "Can you change the background on an existing photo?", a: "Yes, that's one of the most common uses — same product, new background." },
      { q: "Do you need a professional photo as the base?", a: "A clear, quality photo improves the result significantly, but it doesn't need to be a full studio production." },
    ],
    relatedSlugs: ["product-videos", "social-content"],
    relatedGuideSlug: "ai-product-photos-without-a-studio",
  },
  {
    slug: "creative-direction",
    hubSlug: "ai-content",
    title: "Creative Direction",
    tagline: "The direction that turns an AI experiment into content that looks like a real campaign.",
    heroVideo: "/videos/raz-showreel-7.mp4",
    explanation:
      "Creative direction is the layer above the tools — decisions about tone, pacing, visual consistency, and story. It's what determines whether the final content looks polished or like an AI experiment.",
    whoFor: [
      "Brands who want AI content that feels like a real production, not an experiment",
      "Businesses with several content assets that need one consistent voice",
      "Projects that need design decisions beyond the technical production",
    ],
    problem:
      "AI tools produce content — but without creative direction, the result feels disconnected and inconsistent. Direction is what ties individual scenes into one complete experience.",
    benefits: ["Consistent tone and feel across all content", "Visual decisions based on experience, not guesswork", "A result that feels like a real production"],
    process: [
      { title: "Defining Tone", text: "What feeling the content needs to carry." },
      { title: "Building a Visual World", text: "Color, lighting, pace — the language that repeats across every asset." },
      { title: "Guiding Production", text: "Real-time decisions on every scene." },
      { title: "Final Edit", text: "Making sure the final result is true to the direction that was set." },
    ],
    deliverables: ["A defined creative direction, documented", "Guidance through every production stage", "A consistent result across all content assets"],
    useCases: ["A campaign with several content assets that need one voice", "A new brand that needs to define its AI visual identity", "A complex project with several media types"],
    faq: [{ q: "Is this a separate service from the content production itself?", a: "Usually it's an integral part of every project, not a separate add-on — it's the layer that makes sure the result is good." }],
    relatedSlugs: ["concept-development", "campaign-visuals"],
    relatedGuideSlug: null,
  },
  {
    slug: "concept-development",
    hubSlug: "ai-content",
    title: "Concept Development",
    tagline: "Before producing anything — nailing down the idea that will actually work.",
    heroVideo: "/videos/raz-showreel-2.mp4",
    explanation:
      "Concept development is the creative definition stage — turning a general idea (\"a video for the business\") into a concrete message, story, and short script before touching any production tool. This stage determines whether the final content will work.",
    whoFor: [
      "Businesses with a general idea that needs to become a defined concept",
      "Brands who want to test several concept directions before production",
      "Projects that need creative thinking before technical execution",
    ],
    problem:
      "Jumping straight from a general idea to production leads to weak content. Early concept development avoids wasting production on an idea that wasn't clear enough.",
    benefits: ["Clarity before investing in production", "The ability to test several directions quickly", "A final result with a clear story, not just nice pictures"],
    process: [
      { title: "Open Brief", text: "What the business wants to communicate, to whom, and why." },
      { title: "Concept Directions", text: "Building 2-3 different concept directions." },
      { title: "Selection & Refinement", text: "Choosing the strongest direction and developing it into a short script." },
      { title: "Handoff to Production", text: "A smooth transition from the idea stage to execution." },
    ],
    deliverables: ["A concept document or short script", "A defined visual direction", "A clear base for actual production"],
    useCases: ["An initial video idea that needs to become something clear", "Testing several campaign directions before choosing", "A standalone concept project to demonstrate capability"],
    faq: [
      { q: "Is this a separate paid stage?", a: "Usually it's part of a project's overall process, not a separate service — unless it's concept consulting only." },
      { q: "Can I get a concept without production afterward?", a: "Yes, you can hire just the concept-development stage if that's what you need." },
    ],
    relatedSlugs: ["creative-direction", "social-content"],
    relatedGuideSlug: null,
  },
  // ---------- Web Design ----------
  {
    slug: "site-design",
    hubSlug: "web-design",
    title: "Site Design",
    tagline: "Design that doesn't look like a template — a visual identity a competitor can't just copy without it looking off.",
    heroVideo: "/videos/raz-showreel-7.mp4",
    explanation:
      "Website design, for me, isn't picking a template and dropping in content — it's a process that starts by asking what actually makes your brand different, then builds a visual language (tone, typography, motion, spacing) that carries through every page consistently.",
    whoFor: [
      "Businesses whose current site looks generic, or like every other competitor",
      "Brands with a strong identity who want the site to reflect it, not contradict it",
      "Companies starting a new site who want design built around them, not around a template",
    ],
    problem:
      "Most sites are built from a ready-made template with the colors and logo swapped — the result looks professional but isn't memorable. A visitor doesn't remember a site that looks like dozens of others.",
    benefits: [
      "A consistent visual identity that sets the brand apart",
      "A user experience built around how people actually browse, not a template's structure",
      "Design that translates properly between desktop and mobile, not just \"shrinks\"",
    ],
    process: [
      { title: "Research & Discovery", text: "Understanding the brand, the audience, and competitors — what already exists and what's missing." },
      { title: "Design Directions", text: "Building 2-3 different design directions to test, not one direction for approval." },
      { title: "Full Design", text: "Developing the chosen direction across every page of the site, fully consistent." },
      { title: "Handoff to Build", text: "A smooth transition from design into actual construction." },
    ],
    deliverables: ["A complete design system — colors, typography, components", "Design for every page of the site, desktop and mobile", "Organized source files"],
    useCases: ["Rebranding an existing site that no longer represents the business", "Designing a new site for a brand with a clear visual identity", "Adapting an existing identity (print/social) to a digital language"],
    faq: [
      { q: "How long does a full site design take?", a: "On average 2-4 weeks, depending on page scope and rounds of feedback." },
      { q: "Do you use ready-made templates?", a: "Not as a starting point. Templates are used at most as technical inspiration, never as the final design." },
      { q: "Can I see a few directions before choosing?", a: "Yes, that's a standard part of the process — 2-3 directions before going deeper." },
      { q: "Will the design work on mobile too?", a: "Yes, every page is planned for desktop and mobile in parallel, not just checked at the end." },
    ],
    relatedSlugs: ["interactive-websites", "creative-development"],
    relatedGuideSlug: "memorable-website-design-2026",
  },
  {
    slug: "creative-development",
    hubSlug: "web-design",
    title: "Creative Development",
    tagline: "For when the site needs to do something no plugin will do for you.",
    heroVideo: "/videos/raz-showreel-5.mp4",
    explanation:
      "Creative development means writing dedicated code to build experiences that don't exist as a template — custom animations, transitions between states, interactions that respond to scroll or cursor movement, everything that turns a site from \"good\" into \"memorable.\"",
    whoFor: [
      "Brands who want a distinctive browsing experience, not just static pages",
      "Projects with a visual concept that requires custom code to work right",
      "Businesses who already tried a \"template with animations\" and it felt generic",
    ],
    problem:
      "Ready-made animation plugins give a uniform result that looks like every other site using the same plugin. A truly distinctive experience needs code written around the specific concept, not a generic tool's configuration.",
    benefits: [
      "Motion and interaction that serves the message, not just decorates it",
      "High performance because the code is written for exactly what's needed, not dragged down by a general-purpose library",
      "An experience that sets the brand apart from competitors",
    ],
    process: [
      { title: "Concept", text: "What the motion is meant to communicate, and where it serves the message." },
      { title: "Prototype", text: "Building an early version to test the actual feel, not just describe it." },
      { title: "Full Build", text: "Final construction with a focus on performance on every device." },
      { title: "Fine-Tuning", text: "Adjusting pace, timing, and feel until it's right." },
    ],
    deliverables: ["Custom interactive components", "High-performance animations (GSAP / custom CSS)", "Clean code that keeps working after handoff"],
    useCases: ["A brand site with a \"wow\" entrance moment that represents the brand", "A product page with an interaction that demonstrates use", "A cinematic scroll experience for a portfolio project"],
    faq: [
      { q: "Doesn't this hurt site speed?", a: "Not if it's built right. The code is written and tested for performance, not just visual effect." },
      { q: "Can this be added to an existing site?", a: "Yes, absolutely — targeted creative development can be added into a site that already exists." },
      { q: "Are there examples to see?", a: "Yes, the work page has several projects with full creative development." },
    ],
    relatedSlugs: ["site-design", "custom-development"],
    relatedGuideSlug: null,
  },
  {
    slug: "interactive-websites",
    hubSlug: "web-design",
    title: "Interactive Websites",
    tagline: "A site visitors play with, not just scroll through.",
    heroVideo: "/videos/raz-showreel.mp4",
    explanation:
      "An interactive site responds to the user — it doesn't just display information. That can be a calculator, a selection tool, a visualization that changes based on input, or any component that turns passive browsing into active engagement.",
    whoFor: [
      "Businesses whose process (a quote, personalization) can become an interactive tool",
      "Brands who want visitors to \"discover\" things about the product, not just read about them",
      "Projects in a field where engagement equals conversion",
    ],
    problem:
      "A static site delivers information, but doesn't create engagement. When a visitor just scrolls and reads, they remember less and get less interested than when they're active in the process.",
    benefits: [
      "Longer time spent on the site",
      "An experience that makes the visitor remember the brand",
      "The ability to collect relevant information about the visitor's need through the interaction itself",
    ],
    process: [
      { title: "Defining the Mechanic", text: "Exactly what the visitor does, and what they get in return." },
      { title: "Flow Design", text: "Building a clear path from the start to the end of the interaction." },
      { title: "Development", text: "Building the actual logic, with a focus on immediate responsiveness." },
      { title: "Testing", text: "Making sure the interaction is clear and not confusing, on every device." },
    ],
    deliverables: ["A functional, complete interactive component", "Logic built exactly for the business need", "Design that fits the flow, not just \"decorated\""],
    useCases: ["A dynamic quote calculator", "A product personalization tool", "An interactive map or data visualization"],
    faq: [
      { q: "Is this more expensive than a regular site?", a: "Depends on the logic's complexity — a relatively simple one (a basic calculator) isn't much different from a regular page's price." },
      { q: "Does it need special maintenance?", a: "If the logic is stable, no. If it depends on changing data, it's worth planning content updates in advance." },
    ],
    relatedSlugs: ["creative-development", "ai-functionality"],
    relatedGuideSlug: null,
  },
  {
    slug: "ecommerce",
    hubSlug: "web-design",
    title: "E-commerce",
    tagline: "A store that sells on its own, not just displays products.",
    heroVideo: "/videos/raz-showreel-4.mp4",
    explanation:
      "Building a complete online store — product catalog, shopping cart, checkout, inventory and shipping management. Whether on WordPress/WooCommerce or fully custom-built, the goal is the same: a smooth purchase flow that doesn't lose customers halfway through.",
    whoFor: [
      "Businesses selling physical or digital products at a fixed quantity and price",
      "Brands moving from selling on social media to an independent store",
      "Existing stores that want to upgrade their platform or purchase experience",
    ],
    problem:
      "A store built quickly without thinking through the purchase flow loses customers at exactly the critical moment — between adding to cart and actually paying. Every unnecessary step in the process lowers the conversion rate.",
    benefits: [
      "A fast, clear purchase flow that converts better",
      "Product and inventory management that doesn't need ongoing technical help",
      "Proper integration with an Israeli payment provider",
    ],
    process: [
      { title: "Mapping the Catalog", text: "How many products, categories, and how inventory is managed." },
      { title: "Choosing a Platform", text: "WooCommerce or a custom build — based on scope and need." },
      { title: "Build", text: "Catalog, cart, checkout, shipping — all connected and tested." },
      { title: "Full Purchase Test", text: "Going through the entire flow like a real customer before launch." },
    ],
    deliverables: ["A live store with catalog, cart, and checkout", "Integration with an Israeli payment provider", "Independent inventory management"],
    useCases: ["Moving from selling on Instagram to an independent store", "A new store for a DTC brand", "Upgrading a slow or outdated store"],
    faq: [
      { q: "WooCommerce or a custom build?", a: "WooCommerce fits most cases and gives management flexibility. Custom development is relevant when you need performance or logic no plugin provides." },
      { q: "How many products can you manage?", a: "From a few dozen up to large catalogs, with proper planning in advance." },
      { q: "Which payment providers are supported?", a: "Most common Israeli payment providers, through the right integrations." },
    ],
    relatedSlugs: ["wordpress-development", "landing-pages"],
    relatedGuideSlug: "woocommerce-store-checklist",
  },
  {
    slug: "landing-pages",
    hubSlug: "web-design",
    title: "Landing Pages",
    tagline: "One page, one message, one call to action — built to sell.",
    heroVideo: "/videos/raz-showreel-2.mp4",
    explanation:
      "A focused landing page for a specific campaign — not a full site, but a single page where every element is built around one goal: getting the visitor to act. Fast to build, easy to test, and precise on conversion.",
    whoFor: [
      "Businesses running a focused ad campaign",
      "A new product or service launch that needs a dedicated page",
      "Lead collection for a time-limited marketing activity",
    ],
    problem:
      "Sending campaign traffic to a general homepage scatters attention and lowers conversion — the visitor has to find what's relevant on their own. A focused landing page does exactly the opposite.",
    benefits: ["One clear message, no distractions", "A short build time (days, not weeks)", "Easy to test several versions (A/B) and measure what works"],
    process: [
      { title: "Campaign Brief", text: "What the goal is, who the audience is, and where the traffic comes from." },
      { title: "Structure & Message", text: "Building an information hierarchy that leads to one action." },
      { title: "Build", text: "Designing and building the page, including form/tracking." },
      { title: "Launch & Tracking", text: "Going live and connecting measurement to real results." },
    ],
    deliverables: ["A live, fast landing page, built for mobile", "A connected lead-collection form", "Basic conversion tracking"],
    useCases: ["A social media ad campaign", "A new product or service launch", "Collecting signups for an event or webinar"],
    faq: [
      { q: "How long does it take to build a landing page?", a: "Usually 2-4 business days from a closed brief." },
      { q: "Can I test several versions?", a: "Yes — that's exactly one of the advantages of a focused landing page, easy to produce variations and test." },
      { q: "How much does it cost?", a: "There's a detailed pricing guide on the site — a landing page is usually the cheapest, fastest project." },
    ],
    relatedSlugs: ["ai-functionality", "ecommerce"],
    relatedGuideSlug: "landing-page-in-two-days",
  },
  {
    slug: "wordpress-development",
    hubSlug: "web-design",
    title: "WordPress Development",
    tagline: "When content-management flexibility is the requirement — the most proven platform in the world, done right.",
    heroVideo: "/videos/raz-showreel-5.mp4",
    explanation:
      "Professional, custom WordPress sites — built with Elementor Pro, a minimal and well-maintained plugin structure, and custom code (PHP/ACF/CPT) where needed for functionality no plugin covers.",
    whoFor: [
      "Businesses who need an in-house team (not a developer) to edit content themselves",
      "Stores that need WooCommerce",
      "Owners of an old WordPress site that's slow or hard to maintain",
    ],
    problem:
      "Many WordPress sites are built with dozens of unmaintained plugins, which makes them slow and insecure. A properly built WordPress site is a stable, flexible platform for years.",
    benefits: ["Full independent control over content", "A huge ecosystem of reliable plugins", "Stability and performance when built without unnecessary plugin bloat"],
    process: [
      { title: "Brief & Scope", text: "Which pages, features, and level of content independence are needed." },
      { title: "Choosing the Stack", text: "Which plugins are actually necessary and which aren't." },
      { title: "Build", text: "Design and build with Elementor, including custom code where needed." },
      { title: "Handoff & Training", text: "A short training session for independent management." },
    ],
    deliverables: ["A fast, clean WordPress site", "A minimal, maintained plugin structure", "Content-management training"],
    useCases: ["A brand site with ongoing content updates", "A WooCommerce store", "Upgrading an old, slow WordPress site"],
    faq: [
      { q: "Why WordPress instead of a custom build?", a: "When you need ongoing content independence without depending on a developer — WordPress is the right choice." },
      { q: "What about Elementor Pro?", a: "Included when the project needs a Theme Builder, advanced forms, or consistent templates across the site." },
      { q: "Can you upgrade an existing WordPress site?", a: "Yes, that's a large part of the work — upgrading without rebuilding from scratch." },
    ],
    relatedSlugs: ["ecommerce", "custom-development"],
    relatedGuideSlug: "why-is-my-website-slow",
  },
  {
    slug: "custom-development",
    hubSlug: "web-design",
    title: "Custom Development",
    tagline: "When performance and interactivity are the requirement — not a template, code built exactly for you.",
    heroVideo: "/videos/raz-showreel.mp4",
    explanation:
      "Building a site from scratch in real code (React / TypeScript), using AI as a workflow — not as a replacement for professional judgment. Right when you need performance, flexibility, or an experience that doesn't exist in any template.",
    whoFor: [
      "Businesses who want a modern, fast site without waiting months",
      "Startups who need an MVP within days",
      "Anyone who wants features and interactions that don't exist in a ready-made template",
    ],
    problem:
      "Building a custom site the traditional way takes weeks to months because every line of code is written by hand. AI shortens the writing time without hurting quality, when it's kept under professional control.",
    benefits: ["A live site in real code, not a closed website builder", "High performance and fast load times", "Code you can keep developing in the future"],
    process: [
      { title: "Brief & Scope", text: "Understanding the business need in depth." },
      { title: "Design Concept", text: "Building design directions and testing them fast." },
      { title: "Development", text: "Writing code with AI under full professional control." },
      { title: "Launch", text: "Testing, content, and going live." },
    ],
    deliverables: ["A site in real React/TypeScript code", "Fully custom design", "Measured performance, not just promised"],
    useCases: ["A site with complex interactivity", "A fast MVP for a startup", "Moving from an old WordPress site to a modern stack"],
    faq: [
      { q: "Is this more expensive than WordPress?", a: "Depends on scope — simple projects are similarly priced, more complex ones cost more based on the flexibility needed." },
      { q: "What is \"vibe coding\"?", a: "Working with AI tools that write code from a natural-language description, under a developer's review and control throughout the process." },
      { q: "Can this be developed further later?", a: "Yes — it's regular code any developer can keep working on, not a closed proprietary platform." },
    ],
    relatedSlugs: ["creative-development", "ai-functionality"],
    relatedGuideSlug: "what-is-vibe-coding",
  },
  {
    slug: "ai-functionality",
    hubSlug: "web-design",
    title: "AI-Powered Functionality",
    tagline: "Real AI capabilities inside the site — not a buzzword, a feature that actually works.",
    heroVideo: "/videos/raz-showreel-2.mp4",
    explanation:
      "Adding functional AI capabilities to the site itself — a support chatbot, smart search, dynamic content generation, personalized recommendations — integrated into the site experience, not a disconnected widget.",
    whoFor: [
      "Businesses who want automated first-line customer support",
      "Stores who want personalized product recommendations",
      "Content sites that need smart search or dynamic content generation",
    ],
    problem:
      "Most sites \"add AI\" as a floating widget that doesn't really help. Good AI functionality is woven into the site's natural flow and solves a real problem, not just adds a marketing sticker.",
    benefits: [
      "A smarter user experience without extra manual work",
      "First-line response to customers even outside business hours",
      "Content and information that adapts itself to the visitor's specific need",
    ],
    process: [
      { title: "Defining the Need", text: "Exactly what business problem the AI is meant to solve." },
      { title: "Choosing the Approach", text: "Chatbot, search, recommendations — the right tool for the need." },
      { title: "Integration", text: "Connecting and writing the logic inside the site itself." },
      { title: "Testing & Tuning", text: "Making sure the results are relevant and accurate." },
    ],
    deliverables: ["A functional AI feature integrated into the site", "Expected running cost estimated up front", "Documentation of how it works"],
    useCases: ["A first-line support chatbot on the site", "Smart search across a product catalog", "Automatic product description generation"],
    faq: [
      { q: "Is it expensive to run?", a: "The API cost for most uses is relatively low for a mid-sized business — checked and priced in advance." },
      { q: "Can this be added to an existing site?", a: "Yes, absolutely — AI features can be integrated into a site that already exists without rebuilding it." },
    ],
    relatedSlugs: ["custom-development", "interactive-websites"],
    relatedGuideSlug: null,
  },
]

export function findSubServiceEn(hubSlug?: string, subSlug?: string) {
  return SUB_SERVICES_EN.find((s) => s.hubSlug === hubSlug && s.slug === subSlug) ?? null
}

export function findServiceHubEn(hubSlug?: string) {
  return SERVICE_HUBS_EN.find((h) => h.slug === hubSlug) ?? null
}
