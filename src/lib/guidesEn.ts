import { contentGuides, contentGuideToEn } from "./contentGuides"

export type GuideSectionEn = { heading: string; paragraphs: string[]; image?: string }

export type GuideFaqEn = { q: string; a: string }

export type GuideEn = {
  slug: string
  title: string
  // The <title> Google shows, when it should lead with the search query rather
  // than read like the headline. Mirrors `guides.meta_title` on the Hebrew side;
  // absent falls back to `${title} · RAZ`.
  metaTitle?: string
  excerpt: string
  category: string
  readTime: string
  datePublished: string
  heroVideo?: string
  image: string
  heroImage?: string
  faq?: GuideFaqEn[]
  kind?: "article" | "tutorial"
  relatedServiceSlug?: string
  sections: GuideSectionEn[]
}

// A guide is published when its date arrives, never before. Three separate
// places used to re-derive that from `datePublished` on their own (the article
// page, the index, and nothing at all in the prerender/meta path), so a guide
// dated in the future was hidden in the browser while still being prerendered
// into static HTML and served to crawlers with full article metadata. Every
// caller goes through this one function now, so there is a single definition of
// "published" to get wrong.
export function publishedGuidesEn(today = new Date().toISOString().slice(0, 10)) {
  return guidesEn.filter((g) => g.datePublished <= today)
}

const handwrittenGuidesEn: GuideEn[] = [
  {
    slug: "website-cost-guide-2026",
    title: "How Much Does It Cost to Build a Website for a Small Business in 2026 · A Real Pricing Guide",
    excerpt: "Price ranges, what actually drives them, and how to tell if a quote you received makes sense: no vague numbers.",
    category: "Websites & Development",
    image: "/images/guides/cover-web-dev.png",
    readTime: "4 min read",
    datePublished: "2026-08-19",
    heroVideo: "/videos/raz-showreel-7.mp4",
    heroImage: "/images/guides/kama-ole-livnot-atar.jpg",
    relatedServiceSlug: "web-design",
    sections: [
      {
        heading: "Why there's no single number",
        paragraphs: [
          "Every time someone asks me, \"How much does a website cost?\" the honest answer is: it depends. Not because I'm dodging the question, but because \"website\" is a term that covers dozens of completely different scenarios: a single landing page for a campaign, a multi-page brochure site, an e-commerce store with inventory management, or a custom system with its own business logic. The price changes accordingly.",
          "That said, I can give realistic ranges, so you'll know whether a quote you received makes sense or not.",
        ],
      },
      {
        heading: "Standard price ranges in the Israeli market",
        paragraphs: [
          "A single landing page: usually starts around ₪3,000 (~$800). Good for a focused campaign, not for a full digital presence.",
          "A basic brochure site, 5-7 pages, without custom development: ranges between ₪2,500 and ₪5,000 for simple projects, and up to ₪8,000-12,000 when you add a blog, smart forms, and SEO built in from the ground up.",
          "An online store (e-commerce): usually starts around ₪15,000 and goes up from there, depending on the number of products and the integrations needed for payments and logistics.",
          "A site with custom development (React / dedicated code, not a template): here the range is genuinely wide, because there's no ceiling on the performance and interactivity you can build. Projects like this can run anywhere from several tens of thousands of shekels and up, depending on scope.",
          "There's also a monthly subscription model (roughly ₪300-1,200 a month) that bundles building, hosting, and maintenance into one package, convenient for businesses that don't want one big upfront payment, but it's worth calculating the cumulative cost over 2-3 years and comparing it to a one-time payment.",
        ],
      },
      {
        heading: "What actually drives the price",
        paragraphs: [
          "The number of pages and the complexity of each page is the most obvious variable, but not the only one. The questions that really determine price: Do you need dynamic content that updates (like a product catalog, a blog, a project gallery)? Are there third-party integrations (CRM, a payment system, a lead management system)? Is the design a customized template or a unique design concept built from scratch? And is the end product WordPress (faster to build, a huge ecosystem of plugins) or custom development (more flexibility and performance, but also more development time)?",
          "One component people often forget to price: briefing and content time. A website isn't built from code alone: it needs images, copy, and sometimes video. A project where the client arrives with ready materials is cheaper and faster than one where everything has to be produced from scratch.",
        ],
      },
      {
        heading: "Where AI changes the equation",
        paragraphs: [
          "AI tools don't make a complex site cheap, but they do significantly cut development time in certain parts: writing code, generating initial content, and even producing images and video instead of expensive commercial photography. In practice this means: the same finish quality, in less time, and sometimes at a lower cost, not because quality dropped, but because some of the manual work has been replaced by smarter tools under professional supervision.",
          "It's important to distinguish: a site built \"with AI\" as a workflow is completely different from a site built by a fully automated website builder with no human touch. The first can reach a high professional standard. The second is limited in flexibility, performance, and support for large, complex sites.",
        ],
      },
      {
        heading: "How to tell if a quote is reasonable",
        paragraphs: [
          "Ask for a breakdown: how many pages, what's included in maintenance, and what changes cost after delivery. A vague quote (\"website build: ₪5,000\") is a small red flag. A good quote spells out exactly what's included, what isn't, and what happens after launch.",
        ],
      },
      {
        heading: "Common mistakes when choosing a vendor",
        paragraphs: [
          "The most common one: choosing based on the lowest price without checking exactly what's included. A ₪2,000 gap between two quotes usually reflects a real difference in scope of work, not \"the same thing for less money.\"",
          "Second mistake: not checking previous work examples that are actually relevant to your field. A beautiful site for a fashion brand doesn't prove the ability to build a complex booking system.",
          "Third mistake: not asking upfront who owns the code and content once the project ends. In some cases (mainly on closed platforms) the client effectively can't switch to another vendor without rebuilding everything from scratch.",
        ],
      },
      {
        heading: "What happens after launch",
        paragraphs: [
          "A launched site isn't a finished site: it's a site that's starting to live. Within a month or two, small needs almost always come up: fixing text, adding a page, changing an image.",
          "It's worth knowing in advance how this is priced: some vendors give a free support hour in the first month, and some charge for every change from day one. It's a small detail that significantly affects the real cost over the first year.",
        ],
      },
      {
        heading: "What is usually not included, and what it adds",
        paragraphs: [
          "Domain and hosting are a separate annual cost. A co.il domain runs roughly 60 to 120 shekels a year, and decent business hosting runs 300 to 1,500 a year depending on load and server quality. Small numbers, but they surprise anyone who assumed the one-off payment covered everything. Also make sure the domain is registered in your name and not the vendor's, because that is what decides how easily you can leave in two years.",
          "Marketing copy is the big line item people forget. A vendor who writes your text charges separately for it, and reasonably so, because it is different work from building. If the content is on you, price your own time: a six-page brochure site is about two days of writing for someone who does not do it daily.",
          "And photography. If you have no product or team shots, they have to be produced. I covered when you can skip a studio in the [guide on product photos without a shoot](/en/guides/ai-product-photos-without-a-studio).",
        ],
      },
      {
        heading: "How long it takes, and what actually causes delays",
        paragraphs: [
          "A landing page is a few days. A standard brochure site is two weeks to a month. An online store is one to three months, mostly because of product entry and the payment and shipping integrations.",
          "What holds projects up is almost never the development, it is waiting on content from the client and approval rounds. A project with a single approver runs roughly twice as fast as one where three partners have to agree, even when the site is identical.",
          "If you have a real deadline, like a product launch or a trade show, say so in the first conversation. It changes the order of work, and sometimes the price.",
        ],
      },
    ],
  },
  {
    slug: "ai-website-maintenance",
    title: "AI-Powered Website Maintenance · How It Actually Works",
    excerpt: "Not just another buzzword. What AI actually does in website maintenance, where it helps, and where you still need a human.",
    category: "Websites & Development",
    image: "/images/guides/cover-web-dev.png",
    readTime: "3 min read",
    datePublished: "2026-08-22",
    heroVideo: "/videos/raz-showreel-4.mp4",
    heroImage: "/images/guides/tachzukat-atarim-ai.jpg",
    relatedServiceSlug: "web-design",
    sections: [
      {
        heading: "What this actually means",
        paragraphs: [
          "\"AI-powered website maintenance\" sounds like a marketing term, but behind it is concrete work: content and image updates using generative tools, automatic detection of performance and SEO issues, and writing/editing new content at a pace far faster than a fully manual process. That doesn't mean the site \"maintains itself.\" It means the work a human does is significantly shorter, because a large share of the repetitive tasks (writing product descriptions, optimizing images, suggesting content improvements) is done with smart tools and then reviewed and approved.",
        ],
      },
      {
        heading: "What AI is actually good at here",
        paragraphs: [
          "Writing and editing content: first drafts for pages, blog posts, and product descriptions, based on existing style and information and then edited by hand.",
          "Optimizing images and media: compression, modern formats, faster loading, without hurting quality.",
          "Detecting technical SEO issues: missing meta descriptions, broken heading structure, dead links (tasks that used to require manual scanning).",
          "Quickly generating design or content variations, to test what actually performs better with a real audience.",
        ],
      },
      {
        heading: "What still requires a human",
        paragraphs: [
          "Strategic decisions: what to prioritize, what the brand's message is, what stays the same even as trends shift. Subtle design decisions tied to brand identity. And everything related to security, backups, and infrastructure, where a mistake is costly, and where strict human oversight isn't optional.",
          "In short: AI speeds up repetitive work, it doesn't replace judgment. Good AI-assisted website maintenance is a human with smart tools, not smart tools alone.",
        ],
      },
      {
        heading: "What to check before signing a maintenance package",
        paragraphs: [
          "What's the guaranteed response time when something breaks. Whether backups happen automatically and how often. Whether content updates are included or billed separately. And most important: who actually reviews and approves what the AI generates, before it goes live.",
        ],
      },
      {
        heading: "What a typical maintenance week looks like",
        paragraphs: [
          "An automatic performance and security check at the start of the week: an alert if something changed for the worse. Requested content updates (text, images, prices) get done within a day or two, not left waiting for a monthly cycle.",
          "Periodically, a technical SEO check: missing meta tags, dead links, load speed. This is the \"boring\" routine work that used to get pushed off because it ate up so much manual time, and that AI now makes genuinely practical.",
        ],
      },
      {
        heading: "When AI maintenance isn't enough",
        paragraphs: [
          "When there's a problem that requires a deep understanding of the code itself: a bug that comes from the interaction between several systems, not just \"a plugin clashing with a plugin.\" There you need a developer who understands the architecture, not just a tool that spots symptoms.",
          "And when there's a strategic decision tied to the site's business direction: whether to add a feature, change the navigation structure, enter a new market. These are decisions that require understanding the business, not just the code.",
        ],
      },
    ],
  },
  {
    slug: "wordpress-to-ai-migration",
    title: "Moving From WordPress to an AI-Based Site · What to Know Before You Decide",
    excerpt: "An honest guide, including when it's the right move and when it's a mistake. No single tool sold to you as a magic fix.",
    category: "Websites & Development",
    image: "/images/guides/cover-web-dev.png",
    readTime: "3 min read",
    datePublished: "2026-08-25",
    heroVideo: "/videos/raz-showreel.mp4",
    heroImage: "/images/guides/maavar-wordpress-le-ai.jpg",
    relatedServiceSlug: "web-design",
    sections: [
      {
        heading: "The wrong question",
        paragraphs: [
          "\"WordPress or AI\" isn't really a dichotomy. WordPress is a content management platform; AI is a tool (or a layer of the workflow) that can be used inside WordPress itself, or outside it in custom development. The real question is: does WordPress still fit your needs, and is there a better way to produce and maintain the content and design around it?",
        ],
      },
      {
        heading: "When WordPress is still the right choice",
        paragraphs: [
          "When you need your in-house team (non-developers) to be able to edit content, add pages, and run a blog themselves. When the business depends on a plugin ecosystem (store, memberships, bookings). When the site is large and complex with a lot of content and pages: pure AI tools still struggle at that scale.",
        ],
      },
      {
        heading: "When it's worth considering leaving WordPress",
        paragraphs: [
          "When the site is chronically slow, cluttered with old plugins that are hard to maintain, and every small change means \"figuring out what broke.\" When you need performance and interactivity that WordPress inherently limits. When the old site simply no longer represents the brand, and it's better to design a new concept from scratch.",
          "This is where AI enters the picture as a layer of the workflow, not necessarily as a replacement for WordPress: you can use AI tools to quickly shape a concept, structure, and initial content, and then build the final result professionally, sometimes back on WordPress with a new design, sometimes through custom development.",
        ],
      },
      {
        heading: "The limitation worth knowing",
        paragraphs: [
          "End-to-end AI website builders are great for speed and prototypes, but they're generally limited in flexibility for large, complex sites and in fine-grained design control. They're an excellent tool at the idea and planning stage, less so as the final infrastructure for a core business site that needs to grow with you for years to come.",
        ],
      },
      {
        heading: "Practical recommendation",
        paragraphs: [
          "Before deciding, map out exactly what's hurting on the current site: speed? design? ease of management? missing capabilities? The answer to that (not the trend) is what should determine whether the move is to a different infrastructure, a redesign within WordPress, or custom development with AI as part of the workflow.",
        ],
      },
      {
        heading: "Checklist before deciding",
        paragraphs: [
          "Does your in-house team need to edit content on an ongoing basis? If so, that's a heavy consideration in favor of staying on WordPress.",
          "Does the site depend on dedicated plugins (bookings, memberships, industry-specific integrations)? Check whether there's an equivalent in AI tools before deciding to switch.",
          "Is the real problem speed/design, or is it actually a content and messaging problem? A technology switch doesn't fix an unclear message.",
        ],
      },
      {
        heading: "How long a real migration takes, and what it costs",
        paragraphs: [
          "A standard migration (a mid-sized brochure site) usually takes 3-6 weeks from final decision to launch, including a critical step of reviewing existing content and migrating it properly, not just a raw copy-paste.",
          "The cost depends on how much content needs to be moved manually versus content that can be migrated automatically. A site with dozens of pages and dynamic content (blog, catalog) is more expensive to migrate than a small brochure site.",
        ],
      },
    ],
  },
  {
    slug: "ai-videos-for-business",
    title: "AI Videos for Businesses · How It Replaces a Shoot Day Without Losing Quality",
    excerpt: "What's really happening behind the scenes of AI video production, and why it's not \"just another weird internet video.\"",
    category: "AI Visuals & Content",
    image: "/images/guides/cover-ai-visual.png",
    readTime: "4 min read",
    datePublished: "2026-08-28",
    heroVideo: "/videos/raz-showreel-2.mp4",
    heroImage: "/images/guides/srtonei-ai-le-asakim.jpg",
    relatedServiceSlug: "ai-content",
    sections: [
      {
        heading: "The old equation vs. the new one",
        paragraphs: [
          "Producing a product video or a commercial the traditional way requires coordinating a location, a film crew, equipment, and sometimes actors, a full day or more, and a budget that typically starts in the thousands of shekels and up. AI production replaces a large part of that process with work using dedicated generative tools, at significantly lower cost and time, sometimes a quarter of the price of a traditional production.",
        ],
      },
      {
        heading: "How it actually works",
        paragraphs: [
          "The process doesn't start with \"write a prompt and get a finished video.\" It starts with building a concept: what's the story, what's the message, what's the tone. From there you build consistent assets (character, product, location) that repeat across all the scenes, so the video looks like one production and not a collection of disconnected clips. Only then do you produce the scenes themselves, and edit them together: lighting, grain, sound, pacing.",
          "This stage (consistency and production) is the difference between content that looks like an AI experiment and content that looks like a real campaign.",
        ],
      },
      {
        heading: "Who this is for",
        paragraphs: [
          "Businesses that want a brand video, a product video, or content for a social media campaign without coordinating a full shoot day. Brands that want to test several visual concepts before investing in an expensive traditional production. And businesses that simply want quality video content at a pace that matches the pace of social posting, not the pace of film shoots.",
        ],
      },
      {
        heading: "What to check with whoever is producing for you",
        paragraphs: [
          "Ask to see real work examples, not just generic demo reels. Ask how they handle character/product consistency across a whole video. That's the point that's easiest to miss. And make sure they understand: concept content (without a real client) is clearly labeled as such, and content that uses real brands or intellectual property is only made with explicit permission.",
        ],
      },
      {
        heading: "What it actually costs",
        paragraphs: [
          "A short AI video (up to 30 seconds) with a simple concept and no recurring consistent character: usually in the cheapest range, typically a few thousand shekels.",
          "When there's a character or product that needs to stay consistent across several scenes, the cost rises in proportion to the technical work required. This is the stage that demands the most experience and manual oversight.",
        ],
      },
      {
        heading: "The mistake that ruins results the most",
        paragraphs: [
          "Skipping the concept stage and jumping straight to production. AI content created without thinking about message and story always ends up looking like a collection of pretty clips with no direction, even if every individual scene looks good.",
          "Second mistake: settling for the first version that comes out without a revision round. Just like in a regular production, the first cut is almost never the best final version.",
        ],
      },
      {
        heading: "What you need to bring before starting",
        paragraphs: [
          "The more material you have ready, the shorter and cheaper the production. A vector logo, brand colors and high-quality product shots are the minimum. A brand arriving with a screenshot of its logo off Instagram adds a day to the project, and that is a day somebody pays for.",
          "The second thing is reference: two or three videos you like, with one sentence on what exactly you liked about each. It shortens the first revision round dramatically, because without it that round is an expensive way to discover what you wanted.",
          "And the third: decide who approves. Three partners approving in sequence add more cost than any technical change.",
        ],
      },
      {
        heading: "How long it actually takes",
        paragraphs: [
          "A short social video with one concept is usually one to three days. A full ad with a character recurring across scenes is one to two weeks.",
          "Most of that time is not rendering, it is decisions: approving the concept, approving the character, revision rounds. I broke the stages down in the [guide on how long an AI commercial takes](/en/guides/ai-commercial-production-timeline).",
        ],
      },
      {
        heading: "How to tell if the result is good, before you post it",
        paragraphs: [
          "Watch it on a phone, muted, at the size it will actually be seen. Most feed views are exactly that, and a video that only works full-screen with speakers will not work in the wild.",
          "Check the first three seconds separately. If it is still unclear what this is about after three seconds, improving the rest is pointless.",
          "And look for the moments where the eye snags: a hand with six fingers, distorted text, a product that changes shape between cuts. Those are what give an amateur AI production away, and they are almost always fixable in another round.",
        ],
      },
      {
        heading: "How many versions you actually need",
        paragraphs: [
          "A single video is a guess. To know what works you need several versions running against each other, letting the data decide instead of a meeting.",
          "This is also where AI production pays off more than anywhere else: once the concept and assets exist, another version costs a fraction of the first. I went into the numbers in the [guide on how many campaign variations you need](/en/guides/how-many-campaign-variations), and into pricing in the [AI video cost guide](/en/guides/ai-video-cost-guide).",
        ],
      },
      {
        heading: "The limits, so you are not surprised",
        paragraphs: [
          "There are things AI production still does not do well. Real people from your team, for instance: if the message is here is who we are, there is no substitute for a camera. Documentary video, where the whole value is that it actually happened, does not fit either.",
          "And products that depend on precise physical detail, like jewelry or fabric with a particular texture, look better shot for real. What you can do is combine: a real product shot inside an environment built in AI, which is usually the smartest answer on cost versus result. I covered that in the [guide on product photos without a studio](/en/guides/ai-product-photos-without-a-studio).",
        ],
      },
      {
        heading: "What to ask a vendor before you commit",
        paragraphs: [
          "How many revision rounds are included and what happens on the next one. Which files you receive and in which aspect ratios, because Facebook, Instagram and TikTok do not consume the same format. And who owns the assets built along the way.",
          "That last question matters more than it sounds. If a consistent brand character was built for you, it is worth money in the next campaign too, and it should be clear up front that it stays with you.",
        ],
      },
      {
        heading: "The mistake that costs most in hindsight",
        paragraphs: [
          "Ordering a video without deciding up front where it will run. A video built for Instagram that then has to run on YouTube or digital signage needs re-cutting, and sometimes re-production of scenes built for a vertical frame.",
          "Say it in the first conversation. A production that knows from the start it needs three aspect ratios is built differently from the ground up, and that costs far less than fixing it later.",
        ],
      },
    ],
  },
  {
    slug: "memorable-website-design-2026",
    title: "Web Design in 2026: What Makes a Site Memorable, Not Just Good-Looking",
    excerpt: "There's a difference between a beautiful site and a site that works. Here's what actually determines whether a visitor remembers your brand.",
    category: "Websites & Development",
    image: "/images/guides/cover-web-dev.png",
    readTime: "2 min read",
    datePublished: "2026-08-15",
    heroVideo: "/videos/raz-showreel-5.mp4",
    heroImage: "/images/guides/eich-atar-nizkar.jpg",
    relatedServiceSlug: "web-design",
    sections: [
      {
        heading: "Beautiful isn't enough",
        paragraphs: [
          "You can build a site with clean design, beautiful fonts, and polished images, and still have a visitor forget it a second after closing the tab. Memorable design isn't measured by graphic beauty alone, but by identity: is there something on the site that couldn't be copied onto a competitor's site without looking out of place. That's the question that determines whether a design works.",
        ],
      },
      {
        heading: "Three things that actually create memory",
        paragraphs: [
          "A consistent visual tone: not just logo and colors, but how the images are shot, how the buttons behave, how the copy sounds. Consistency is what turns a collection of pages into a brand identity.",
          "Motion in the right place: animation that serves the content (revealing information, transitions between states) builds a sense of quality. Animation that exists just \"because it's possible\" does the opposite and pulls attention away from the message.",
          "One clear point of view: a site that tries to say everything on the homepage ends up saying nothing. A memorable site always starts from one clear sentence about what the brand does, and builds around it.",
        ],
      },
      {
        heading: "Where AI helps in this process",
        paragraphs: [
          "AI doesn't create that identity for you, but it significantly shortens the time it takes to test several design directions before picking one, and to produce visual content (images, background video) that matches the chosen direction without an expensive traditional production. The decision about the identity itself stays human.",
        ],
      },
      {
        heading: "A real-world example",
        paragraphs: [
          "Think of two restaurant websites. One has a menu, photos, and a map, technically fine, but just like every other restaurant site. The other uses distinctive typography, one large image that tells the story of the place, and subtle motion that guides you between the site's \"floors.\" The same basic content, a completely different memory left behind.",
        ],
      },
      {
        heading: "How to check if a design works",
        paragraphs: [
          "A simple test: if you removed the logo and the colors, could you still tell it's your site? If the answer isn't obvious, the design isn't distinctive enough yet.",
          "Another test: let someone look at the site for 5 seconds and describe what they remember. If the answer is \"nice site\" with no concrete detail, that's a sign the design didn't leave an impression.",
        ],
      },
    ],
  },
  {
    slug: "brochure-site-vs-online-store",
    title: "Brochure Site vs. Online Store: How to Choose What Your Business Needs",
    excerpt: "Not every business needs e-commerce. A short guide to making the right call based on how you actually sell.",
    category: "Websites & Development",
    image: "/images/guides/cover-web-dev.png",
    readTime: "3 min read",
    datePublished: "2026-08-31",
    heroVideo: "/videos/raz-showreel-7.mp4",
    heroImage: "/images/guides/atar-tadmit-mul-hanut.jpg",
    relatedServiceSlug: "web-design",
    sections: [
      {
        heading: "The question that decides everything",
        paragraphs: [
          "It's not \"how many products do I have\" but \"how does the deal actually close.\" If a deal closes through a call, a meeting, or a custom quote, an online store is a waste of time and budget. If a product sells at the same price to everyone and can be bought instantly, a store is exactly the right tool.",
        ],
      },
      {
        heading: "When a brochure site is enough",
        paragraphs: [
          "Personalized services (consulting, design, construction), businesses where the deal requires a conversation or a quote, and brands whose goal is to build trust and drive a contact, not to close a purchase with a click. A good brochure site does one job: get the right person to reach out.",
        ],
      },
      {
        heading: "When an online store is essential",
        paragraphs: [
          "Physical or digital products with a fixed price, inventory quantities that need managing, and customers who expect to buy now without waiting for a reply. Here, a site without a direct purchase capability simply loses sales.",
        ],
      },
      {
        heading: "The common mistake",
        paragraphs: [
          "Building a store \"because that's what everyone does\" without actually having a real product catalog to manage. An empty store, or one with a single product, looks less professional than a good brochure site. Build what fits how you sell today, not what might happen in the future.",
        ],
      },
      {
        heading: "What happens when you choose wrong",
        paragraphs: [
          "A business that built a store without a real need finds itself maintaining a complex system (inventory updates, payments, shipping) for nothing, because in practice every deal still closes over the phone.",
          "And the reverse: a business with a real product catalog that only built a brochure site loses sales from people who wanted to buy now, not wait for a reply to an email.",
        ],
      },
      {
        heading: "A hybrid approach works too",
        paragraphs: [
          "It's not always a binary choice. You can have a brochure site with a \"request a quote\" catalog for complex products, alongside direct purchase for standard ones. The right solution comes from how your business actually sells, not from a ready-made template.",
        ],
      },
      {
        heading: "The difference in cost and in time",
        paragraphs: [
          "A five to seven page brochure site runs between 2,500 and 12,000 shekels, depending on design depth and how many systems connect to it. An online store generally starts around 15,000 and goes up. I laid out all the ranges in the [website pricing guide](/en/guides/website-cost-guide-2026).",
          "But the real difference is not in the build, it is in the upkeep. A brochure site can be left almost untouched for a year. A store needs ongoing attention: stock, prices, stuck orders, plugin updates that affect checkout.",
          "Think of it as hours per month, not a one-off payment. A store nobody maintains stops selling within months.",
        ],
      },
      {
        heading: "One question that settles the decision",
        paragraphs: [
          "Take the last ten deals you closed and ask of each: could the customer have paid on their own, on the site, without talking to you. If the answer is yes most of the time, you need a store. If it is no, you need a brochure site.",
          "That is a better question than any list of pros and cons, because it is based on what actually happens in your business rather than what is common in your industry. Two businesses in the same field can come out with opposite answers, and that is fine.",
        ],
      },
      {
        heading: "What nobody tells you about small stores",
        paragraphs: [
          "A store with fewer than ten products is almost always better off as a product page inside a brochure site than as a full store. The heavy machinery of inventory, categories and filtering exists to solve a large-catalogue problem, and without a catalogue it only slows the site down and complicates management.",
          "The practical rule: if you can show every product on one page without much scrolling, you do not need a store, you need a pay button.",
          "It also saves the hidden cost of a small store, which is the payment processing fees and the monthly platform subscription that run whether you sold anything this month or not.",
        ],
      },
      {
        heading: "When it is worth switching, and when it is not",
        paragraphs: [
          "A business that started as a brochure site and begins selling one or two standard products does not need a store immediately. A pay button on a product page does the job, and you can live with it for a year without feeling constrained.",
          "The moment you genuinely need to switch is when you start managing stock, when customers start asking where their order is, or when there are enough products to need filtering. Before that, switching early only adds work.",
          "And when you do switch, that is the time to make sure you do not lose what already works in Google. I explained that in the [guide on migrating platforms without losing SEO](/en/guides/platform-migration-without-losing-seo).",
        ],
      },
    ],
  },
  {
    slug: "ai-campaign-end-to-end",
    title: "An End-to-End AI Campaign: What It Actually Looks Like",
    excerpt: "From the initial idea to the file ready for publishing, step by step, without dressing up the process.",
    category: "AI Visuals & Content",
    image: "/images/guides/cover-ai-visual.png",
    readTime: "2 min read",
    datePublished: "2026-09-03",
    heroVideo: "/videos/raz-showreel-2.mp4",
    heroImage: "/images/guides/kampain-ai-mikatze-lekatze.jpg",
    relatedServiceSlug: "ai-content",
    sections: [
      {
        heading: "Step 1: Brief and message",
        paragraphs: [
          "Before touching any AI tool: what's the message, who is it for, and where will it run (a specific social network, a website, a screen). A campaign that starts from a tool instead of a message always feels like an experiment, not like advertising.",
        ],
      },
      {
        heading: "Step 2: Concept and visual direction",
        paragraphs: [
          "Building several quick concept directions: color palette, photography style, tone (minimalist / dramatic / friendly). This is the stage where AI lets you test several directions within hours instead of days.",
        ],
      },
      {
        heading: "Step 3: Consistent assets",
        paragraphs: [
          "If there's a product, character, or location that recurs throughout the campaign, you build them as one consistent asset and use it across all the scenes. This is what separates a cohesive campaign from a collection of disconnected images.",
        ],
      },
      {
        heading: "Step 4: Production and editing",
        paragraphs: [
          "Actually generating the scenes, and then editing: color, pacing, typography, different formats for each platform (story, feed, ad). Here, the difference between amateur and professional content is almost always in the editing, not the initial generation.",
        ],
      },
      {
        heading: "What's important to know upfront",
        paragraphs: [
          "An AI campaign that looks good usually takes a few days, not weeks, but it still requires iteration. If someone promises a finished campaign within an hour with no reviews, you should be suspicious of the quality of the result.",
        ],
      },
      {
        heading: "What drags out the process unnecessarily",
        paragraphs: [
          "Changing the concept direction after production has already started, which is exactly why the early approval stage is so critical. Lack of clarity about who signs off on the final product, which creates endless revision rounds with no clear decision.",
        ],
      },
      {
        heading: "What a full campaign costs",
        paragraphs: [
          "It depends on the number of assets required and how complex it is to keep them visually consistent with each other. A campaign with one consistent asset (one product, a few scenes) is significantly cheaper than a campaign with several characters and locations that all need to stay consistent.",
        ],
      },
    ],
  },
  {
    slug: "ai-commercial-production-timeline",
    title: "AI Commercials: How Long It Takes and What the Process Involves",
    metaTitle: "How Long Does an AI Commercial Take to Produce · RAZ",
    excerpt: "Realistic expectations: what happens at each stage, and how long it actually takes from brief to finished file.",
    category: "AI Visuals & Content",
    image: "/images/guides/cover-ai-visual.png",
    readTime: "2 min read",
    datePublished: "2026-09-04",
    heroVideo: "/videos/raz-showreel-4.mp4",
    heroImage: "/images/guides/prasomet-ai-zman-taalich.jpg",
    relatedServiceSlug: "ai-content",
    sections: [
      {
        heading: "A realistic timeline",
        paragraphs: [
          "A short AI commercial (up to 30 seconds) with a clear concept and consistent assets: usually between a few days and a week, depending on complexity and the number of revision rounds. This is significantly faster than a traditional production, but not \"ready instantly\" the way it's sometimes marketed.",
        ],
      },
      {
        heading: "What affects how long it takes",
        paragraphs: [
          "The number of scenes and the transitions between them. Whether there's one consistent character that needs to be built and maintained throughout the whole video. This is the stage that requires the most iterations. And whether there are specific requirements (a brand, a real product) that need to be matched precisely.",
        ],
      },
      {
        heading: "What's included in a proper process",
        paragraphs: [
          "A brief and concept approval, building consistent assets, producing the scenes, editing and sound, and one or two revision rounds. If someone offers an AI commercial without a concept stage or without the option for revisions, that's probably a generic result, not a tailored production.",
        ],
      },
      {
        heading: "What happens during a revision round",
        paragraphs: [
          "A revision requesting a small change (color, editing pace) is usually fast: a day or two. A revision that asks to change the concept itself after production has already started effectively means starting a new production stage, not a \"small fix.\"",
        ],
      },
      {
        heading: "A direct comparison with traditional production",
        paragraphs: [
          "Traditional production: coordinating a location, equipment, a crew, and usually weeks of advance scheduling. AI commercial: no dependency on people's availability or a physical location. The only bottleneck is the creative work time itself.",
        ],
      },
    ],
  },
  {
    slug: "signs-you-need-a-redesign",
    title: "5 Signs It's Time to Redesign Your Website",
    excerpt: "Not every old site needs an upgrade. Here's how to know if yours does.",
    category: "Website Upgrades",
    image: "/images/guides/cover-site-upgrades.png",
    readTime: "2 min read",
    datePublished: "2026-09-05",
    heroVideo: "/videos/raz-showreel-5.mp4",
    heroImage: "/images/guides/simanim-le-atzuv-mechadash.jpg",
    relatedServiceSlug: "web-design",
    sections: [
      {
        heading: "1. The site is chronically slow",
        paragraphs: [
          "If page load consistently takes more than 3 seconds, that's no longer an aesthetic issue. It's actively losing you customers. Old sites with a pile of unmaintained plugins are the most common cause.",
        ],
      },
      {
        heading: "2. Updating content has become a chore",
        paragraphs: [
          "If every small change requires calling a developer, or you're afraid to touch the system \"because something always breaks\", the site is limiting you instead of serving you.",
        ],
      },
      {
        heading: "3. It doesn't look good on mobile",
        paragraphs: [
          "Most traffic today comes from mobile. A site built years ago with a \"desktop first\" approach usually looks broken or clunky on a phone, even if it's \"technically\" responsive.",
        ],
      },
      {
        heading: "4. The brand has evolved and the site hasn't",
        paragraphs: [
          "If the business has changed (target audience, positioning, services) but the site still looks like it did a few years ago, there's a gap between what you actually offer and what shows on the outside.",
        ],
      },
      {
        heading: "5. It just doesn't convert",
        paragraphs: [
          "There's traffic, but no inquiries. That's usually a sign of an unclear message, a weak call to action, or a confusing user experience, not a problem that's solved with more content, but one that requires redesigning the journey itself.",
        ],
      },
      {
        heading: "What this doesn't mean",
        paragraphs: [
          "A redesign doesn't mean throwing out all the content and structure that already works. If a particular page brings in good traffic and plenty of leads, the change should preserve what's working and fix only what isn't.",
        ],
      },
      {
        heading: "A recommended course of action",
        paragraphs: [
          "Start with a real diagnosis, not a guess. A speed check (PageSpeed Insights), a review of usage data if you have analytics, and mapping out content management issues. From there, decide whether this calls for a targeted upgrade or a full redesign.",
        ],
      },
    ],
  },
  {
    slug: "platform-migration-without-losing-seo",
    title: "Switching Platforms Without Losing SEO: How to Do It Right",
    excerpt: "A site upgrade can reset your Google rankings if done wrong. Here's what you have to check.",
    category: "Website Upgrades",
    image: "/images/guides/cover-site-upgrades.png",
    readTime: "2 min read",
    datePublished: "2026-09-06",
    heroVideo: "/videos/raz-showreel.mp4",
    heroImage: "/images/guides/maavar-platforma-bli-leabed-seo.jpg",
    relatedServiceSlug: "web-design",
    sections: [
      {
        heading: "The real risk",
        paragraphs: [
          "A platform switch (WordPress to a custom site, or the reverse) changes URLs, page structure, and sometimes entire pieces of content, and Google has to discover and re-crawl everything. Without proper planning, this can reset months or years of organic ranking.",
        ],
      },
      {
        heading: "What must happen before the move",
        paragraphs: [
          "Mapping every existing URL and its ranking in Google (which pages actually bring in traffic). Precisely documenting the titles, descriptions, and content that already work. And a redirect plan from every old URL to its equivalent new URL, not a default fallback to the homepage.",
        ],
      },
      {
        heading: "What must happen on migration day",
        paragraphs: [
          "301 redirects (not temporary ones) from every old URL to the new one, checking that the sitemap.xml is updated and submitted to Google immediately, and making sure there's no accidental indexing block (a robots.txt rule or a noindex tag that survived from the development environment, a common and damaging mistake).",
        ],
      },
      {
        heading: "After the migration",
        paragraphs: [
          "Monitoring Google Search Console for crawl errors and sudden traffic drops in the first few weeks. A small, temporary dip is normal while Google updates its index. A sharp, sustained drop is a sign something in the redirects isn't right.",
        ],
      },
      {
        heading: "Tools to check before and after",
        paragraphs: [
          "Google Search Console is the first tool to check: it shows exactly which URLs are ranking and which crawl errors show up after the move. Screaming Frog or a similar tool helps map out all existing URLs before you start.",
        ],
      },
      {
        heading: "A short case study",
        paragraphs: [
          "A site that migrated without proper redirects lost about 70% of its organic traffic within a month, and took roughly six months to recover. The same kind of migration with a redirect plan prepared in advance usually preserves most of the existing ranking within a few weeks.",
        ],
      },
    ],
  },
  {
    slug: "what-is-vibe-coding",
    title: "What Is Vibe Coding, and Why It's Changing How Websites Get Built",
    excerpt: "The new term everyone's talking about: what it actually means, and why it's not just hype.",
    category: "Websites & Development",
    image: "/images/guides/cover-web-dev.png",
    readTime: "2 min read",
    datePublished: "2026-08-15",
    heroVideo: "/videos/raz-showreel-7.mp4",
    heroImage: "/images/guides/ma-ze-vibe-coding.jpg",
    relatedServiceSlug: "web-design",
    sections: [
      {
        heading: "The simple definition",
        paragraphs: [
          "Vibe coding means working with an AI tool that writes code based on a plain-language description: \"add a button that opens a menu\" instead of writing it line by line. It's not magic, and it's not blind generation either: every result is reviewed, tested, and fixed by a developer.",
        ],
      },
      {
        heading: "Why it changed the pace of work",
        paragraphs: [
          "Tasks that used to take hours (building a component, wiring up a form, sorting out responsive layout) now take minutes. That doesn't mean quality dropped. It means the time that used to go into mechanical typing now goes into design decisions and testing.",
        ],
      },
      {
        heading: "What it isn't",
        paragraphs: [
          "It's not an automated website builder running on its own with no developer involved. The distinction is critical: vibe coding produces real code (React, TypeScript) that a developer reviews and assembles into a complete product. A closed website builder produces a result you can't touch beyond its own editor.",
        ],
      },
      {
        heading: "What it looks like in an actual workday",
        paragraphs: [
          "A morning brief: exactly what needs to happen on the site today. From there, iterative work (describe, test, fix, repeat) in short cycles instead of long upfront planning that isn't always accurate.",
          "The important part you don't see from the outside: reviewing the code, running tests, and making sure the result actually works across every browser and device, not just that it looks good in one preview.",
        ],
      },
      {
        heading: "What doesn't change, even with AI",
        paragraphs: [
          "Understanding the real business need behind the request. If a client asks for a specific button, the question to ask is what they're actually trying to achieve, sometimes the right solution is different from what was originally requested, and that's work that requires experience, not just a fast tool.",
        ],
      },
    ],
  },
  {
    slug: "ux-ui-design-with-ai",
    title: "How AI Helps Design UX/UI Faster",
    metaTitle: "UX/UI Design with AI · How It Speeds Up Website Planning · RAZ",
    excerpt: "Testing several design directions within hours, not days, without giving up human judgment.",
    category: "Websites & Development",
    image: "/images/guides/cover-web-dev.png",
    readTime: "2 min read",
    datePublished: "2026-09-07",
    heroVideo: "/videos/raz-showreel-5.mp4",
    heroImage: "/images/guides/ux-ui-im-ai.jpg",
    relatedServiceSlug: "web-design",
    sections: [
      {
        heading: "The problem with traditional design",
        paragraphs: [
          "Traditional UX/UI design requires building several versions by hand, each one taking hours. In practice, one direction usually gets picked too early, because there's no time to test real alternatives.",
        ],
      },
      {
        heading: "What AI changes in the process",
        paragraphs: [
          "AI tools make it possible to create several design variations (layout, color, typography) in significantly less time. That turns the spec stage from \"picking too early\" into \"an actual comparison between options.\"",
        ],
      },
      {
        heading: "What still requires a professional eye",
        paragraphs: [
          "Visual hierarchy, user flow, accessibility, and brand consistency: these are areas where AI offers options but doesn't decide. The final choice and the fine-tuning always stay under professional judgment.",
        ],
      },
      {
        heading: "A concrete example of the process",
        paragraphs: [
          "A request for a new landing page turns into three design proposals within hours: one minimalist, one bolder, and one in between. The client picks a direction, and only then does the fine detail work begin.",
        ],
      },
      {
        heading: "The risk to watch out for",
        paragraphs: [
          "Choosing too quickly between variations without testing them against a real audience. More options are only an advantage if you actually test them, not just pick based on one moment's personal taste.",
        ],
      },
    ],
  },
  {
    slug: "landing-page-in-two-days",
    title: "Building a Landing Page With AI in Two Days",
    excerpt: "From brief to live page: what you can realistically expect timeline-wise, without inflated promises.",
    category: "Websites & Development",
    image: "/images/guides/cover-web-dev.png",
    readTime: "2 min read",
    datePublished: "2026-08-15",
    heroVideo: "/videos/raz-showreel.mp4",
    heroImage: "/images/guides/landing-page-yom-yomayim.jpg",
    relatedServiceSlug: "web-design",
    sections: [
      {
        heading: "Why a landing page is where AI stands out the most",
        paragraphs: [
          "A landing page is usually a single page with one clear goal, exactly the kind of project where AI tools speed things up the most, because there isn't much structural complexity that requires lengthy planning.",
        ],
      },
      {
        heading: "What happens each day",
        paragraphs: [
          "Day one: brief, messaging, design direction, and building the page. Day two: revisions, connecting the form/tracking, mobile testing, and launch. This is a realistic timeline for a standard landing page, not for a project with complex integrations.",
        ],
      },
      {
        heading: "What can slow it down",
        paragraphs: [
          "Content that isn't ready in advance (copy, images), mid-project direction changes, or complex integration requirements (CRM, a payment system). A landing page with all the materials ready ahead of time is the fastest.",
        ],
      },
      {
        heading: "What has to be ready in advance",
        paragraphs: [
          "Final copy (or at least a near-final draft), a hero image or video, and contact details or a form integration. The more ready these materials are in advance, the more the process actually stays within the two-day window.",
        ],
      },
      {
        heading: "What happens after launch",
        paragraphs: [
          "Tracking conversions from day one, not waiting until the end of the campaign to find out something wasn't working. Quickly tweaking a headline or a call to action based on the first data is a natural part of the process.",
        ],
      },
    ],
  },
  {
    slug: "business-automation-save-hours",
    title: "Business Automations: How to Save Hours of Work a Week",
    excerpt: "Manual processes you can automate without changing how the business runs.",
    category: "Websites & Development",
    image: "/images/guides/cover-web-dev.png",
    readTime: "2 min read",
    datePublished: "2026-09-08",
    heroVideo: "/videos/raz-showreel-4.mp4",
    heroImage: "/images/guides/otomatziot-lachsoch-shaot.jpg",
    relatedServiceSlug: "web-design",
    sections: [
      {
        heading: "What's worth automating first",
        paragraphs: [
          "Any recurring process that involves copying information between systems (a website form → a spreadsheet → a reminder email) is a top candidate for automation. These are the tasks that eat up the most time without requiring real human judgment.",
        ],
      },
      {
        heading: "Real-world examples",
        paragraphs: [
          "A new lead from the website form automatically enters the CRM and sends a WhatsApp message to the customer. An approved invoice automatically updates a tracking spreadsheet. An automatic reminder to a customer who hasn't responded within 48 hours.",
        ],
      },
      {
        heading: "Where it starts",
        paragraphs: [
          "With mapping: what actually happens manually today, how much time it takes per week, and what the risk is if it gets forgotten. From there, you build the automated process for the most cost-effective part first.",
        ],
      },
      {
        heading: "How to measure whether an automation pays off",
        paragraphs: [
          "It's simple: how much time it saves per week, multiplied by the number of weeks in a year, against the one-time setup cost. An automation that saves an hour a week pays for itself within a few months in most cases.",
        ],
      },
      {
        heading: "What's not worth automating",
        paragraphs: [
          "Processes that require delicate human judgment, like how to respond to an angry customer, or deciding on an exceptional discount. These stay with a human, even if the parts around them are automated.",
        ],
      },
    ],
  },
  {
    slug: "elementor-pro-is-it-worth-it",
    title: "Elementor Pro: When It's Worth It",
    excerpt: "Not every WordPress site needs the paid version. How to know if yours does.",
    category: "Websites & Development",
    image: "/images/guides/cover-web-dev.png",
    readTime: "2 min read",
    datePublished: "2026-09-09",
    heroVideo: "/videos/raz-showreel-5.mp4",
    heroImage: "/images/guides/elementor-pro-mata-shave.jpg",
    relatedServiceSlug: "web-design",
    sections: [
      {
        heading: "What you get in Pro that the free version doesn't have",
        paragraphs: [
          "A Theme Builder (designing the header/footer/full archive pages), advanced dynamic forms, CRM and content-system integrations, and additional design templates. The free version is enough for a simple single page. Pro is needed for a full site with structural consistency.",
        ],
      },
      {
        heading: "When it's unnecessary",
        paragraphs: [
          "For a single, simple landing page with no need for complex forms, the free version is entirely sufficient, and there's no reason to pay for capabilities that won't be used.",
        ],
      },
      {
        heading: "When it's essential",
        paragraphs: [
          "A full brochure site with several page types, a WooCommerce store, or any project where content needs to be managed consistently through repeating templates: there, Pro pays for itself quickly in saved work time.",
        ],
      },
      {
        heading: "Real cost vs. benefit",
        paragraphs: [
          "Elementor Pro's annual price is usually dwarfed by the cost of the development hours it would take to build that same flexibility from scratch. The relevant question isn't the price itself, but whether the advanced capabilities will actually get used.",
        ],
      },
      {
        heading: "A common mistake in choosing",
        paragraphs: [
          "Buying Pro and only using the basic capabilities the free version already provides. Before upgrading, it's worth making sure the project genuinely needs the Theme Builder or advanced forms.",
        ],
      },
    ],
  },
  {
    slug: "woocommerce-store-checklist",
    title: "Opening a WooCommerce Store: What You Need to Know Before You Start",
    excerpt: "The questions worth answering before you start building, not after.",
    category: "Websites & Development",
    image: "/images/guides/cover-web-dev.png",
    readTime: "2 min read",
    datePublished: "2026-08-15",
    heroVideo: "/videos/raz-showreel-7.mp4",
    heroImage: "/images/guides/woocommerce-lifney-shemathilim.jpg",
    relatedServiceSlug: "web-design",
    sections: [
      {
        heading: "How many products do you actually have",
        paragraphs: [
          "WooCommerce fits almost any scale, but the planning is fundamentally different between 20 products and 2,000. A large catalog requires thinking ahead about categories, filtering, and search.",
        ],
      },
      {
        heading: "Payments and shipping",
        paragraphs: [
          "You need to decide in advance which Israeli payment provider connects, and how shipping is managed (flat rate, by weight, self pickup). This directly affects how the plugin setup gets built.",
        ],
      },
      {
        heading: "Inventory management",
        paragraphs: [
          "If inventory is updated somewhere else (an external system, a spreadsheet), it's better to plan the sync from the start rather than bolt it on afterward.",
        ],
      },
      {
        heading: "Starting off right",
        paragraphs: [
          "An initial product list, a shipping and returns policy, and a payment provider chosen in advance: these are the three things worth locking down before you actually start building.",
        ],
      },
      {
        heading: "Questions worth answering upfront",
        paragraphs: [
          "How is inventory updated, manually, or synced from another system? Who's responsible for product photos and descriptions? The answers to these determine how fast and smooth the actual build will be.",
        ],
      },
      {
        heading: "What happens at the first launch",
        paragraphs: [
          "The first purchase always teaches you something: a checkout flow that looked clear in the design sometimes turns out to be confusing in practice. A testing round with real users before a wide launch saves a lot of headaches.",
        ],
      },
    ],
  },
  {
    slug: "professional-brochure-site-checklist",
    title: "A Professional Brochure Site: What It Must Have",
    excerpt: "Not every pretty \"About\" page makes a brochure site effective. The list that actually matters.",
    category: "Websites & Development",
    image: "/images/guides/cover-web-dev.png",
    readTime: "3 min read",
    datePublished: "2026-09-10",
    heroVideo: "/videos/raz-showreel.mp4",
    heroImage: "/images/guides/atar-tadmit-professionali.jpg",
    relatedServiceSlug: "web-design",
    sections: [
      {
        heading: "A clear message in the first second",
        paragraphs: [
          "A visitor landing on the homepage needs to understand within seconds what the business does and who it's for. A brochure site that opens with a generic \"welcome\" misses the first and most important opportunity.",
        ],
      },
      {
        heading: "Real social proof",
        paragraphs: [
          "Clients, projects, testimonials: something that proves the business actually operates, not just claims to. Even a few real work examples are worth more than a long marketing paragraph.",
        ],
      },
      {
        heading: "A clear way to get in touch",
        paragraphs: [
          "A simple form, an accessible phone/WhatsApp number, and not just a footer email address that's easy to miss. A brochure site that makes contact difficult loses leads for no reason.",
        ],
      },
      {
        heading: "What a working About page looks like",
        paragraphs: [
          "Not a dry list of achievements, but a short story that explains why the business exists and who it helps. People trust businesses they understand, not just businesses with an impressive résumé.",
        ],
      },
      {
        heading: "A common mistake in brochure sites",
        paragraphs: [
          "Filling the homepage with every possible piece of information instead of leading toward one clear message. A good homepage sparks curiosity and leads you further in. It doesn't try to tell you everything at once.",
        ],
      },
      {
        heading: "A page per service, not one page for all of them",
        paragraphs: [
          "This is the mistake that hurts search most. A business offering four services that puts them all on a single page called Services is competing for four different queries with one page, and losing all four.",
          "A separate page per service, with a heading that uses the words a customer actually types into Google, is the difference between a site that gets found and a site that merely exists. It helps the sale too: you can send a prospect one relevant link instead of asking them to scroll.",
        ],
      },
      {
        heading: "What Google needs to see",
        paragraphs: [
          "A unique title and description on every page, not the same text duplicated. Readable page addresses rather than random numbers. And images with text descriptions, both for accessibility and because Google reads them.",
          "And the thing most often missed: speed. A beautiful brochure site that takes three seconds to load on mobile loses a large share of visitors before they see anything. I covered what causes that in the [guide on why your site is slow](/en/guides/why-is-my-website-slow).",
        ],
      },
      {
        heading: "An FAQ page that actually answers",
        paragraphs: [
          "Not five generic questions, but the ones you genuinely get asked on the phone. What it costs, how long it takes, what happens if they are not happy.",
          "It has two benefits. It filters out irrelevant enquiries before they reach you, and it is exactly the kind of content Google shows directly in search results.",
        ],
      },
      {
        heading: "What to check before going live",
        paragraphs: [
          "Open the site on a phone, not a desktop. That is where most visitors will arrive, and it is also where problems surface: text too small, a button that is hard to tap, an image that gets cropped.",
          "Fill in your own contact form and confirm the enquiry actually arrives, at an inbox somebody reads. A broken form is the most common and most expensive failure on brochure sites, and it is silent: leads simply stop coming.",
          "And check how the site looks when shared on WhatsApp. If the image or title that appears there makes no sense, that is what everyone who receives the link will see.",
        ],
      },
      {
        heading: "What builds trust without saying a word",
        paragraphs: [
          "A real photo of you or your team. A brochure site with stock photos of people in suits signals the opposite of what it intended, because everyone recognises stock.",
          "Real business details in the footer: full name, phone, city. A business that hides who is behind it looks suspicious, even when it has nothing to hide.",
          "And response time. If it says you reply within 24 hours, that has to be true. A small promise you do not keep is the first impression that sticks.",
        ],
      },
      {
        heading: "Brochure site or store: how to tell which you need",
        paragraphs: [
          "If your deals close in a conversation or a quote, a brochure site is the tool. If the product sells at the same price to everyone and can be bought immediately, you need a store. I laid out the distinction in the [guide on brochure sites versus online stores](/en/guides/brochure-site-vs-online-store).",
          "And if you are at the stage of comparing quotes, the real market ranges are in the [website pricing guide](/en/guides/website-cost-guide-2026).",
        ],
      },
      {
        heading: "The content worth adding after launch",
        paragraphs: [
          "A five-page brochure site competes for very few queries. What widens the range without touching the structure is short guides or articles on the questions your customers actually ask.",
          "You do not need an active blog with a weekly post. Five good articles answering the questions that keep coming up on the phone bring more relevant traffic than twenty generic posts, and they save you answering those questions again.",
          "And each such article is a chance to link inward to the relevant service page, which helps both the visitor and Google understand how the site is organised.",
        ],
      },
    ],
  },
  {
    slug: "why-is-my-website-slow",
    title: "Why My Website Is Slow, and How to Fix It",
    excerpt: "The diagnosis and the fix, not just \"compress your images,\" but a real understanding of what causes slowness.",
    category: "Websites & Development",
    image: "/images/guides/cover-web-dev.png",
    readTime: "2 min read",
    datePublished: "2026-08-15",
    heroVideo: "/videos/raz-showreel-4.mp4",
    heroImage: "/images/guides/lama-atar-iti.jpg",
    relatedServiceSlug: "web-design",
    sections: [
      {
        heading: "The common causes",
        paragraphs: [
          "Uncompressed images at their huge original size. Too many WordPress plugins, some of them not actually in use. Weak hosting that can't handle load. And JavaScript code that loads even when it's not needed on that specific page.",
        ],
      },
      {
        heading: "How to actually check",
        paragraphs: [
          "Google PageSpeed Insights gives you a score and concrete findings, not just \"the site is slow,\" but exactly which file is too big and what's blocking load. That's the right starting point before any fix.",
        ],
      },
      {
        heading: "The right order of fixes",
        paragraphs: [
          "Images first (the most significant, the fastest to fix), then unnecessary plugins, and only then a hosting upgrade if it's still needed. Upgrading hosting before cleaning up heavy content is a waste of money.",
        ],
      },
      {
        heading: "More testing tools beyond PageSpeed",
        paragraphs: [
          "GTmetrix gives additional detail on the resource loading order. WebPageTest simulates slower connections, which matters because not every visitor is browsing on fast internet.",
        ],
      },
      {
        heading: "An improvement you'll see within a day",
        paragraphs: [
          "Compressing images alone, without touching anything else, is usually enough for a noticeable improvement in load time on the very same day. This is typically the most cost-effective starting point.",
        ],
      },
    ],
  },
  {
    slug: "acf-custom-post-types-when-to-use",
    title: "When You Need ACF and Custom Post Types on a WordPress Site",
    excerpt: "When regular pages are no longer enough to manage your content.",
    category: "Websites & Development",
    image: "/images/guides/cover-web-dev.png",
    readTime: "2 min read",
    datePublished: "2026-09-11",
    heroVideo: "/videos/raz-showreel-2.mp4",
    heroImage: "/images/guides/acf-cpt-matai-tzarich.jpg",
    relatedServiceSlug: "web-design",
    sections: [
      {
        heading: "What it actually is",
        paragraphs: [
          "A Custom Post Type (CPT) is a new content type you define (for example \"projects\" or \"products\"), and ACF (Advanced Custom Fields) gives each item structured fields (image, price, description) instead of free-form text.",
        ],
      },
      {
        heading: "The sign that you need it",
        paragraphs: [
          "If you have recurring content in a fixed structure (dozens of projects, products, or articles that all need the same fields), regular pages turn into an unmanaged mess. CPT+ACF gives you a consistent structure that's easy to maintain.",
        ],
      },
      {
        heading: "What it delivers in practice",
        paragraphs: [
          "Simpler content management (a form with defined fields, not editing HTML), and consistent display across the site, because every item uses the same display template.",
        ],
      },
      {
        heading: "A real-world example",
        paragraphs: [
          "A site with dozens of projects in a portfolio: without a CPT, every project is a separate page whose design can easily go wrong. With CPT+ACF, every new project goes in through one uniform form and automatically appears in the right template.",
        ],
      },
      {
        heading: "When it's overkill",
        paragraphs: [
          "For a site with only 3-4 static pages, building a CPT structure is usually unnecessary and adds complexity without real benefit. Simplicity wins when there isn't really recurring content.",
        ],
      },
    ],
  },
  {
    slug: "wordpress-api-integrations",
    title: "Connecting Systems to a WordPress Site: What's Possible and What Isn't",
    excerpt: "CRM, payments, newsletters: a realistic guide to integrations that actually work.",
    category: "Websites & Development",
    image: "/images/guides/cover-web-dev.png",
    readTime: "2 min read",
    datePublished: "2026-09-12",
    heroVideo: "/videos/raz-showreel-7.mp4",
    heroImage: "/images/guides/integraziot-api-wordpress.jpg",
    relatedServiceSlug: "web-design",
    sections: [
      {
        heading: "What counts as a good integration",
        paragraphs: [
          "A system with an open API and clear documentation: almost every serious CRM, payment, or newsletter system meets that bar. The trouble starts with old or proprietary systems that lack accessible documentation.",
        ],
      },
      {
        heading: "Common examples that work well",
        paragraphs: [
          "A website form that creates a lead directly in a CRM. Automatic inventory updates against an external system. Sending an order confirmation by both email and WhatsApp.",
        ],
      },
      {
        heading: "What to check before promising an integration",
        paragraphs: [
          "Whether the other system even has an API, and what its limits are (number of calls, real-time updates versus once a day). This determines whether the integration will be smooth or will require workarounds.",
        ],
      },
      {
        heading: "The testing stage you don't skip",
        paragraphs: [
          "Before relying on an integration in production, you test it in a staging environment with fake data. An integration that breaks without prior testing can cause lost leads without anyone noticing.",
        ],
      },
      {
        heading: "What happens when an external system changes",
        paragraphs: [
          "API providers update their versions from time to time, and this sometimes breaks existing integrations. Ongoing maintenance includes tracking these announcements, not just a one-time build that's then forgotten.",
        ],
      },
    ],
  },
  {
    slug: "ai-ugc-content-that-converts",
    title: "AI UGC: Why Content That Looks Amateur Converts Better Than a Polished Ad",
    excerpt: "Why the UGC format works, where AI genuinely replaces a human creator, and where it should not.",
    category: "AI Visuals & Content",
    image: "/images/guides/cover-ai-visual.png",
    readTime: "4 min read",
    datePublished: "2026-09-02",
    heroVideo: "/videos/raz-showreel-2.mp4",
    heroImage: "/images/guides/ai-ugc-mamir-yoter.jpg",
    relatedServiceSlug: "ai-content",
    sections: [
      {
        heading: "What UGC actually is, and why everyone is talking about it",
        paragraphs: [
          "UGC stands for User Generated Content: content that looks like a customer shot it on a phone rather than a studio with lighting. The format took over the feed because it does not look like an ad, and for exactly that reason people do not scroll past it automatically.",
          "Businesses noticed, and UGC is now one of the most requested formats for campaigns on Facebook, Instagram and TikTok. The problem is that producing real UGC is surprisingly expensive and slow.",
        ],
      },
      {
        heading: "What it costs the traditional way",
        paragraphs: [
          "A human UGC creator in Israel charges between 3,000 and 15,000 shekels per video, depending on audience size and usage rights. Average turnaround is around two weeks, from booking to delivery.",
          "And that is for one video. A normal campaign needs five to ten versions before there is anything real to test against, and that is where those numbers start to break a small business.",
        ],
      },
      {
        heading: "Where AI comes in",
        paragraphs: [
          "You can build a character that looks and behaves like a real creator, keep it consistent across a whole series of videos, and swap only the product or the angle in each version. What takes two weeks and costs thousands per version becomes days, at a significantly lower cost for the entire set.",
          "The real advantage is not the price, it is the number of attempts. When an extra version costs little, you can ship eight variations and let the data decide the winner instead of betting on one. I covered that in detail in the [guide on how many campaign variations you need](/en/guides/how-many-campaign-variations).",
        ],
      },
      {
        heading: "The contradiction everyone asks about: if it is fake, how is it authentic",
        paragraphs: [
          "That is the fairest question on the subject, and it has a clear answer. UGC does not work because the viewer thinks it is a real customer. It works because the format itself, handheld camera, natural light, talking straight to the lens, feels like a recommendation rather than a billboard. It is a matter of visual language, not of who is holding the camera.",
          "But there is a red line, and it is not blurry: an AI video posing as a real customer testimonial is deception. I do not produce that, and nobody needs to. You can use the language of UGC without making a false claim about who is speaking.",
        ],
      },
      {
        heading: "What separates good UGC from weak UGC",
        paragraphs: [
          "The first thing is tone. UGC that sounds like a regular ad with different narration misses the entire point. The first sentence has to sound like something a person says to a friend, not like a line written in a marketing meeting.",
          "The second is the opening. The viewer decides within three seconds whether to stay, and a UGC video that opens on a logo or a brand name has already lost. It should open mid-sentence, on a problem, or on something visual that is not immediately clear.",
          "The third is deliberate imperfection. Lighting that is too good, a frame that is too centered and audio that is too clean give the format away. Part of the work in an AI production is actually removing polish rather than adding it.",
          "And the fourth is length. A UGC video that runs past 30 seconds could almost always have been half that, and most of what gets cut is a preamble nobody asked for. If you are unsure where to cut, cut from the start.",
        ],
      },
      {
        heading: "Where it simply does not work",
        paragraphs: [
          "A genuine testimonial from a happy customer. There is no substitute for it, and if you have a customer willing to talk to a camera, that is worth more than anything you can produce.",
          "Products that depend on precise physical detail, like fabric that has to look exactly as it does in reality down to the stitching, or food that has to look fresh in a specific way. Real photography still wins there, and you can combine the two: real product shots with [an environment built in AI](/en/guides/ai-product-photos-without-a-studio).",
          "Also: if your brand rests on factual credibility, like medicine or finance, be especially careful with anything that reads as a personal recommendation.",
        ],
      },
      {
        heading: "What this looks like as an actual workflow",
        paragraphs: [
          "It starts with deciding who the character is and what she is selling, not with the tool. You build her once and keep her, because a character that shifts between videos breaks the whole effect. Then you write short scripts for each variation, and only at the end do you produce.",
          "The part people underestimate is the edit. Pacing, cuts, captions and sound are the difference between something that looks like a tool output and something that looks like content. It is also the part that takes the longest, and that is fine.",
        ],
      },
      {
        heading: "What has to be disclosed, and that is not a judgment call",
        paragraphs: [
          "Commercial content has to be marked as commercial. That is true for a paid creator's content, and it is equally true for a video you produced yourself. Clear disclosure, in the video or in the caption, is not something that hurts performance, and it is what prevents a complaint or a takedown.",
          "AI production adds a second question: is it clear to the viewer that the character is not a real person. When the video makes no claim about identity, like a product demo or an explainer, this is usually not an issue. When it is framed as personal testimony, it is, and that is exactly the line described above. When in doubt, rewrite it so the video explains rather than testifies.",
        ],
      },
      {
        heading: "What to measure after you post",
        paragraphs: [
          "Not likes. The number that matters on a UGC video is how many people stayed past three seconds, and how many reached the end. Facebook and Instagram both give you these, and most people never open that screen.",
          "If three-second retention is low, the problem is the opening rather than the product, and you can fix it in a new version within hours. If retention is high but nobody clicks, the problem is the call to action or the match between the video and the landing page. Those two problems look identical in a summary report and need opposite fixes, which is exactly why they are worth reading separately.",
        ],
      },
    ],
  },
  {
    slug: "ugc-video-cost-israel-2026",
    title: "What a UGC Video Costs in Israel in 2026: Human Creator vs AI",
    excerpt: "What actually sets the price of a UGC video, what creators in Israel charge, and where AI makes it cheaper and where it does not.",
    category: "AI Visuals & Content",
    image: "/images/guides/cover-ai-visual.png",
    readTime: "5 min read",
    datePublished: "2026-09-02",
    relatedServiceSlug: "ai-content",
    sections: [
      {
        heading: "Why two quotes for the same video can differ by 5x",
        paragraphs: [
          "Ask around for a quote on a UGC video and you will get 1,500 shekels from one place and 12,000 from another, which sounds like somebody is trying it on. Usually nobody is. You are being sold two completely different things under the same name.",
          "Four things set the price: the size of the creator's audience, how long and where you are allowed to use the video, how many versions you get, and who writes the script. Changing any one of them moves the number more than any negotiation will.",
        ],
      },
      {
        heading: "The ranges I see in the Israeli market",
        paragraphs: [
          "A small creator, up to a few thousand followers, generally works in the 800 to 2,500 shekel range per video, and sometimes for product alone. A mid-tier creator with a real audience and an organized portfolio sits between 3,000 and 8,000. A well-known creator with a large following starts around 10,000 and runs to 15,000 shekels and up for a single video.",
          "Going through an agency or a marketplace usually adds 20 to 30 percent on top of the creator's rate. That is not necessarily waste, because someone is coordinating, holding the schedule and taking responsibility for the deliverable. It is worth knowing that is what the extra buys.",
          "Timelines have a price of their own. Two weeks from booking to delivery is a reasonable standard. A rush job for the coming week typically adds 30 to 50 percent, if anyone agrees to it at all.",
        ],
      },
      {
        heading: "How to find a creator, and what to check before you commit",
        paragraphs: [
          "Most businesses find a creator through an Instagram search or a referral, and choose based on how good the profile looks. That is the least relevant signal available. A creator with 40,000 followers whose entire feed is about themselves does not necessarily know how to sell somebody else's product, and that is a different skill.",
          "What is worth checking: ask to see two or three UGC videos they produced for brands, not personal content. Notice whether they talk about the product like a person or like a voice-over artist. And if you can, ask the previous brand whether the video actually ran in a campaign or was just posted and forgotten.",
          "And the most important question, which almost nobody asks: who writes the script. If the answer is you, that is work that landed on you and was never priced. If the answer is the creator, ask to see a script they wrote before you approve anything.",
        ],
      },
      {
        heading: "The clause that surprises almost every business: you are not buying the video",
        paragraphs: [
          "This is the most expensive misunderstanding in the category. Most businesses assume that once they have paid, the video is theirs forever and for anything. What you actually buy by default is a limited license: usually organic use on your own channels, for a fixed period.",
          "Where it blows up is the moment you want to put money behind it. Use in a paid campaign, and certainly running the ad from the creator's own account, is a separate line item priced separately, and it often doubles the cost. Exclusivity against competitors is an add-on too, not something that comes automatically.",
          "Before signing, ask three questions: how long the license runs, whether it covers paid promotion, and whether the creator can shoot for your competitor next month. The answers change the real price far more than the number on the quote.",
        ],
      },
      {
        heading: "What happens to the numbers when you produce it with AI",
        paragraphs: [
          "Here the cost structure flips. The tools themselves are cheap, on the order of a few hundred shekels a month in subscriptions. The real cost is the work around them: deciding who the character is, building her once so she stays consistent, writing scripts and editing. I broke that calculation down in full in the [AI video pricing guide](/en/guides/ai-video-cost-guide).",
          "The practical difference is not in the first video, it is in the fifth. With a human creator every additional version is another production at close to full price. In an AI production, once the character and the style exist, another version costs a fraction of the first and takes hours instead of weeks.",
          "And there is no licensing problem. It is your content, with no expiry date and no question about what happens if you want to run it as a paid ad six months from now.",
        ],
      },
      {
        heading: "Budget a campaign, not a video",
        paragraphs: [
          "Most people budget for one video, which is exactly why the budget runs out before the campaign starts working. A single video is a guess. To know what works you need five to ten versions and you let the data decide, which I covered in the [guide on how many campaign variations you need](/en/guides/how-many-campaign-variations).",
          "So the right calculation is not 5,000 shekels for a video, it is what a testable set of eight versions costs. On the human route that reaches tens of thousands and a month of work quickly. That is precisely where small businesses give up on the format altogether, even though it suits them.",
        ],
      },
      {
        heading: "What happens when the video works, and why that costs money",
        paragraphs: [
          "This is the scenario most worth preparing for, because it looks like success and arrives with an invoice. A video that performs well is one you will want to run again in two months, at a larger budget, maybe in an additional format. Any of those three can fall outside the original license.",
          "The expensive mistake is discovering this after you have already posted. Locking in an extension option up front, even one you never exercise, is far cheaper than going back to the creator once the campaign is running and you have no alternative. A creator who knows you are dependent prices accordingly, and that is reasonable of them.",
          "In an AI production this problem does not exist, and it is an advantage that is hard to value until you hit it. Your set, with no clock running.",
        ],
      },
      {
        heading: "Where you should not be saving money",
        paragraphs: [
          "On a genuine testimonial from a happy customer. If you have a customer willing to talk to a camera, that is worth more than any production, and there is no substitute for it. I went into that boundary in the [guide on why UGC works](/en/guides/ai-ugc-content-that-converts).",
          "On music. Using a popular track without a license in a paid campaign is a fast route to a takedown or a claim, and it happens far more often than people think.",
          "And on the edit. You can cut cost at almost any stage of production, but pacing, cuts and captions are what decide whether anyone stops on the video in the first second. A cheap video nobody watches is the most expensive option on the list.",
        ],
      },
    ],
  },
  {
    slug: "ai-character-consistency",
    title: "Why It's Hard to Keep a Character Consistent in AI, and How to Solve It",
    excerpt: "The technical problem that separates amateur AI production from professional AI production.",
    category: "AI Visuals & Content",
    image: "/images/guides/cover-ai-visual.png",
    readTime: "2 min read",
    datePublished: "2026-09-13",
    heroVideo: "/videos/raz-showreel-4.mp4",
    heroImage: "/images/guides/character-consistency-ai.jpg",
    relatedServiceSlug: "ai-content",
    sections: [
      {
        heading: "The problem",
        paragraphs: [
          "AI tools for generating video and images tend to \"forget\" details between scenes: a face changes slightly, clothes shift, a product looks a bit different in every image. This is what makes AI content look \"not real.\"",
        ],
      },
      {
        heading: "Why this happens",
        paragraphs: [
          "Every generation is essentially a new process based on text/visual instructions, with no built-in \"memory\" between images, unless you deliberately build that in with dedicated techniques and consistent reference assets.",
        ],
      },
      {
        heading: "How it's actually solved",
        paragraphs: [
          "Building a \"consistent asset\" (a precise visual reference for the character/product) and using it as the basis for every scene, together with manual editing that corrects small deviations. This is the technical work that determines whether the production looks professional or not.",
        ],
      },
      {
        heading: "How to check consistency quality",
        paragraphs: [
          "Comparing facial features, lighting, and angles between adjacent scenes. A trained eye spots inconsistency within seconds, which is exactly why careful manual review is an inseparable part of the process.",
        ],
      },
      {
        heading: "How much time this adds to a production",
        paragraphs: [
          "Building a quality consistent asset can add a day or two to the process, but that's exactly the investment that determines whether the final result looks professional or amateur.",
        ],
      },
    ],
  },
  {
    slug: "image-to-video-ai-explained",
    title: "From a Static Image to a Video: How It Works",
    excerpt: "Have a good product photo? That's all you need to get started.",
    category: "AI Visuals & Content",
    image: "/images/guides/cover-ai-visual.png",
    readTime: "2 min read",
    datePublished: "2026-09-14",
    heroVideo: "/videos/raz-showreel.mp4",
    heroImage: "/images/guides/image-to-video-eich-ze-oved.jpg",
    relatedServiceSlug: "ai-content",
    sections: [
      {
        heading: "The basic principle",
        paragraphs: [
          "AI tools take a static image (a product, a logo, a brand photo) and generate motion from it (a subtle zoom, a rotation, shifting light), turning it into a short video asset.",
        ],
      },
      {
        heading: "Who this is especially useful for",
        paragraphs: [
          "Businesses with an existing archive of product photos who want video content without a new shoot. It's also a fast way to turn an existing image campaign into video content for social media.",
        ],
      },
      {
        heading: "What determines the result",
        paragraphs: [
          "The quality and resolution of the original image directly affects the result: a sharp, properly lit image produces a far more convincing video than a blurry one.",
        ],
      },
      {
        heading: "What improves the result",
        paragraphs: [
          "An image with a clean background and even lighting gives the AI tool a better base to work with. A cluttered background or unevenly lit image makes smooth motion harder to achieve.",
        ],
      },
      {
        heading: "Less obvious uses",
        paragraphs: [
          "Turning a static logo into a short animation for a video's opening, or bringing an old product photo back to life without reshooting when there's no longer access to the physical product.",
        ],
      },
    ],
  },
  {
    slug: "ai-product-photos-without-a-studio",
    title: "Professional Product Photos Without a Studio Shoot",
    excerpt: "Backgrounds, lighting, and angles: all of it can be generated with AI from an existing product.",
    category: "AI Visuals & Content",
    image: "/images/guides/cover-ai-visual.png",
    readTime: "2 min read",
    datePublished: "2026-08-15",
    heroVideo: "/videos/raz-showreel-5.mp4",
    heroImage: "/images/guides/tmunot-mutzar-ai-bli-studio.jpg",
    relatedServiceSlug: "ai-content",
    sections: [
      {
        heading: "What's actually possible",
        paragraphs: [
          "Changing the background of an existing product photo, adding virtual studio lighting, generating several angles from one image, all without coordinating a reshoot or renting a studio.",
        ],
      },
      {
        heading: "When it beats real photography",
        paragraphs: [
          "When you already have a good base product photo and need additional versions (different backgrounds for different platforms, different seasons), instead of hiring a photographer again for every variation.",
        ],
      },
      {
        heading: "When real photography is still worth it",
        paragraphs: [
          "When there's no quality base image to start from at all, or when the product itself requires precise documentation (texture, true dimensions) that's hard to reproduce with AI.",
        ],
      },
      {
        heading: "What happens when you request too many variations",
        paragraphs: [
          "Too many versions without a clear direction leads to wasted time choosing between similar options. It's better to define 2-3 desired background styles in advance and request exactly those.",
        ],
      },
      {
        heading: "Combining it with real photography",
        paragraphs: [
          "You don't have to choose one or the other: one high-quality product photo can serve as the base for dozens of AI variations, a combination that maximizes both quality and quantity.",
        ],
      },
    ],
  },
  {
    slug: "what-is-a-concept-ad",
    title: "What Is a Concept Ad, and Why It's Worth Seeing One Before You Order a Commercial",
    metaTitle: "What Is a Concept Ad and Why See One Before You Order · RAZ",
    excerpt: "Demo pieces that show exactly what to expect, without paying for a real project just to find out.",
    category: "AI Visuals & Content",
    image: "/images/guides/cover-ai-visual.png",
    readTime: "2 min read",
    datePublished: "2026-09-15",
    heroVideo: "/videos/raz-showreel-2.mp4",
    heroImage: "/images/guides/ma-ze-concept-ad.jpg",
    relatedServiceSlug: "ai-content",
    sections: [
      {
        heading: "What a Concept Ad is",
        paragraphs: [
          "A concept ad is a demo piece, built like a real project (concept, consistent assets, editing) but with no real client behind it, and clearly labeled as such.",
        ],
      },
      {
        heading: "Why it's useful before ordering",
        paragraphs: [
          "It's the best way to see exactly the finish level and style of whoever is producing for you, before investing in a full project. Generic demo images don't give you the same precise picture.",
        ],
      },
      {
        heading: "What to check in a concept piece",
        paragraphs: [
          "Visual consistency throughout the whole video, editing quality (not just raw generation), and a clear label that it's a concept piece and not a commissioned project.",
        ],
      },
      {
        heading: "How it differs from a regular commercial",
        paragraphs: [
          "A concept ad isn't meant to sell a real product: it's meant to demonstrate a level of capability. That changes the whole process: more creative freedom, fewer constraints from a real brand.",
        ],
      },
      {
        heading: "What to expect from a good concept piece",
        paragraphs: [
          "Full visual consistency, meticulous editing, and a clear label that it's a concept piece. If any of the three is missing, that's a sign the production quality won't carry over to a real project.",
        ],
      },
    ],
  },
  {
    slug: "how-many-campaign-variations",
    title: "How Many Creative Variations Does a Successful Campaign Need",
    metaTitle: "Campaign Content Variations · How Many a Campaign Needs · RAZ",
    excerpt: "More isn't always better: how to know how many variations you actually need.",
    category: "AI Visuals & Content",
    image: "/images/guides/cover-ai-visual.png",
    readTime: "2 min read",
    datePublished: "2026-08-15",
    heroVideo: "/videos/raz-showreel-4.mp4",
    heroImage: "/images/guides/kama-variaziot-kampain.jpg",
    relatedServiceSlug: "ai-content",
    sections: [
      {
        heading: "Why you need more than one version in the first place",
        paragraphs: [
          "Different audiences respond to different message angles, and different platforms (story, feed, ad) require different formats. One version tries to fit everyone and only partially succeeds.",
        ],
      },
      {
        heading: "How many is actually enough",
        paragraphs: [
          "3-4 different message variations (not just color/font) are usually a good starting point for a real A/B test, without spreading budget across too many directions at once.",
        ],
      },
      {
        heading: "How AI helps here",
        paragraphs: [
          "Instead of producing each variation from scratch with a film crew, AI makes it possible to generate several versions significantly faster from the same consistent assets, which makes real A/B testing practical even on a limited budget.",
        ],
      },
      {
        heading: "How to choose which variations to test",
        paragraphs: [
          "Don't change everything at once between versions: change one variable at a time (message, color, call to action) so you know clearly what exactly affected the result.",
        ],
      },
      {
        heading: "When to stop testing and start running",
        paragraphs: [
          "The moment there's a clear, consistent difference between variations over enough time and exposure. A test that stops too early gives a misleading picture.",
        ],
      },
    ],
  },
  {
    slug: "wordpress-vs-custom-development",
    title: "WordPress vs. Custom Development: What Fits Your Business",
    excerpt: "The direct comparison, not which one is better, but what's right for your specific need.",
    category: "Websites & Development",
    image: "/images/guides/cover-web-dev.png",
    readTime: "2 min read",
    datePublished: "2026-09-16",
    heroVideo: "/videos/raz-showreel.mp4",
    heroImage: "/images/guides/wordpress-mul-pituach-mutam.jpg",
    relatedServiceSlug: "web-design",
    sections: [
      {
        heading: "WordPress wins when...",
        paragraphs: [
          "You need to edit content yourselves on an ongoing basis, you depend on ready-made plugins (a store, sign-ups), or the budget is limited and you need a fast result at a relatively low cost.",
        ],
      },
      {
        heading: "Custom development wins when...",
        paragraphs: [
          "You need maximum performance, interactivity that doesn't exist in any template, or a unique user experience that's part of the brand's own identity, not just \"another good site.\"",
        ],
      },
      {
        heading: "You can have both",
        paragraphs: [
          "It's not unusual to combine the two: a WordPress brochure site for ongoing content management, alongside a custom landing page for a specific campaign that needs high performance. The choice doesn't have to be binary.",
        ],
      },
      {
        heading: "A question really worth asking before deciding",
        paragraphs: [
          "Who will actually update the site after launch: an in-house team, or always me? That answer alone usually decides between WordPress and custom development more than any other consideration.",
        ],
      },
      {
        heading: "Long-term maintenance cost",
        paragraphs: [
          "WordPress tends to cost less in ongoing maintenance if content is updated independently. Custom development may require more reliance on a developer for changes, but delivers higher performance and flexibility.",
        ],
      },
    ],
  },
  {
    slug: "ai-video-cost-guide",
    title: "How Much Does an AI Video Cost for a Business · A Pricing Guide",
    excerpt: "Real price ranges for AI video production in 2026, what actually moves the number, and how to tell if a quote you received makes sense.",
    category: "AI Visuals & Content",
    image: "/images/guides/cover-ai-visual.png",
    readTime: "5 min read",
    datePublished: "2026-09-02",
    heroVideo: "/videos/raz-showreel-7.mp4",
    heroImage: "/images/guides/kama-ole-srton-ai.jpg",
    relatedServiceSlug: "ai-content",
    sections: [
      {
        heading: "Why there is no single price for an AI video",
        paragraphs: [
          "When someone asks me what an AI video costs, the honest answer is that it depends on what they mean by \"video\". A 10-second product clip with one moving frame is not the same thing as a 30-second commercial with a character who recurs across five scenes and stays the same character in all of them. Both get called an AI video, and the gap between them can be five times the cost.",
          "So instead of one number, here are the real ranges and the things that actually move them.",
        ],
      },
      {
        heading: "Price ranges in the Israeli market in 2026",
        paragraphs: [
          "A full professional production, meaning a marketing script, a storyboard, consistent visual assets, editing and sound, runs between ₪5,000 and ₪15,000. That is the band where most videos that genuinely look like commercials, rather than like experiments, actually sit.",
          "Below that there is a whole category of short social videos, 10 to 20 seconds, one concept, no character that has to stay consistent across scenes. The cost there is meaningfully lower, because most of the expensive work simply isn't required.",
          "For comparison, an equivalent traditional video production historically started around ₪10,000 and went up from there, before counting a shoot day, a crew and equipment.",
        ],
      },
      {
        heading: "What actually moves the price",
        paragraphs: [
          "Three things, in order. First is consistency: if a character or product has to look identical in every scene, that is a build job of its own before production even starts. Second is the number of scenes, because each scene is its own small production. Third is how many versions you need at the end, which I covered separately in the [guide on how many campaign variations you need](/en/guides/how-many-campaign-variations).",
          "What barely affects the price, counterintuitively, is the length of the video itself. A 30-second video with three scenes is cheaper than a 15-second video with eight.",
        ],
      },
      {
        heading: "What you need to bring, and how much it changes the price",
        paragraphs: [
          "This is the item nobody asks about and it moves the price more than negotiating does. A brand that arrives with a proper brand file, vector logo, colors, fonts and high-quality product shots, saves a full day of work. A brand that arrives with a screenshot of its logo taken off Instagram adds that day back.",
          "The second thing worth bringing is reference. Two or three videos you like, with one sentence each on what specifically you liked about them. It sounds small, but it shortens the first revision round dramatically, because otherwise that round is really just an expensive way of discovering what you wanted.",
          "And the third: decide who approves. A project where three people approve in sequence costs more than one with a single approver, even when the deliverable is identical, because every extra round is work.",
        ],
      },
      {
        heading: "The myth that confuses people most: \"AI is free, so why does this cost money\"",
        paragraphs: [
          "This is the question I get most, and it's a fair one. Yes, a subscription to a production tool costs tens to a few hundred shekels a month. But the tool is not the production, the same way a camera is not a film.",
          "The real cost is creative work time: shaping a concept that fits the brand, building a character or product that stays consistent, running dozens of variations until a scene sits right, then editing, timing and sound. Anyone selling you an AI video for a few hundred shekels is selling you a tool's output, not a production. Sometimes that is exactly what you need, and then it's a good deal. For a commercial meant to represent a brand, it isn't.",
        ],
      },
      {
        heading: "Why it is still far cheaper than traditional production",
        paragraphs: [
          "Because the entire logistics cost disappears. No shoot day, no location, no crew, no equipment, no casting and no coordinating five people's calendars. What's left is creative work time, and that is what you're paying for.",
          "In practice that lands at a quarter or less of an equivalent traditional production, with delivery in one to three days instead of weeks. I went into how that process actually works in the [guide on AI videos for businesses](/en/guides/ai-videos-for-business).",
          "The real limitation: some things traditional production still does better. Filming actual people from your team, a product that has to look exactly like it does in reality down to the stitching, or documentary footage. Real filming still wins there.",
        ],
      },
      {
        heading: "And how long it takes",
        paragraphs: [
          "A short social video, one concept, no character that has to stay consistent, is usually one to three days. A full ad with a character recurring across several scenes is one to two weeks, and most of that time is not rendering, it is decisions: approving the concept, approving the character, revision rounds.",
          "What actually stretches projects is almost always waiting on approvals and materials from the client, not the production itself. I broke the process into stages in the [guide on how long an AI commercial takes](/en/guides/ai-commercial-production-timeline).",
        ],
      },
      {
        heading: "What is usually not in the base price",
        paragraphs: [
          "Original music, as opposed to a library license. Professional voiceover, especially in more than one language. Extra variations beyond a single version, including crops to different formats for each platform.",
          "None of these are unfair add-ons, they are simply additional work. But it's worth asking about them upfront, because they are the most common reason one quote looks cheap and another looks expensive for the exact same deliverable.",
        ],
      },
      {
        heading: "The common budgeting mistake: pricing one video instead of a set",
        paragraphs: [
          "Most people arrive with a budget for one video, then discover after two weeks of running it that they cannot tell whether the creative is not working or the audience is wrong, because they have nothing to compare against. A single video is one data point, and one point tells you nothing.",
          "The right calculation is what a set of six to eight testable versions costs. In AI production this is where the economics work in your favor, because once the character and the style exist, each additional version costs a fraction of the first. The same logic applies to UGC, which I laid out in the [UGC video pricing guide](/en/guides/ugc-video-cost-israel-2026).",
          "In practice: if you have 12,000 shekels, a set of six good versions almost always beats one perfect ad.",
        ],
      },
      {
        heading: "How to compare two quotes",
        paragraphs: [
          "Ask three questions. How many revision rounds are included, and what happens on the fourth. Which final files you receive, and in which aspect ratios. And who owns the assets created along the way, for example a character built specifically for your brand.",
          "The answer to the third one surprises people. If a consistent brand character was built for you, it has value in the next campaign too. It's worth being clear upfront about whether it stays with you.",
          "One last thing worth checking: ask to see a complete finished video, not a reel of pretty frames. A single frame can almost always be made to look good. A whole video that stays consistent for 30 seconds is what proves real capability.",
        ],
      },
    ],
  },
  {
    slug: "law-firm-website-checklist",
    title: "Building a Website for Lawyers: What It Actually Needs to Generate Inquiries",
    excerpt: "What makes a client in crisis actually fill out a contact form instead of closing the tab, and why a generic brochure site isn't enough for a law firm.",
    category: "Websites & Development",
    image: "/images/guides/cover-web-dev.png",
    readTime: "4 min read",
    datePublished: "2026-08-16",
    relatedServiceSlug: "web-design",
    sections: [
      {
        heading: "Why a Lawyer's Website Isn't a Regular Brochure Site",
        paragraphs: [
          "When someone searches for a lawyer on Google, they're already in the middle of a crisis or a major decision: divorce, a lawsuit, a contract, an inheritance. That's fundamentally different from someone looking for a coffee shop or a clothing store. They're not just \"browsing\": they're checking whether they can trust the person behind the website. A [generic brochure site](/en/guides/professional-brochure-site-checklist) with an \"About,\" \"Services,\" and \"Contact\" page doesn't answer that question.",
          "The difference shows up in the numbers too: pages focused on a specific practice area (say, \"divorce lawyer Tel Aviv\" instead of just \"lawyer\") convert several times more inquiries than one general page that lists every practice area in a flat row.",
        ],
      },
      {
        heading: "What Actually Builds Trust When Everyone Claims to Be \"The Most Professional\"",
        paragraphs: [
          "Every law firm writes about its own professionalism, reliability, and experience. Those are empty words without concrete proof behind them. What actually works: a real number of years of experience, precise specializations (not \"family law\" but \"divorce involving complex assets\" or \"child custody\"), and a focused outcome description, not \"we've won a lot of cases\" but a specific case, without exposing identifying client details.",
          "A real photo of the lawyer (not a stock photo of someone in a suit standing in front of a bookshelf) meaningfully changes the visitor's opening attitude. Clients want to know who they're about to talk to before they pick up the phone.",
        ],
      },
      {
        heading: "The Structure That Actually Drives Inquiries on a Practice-Area Page",
        paragraphs: [
          "A separate page for each practice area, not one page with a list, containing: a short explanation of the problem the client is dealing with in their own language, not legal jargon; what actually happens in the process (how long, what stages); and roughly what it costs. Even a wide range beats silence, because people are afraid to ask \"how much does this cost\" and it's better to answer that upfront.",
          "A \"Schedule a Consultation\" button should appear at least twice on the page: once near the top, before people even read the content, and again at the end after they're convinced. A short form (name, phone, brief case description) works far better than a long form with ten fields.",
        ],
      },
      {
        heading: "What Has to Appear on Every Page of the Site",
        paragraphs: [
          "A phone number for direct dialing, not just a form, especially on mobile, because someone in crisis wants to talk to a person now, not wait for the next business day. Real availability hours, including whether there's weekend or evening coverage for urgent cases.",
          "Real testimonials with a first name and a case description, with the client's consent of course, are worth far more than a generic star rating. And if the firm is registered with the bar association or a professional body, it's worth showing that clearly, not hiding it at the bottom of the page.",
        ],
      },
      {
        heading: "Common Mistakes That Kill Inquiries",
        paragraphs: [
          "The most common mistake: hiding the price entirely and redirecting everything to \"contact us for details.\" That backfires: it increases uncertainty at exactly the moment the client most needs confidence. A general price range beats total silence by a wide margin.",
          "Second mistake: a menu with ten or fifteen different practice areas with no clear hierarchy. That makes the client feel the firm \"does everything\" and therefore isn't an expert in anything. It's better to clearly present three or four core areas, even if the firm actually handles more than that.",
        ],
      },
      {
        heading: "What Happens After the Form Gets Submitted",
        paragraphs: [
          "Many firms invest heavily in the landing page and completely neglect what happens afterward: no confirmation message, no clear response window (\"we'll get back to you within 24 hours,\" for example), and the client is left not knowing whether the inquiry was even received. That's the biggest gap between websites that generate real results and websites that just \"look good.\"",
          "A [connection to a CRM system](/en/guides/wordpress-api-integrations), or at minimum an actively monitored inbox rather than \"someone will check it when they have time,\" is the difference between an inquiry that turns into a client and one that disappears within two days.",
        ],
      },
    ],
  },
  {
    slug: "how-many-creatives-per-month-meta-ads",
    title: "How Many Creatives a Month Does a Meta Campaign Need: The Real Number by Budget",
    excerpt:
      "How many new ads a Meta campaign needs each month by media budget, how to spot creative fatigue, and how to hit that number without a shoot every week.",
    category: "AI Visuals & Content",
    image: "/images/guides/cover-ai-visual.png",
    readTime: "5 min read",
    datePublished: "2026-10-15",
    relatedServiceSlug: "ai-content",
    sections: [
      {
        heading: "Why an ad that worked stops working after three weeks",
        paragraphs: [
          "A good Meta ad does not die because it got worse. It dies because the same people saw it too many times. The first time it stops the scroll, by the fourth the eye skips it, and by the eighth it is irritating. That is creative fatigue, and in 2026 campaigns it arrives within two to three weeks, not months like it used to.",
          "The practical consequence is simple: creatives are not a launch question, they are a cadence question. How many versions to test when a campaign starts is a separate topic, covered in [my guide on campaign variations](/en/guides/how-many-campaign-variations). The question here is different: how much new material has to go in every month so the campaign keeps selling after the first winner wears out.",
        ],
      },
      {
        heading: "A bigger budget does not extend an ad's life, it shortens it",
        paragraphs: [
          "Plenty of business owners assume that if an ad works, you raise its budget and it works harder. In practice, doubling spend on the same audience roughly doubles how fast those people see it again. An ad that lasted five weeks on 3,000 NIS a month can burn out in two weeks on 20,000.",
          'That is also why brands that scale up suddenly feel the campaign has "broken". The media did not break and nobody ruined the pixel; the material ran out. As budget grows, creative stops being a one-off expense and becomes a consumable, like stock in a warehouse.',
        ],
      },
      {
        heading: "The number by monthly media budget",
        paragraphs: [
          "These ranges work as a starting point for a Meta sales campaign aimed at an Israeli audience that is not tiny. Up to 5,000 NIS a month: two to four new creatives a month. At this level frequency climbs slowly, and a good ad can last a month or more.",
          "Between 5,000 and 10,000 NIS: one or two a week, so four to eight a month. Between 10,000 and 50,000 NIS: four to eight a week, so 16 to 30 a month. Above 50,000 NIS, brands are already working with ten or more a week, and the limit is usually production capacity rather than money.",
          "That number sounds excessive to anyone who has never spent 20,000 NIS a month on media. Anyone already there knows it from the other side: from the week cost per purchase jumped for no visible reason.",
        ],
      },
      {
        heading: "Not every change counts as a new creative",
        paragraphs: [
          "This is where most counts lie. Changing a button colour or one line of copy is not a new creative, and Meta's system knows it: since the 2025 algorithm updates it groups ads that look too similar and treats them almost as one. Ten colour versions of the same video buy you very little time.",
          "Think in two layers. A concept is a different idea: another angle, another claim, another situation, as I explained in [the guide to concept ads](/en/guides/what-is-a-concept-ad). A variation is the same concept with a different hook, length or format. A new concept brings a campaign back to life; a variation extends the life of a concept that already works.",
          "A rule of thumb that holds up: at least a third of each month's new material should be a genuinely new concept. The rest can be variations of what has already proven itself.",
        ],
      },
      {
        heading: "How to work out your own number without guessing",
        paragraphs: [
          "The ranges above are averages. The real calculation depends on two variables: how big the audience is, and how fast you move through it. An audience of 200,000 people in one city wears out far faster than a national audience of two million, on exactly the same budget.",
          "The practical way: open Ads Manager, look at the last seven days' frequency on your main campaign, and check how long your last winning ad lasted before cost per result started to climb. If it lasted three weeks and you run four active ads in parallel, you need to replace roughly one and a half ads a week just to stand still.",
        ],
      },
      {
        heading: "Three signs a creative has worn out",
        paragraphs: [
          "First: frequency in a cold audience passes 3 a week and keeps rising. Second: click-through rate drops 20 to 30 percent from the first week, with no change in audience or offer. Third: cost per thousand impressions rises, and cost per result rises with it.",
          "When all three show up together, there is no point tweaking audience settings or bidding. It is not a technical fault; it is a signal that you need new material. The common mistake is waiting until the ad is fully dead before starting production, which leaves a two-week gap where the budget runs on worn-out creative.",
        ],
      },
      {
        heading: "How to reach 20 creatives a month without 20 productions",
        paragraphs: [
          "Twenty shoot days a month is not realistic for any mid-sized brand. What is realistic is thinking in multiples: five concepts a month, and three or four cuts of each. A different hook in the first three seconds, a 15-second and a 30-second version, and formats for Stories and Feed. Five concepts become 15 to 20 genuinely different ads.",
          "This is where AI production changes the maths, because a video that needs no location, cast or crew can be produced again every week, and a scene can change without going back to set. For comparison, in my monthly package five videos cost 6,000 NIS, which is 1,200 NIS per concept. Market-wide price ranges are in [the AI video cost guide](/en/guides/ai-video-cost-guide).",
          "The honest limitation: AI does not replace everything. A product the buyer needs to see in a real person's hands, or a real customer's testimonial, still needs a camera. The mix that works is AI for volume and concepts, and real footage where credibility is the message, as covered in [the UGC guide](/en/guides/ai-ugc-content-that-converts).",
        ],
      },
      {
        heading: "The most expensive mistake: producing in waves",
        paragraphs: [
          "The pattern repeats itself: a brand shoots 12 videos in one day, uploads all of them at once, and three months later has nothing left. In the first weeks there is too much material and the algorithm spreads the budget across it. By the third month there is not enough, and cost per purchase climbs.",
          "The same 12 videos, released three or four a month, perform far better. The campaign gets fresh material before the previous batch wears out, and there is time to learn what worked and let it shape the next concept. Steady cadence beats volume almost every time, and that is exactly the difference between a production and [ongoing content](/en/services/ai-content).",
        ],
      },
    ],
    faq: [
      {
        q: "Can I run a Meta campaign with just one creative?",
        a: "You can, but it will usually last two to four weeks before cost per result starts rising. Without more material the algorithm has nothing to choose between, and you cannot tell whether the problem is the ad or the offer. The sensible minimum is three active ads in parallel.",
      },
      {
        q: "How long does a Facebook or Instagram ad last on average?",
        a: "On a campaign spending 10,000 NIS a month or more, a good ad usually lasts two to three weeks before performance drops. On small budgets, or a broad national audience, it can last a month or more. The metric to watch is weekly frequency, not the number of days.",
      },
      {
        q: "How many ads should run at once in one ad set?",
        a: "Three to six is a good working point for most businesses. Fewer than three gives the algorithm too few options, and more than ten on a mid-sized budget spreads the money so thin that no ad gets enough impressions to learn from.",
      },
      {
        q: "What does it cost to produce 20 creatives a month?",
        a: "It depends how many are new concepts and how many are variations. With AI production, five concepts a month cost 6,000 NIS with me, and each concept can yield several cuts. A traditional shoot day usually comes out far higher, because every scene change means going back to set.",
      },
      {
        q: "Do still images count as creatives, or does it have to be video?",
        a: "Stills absolutely count, and in some categories, such as products with a clear price, they beat video. A common mix is roughly one third stills and two thirds short video. What matters is that the idea is different, not the format.",
      },
    ],
  },
  {
    slug: "ai-built-website-cost",
    title: "How Much Does an AI-Built Website Cost: Prices Compared to a Traditional Build",
    excerpt:
      "What an AI-built website costs in each of the three ways to build one, how that compares to WordPress and a traditional build, and the real cost over three years.",
    category: "Websites & Development",
    image: "/images/guides/cover-web-dev.png",
    readTime: "6 min read",
    datePublished: "2026-10-16",
    relatedServiceSlug: "web-design",
    sections: [
      {
        heading: '"An AI-built website" means three different things, at three different prices',
        paragraphs: [
          "When someone asks me what an AI-built website costs, I first ask what they mean. Three completely different approaches all go by that name: an AI site builder you run yourself, like Lovable, Base44 or Wix's AI assistant. A developer who builds the site with AI tools, what is now called [vibe coding](/en/guides/what-is-vibe-coding). And alongside them, the traditional build: WordPress with Elementor, or fully hand-written development.",
          "Most of the confusion about price comes from comparing the first approach to the third and concluding that an AI site costs next to nothing. That compares different products, roughly like comparing renting power tools with hiring a contractor.",
        ],
      },
      {
        heading: "Building it yourself with AI tools: cheap in money, expensive in time",
        paragraphs: [
          "The tools themselves usually cost between 100 and 300 NIS a month at the time of writing, plus a domain for a few dozen shekels a year. For a personal page, testing an idea, or a site that has to go up today regardless of how it looks, that is a perfectly legitimate option.",
          "The real cost comes later. Anyone who has built this way knows the moment every small fix burns credits, and the tool fixes one thing and breaks two. Hebrew adds its own problems: right-to-left alignment that breaks in forms, fonts that do not support the script well, and menus that flip on mobile. And even when everything looks right, basic SEO such as a title and description per page and a sitemap is not always there.",
          "I do not rule this approach out. But if the site is meant to bring customers from Google or carry a paid campaign, count your own hours too. Twenty evenings of trial and error are a real cost, even if they never appear on an invoice.",
        ],
      },
      {
        heading: "A developer working with AI: the same ranges, less time",
        paragraphs: [
          "Here prices look like the regular market, because in the end you pay for the same things: planning, design, content and testing. A landing page starts around 3,000 NIS, a simple brochure site runs 2,500 to 5,000, and with a blog and built-in SEO 8,000 to 12,000. A store starts at roughly 15,000. The full breakdown of what goes into each range is in [the website cost guide](/en/guides/website-cost-guide-2026).",
          "The difference is mostly time. A landing page that once took two weeks can go live in two days, as I described in [the guide to a landing page in two days](/en/guides/landing-page-in-two-days), and a brochure site that takes one or two months traditionally goes up in one to three weeks. Developers who work this way usually price in the lower half of the range for the same scope, but not at half the price.",
        ],
      },
      {
        heading: "The myth: AI cuts the price of a website in half",
        paragraphs: [
          "The common expectation is that if the computer writes the code, the price should drop accordingly. In practice, writing code was only one of several parts of a quote, and not always the biggest. Deciding what goes on each page, the copy, the images, the review rounds with you and the setup for Google are still human work.",
          'So the time saving can be dramatic, from weeks to days, but the money saving is smaller. Someone offering a full brochure site for 800 NIS "because it\'s AI" is probably selling you the first approach from the previous section, just pressing the buttons for you.',
          "What does come down is the cost of changes. A round of revisions that once took a working day now takes an hour, so a vendor working with AI can afford to include more rounds at the same price. That is the real value to look for in a quote, more than a discount on the final number.",
        ],
      },
      {
        heading: "The comparison that actually matters: what the site costs over three years",
        paragraphs: [
          "The build price is only the start. A WordPress site needs hosting, usually 30 to 100 NIS a month, licences for plugins like Elementor Pro, and ongoing security updates. A basic maintenance plan runs 150 to 500 NIS a month on the market, as I covered in [the website maintenance guide](/en/guides/ai-website-maintenance).",
          "A site built in modern code and hosted on services like Vercel or Netlify usually costs very little to host at a small business's traffic, and has no plugins to update every month. A worked example: a brochure site at 8,000 NIS with 300 NIS a month for hosting and maintenance comes to 18,800 NIS over three years. The same site at 150 NIS a month comes to 13,400. The difference is not in the quote; it is in the invoices that follow it.",
        ],
      },
      {
        heading: "Where a traditional build still makes more sense",
        paragraphs: [
          "There are cases where WordPress is still the cheaper and better choice. If you have a team posting content daily who already know its interface, if you need a store that leans on existing plugins for payments and shipping, or if you already have a WordPress developer you trust, switching will not save money.",
          "The full comparison between the approaches is in [the WordPress vs custom development guide](/en/guides/wordpress-vs-custom-development). In short: an AI-built site pays off when you want speed, performance and less upkeep. WordPress pays off when you want a familiar ecosystem and self-editing in every corner.",
        ],
      },
      {
        heading: "What does not change in price, AI or not",
        paragraphs: [
          "Some costs are identical whichever way the site is built, and they are worth budgeting separately. Writing marketing copy from scratch usually adds a few thousand shekels if you have no text. Professional photos, connecting a payment or CRM system, and accessibility to the Israeli standard are line items that do not shrink just because the code was written faster.",
          "The domain, the email accounts and the paid tools the site connects to stay the same as well. When comparing two quotes, check they cover the same items before you compare the number at the bottom.",
        ],
      },
      {
        heading: 'Three questions before you approve a quote for an "AI website"',
        paragraphs: [
          "First: who owns the code and where is it hosted. If the site sits on the vendor's platform and cannot be taken out, you are not buying a website, you are renting one. Second: how do I update text or an image myself. A site with no admin means every small change goes through a developer.",
          "Third: what happens if the tool the site was built on changes its price or shuts down. A very low price that comes with a rigid monthly subscription is a warning sign, because that is where the vendor's real margin lives. The answers to these three questions say more about the true cost than the number on the quote.",
          "One more small tip: ask to see one site the vendor built this way that is still live after a year. A site that has survived a year of updates, new content and changing tools tells you far more than a portfolio of screenshots.",
        ],
      },
    ],
    faq: [
      {
        q: "Can an AI-built website rank on Google?",
        a: "Yes, if it is built properly. What matters is not the tool but whether pages reach Google as full HTML, with a title and description per page and a sitemap. Ask the vendor to show you a site they built this way that appears in search.",
      },
      {
        q: "Can I edit an AI-built website myself after launch?",
        a: "It depends on whether it was given an admin. A site with a content system lets you change text, images and articles without a developer, just like WordPress. A site without one needs a developer for every change, and that is worth confirming before you approve a quote.",
      },
      {
        q: "How long does it take to build a website with AI?",
        a: "A landing page can go live in two to three days once the content is ready. A brochure site usually takes one to three weeks, and a site with a store or integrations takes longer. What delays it is almost always content and approvals, not code.",
      },
      {
        q: "Is hosting an AI-built website really cheaper?",
        a: "In most cases, yes. A modern-code site on Vercel or Netlify can cost nothing to a few dozen shekels a month at a small business's traffic, against 30 to 100 NIS for standard WordPress hosting. At very high traffic the price rises, but most small businesses never get there.",
      },
      {
        q: "What does it cost to move an existing WordPress site to an AI-built one?",
        a: "Usually about the same as a new build of the same scope, plus work on redirects from the old URLs so you do not lose Google rankings. Moving a mid-sized brochure site typically takes 3 to 6 weeks. If the current site brings organic traffic, do not skip the redirects to save money.",
      },
    ],
  },
  {
    slug: "facebook-creative-fatigue",
    title: "Facebook creative fatigue: why the ad that worked stopped selling",
    excerpt:
      "How to spot creative fatigue in Meta's numbers, why an ad now lasts two or three weeks, and what actually brings a campaign back.",
    category: "AI Visuals & Content",
    image: "/images/guides/cover-ai-visual.png",
    readTime: "6 min read",
    datePublished: "2026-10-17",
    relatedServiceSlug: "ai-content",
    sections: [
      {
        heading: "The ad didn't change, the audience did",
        paragraphs: [
          "Anyone running Meta campaigns knows the pattern: an ad goes live, the first week brings leads or sales at a great price, and then, without you touching anything, cost per lead starts climbing. Same video, same audience, same budget. What changed is that the people seeing it have already seen it.",
          "That's creative fatigue. The ad didn't get worse, it just stopped being new. The people who were going to respond already did, and the ones who scrolled past the first time scroll past the fourth time too, only faster.",
          "What makes it dangerous is that it's quiet. No alert, no error, the campaign keeps running and spending. The only difference is that every shekel buys less, and if you aren't checking the right numbers every few days, you find out at the end of the month, when leads already cost twice as much.",
        ],
      },
      {
        heading: "Why an ad now lasts two or three weeks, not months",
        paragraphs: [
          "A few years ago a good ad could run for two months. Today, in accounts spending a few thousand shekels a week, an ad usually tires within two to three weeks. Most of the reason is how Meta allocates budget: the algorithm concentrates spend on the ad that's producing results, so it keeps pushing it at the same people most likely to respond.",
          "The bigger the budget and the narrower the audience, the faster this happens. A local business targeting one city at 300 shekels a day will burn through a creative long before a national brand with an audience of millions. So there's no single number of days that fits everyone, but there are clear signs you can read.",
        ],
      },
      {
        heading: "How to spot fatigue in the numbers, in order",
        paragraphs: [
          "The first sign is the Frequency column in Ads Manager. When weekly frequency on a cold prospecting campaign passes 3 to 4, most people have already seen the ad several times. Frequency alone proves nothing, but it tells you where to look.",
          "The second sign is CTR falling while CPM stays flat or rises. A 20 to 30 percent drop from the ad's peak over a week, with no change in audience or budget, is almost always fatigue. The third sign, and the last to show up, is rising cost per result. By the time you see it, the money is already spent.",
          "Meta sometimes flags ads as Creative fatigue in the delivery column. It's a useful signal but a late one: by the time the label appears, the data has been saying it for days.",
        ],
      },
      {
        heading: "The myth: the audience ran out, we need a new one",
        paragraphs: [
          "The most common reaction to a tiring campaign is to change targeting: more interests, a new lookalike, a different age range. Most of the time it doesn't help, because the problem isn't who you're showing it to but what you're showing them. Meta broadens delivery on its own anyway, and your audience is nowhere near exhausted. What's exhausted is curiosity about this particular video.",
          "The second mistake is raising budget to push an ad that's weakening. That accelerates the fatigue, because the extra money goes to the same people who already saw it. And if you pause the ad and switch it back on, it returns with the same memory in people's heads and usually another learning phase.",
        ],
      },
      {
        heading: "What actually brings it back: new creative, not a new headline",
        paragraphs: [
          "The fix is new creative, and new here means something the eye registers as new in the first second. Swapping the copy under the video or the color of a button doesn't count. What does count: a different opening in the first three seconds, a different angle on the same product, a different format (UGC instead of a product video), or a message aimed at a different pain point of the same customer.",
          "The healthy way to work is not to wait for an ad to die, but to keep feeding new versions in alongside the winner. That way, when it tires, there's already a replacement the algorithm knows. I've written separately about [how many variations a campaign needs](/en/guides/how-many-campaign-variations) and about [what a concept ad is](/en/guides/what-is-a-concept-ad), which is exactly the kind of change the algorithm treats as a new ad.",
        ],
      },
      {
        heading: "What that means in actual numbers",
        paragraphs: [
          "The math is simple and unpleasant. If an ad lives two or three weeks, and most new versions won't match the winner, you need to produce far more than ends up in the campaign. A brand spending 10,000 to 50,000 shekels a month on media usually needs four to eight new creatives a week to keep delivery from decaying.",
          "A smaller business spending a few thousand shekels a month can get by with two to four new versions a month. What doesn't work at any budget is one video produced once a year and run until it stops selling.",
          "And know in advance that most versions will lose. Out of five new versions, usually one or two reach the previous winner's performance and the rest get switched off after a few days. That isn't the creative failing, it's how testing works: you buy the next winner with a few losers.",
        ],
      },
      {
        heading: "Why a shoot day isn't fast enough",
        paragraphs: [
          "This is where most businesses get stuck. A professional shoot day produces good material, but it happens once a quarter at best, and by the time the edit is ready the previous creative is already dead. Meta's rhythm is weekly; traditional production's rhythm is quarterly. That gap is the whole story.",
          "This is where [AI video production](/en/services/ai-content) changes the equation: you can produce a new angle, a different character or a new scene without booking a crew and a location again. It has real limits, and not every product looks right in AI, but for steady creative refresh it's currently the only tool that keeps pace. I broke down the costs in [how much an AI video costs a business](/en/guides/ai-video-cost-guide).",
        ],
      },
      {
        heading: "What to do with an ad that's tired",
        paragraphs: [
          "Don't delete it. An ad that worked teaches you something: which opening stopped the scroll, which message earned the clicks. The most useful thing to do with it is take it apart and build the next version from it, with the same principle and a completely different execution.",
          "One more thing worth remembering: an ad that rests for two or three months can come back and work again with a new audience or in a different season. Keep your winners aside, with their numbers, instead of throwing them out with the campaign.",
          "A simple routine that works: once a week, open Ads Manager, sort active ads by frequency, and flag every ad whose CTR has dropped a quarter from its peak. Those are the ads that need a replacement in the coming week. Ten minutes a week saves a month of budget going to an ad that no longer sells.",
        ],
      },
    ],
    faq: [
      {
        q: "What's the maximum frequency for a Facebook ad before it tires?",
        a: "There's no magic number, but on a cold campaign a weekly frequency above 3 to 4 is a signal to check CTR and cost per result. In a warm retargeting audience frequency can run higher without trouble, because repetition is part of the point there.",
      },
      {
        q: "How often should you replace creative on Meta?",
        a: "In an account spending a few thousand shekels a week, an ad usually holds for two to three weeks. So it's worth adding new versions every week or two rather than waiting for the winner to collapse. On small budgets the cycle is longer, sometimes six weeks.",
      },
      {
        q: "Is changing the copy or headline enough to refresh an ad?",
        a: "Usually not. What decides whether someone stops is the visual in the first second, and new copy under the same video looks to them like the same ad. A new opening, angle or format is what counts as new creative.",
      },
      {
        q: "How much does it cost to produce new creatives every month?",
        a: "In traditional production each shoot day costs thousands of shekels and yields material for a few weeks. With AI production, my monthly package of 5 short videos is 6,000 shekels, and a single-video pilot is 1,800. Market price lists quote 2,500 to 3,000 shekels for a 40-second video.",
      },
      {
        q: "How do you know the problem is fatigue and not something else?",
        a: "Fatigue looks like a gradual drop in CTR and a rise in cost per result while audience, budget and landing page stay the same. A sharp drop in a single day points more to a technical fault, a landing page change or a pixel problem.",
      },
    ],
  },
  {
    slug: "wordpress-vs-ai-website",
    title: "WordPress site or AI-built site: the full comparison",
    excerpt:
      "A direct comparison between a WordPress site and a site coded with AI: price, speed, editing, maintenance and Google, including the cases where WordPress is still the right call.",
    category: "Websites & Development",
    image: "/images/guides/cover-web-dev.png",
    readTime: "5 min read",
    datePublished: "2026-10-18",
    relatedServiceSlug: "web-design",
    sections: [
      {
        heading: 'An "AI website" is not Wix with a chatbot',
        paragraphs: [
          'Before comparing, we need to agree on what we\'re talking about, because "AI website" covers two completely different things. One is an automatic site builder: you type a sentence about your business and get a ready template. The other, which this comparison is about, is a site written in real code (usually React or Next.js) by a developer working with AI tools, hosted on a service like Vercel.',
          "The common myth is that an AI site is one the computer made by itself, so it must be cheap and fragile. In practice AI speeds up writing the code, but the decisions about structure, design, performance and SEO stay with whoever builds it. If the term itself is new to you, I covered it in depth in [what vibe coding is](/en/guides/what-is-vibe-coding).",
        ],
      },
      {
        heading: "Build price: the gap is smaller than you think",
        paragraphs: [
          "For a standard brochure site, both routes land in roughly the same range in the Israeli market: 2,500 to 5,000 shekels for a simple site, and 8,000 to 12,000 with a blog, forms and built-in SEO. WordPress saves time because templates and plugins already exist. AI saves time because the code gets written fast. The result is a similar price.",
          "The real difference shows up after launch. A WordPress site comes with managed hosting at 50 to 150 shekels a month and plugin licences like Elementor Pro that renew every year. A small coded site can run on the free tier of Vercel or Netlify, so its ongoing cost is significantly lower.",
          "Simple three-year math: WordPress hosting at 100 shekels a month plus a few hundred shekels a year in licences comes to roughly 4,500 to 5,000 shekels, before a single hour of maintenance. On a small coded site that figure can be close to zero. That doesn't make it cheaper in every case, but it's the number to put next to the quote.",
        ],
      },
      {
        heading: "Speed: a coded site wins almost every time",
        paragraphs: [
          "A typical WordPress site loads a theme, a page builder and ten to twenty plugins, each adding files to every page. You can speed it up with caching and optimization, but you start from a heavy baseline. A coded site is prebuilt into static HTML files and served from the server closest to the visitor, so it starts fast.",
          "That matters for Google and for conversions, because Core Web Vitals are part of ranking and a mobile visitor won't wait four seconds. If your current site is slow, it's worth first understanding [why your website is slow](/en/guides/why-is-my-website-slow), because sometimes the fix is one plugin, not a platform change.",
        ],
      },
      {
        heading: "Self-editing: WordPress's big advantage",
        paragraphs: [
          "This is where WordPress is genuinely strong. Anyone in the business can log in, change text, upload an image and publish a post without talking to anyone. Thousands of people in Israel know the interface, so even if the original developer disappears, someone can pick it up.",
          "With a coded site that isn't a given. For you to edit it yourself, someone has to build an admin panel or connect a content system, and that's work you need to ask for up front and pay for. A coded site without an admin means every text change goes through a developer. It's the first question I'd ask a vendor offering an AI site.",
          "There's also a middle path that works well: a coded site with a slim admin covering only what actually changes, like text, images, blog posts and FAQs. Everything else stays in code, so nobody can break the design by accident. For a business that updates once a month, that's enough.",
        ],
      },
      {
        heading: "Maintenance and security: fewer moving parts, more dependency",
        paragraphs: [
          "Most WordPress hacks come through plugins that weren't updated. A WordPress site needs regular updates to core, theme and plugins, and every so often an update breaks something. A static site with no exposed database and no plugins offers an attacker far less, and usually just keeps working for years.",
          "The price is dependency. A coded site is code someone has to understand, and if it was written messily, the next developer pays for it. That's why the code should live with you, in a repository you own. I went into detail in the guide on [maintaining an AI-built website](/en/guides/ai-website-maintenance).",
        ],
      },
      {
        heading: "Google doesn't prefer either one",
        paragraphs: [
          'Another myth: "WordPress is better for SEO." Google doesn\'t know or care what platform a site is built on. What it reads is HTML, speed, heading structure, structured data and content. WordPress delivers that through a plugin like Yoast or Rank Math. A coded site delivers it only if whoever built it took care of it.',
          "So a coded site can be better for Google, but it can also be worse, for example a site rendered entirely in the browser that reaches Google as an empty page. Ask the vendor to show you the page source of a site they built, and check that the text is actually there.",
        ],
      },
      {
        heading: "Where WordPress still wins, no argument",
        paragraphs: [
          "There are cases where I wouldn't recommend a coded site. A content site with writers publishing daily, a site whose marketing team builds its own landing pages, and a WooCommerce store leaning on plugins for payments, shipping and invoicing that would take months to rebuild. A business that wants to avoid depending on any particular developer also benefits from WordPress.",
          "In those cases a well-built WordPress site, with few plugins and decent hosting, is the right choice, not a compromise. The broader comparison between WordPress and any custom development, not just AI, is in [WordPress vs custom development](/en/guides/wordpress-vs-custom-development).",
          "In the other direction, a coded site clearly wins for a campaign landing page, a brochure site where speed and distinctive design are part of the sale, and a site that needs a special function no plugin offers. There WordPress adds weight without adding value.",
        ],
      },
      {
        heading: "Five questions that settle the decision",
        paragraphs: [
          'Who will update the site, and how often? If the answer is "us, every week", WordPress or a coded site with an admin. Is speed part of the sale, for example in mobile campaigns? Then a coded site. How many plugins does your current site need to function? More than twenty is a sign of maintenance pain.',
          "Two more: who owns the code or the account, and what's the running budget over three years rather than just launch day. If you already have a WordPress site and are thinking of switching, the process itself, what moves and what stays behind, is laid out in [moving from WordPress to an AI-built site](/en/guides/wordpress-to-ai-migration).",
        ],
      },
    ],
    faq: [
      {
        q: "Is an AI-built site cheaper than a WordPress site?",
        a: "On build price the difference is usually small: a brochure site costs 2,500 to 12,000 shekels either way, depending on scope. The saving comes in running costs: WordPress hosting and plugin licences can add up to a few hundred to two thousand shekels a year, while a small coded site usually runs on free or very cheap hosting.",
      },
      {
        q: "Can I edit an AI-built site myself?",
        a: "Only if it was built with an admin panel or connected to a content system. That should be written into the quote, because without it every text change goes through a developer. In WordPress, self-editing comes by default.",
      },
      {
        q: "Does an AI site builder like Wix count as an AI website?",
        a: "It's a different kind of product. An automatic site builder produces a template inside a closed platform, with limits on design, speed and leaving it. A coded site built with AI is your own code, which can move to any host and any developer.",
      },
      {
        q: "Which is better for an online store, WordPress or AI?",
        a: "For a store with payments, shipping, inventory and invoicing, WooCommerce or Shopify is still the safe choice in most cases, because all those integrations exist as plugins. A store like that starts around 15,000 shekels in the market. Building from scratch in code pays off only when there are requirements the plugins can't meet.",
      },
      {
        q: "How long does an AI-built site take compared to WordPress?",
        a: "A brochure site usually takes one to three weeks either way, and a landing page can be ready in two days. What stretches the timeline is almost always content and approvals, not the platform.",
      },
    ],
  },
  {
    slug: "monthly-content-retainer-cost",
    title: "How Much Does a Monthly Content Retainer Cost: What 6,000 a Month Actually Buys",
    excerpt:
      "What a 6,000 shekel monthly content retainer includes, how it stacks up against a freelance editor, an agency retainer and a shoot day, and how to test it before committing.",
    category: "AI Visuals & Content",
    image: "/images/guides/cover-ai-visual.png",
    readTime: "5 min read",
    datePublished: "2026-10-19",
    relatedServiceSlug: "ai-content",
    sections: [
      {
        heading: "6,000 a month buys five ads, not social media management",
        paragraphs: [
          "When someone asks me what a content retainer costs, the first thing I need to know is what they actually want to buy. In the Israeli market, \"retainer\" covers two completely different products: page management, meaning posts, stories and a few reels a month, and a production line for ads built to run in paid campaigns. The difference isn't volume. It's what each piece is for.",
          "My monthly package is the second kind. 6,000 shekels a month for five short ad videos, including the creative and the ideas, AI production matched to the brand's look, and a steady cadence you can plan your month around. It doesn't include writing posts, managing comments or buying media. It sits next to whoever runs your campaigns, not in their place.",
        ],
      },
      {
        heading: "Why a brand running paid media needs new content every month",
        paragraphs: [
          "A Meta ad now wears out in two to three weeks, not months. The same audience sees it again and again, click-through drops, and cost per purchase climbs. A brand spending 10,000 to 50,000 shekels a month on media needs several new creatives every week just to keep the campaign breathing.",
          "That's the whole case for a retainer. Nobody buys five videos a month because they love video. They buy them because their ads stop working, and one shoot day a quarter can't fill the gap. If you aren't running paid media, you don't have this problem, and a one-off project will suit you better.",
        ],
      },
      {
        heading: "What goes into the five videos",
        paragraphs: [
          "Every video starts from an idea, not a tool. At the start of the month I pitch a few concepts: an angle on the product, an opening that stops the scroll, a problem the audience recognizes. Once we pick, I produce them with AI so the product stays itself in every frame, in the brand's colors, tone and typography. I walk through the technical side in the [guide to running an AI campaign end to end](/en/guides/ai-campaign-end-to-end).",
          "The cadence is what pays off over time. By month three I know which hooks work for you and which don't, and how your product behaves in the models. The fifth video in month three comes together faster and better than the first one did, because most of the decisions have already been made.",
        ],
      },
      {
        heading: "1,200 per video, and why that's the wrong number to compare",
        paragraphs: [
          "Simple division gives 1,200 shekels per video. Market pricing pages for AI video usually quote 2,500 to 3,000 shekels for a single 40 second video, and I break those ranges down in the [AI video cost guide](/en/guides/ai-video-cost-guide). So the retainer is cheaper per video, which is expected: ongoing work skips the getting-to-know-you phase every single order carries.",
          "But price per video is the wrong question. The right one is what a burned-out creative costs you. If your current ad brings a purchase at 80 shekels and has fatigued to 140, the gap on a 20,000 a month budget dwarfs any difference between suppliers.",
        ],
      },
      {
        heading: "A freelance editor: cheaper, but someone has to shoot",
        paragraphs: [
          "A freelance video editor typically charges a few hundred shekels per short video, which looks like an obvious saving. It genuinely is one when you have raw footage: product shots, a creator talking to camera, customer clips. The editor cuts, adds captions and music, and outputs versions.",
          "The problem is what happens before the edit. An editor doesn't invent concepts or produce frames nobody filmed. If no one feeds them new material every month, you get the same footage rearranged, and your audience notices fast. A setup that works for plenty of brands is an editor for versions of existing material, plus a separate source of new concepts.",
        ],
      },
      {
        heading: "An agency retainer: more items, fewer ads",
        paragraphs: [
          "Social media management retainers in Israel run from 1,500 to 6,000 shekels a month and usually include 20 to 30 posts, 10 to 15 stories and 5 to 10 reels. Counted by item, that looks like far more for less, and for anyone who needs a consistent page presence it really is the right tool.",
          "What's worth checking is how many of those items were built to run as an ad. A reel made for the organic feed and an ad made to stop a stranger's scroll are different products. The common myth is that 6,000 is the middle of the market. In social management it's the ceiling, and in ad production it buys something a management retainer usually doesn't produce at all.",
        ],
      },
      {
        heading: "A shoot day: great for stills, expensive for variations",
        paragraphs: [
          "Product photography in Israel is a competitive market. An eight hour shoot day costs roughly 1,400 to 2,500 shekels, and white background shots come out at tens of shekels each. If catalog images are what you need, a photographer will do it well and cheaply, and I won't try to talk you out of it. I wrote about this in the [guide to AI product photos](/en/guides/ai-product-photos-without-a-studio) as well.",
          "Video flips the picture. A video shoot day with a crew, lighting and a location costs a lot more, and produces a pile of footage from one day, in one light, on one set. A live campaign burns through versions that look different from one another, and that's exactly what a single shoot day struggles to supply across three months.",
        ],
      },
      {
        heading: "The pilot: 1,800 that's credited in full",
        paragraphs: [
          "Before committing to a month you can start with one video at 1,800 shekels. If you move to the monthly package within seven days of delivery, the full 1,800 comes off the price and the pilot counts as one of the five videos. In practice the first month costs 4,200 more, and you haven't paid for the test twice.",
          "The seven days run from delivery, not from signing, on purpose. That's the window to run the video against a real audience, even on a small budget, and see numbers before deciding. Past work is on the [work page](/en/work), and the service itself is described on the [AI content page](/en/services/ai-content).",
        ],
      },
      {
        heading: "When a retainer isn't right for you",
        paragraphs: [
          "If you don't run paid media, don't refresh a catalog and don't have several branches to feed, you have no fatigue problem, and five videos a month will pile up in a folder. In that case, buy once, use the video well, and come back when there's a reason.",
          "Another sign: if nobody on your side looks at campaign data and decides what to swap out, a retainer will produce content nobody measures. The package works best when there's a campaign manager on the other end, in house or external, who tells me at the end of each month what held up and what dropped.",
        ],
      },
    ],
    faq: [
      {
        q: "What happens if the pilot doesn't work for us?",
        a: "Then you stop there. You paid 1,800 shekels for one video, it's yours, and there's no commitment to the monthly package. The full credit only applies if you move to the package within seven days of delivery.",
      },
      {
        q: "How long does it take to get the five videos?",
        a: "The videos are delivered across the month rather than all on one day, so there's always something new to put into the campaign. The first video of the first month takes longer, because it includes getting to know the product and the brand.",
      },
      {
        q: "Are 5 videos a month enough for a Meta campaign?",
        a: "It depends on budget. A brand spending 10,000 shekels a month can work with five new concepts plus hook variations an editor cuts from them. At 40,000 and up the required pace is higher, and it's worth planning how to reach that volume.",
      },
      {
        q: "Who owns the videos once they're delivered?",
        a: "Once paid, you can use them anywhere, paid media included, with no time limit and no extra fee. There's no separate rights package for paid placement.",
      },
      {
        q: "What's the difference between a content retainer and social media management?",
        a: "Social management is measured in items for your page, usually 20 to 30 posts and 5 to 10 reels a month for 1,500 to 6,000 shekels. A production retainer is measured in ads built to run in a campaign. Most brands running paid media need both, not one instead of the other.",
      },
    ],
  },
  {
    slug: "ai-videos-for-ecommerce-brands",
    title: "AI Videos for Ecommerce Brands: How to Feed a Campaign That Burns Out Every Three Weeks",
    excerpt:
      "How many creatives an ecommerce campaign really consumes, what AI video does well for a physical product and where it still falls short, and how to build a pace that doesn't run dry mid-month.",
    category: "AI Visuals & Content",
    image: "/images/guides/cover-ai-visual.png",
    readTime: "5 min read",
    datePublished: "2026-10-20",
    relatedServiceSlug: "ai-content",
    sections: [
      {
        heading: "The ad that worked last month didn't break, your audience just saw it",
        paragraphs: [
          "Almost every ecommerce brand running Meta knows this moment: an ad that was bringing sales at a good cost starts to stall after two or three weeks. Nothing about it changed. What changed is frequency, how many times the same person has already seen it, and as that climbs, clicks drop and cost per purchase rises.",
          "That's creative fatigue, and in ecommerce it hits especially hard because the audience is relatively small and the ads run on it over and over. The only fix that holds up over time is getting new material in before the old one dies, not after.",
        ],
      },
      {
        heading: "How many creatives an ecommerce campaign really consumes",
        paragraphs: [
          "A brand spending 10,000 to 50,000 shekels a month on media needs roughly four to eight new creatives a week to keep the campaign running at a reasonable cost. At 30,000 to 50,000 that's 10 to 15 new concepts every two weeks, which turns into 30 to 50 ad units once you count different hooks and formats.",
          "Notice the distinction between a concept and an ad unit. Most of that number is versions: the same idea with three different hooks, in 9:16 for stories and 4:5 for the feed. What runs out fast is the concepts themselves, and I cover how many versions are worth cutting from each in the [guide to campaign variations](/en/guides/how-many-campaign-variations).",
        ],
      },
      {
        heading: "The myth: more budget will bring performance back",
        paragraphs: [
          "The instinctive response to a stalling ad is to raise the budget or open a new audience. Sometimes that buys a few days, but most of the time it speeds the problem up: more money on the same creative means the same people see it sooner.",
          "An ecommerce brand's problem on Meta is almost always a material problem, not a budget problem. Meta's algorithm now does much of the targeting on its own, and what's left in your hands is mostly what the audience sees. That's why the pace of new creative matters more than most settings in the ad account.",
        ],
      },
      {
        heading: "What AI does well for a physical product",
        paragraphs: [
          "The big advantage is versions. From a good product photo you can build different scenes, different lighting, hands using it, and different hooks for the same idea, without building a new set for each one. How a still image becomes a video is explained in the [image to video guide](/en/guides/image-to-video-ai-explained).",
          "The second advantage is consistency. In a product ad, the bottle has to stay the same bottle in every frame, with the same label and the same color. That's the professional work in AI production, and it's the difference between a tool that makes an avatar read a script for 50 shekels and an ad where the product is recognizable. I wrote about the same problem for characters in the [guide to AI character consistency](/en/guides/ai-character-consistency).",
        ],
      },
      {
        heading: "Where it still fails, and what to do about it",
        paragraphs: [
          "Small text on packaging is the obvious weak spot. Models tend to warp letters, Hebrew especially, so a label with ingredients or small numbers needs manual work or the original photo composited onto the frame. Fabric texture, pouring liquid or food in close-up also take several rounds before they look believable.",
          "And it's worth saying plainly: for white background catalog shots, AI isn't necessarily the right choice. Product photography in Israel costs roughly 1,400 to 2,500 shekels for an eight hour day, and that's a good price for stills. AI's edge starts with video and versions, where no studio delivers thirty different videos for 2,500 shekels.",
        ],
      },
      {
        heading: "One concept, several hooks: what a working production line looks like",
        paragraphs: [
          "The structure most short ecommerce ads are built on is simple: a hook that stops the scroll, a problem the audience recognizes, the product as the answer, and a call to action. The first three seconds are the part that fatigues fastest, so the same video with a new hook often behaves like a new ad.",
          "In practice a working line looks like this: a few new concepts a month, two or three hooks for each, and each in two aspect ratios. The concepts have to be invented and produced. The versions can sometimes be cut by an editor. There's more on the creator-style side in the [guide to AI UGC content](/en/guides/ai-ugc-content-that-converts).",
        ],
      },
      {
        heading: "What to prepare before you start",
        paragraphs: [
          "Four things save at least one round of revisions. Sharp product photos from several angles, including a close-up of the label. Your best ad to date and one number explaining why it counts as the best. The reviews or messages customers send, because that's where the best hooks come from. And a list of the products with enough margin to advertise.",
          "That last item matters more than it seems. A brand with a hundred products doesn't need a video for each one. It needs videos for the products that hold a cost per purchase, and only you know which those are.",
        ],
      },
      {
        heading: "What it costs against the alternatives",
        paragraphs: [
          "Israeli AI video pricing pages usually quote 2,500 to 3,000 shekels for a single 40 second video, and the full ranges are in the [AI video cost guide](/en/guides/ai-video-cost-guide). With me, a single pilot video is 1,800 shekels, and the monthly package is 6,000 shekels for five short ad videos, including the creative and the steady cadence.",
          "Moving from the pilot to the package within seven days of delivery credits the full 1,800, and the pilot counts as one of the five videos. Against self-serve tools at 50 shekels a video that sounds expensive, but there you get an avatar reading text. Against a video shoot day with a crew and a location, it's usually cheaper and produces more versions.",
        ],
      },
      {
        heading: "How to tell whether the new videos are working",
        paragraphs: [
          "Don't judge a video by how good it looks. Three numbers tell you almost everything: how many viewers stayed past three seconds, meaning whether the hook worked, the click-through rate, and cost per purchase against your long-running ad.",
          "Give each new creative a few days and enough budget for a few thousand impressions before deciding. A video that fails at the hook gets a new hook, not the bin. A video whose hook works but doesn't sell is telling you something about the offer or the product page, not necessarily about the video.",
          "And keep the long-running ad live alongside the new ones rather than switching it off the day they launch. It's your benchmark: until a new creative beats it on cost per purchase across a full week, it stays, and the decision is made on numbers rather than on gut feeling.",
        ],
      },
    ],
    faq: [
      {
        q: "How many videos a month does a small ecommerce brand need?",
        a: "A brand spending up to 10,000 shekels a month on media can sustain a campaign with four to six new concepts a month and a few hooks for each. Above 30,000 shekels the pace climbs to dozens of ad units a month, most of them versions of a smaller number of ideas.",
      },
      {
        q: "Can I use the product photos I already have?",
        a: "Usually yes, as long as they're sharp and show the product from several angles. A close-up of the label matters most, because text on packaging is what models distort most easily.",
      },
      {
        q: "Does an AI product video look fake?",
        a: "One produced without oversight can, mostly in hands, small text and liquids. In professional production every frame is checked against the real product and fixed before delivery, and the product should look identical to the one the customer receives.",
      },
      {
        q: "How long does it take to produce an AI video for a product?",
        a: "A first video for a new product usually takes a few working days, because it includes building the concept and learning how the product behaves in the models. Later videos for the same product come out faster.",
      },
      {
        q: "What's the difference between an AI video and a UGC ad with a real creator?",
        a: "A real creator brings credibility that's hard to manufacture, and is best kept for concepts that have already proved themselves. AI suits testing hooks and ideas at a high pace, because booking a creator twenty times a month is expensive and slow. Plenty of brands use both.",
      },
    ],
  },
  {
    slug: "brand-film-cost-israel",
    title: "How much does a brand film cost: full price guide, and does AI make it cheaper",
    excerpt:
      "Real Israeli market ranges for a shot brand film and an AI brand film, what moves the number, and where AI simply does not fit.",
    category: "AI Visuals & Content",
    image: "/images/guides/cover-ai-visual.png",
    readTime: "5 min read",
    datePublished: "2026-10-21",
    relatedServiceSlug: "ai-content",
    sections: [
      {
        heading: 'Why "brand film" is really three different products',
        paragraphs: [
          "When someone asks me how much a brand film costs, my first question is what they mean by it. In the Israeli market the term covers at least three things: an interview where the owner tells the story, a mood piece with footage of the work, the team and the place, and a short brand spot built like an ad around one concept and one message. Each has a completely different cost structure.",
          "That matters because quotes that look far apart are usually not pricing the same product. A 4,000 shekel quote and a 20,000 shekel quote can both be fair if one is half a shoot day with basic editing and the other is a script, two shoot days and actors. Before comparing numbers, make sure you are comparing the same thing.",
        ],
      },
      {
        heading: "What a shot brand film costs in Israel",
        paragraphs: [
          "A basic brand film, with one videographer, half a day to a full day on site, a one to one and a half minute edit and library music, usually lands between 3,500 and 8,000 shekels. That is where most small businesses sit, and it works when there is actually something to film: a space, a team, a process.",
          "A mid-range production, with a script, a director, a crew of two or three, proper lighting, a cleanly recorded interview and color grading, runs roughly 10,000 to 25,000 shekels. Above that, a production with actors, several locations, a drone and an ad agency attached starts around 30,000 and can reach six figures.",
          "These are orders of magnitude, not an official rate card, and they move with city, season and scope. But if a quote falls far outside them, it is worth asking what exactly is missing from it, or what is in it that you never asked for.",
        ],
      },
      {
        heading: "Where the money goes in a shot production",
        paragraphs: [
          "Most of the budget in a shot film is not the film, it is the day. A videographer with gear costs roughly 2,500 to 5,000 shekels a day, a sound person and a gaffer each add their own line, and actors or a paid location cost money before anyone presses record.",
          "After the day comes the edit: cutting, color, sound and captions. For a one-minute film that is typically two to four days of work. And the part people forget: if a shot turns out to be missing after the shoot, there is no revision round. There is another shoot day, with all its costs from scratch.",
        ],
      },
      {
        heading: "What an AI brand film costs",
        paragraphs: [
          "AI production removes everything tied to the day: crew, gear, location and scheduling. What remains is the creative work, meaning concept, consistent assets, scene generation, editing and sound. The pricing pages ranking in Google today quote roughly 2,500 to 3,000 shekels for a 40-second video, and a complex spot with a recurring character costs more, as I broke down in the [AI video pricing guide](/en/guides/ai-video-cost-guide).",
          "My own pilot, one short focused video, is 1,800 shekels, and a monthly package of five videos is 6,000 shekels a month. I mention it for scale: a short AI brand spot costs about as much as half a day of a videographer, before editing.",
          "And do not confuse the two: an AI video for a few hundred shekels is usually a tool output, not a production. For a film meant to represent the business on its homepage, that is almost never enough.",
        ],
      },
      {
        heading: "The myth: AI makes every brand film cheaper",
        paragraphs: [
          "It does not. AI makes a brand film built around an idea cheaper. It does not make a film cheaper when its whole value is real people. If the goal is for a customer to see the founder, hear her speak and decide to trust her, there is no way to produce that with AI without damaging the very thing you are selling. An avatar of the owner speaking in his place is the opposite of trust.",
          "The same goes for customer interviews, a real tour of a factory or a clinic, and a product whose value is a physical detail, like the texture of a fabric or the polish on a piece of jewelry. There a real camera wins, and it is worth paying for. I covered these limits in the [guide to AI videos for business](/en/guides/ai-videos-for-business) as well.",
        ],
      },
      {
        heading: "The mix that usually saves the most",
        paragraphs: [
          "Many businesses do not need to pick a side. You can shoot a focused half day, just the owner interview and a few shots of the team, and build the rest with AI: the opening, transitions, mood scenes and anything that is hard or expensive to film. The expensive part shrinks to a few hours instead of a day or two.",
          "The condition is that both halves look like one production. Lighting, color and grain have to match, or the viewer feels the seam even without being able to name it. And when a character or product recurs across scenes, consistency is the genuinely hard work, which I detailed in the [guide to AI character consistency](/en/guides/ai-character-consistency).",
        ],
      },
      {
        heading: "What to check in a brand film quote",
        paragraphs: [
          "Ask how many shoot days or scenes are included, how many revision rounds, and what happens if an extra shot is needed. In a shot production the answer to that last one is usually a paid extra day; in AI production it is usually a revision round. That difference affects the real cost more than the headline number.",
          "Also ask which files you get. A homepage brand film is horizontal, but the same business will want a vertical cut for Instagram and a 15-second version for paid ads. Every extra cut is work, and it is better in the quote than as a surprise on the invoice.",
        ],
      },
      {
        heading: "One brand film will not last three years",
        paragraphs: [
          "Many businesses price a brand film as a one-off investment, and three years later it is still on the homepage, with staff who have left and prices that have changed. A shot film ages fast precisely because it is real: every detail in it is a snapshot of one moment.",
          "So the approach I recommend is one shot core film, as short as possible, alongside short AI videos that rotate through the year. The expensive part stays relevant, and the content that ages is the cheap part. The timelines of the two are very different, and I broke down the AI side in the [guide to how long an AI commercial takes](/en/guides/ai-commercial-production-timeline).",
        ],
      },
    ],
    faq: [
      {
        q: "How much does a one-minute brand film cost?",
        a: "A shot one-minute film with one videographer and basic editing usually costs 3,500 to 8,000 shekels. With a script, a crew and proper lighting the range is 10,000 to 25,000. With AI, a 30 to 40 second brand spot runs roughly 1,800 to 3,000 shekels in the market, and a longer film with many scenes costs more.",
      },
      {
        q: "How long does it take to produce a brand film?",
        a: "A shot film usually takes two to four weeks, including scheduling the shoot and editing. A short AI video is one to three working days, and a complex spot with a consistent character takes one to two weeks. In most cases what stretches the schedule is waiting for approvals, not production.",
      },
      {
        q: "Can I make an AI brand film with my own face?",
        a: 'Technically yes, but for a film meant to build trust in you I do not recommend it. People spot synthesized faces quickly, and the message "this is me" loses all its value. If your face is the story, shoot half a day for the interview and use AI for everything around it.',
      },
      {
        q: "What is the right length for a brand film?",
        a: "For a homepage, 60 to 90 seconds is usually enough, and 15 to 30 seconds for social. In AI production length barely moves the price; the number of scenes does. In a shot production every extra location is extra shooting time, and so extra money.",
      },
      {
        q: "Are music and voiceover included in the price?",
        a: "Licensed library music is almost always included. Original music is an extra, and a professional voice actor for a one-minute film costs roughly 500 to 2,000 shekels depending on the artist and the usage. Ask for those lines to appear in the quote explicitly.",
      },
    ],
  },
  {
    slug: "brochure-site-cost-small-business",
    title: "How much does a brochure website cost for a small business: price ranges and what drives them",
    excerpt:
      "The real ranges for a brochure site, what moves the price between 2,500 and 12,000 shekels, and what it costs you every year after launch.",
    category: "Websites & Development",
    image: "/images/guides/cover-web-dev.png",
    readTime: "6 min read",
    datePublished: "2026-10-22",
    relatedServiceSlug: "web-design",
    sections: [
      {
        heading: "Why two seemingly identical brochure sites can differ threefold in price",
        paragraphs: [
          "A brochure site is the category where quotes are most confusing. Three vendors get the same brief, five pages for a service business, and come back with 3,000, 6,500 and 11,000 shekels. That doesn't mean one of them is a crook. It means each of them priced something different under the same word.",
          "This guide is only about the brochure site: a site whose job is to present a business and bring in an enquiry, with no cart and no custom system. If you're not sure that's what you need, the ranges for every type of site, from a landing page to a store, are in [the general website pricing guide](/en/guides/website-cost-guide-2026). Here I go deep into what happens inside the range of one brochure site.",
        ],
      },
      {
        heading: "The ranges: 2,500 to 5,000, and 8,000 to 12,000",
        paragraphs: [
          "A simple brochure site of 5 to 7 pages, on an adapted template with basic forms, runs between 2,500 and 5,000 shekels in the Israeli market. In that range you usually get the structure and the design, and you bring the copy and the photos yourself.",
          "Add a blog, smarter forms, a separate page for each service and SEO built in from the start, and the range rises to 8,000 to 12,000 shekels. That jump doesn't come from more pages. It comes from work you can't see in a screenshot: keyword research, URL structure, a title and description for every page, and load speed that gets tested rather than hoped for.",
          "What you almost never get at the low end: unlimited revision rounds, a design built from scratch rather than on a template, and support after launch. That's fine as long as the quote says so explicitly and you don't discover it in the third round of revisions.",
        ],
      },
      {
        heading: "Page count matters less than you think",
        paragraphs: [
          "The common myth is that a site's price follows its page count, as if every page were a line in a price list. In practice the first page is the expensive one: it sets the design language, the components and the mobile behaviour. Every extra service page built from the same components is a fairly small addition, usually a few hundred shekels.",
          "What does push the price up is a page with behaviour of its own: a filterable project gallery, a price calculator, a multi-step form, or a section fed from a CMS. One page like that can cost more than five regular content pages. When you compare quotes, ask what one more page of the same kind costs, not what the site costs.",
        ],
      },
      {
        heading: "Copy is the line item that changes the price most, and the result too",
        paragraphs: [
          "Copywriting is the biggest difference between a 4,000 quote and a 9,000 one. A vendor who writes your copy typically charges 1,500 to 4,000 shekels for a six-page site, depending on whether it's an interview and rewrite or writing from scratch with research. A vendor who doesn't leaves you about two days of work, and often two weeks of delay.",
          "I see the same thing again and again: the site is ready and it's waiting for the About page text. If you're writing it yourself, write before design starts, not after. And if you want to know what has to be on every page before you write a line, I put it together in [the checklist of what a professional brochure site needs](/en/guides/professional-brochure-site-checklist).",
        ],
      },
      {
        heading: "Photos: camera, stock or AI",
        paragraphs: [
          "A brochure site without real photos of the business looks like a template. There are three ways to solve that. A day with a photographer usually costs 1,500 to 4,000 shekels and gives you a set that lasts years. Stock photos cost almost nothing, but visitors spot them, especially the people in suits.",
          "The third option is AI imagery built around a real product or space. It works well for products and atmosphere, and less well for your team's faces, where a real photo still wins. I covered when it replaces a studio and when it doesn't in [the guide to product photos without a studio](/en/guides/ai-product-photos-without-a-studio).",
        ],
      },
      {
        heading: "SEO during the build costs little; SEO afterwards costs a lot",
        paragraphs: [
          'Many cheap quotes include a line that says "basic SEO". In practice that usually means a plugin was installed. SEO built in from the start means every service gets its own page with a title that matches what the customer types, readable URLs, a unique description per page and a site that loads fast on mobile.',
          "During the build that's a few extra hours, roughly 1,000 to 3,000 shekels inside the quote. After launch, splitting one services page into four, changing URLs and redirecting the old ones is a project of its own. If you know Google is a channel you need, this is the last place to save.",
          'And one question worth asking any vendor: which exact terms is each service page meant to rank for? A vendor who did the work answers with a list. One who didn\'t answers with a general sentence about "optimisation".',
        ],
      },
      {
        heading: "What the site costs every year after launch",
        paragraphs: [
          "The one-off payment isn't the whole story. A .co.il domain costs about 60 to 120 shekels a year. Reasonable hosting for a brochure site runs 300 to 1,500 shekels a year. If it's built on WordPress with paid plugins, add a few hundred shekels a year in licences.",
          "Then maintenance: version updates, backups, and the small fix when something breaks. Some vendors bill by the hour and some offer a monthly retainer of a few hundred shekels. What maintenance actually covers and what you can skip is in [the guide to website maintenance](/en/guides/ai-website-maintenance). Bottom line: a brochure site costs roughly 500 to 2,500 shekels a year just to keep working the way it did on launch day.",
        ],
      },
      {
        heading: "How to compare quotes: three-year cost, not build price",
        paragraphs: [
          "A worked example. Quote A: 6,000 shekels to build, then domain and hosting at about 900 a year. Over three years that's roughly 8,700 shekels, and the site and the domain are yours. Quote B: a subscription of 500 a month that covers everything. It sounds cheaper at first, but after three years you've paid 18,000, and often the site doesn't come with you if you leave.",
          "A subscription can make sense for a business without the cash flow for a large payment, or one that wants someone else to handle everything. Just do the three-year maths before you sign, and ask in writing who owns the domain and the content on the day you want to move.",
          "Three more things that belong in the quote itself, not in a phone call: how many revision rounds are included, what one more page of the same kind costs after handover, and the hourly rate for a small change. Three lines that save most of the first year's arguments.",
        ],
      },
    ],
    faq: [
      {
        q: "How much does a 5-page brochure website cost?",
        a: "A simple 5-page brochure site usually runs 2,500 to 5,000 shekels when you supply the copy and photos. With copywriting, a page per service and built-in SEO it reaches 8,000 to 12,000. The difference is almost always in the work around the design, not the page count.",
      },
      {
        q: "How long does it take to build a brochure website?",
        a: "A standard brochure site takes two weeks to a month. What stretches it is almost always waiting for content and approvals, not development. If the copy and photos are ready before work starts, it can be much shorter.",
      },
      {
        q: "Should I build a brochure site myself on a platform like Wix?",
        a: "If your budget is under 2,000 shekels and you can spend a few days on it, it's a reasonable first step. The subscription runs about 100 to 300 shekels a month, and over a few years that adds up to the price of a professional site. The main drawback is that moving off it usually means rebuilding.",
      },
      {
        q: "How does a brochure site compare to a landing page on price?",
        a: "A landing page is one page aimed at one action and starts at about 3,000 shekels. A brochure site presents the whole business and competes in Google for several services, so it's worth more over time. For a short paid campaign a landing page is enough; for a permanent presence it isn't.",
      },
      {
        q: "Does the price of a brochure site include hosting and a domain?",
        a: "Usually not, or only for the first year. A .co.il domain is 60 to 120 shekels a year and hosting 300 to 1,500 a year. Make sure the domain is registered in your name, not the vendor's.",
      },
    ],
  },
  {
    slug: "shoot-day-vs-ai-production",
    title: "Shoot day or AI production: the real numbers for both",
    excerpt:
      "A line-by-line breakdown of what a shoot day costs against AI production, what each finished video really costs either way, and what still needs a camera.",
    category: "AI Visuals & Content",
    image: "/images/guides/cover-ai-visual.png",
    readTime: "6 min read",
    datePublished: "2026-10-23",
    relatedServiceSlug: "ai-content",
    sections: [
      {
        heading: "The right question is cost per video, not cost per day",
        paragraphs: [
          "A shoot day is priced by the day and AI production is priced by the video, which is why the first comparison people make is almost always wrong. A 9,000 shekel shoot day sounds expensive next to an 1,800 shekel AI video, but if that day yields eight videos, the math looks completely different.",
          "So here I break both sides down to the same unit: cost per video ready to publish. I already explained how AI production works and who it suits in the [guide to AI videos for business](/en/guides/ai-videos-for-business), and I will not repeat it. This piece is just the numbers, and the places where they mislead.",
        ],
      },
      {
        heading: "What goes into one shoot day",
        paragraphs: [
          "A basic shoot day in Israel looks roughly like this: a videographer with gear, 2,500 to 5,000 shekels. A sound person or a gaffer, if needed, another 1,200 to 2,500 each. A paid location, from a few hundred shekels for a cafe to thousands for a studio. And an actor or model, from a few hundred for a background extra to several thousand for the face of a campaign, usage rights included.",
          "Then comes editing, usually priced separately: 800 to 2,000 shekels per short video, more with color grading and animated text. A modest day with several edited videos easily reaches 6,000 to 12,000 shekels, and a day with a full crew and actors passes that fast.",
          "There is also a cost no quote lists: your time. Scheduling, clearing the space, staff stepping off shift to appear on camera, and a day the business runs at half capacity. For a small business that is sometimes the most expensive line of all.",
        ],
      },
      {
        heading: "How many videos a shoot day really produces",
        paragraphs: [
          "A well-planned shoot day for social content can yield six to ten short videos, provided the scripts are written in advance and everyone shows up ready. In that scenario a 9,000 shekel day works out to roughly 900 to 1,500 shekels per video, which is entirely competitive.",
          "The problem is that this is the good scenario. In practice, shifting light, a shot that takes twenty takes and a script rewritten on set cut the output, and most days I know of end closer to four to six usable videos. Even then they all look alike: same place, same light, same clothes. Fine for a feed, less good for testing several creative directions.",
        ],
      },
      {
        heading: "The numbers on AI production",
        paragraphs: [
          "AI production has no day, so the cost is measured directly per video. The pricing pages ranking in Google quote 2,500 to 3,000 shekels for a 40-second video. My own short pilot video is 1,800 shekels, and a monthly package of five videos is 6,000 shekels, which is 1,200 per video, ideas included. Anyone who moves from the pilot to the package within seven days of delivery gets the full 1,800 credited, and the pilot counts as the first of the five.",
          "What changes the economics is that every video can take place in a different world. A beach, a kitchen, a Tokyo street or a white studio, with no extra line for a second location. That is exactly where a shoot day gets expensive fast.",
          "The limit worth knowing: each AI video is a piece of work in its own right, not a by-product of one day. A video with a character recurring across many scenes takes longer and costs more than a single-scene clip.",
        ],
      },
      {
        heading: "The myth: AI production is always cheaper",
        paragraphs: [
          "It is not. If you need many videos of the same thing, in the same place, with the same people, a well-planned shoot day can come out cheaper per video. A fitness coach who needs twenty tip videos in his own studio does not need AI; he needs a videographer for half a day and a ready list of scripts.",
          "AI wins when every video needs a different setting, when the product has to appear in places that are hard or expensive to reach, and when you want to test several directions before committing to one. I wrote about the logic of testing versions against each other in the [guide to how many creative variations you need](/en/guides/how-many-campaign-variations).",
        ],
      },
      {
        heading: "What still needs a camera",
        paragraphs: [
          "Real people who are the message. An owner talking about what she does, a team, customers telling what happened to them, an event that actually took place. The value here is that it is real, and no synthesis replaces that, however good it looks.",
          "Products sold on a physical detail: the texture of a fabric, the shine of a piece of jewelry, how a garment sits on a body. And content from a creator whose audience knows them personally, where the face is the asset. I compared both routes for that kind of content in the [UGC video pricing guide](/en/guides/ugc-video-cost-israel-2026).",
          "There are technical limits too: small Hebrew text on packaging, hands performing a precise action, or a logo that must be identical in every frame. Most can be solved, but sometimes one filmed shot is cheaper than three revision rounds.",
        ],
      },
      {
        heading: "The mix: shoot the product once, build many worlds around it",
        paragraphs: [
          "The most economical approach I know for most products is not to choose. Shoot the product itself once, clean and accurate, and build the environments around it with AI. The product stays true to reality, and the setting changes without another shoot day. I detailed the method in the [guide to product photos without a studio](/en/guides/ai-product-photos-without-a-studio).",
          "The same logic works for videos with people: half a shoot day for the owner interview, and AI for the opening, the transitions and anything hard to film. You pay for the camera only during the hours it is genuinely worth the money.",
        ],
      },
      {
        heading: "How to decide in five minutes",
        paragraphs: [
          "Three questions. Is the value of the video real people or an idea? If people, a camera. Can all the videos happen in the same place? If so, a shoot day is probably cheaper per video. Do you need to test several different directions? If so, AI.",
          "A fourth question people skip: how often will you need this again? A shoot day is an event, and if you need more videos in two months, you pay for another day and another round of scheduling. AI production builds on assets that already exist, so the fifth video is cheaper and faster than the first. For a business that advertises every month, that difference outweighs any gap in the price of a single video.",
          "If the answers split, you probably need both, and that is perfectly fine. And if you want to see what AI production looks like in practice before deciding, there are examples on the [work page](/en/work).",
        ],
      },
    ],
    faq: [
      {
        q: "How much does a shoot day for social videos cost?",
        a: "A basic shoot day with a videographer and gear costs 2,500 to 5,000 shekels, and with editing for several short videos the total usually reaches 6,000 to 12,000. A full crew, actors and a paid location push that up significantly.",
      },
      {
        q: "How many videos can one shoot day produce?",
        a: "On a well-planned day with scripts ready in advance, six to ten short videos. In practice most days end with four to six usable ones. The more locations and outfits, the lower the output.",
      },
      {
        q: "Does an AI video look fake?",
        a: "An amateur AI video looks fake, mostly in hands, text and a product that changes shape between shots. A professional production fixes those in revision rounds and works with lighting, grain and sound so the result reads as one production. What is still hard to fake is a familiar person speaking to camera, and that is where filming is better.",
      },
      {
        q: "Which is faster, a shoot day or AI production?",
        a: "A shoot day usually needs a week of scheduling, the day itself, and another three to seven days of editing. A short AI video is ready in one to three working days. With both methods, waiting for approvals is what stretches the schedule most.",
      },
      {
        q: "Can I use my existing footage and photos in AI production?",
        a: "Yes, and it usually improves the result. High-quality product photos, a vector logo and existing video clips serve as a base or a reference and shorten the path to a video that stays true to the product. A screenshot from Instagram, on the other hand, adds work instead of saving it.",
      },
    ],
  },
  {
    slug: "landing-page-cost-for-campaign",
    title: "How Much Does a Campaign Landing Page Cost: The Difference Between 1,500 and 8,000 Shekels",
    excerpt:
      "What each price tier of a landing page actually buys, what sits outside the quote, and how to decide what to pay before you spend a shekel on ads.",
    category: "Websites & Development",
    image: "/images/guides/cover-web-dev.png",
    readTime: "6 min read",
    datePublished: "2026-10-24",
    relatedServiceSlug: "web-design",
    sections: [
      {
        heading: "Why two quotes for the same page are five times apart",
        paragraphs: [
          'You sent a brief to three suppliers and got back 1,500, 4,000 and 8,000 shekels for "a landing page". The natural assumption is that one of them is overpriced or one of them is an amateur. Most of the time neither is true: each is pricing different work under the same name.',
          "A landing page is one page, but it is not one amount of work. The gap between tiers almost never lives in the number of sections or the amount of animation. It lives in who makes the decisions: what the offer is, how it is worded, and what gets measured once the page is live.",
          "Before comparing numbers, it helps to know what each tier actually buys. This is what I see in the Israeli market today.",
        ],
      },
      {
        heading: "What 1,500 shekels buys: a template, your copy, and a launch",
        paragraphs: [
          "At this tier you usually get a ready-made template (Elementor, Wix or a similar builder) dressed in your colours and logo. The text, the images and the offer come from you, and there is one round of revisions, sometimes two. The form sends an email, and that is it.",
          "That is not an unfair price, and it is not necessarily bad. For a small campaign, a one-off event or a first test of an offer, a page like this can work very well, provided you can write a strong offer yourself. What it does not include: thinking about the message, mobile work beyond what the template gives you, and conversion events set up in the pixel.",
          "That last one is the trap. A page without proper measurement will not tell you whether the campaign works, and you will pay for media to find out late.",
        ],
      },
      {
        heading: "What 3,000 to 5,000 buys: a page built around the offer",
        paragraphs: [
          "This is the range most businesses should be in, and it is where [the website pricing guide](/en/guides/website-cost-guide-2026) places a single landing page, starting at roughly 3,000 shekels. Here the design is built around one offer rather than around a template: the headline, the order of the arguments and the placement of the button follow what the visitor needs to hear.",
          "It usually also includes real mobile work (that is where most campaign visitors arrive), a form connected to somewhere a person actually reads, a Meta pixel and a Google tag with a correctly configured conversion event, and two rounds of revisions. The copy is usually still yours, edited by the supplier.",
          "A page like this is quick to build. I covered the timeline itself, and what has to be ready for it to really take two days, [in the guide to a landing page in two days](/en/guides/landing-page-in-two-days).",
        ],
      },
      {
        heading: "What 6,000 to 8,000 buys: message, copy and testing",
        paragraphs: [
          "Above 6,000 shekels you are no longer buying a page, you are buying thinking. A supplier at this level writes the copy, works out the offer with you, builds dedicated visuals (a photo, a render or a short video for the top of the page), and usually delivers two versions of the headline or the opening to test against the same traffic.",
          "Sometimes this tier also includes a CRM connection, proper source tracking with UTMs, and work on load speed. Each of those is real work, so an 8,000 quote that itemises them is not padding.",
          "What to check: whether the versions and the copy are really included, or whether the higher price mostly reflects a more elaborate design. Impressive design alone does not justify the jump.",
        ],
      },
      {
        heading: "The myth: a more expensive page converts better",
        paragraphs: [
          "It does not work that way. A 1,500 page with a sharp offer and an ad that matches it will beat an 8,000 page with a vague offer nearly every time. Conversion is decided by the offer first, then by the match between the ad and the page, and only last by the design.",
          "What the price does buy is the chance that a professional stops you before you launch a weak offer, and the ability to know what failed when something fails. If you have both of those in house, you can pay less and lose nothing.",
          "And the reverse: if nobody on your side writes marketing copy, the 1,500 is the most expensive saving in the campaign.",
        ],
      },
      {
        heading: "How to match the page price to your media budget",
        paragraphs: [
          "A reasonable rule of thumb: the page should not cost more than one month of media, and not less than a tenth of it. Someone spending 2,000 shekels a month on ads does not need an 8,000 page. Someone spending 30,000 a month on a 1,500 page loses on every point of conversion the page leaves on the table.",
          "Simple arithmetic: on a 10,000 shekel monthly campaign, moving from 2% to 3% conversion is fifty percent more leads on the same budget. The difference between a 3,000 page and a 6,000 page pays for itself in the first month if it delivers that improvement, and pays back nothing if it does not.",
          "A campaign running several audiences usually needs more than one page. How many versions you really need, and when it becomes excessive, is laid out [in the guide to campaign variations](/en/guides/how-many-campaign-variations).",
        ],
      },
      {
        heading: "What almost no quote includes",
        paragraphs: [
          "A domain and hosting, if the page does not sit on your existing site. A subscription to the builder, if the page is built in Wix or Elementor Pro, which renews every year. And writing the ads themselves, which is the campaign manager's job rather than the page builder's.",
          "Another forgotten line: changes after launch. In the first week of a campaign you almost always swap a headline or a button based on the early numbers. Ask up front whether that is included or billed by the hour.",
          "And speed. A page heavy with images or uncompressed video loses visitors before they have seen the offer, and in a paid campaign every one of them is money already spent. What causes it and how to check, [in the guide to slow websites](/en/guides/why-is-my-website-slow).",
        ],
      },
      {
        heading: "Three questions that make any quote clear",
        paragraphs: [
          'Who writes the copy? If the answer is "you", compare the quote only with other quotes where you write as well. That is the most common reason two numbers look unrelated.',
          "What counts as a conversion, and where will I see it? A supplier who answers in detail about the pixel's conversion event understands they are building a campaign page, not one more page on a site.",
          "Who owns the page once it is live? A page that sits in the supplier's account and disappears when you stop paying is a rental, not a purchase. Worth knowing before you pay, not on the day you want to move. My own process from brief to launch is laid out on the [web design](/en/services/web-design) page.",
        ],
      },
    ],
    faq: [
      {
        q: "How long does it take to build a campaign landing page?",
        a: "A page in the 3,000 to 5,000 shekel tier usually takes two to five working days, provided the copy and images are ready. If the supplier also writes the copy, add a few days for a round on the message. Most delays come from decisions not yet made, not from the build itself.",
      },
      {
        q: "Is it better to build the landing page inside my existing site or separately?",
        a: "If your site is fast and lets you hide the menu and navigation, a page inside it saves a domain and an extra subscription. A separate page is better when the site is slow, or when you want to change things without touching the main site. Either way, a campaign page should not have a menu leading visitors away.",
      },
      {
        q: "How many revision rounds are normal for a landing page?",
        a: "Two is the market standard, and a third is usually paid. At the 1,500 shekel tier there is sometimes only one. Make sure it is written into the quote, because it is the most common difference between two quotes that look identical.",
      },
      {
        q: "Can I build a landing page myself and save the money?",
        a: "Yes, and for a small campaign that is entirely legitimate. The cost is a monthly builder subscription plus a few evenings of work. The hard part to do alone is configuring the conversion event in the pixel correctly, and without it you will not know whether your ad spend is working.",
      },
      {
        q: "Does a campaign landing page need SEO?",
        a: "Hardly. A campaign page gets its traffic from ads, so what matters is speed, matching the ad, and measurement. If you want Google to send it traffic over time as well, that is a service page on your site, which is a project priced differently.",
      },
    ],
  },
  {
    slug: "instagram-ai-ad-cost",
    title: "How Much Does an AI Instagram Ad Cost: Price by Length and Format",
    excerpt:
      "What an AI ad for Reels, Stories and the feed actually costs, why length matters less than you think, and what separates a 50-shekel video from a concept ad.",
    category: "AI Visuals & Content",
    image: "/images/guides/cover-ai-visual.png",
    readTime: "6 min read",
    datePublished: "2026-10-25",
    relatedServiceSlug: "ai-content",
    sections: [
      {
        heading: "Price is set by scenes, not by seconds",
        paragraphs: [
          'Businesses often ask me something like "how much is a 15-second Instagram ad?", as if there were a per-second rate card. There isn\'t. A 15-second ad with eight short scenes, a product that appears in every one of them and Hebrew captions costs more than a 30-second ad with three long, calm scenes.',
          "The reason is simple: every scene is a small production of its own. It has to be generated, sometimes dozens of times, the take where the product looks right has to be picked, and it has to cut into the next scene without a jump. I covered the overall picture of AI video pricing in the [guide to what an AI business video costs](/en/guides/ai-video-cost-guide). This one focuses on what changes when the destination is Instagram specifically.",
        ],
      },
      {
        heading: "Four prices you'll find on Google, and four completely different products",
        paragraphs: [
          "Anyone searching for an AI Instagram ad today runs into a confusing range. At one end, self-serve tools sell a Hebrew UGC video for around 50 shekels. Above them, monthly AI Reels packages work out to roughly 200 shekels a reel. Vendor pricing pages quote 2,500 to 3,000 shekels for a 40-second video, and a full production with a script, storyboard and product consistency runs between 5,000 and 15,000 shekels in the Israeli market.",
          "That isn't one product at four price points. It's four different products that all happen to be called \"AI video\". The fair comparison isn't which is cheaper, it's what each of them can actually do.",
        ],
      },
      {
        heading: "A self-serve avatar and a concept ad are not the same thing at different prices",
        paragraphs: [
          "The 50-shekel video is almost always an avatar: a stock character from a library reading the text you typed straight to camera. That works for a simple explainer, and I have no problem with it. But there's no idea in it. Nothing stops the scroll except a talking face, and the exact same character is also showing up for hundreds of other businesses that picked it from the same library.",
          "A concept ad starts from the question of what will make someone stop, and only then gets produced. It's built around your product rather than a generic character, so the product has to look like itself in every frame. I wrote about what a concept is and why it's worth seeing one before you order in the [guide to concept ads](/en/guides/what-is-a-concept-ad).",
          "There's one more place the cheap tools visibly fail: spoken Hebrew. Lip sync in Hebrew, pronunciation of brand names and an accent that doesn't sound translated are exactly where an avatar sounds like an avatar.",
        ],
      },
      {
        heading: "Format: Reels, Stories and feed are not three sizes of one video",
        paragraphs: [
          "Reels and Stories are vertical, 9:16, and a feed post works best at 4:5. The common mistake is to produce one horizontal video and crop the rest out of it. In that crop the product slips out of frame, captions collide with the app's interface, and a composition built for width simply doesn't work for height.",
          "When formats are planned up front, a vertical version and a feed version from the same production add little, usually a few hours of adapting and editing. When an extra format is requested after everything is done, some scenes sometimes have to be generated again, and that's where the price jumps. So tell your supplier in the brief where the video will run.",
          "One more detail that matters: in a vertical video, the top and bottom of the screen are covered by the account name, the caption and the buttons. A caption or a product placed there simply won't be seen. A supplier who works a lot for Instagram leaves those areas empty at the storyboard stage, rather than discovering the problem after the ad is live.",
        ],
      },
      {
        heading: "By length: what each length does and what it adds to the work",
        paragraphs: [
          "6 to 10 seconds: one hook, one message, usually two or three scenes. The cheapest format to produce and the hardest to write, because there's no time to explain anything. Good for Stories and for testing hooks.",
          "15 to 20 seconds: the most common length for a paid Reel. Enough for a hook, problem, solution and call to action across four to six scenes. In most cases this is where cost against result is best.",
          "30 seconds and up: right when there's a story, or a product that needs demonstrating. The price rises here not because of the seconds but because scenes almost always get added, and with them more work keeping shots consistent.",
        ],
      },
      {
        heading: "What I charge, and how it breaks down per video",
        paragraphs: [
          "A pilot with me is 1,800 shekels for one short ad video. The monthly package is 6,000 shekels for five videos, which is 1,200 shekels a video, and it covers the creative and ideas, production matched to the brand, and a steady cadence through the month. Anyone who moves from the pilot to the package within seven days of delivery gets the full 1,800 credited, and the pilot counts as the first of the five videos.",
          "I'm giving these numbers so you can place them inside the range above, not to persuade you. They're far above 50 shekels and below a full 5,000-plus production, which is exactly where a short concept ad for Instagram sits.",
        ],
      },
      {
        heading: "Why a single Instagram ad is almost always the wrong calculation",
        paragraphs: [
          "A Meta ad now fatigues within two to three weeks. After that the same audience has already seen it, cost per click climbs, and the ad that worked beautifully in week one stops working. So the right question isn't what one ad costs, it's what it costs to keep a campaign alive for a month.",
          "In practice, a business advertising steadily needs several concepts and several hooks per concept. I went into how many versions are actually worth testing in the [guide to campaign variations](/en/guides/how-many-campaign-variations). It's also why the per-video price in a package is lower than a one-off: most of the work of building the brand and product assets happens once.",
        ],
      },
      {
        heading: "Five questions that separate a real quote from an empty one",
        paragraphs: [
          "How many scenes are in the video, and who writes the concept? Which formats are included, and are both 9:16 and 4:5 in? How many revision rounds are included? Is your actual product the asset used in production, or a generic render that only resembles it? And who owns the rights to the video at the end?",
          "The answer to the fourth question usually explains the price gap. Keeping a bottle, a package or a logo identical across a whole video is a job in itself, and I wrote about it in the [guide to character and product consistency in AI](/en/guides/ai-character-consistency). A supplier who never asks you about the product probably isn't planning to protect it.",
          "And one more thing worth checking: whether the quote includes captions. Most Instagram viewing happens with the sound off, so an ad without captions loses a large part of its audience before the message lands. Hebrew captions, aligned properly right to left in a font that reads on a phone screen, are a small job that changes a lot.",
        ],
      },
    ],
    faq: [
      {
        q: "How much does an AI Reel for Instagram cost?",
        a: "It depends what you're getting. Self-serve tools sell an avatar video for around 50 shekels, and monthly Reels packages work out to roughly 200 shekels a reel. A concept ad built on your product starts around 1,200 to 1,800 shekels a video, and a full production with a script and storyboard runs 5,000 to 15,000 shekels.",
      },
      {
        q: "Does a 30-second video cost twice as much as a 15-second one?",
        a: "No. Price is driven mainly by the number of scenes and by product consistency, not by length. A 30-second video in three scenes can cost less than a 15-second video in eight.",
      },
      {
        q: "Do I need separate videos for Reels, Stories and the feed?",
        a: "Reels and Stories are both 9:16, so one version serves both, with a small adjustment for the areas the app's interface covers. The feed is better at 4:5. If formats are planned from the start, an extra version adds only a few hours of work.",
      },
      {
        q: "How long does it take to produce an AI Instagram ad?",
        a: "A short 15 to 20 second ad usually takes a few working days from brief to delivery, including a round of revisions. What drags it out is usually waiting on materials or approvals, not the production itself.",
      },
      {
        q: "Can I run an AI ad on Meta without problems?",
        a: "Yes. Meta allows AI-generated ads and in some cases labels them as such. What gets rejected is usually the same thing that gets a filmed ad rejected: unsupported claims, real people used without permission, or misleading text.",
      },
    ],
  },
  {
    slug: "ai-videos-for-importers-distributors",
    title: "AI videos for importers and distributors: a full catalogue without a shoot day per product",
    excerpt:
      "How an importer with hundreds of products gets video for the catalogue without shooting each one, where it works, where it still falls short, and what it actually costs.",
    category: "AI Visuals & Content",
    image: "/images/guides/cover-ai-visual.png",
    readTime: "6 min read",
    datePublished: "2026-10-26",
    relatedServiceSlug: "ai-content",
    sections: [
      {
        heading: "An importer's problem isn't one video, it's 300 products",
        paragraphs: [
          "A brand with five products can afford a shoot day for every launch. An importer or distributor with 300 SKUs can't, and usually doesn't try. What actually happens is that ten products get content, and the rest of the catalogue lives on the manufacturer's stock photo and a hastily translated description.",
          "And that's exactly where video is missing most. The retailer wants a short clip for an in-store screen, the marketplace favours listings with video, and a paid ad without motion dies quickly. The need isn't one polished film. It's a lot of very decent, consistent videos arriving at the pace of the catalogue.",
          "There's another side importers tend to forget: they don't always own the brand. When the overseas manufacturer supplies no Hebrew content, or supplies content built for a completely different market, the gap falls on the importer, and usually on one marketing manager who carries both the catalogue and the campaigns.",
        ],
      },
      {
        heading: "Why a shoot day per product breaks down on video specifically",
        paragraphs: [
          "I want to be fair to photography. Product stills in Israel are a competitive, cheap market: a studio day runs roughly 1,400 to 2,500 shekels, and some photographers will shoot a hundred products on white for a similar sum. If all you need is catalogue photos, AI isn't necessarily the big saving you're being promised.",
          "Video is a different story. No studio will deliver thirty short clips, each with a different product in a scene that suits it, for 2,500 shekels. A filmed product video needs a set, lighting, camera movement and an edit, and every extra product is close to a new production. That's where the gap between a shoot and AI goes from tens of percent to an order of magnitude.",
        ],
      },
      {
        heading: 'The myth: "AI invents a product that looks similar"',
        paragraphs: [
          "This is the most common worry I hear from importers, and it's a fair one: a customer who orders a product and receives something different from the video is a return and a complaint. But a professional production doesn't start from a text description of the product. It starts from real photos of it, and the product is kept as it is while the environment around it is built. I explained the mechanism in [the guide to turning an image into a video](/en/guides/image-to-video-ai-explained).",
          "In practice, the most important work is making sure the product stays itself in every frame: same colour, same shape, same logo. A version where the handle moved or the packaging changed colour is rejected, even if it looks better. That's the part that takes time, not generating the scene itself.",
        ],
      },
      {
        heading: "What an importer needs to supply for this to work",
        paragraphs: [
          "For each product: three to five sharp photos from different angles, in even light, on a plain background. A good phone photo is enough. If the packaging carries text or a logo that has to be exact, shoot those separately in close-up. Most importers already have this from the manufacturer, sometimes in better quality than they think.",
          "Two more things save revision rounds: one sentence on what the product does and who it's for, and a list of what must not be shown. A product meant for professional use shouldn't appear in a home kitchen, and an age-restricted product shouldn't appear near children. A supplier who doesn't ask this up front will find out in revisions.",
        ],
      },
      {
        heading: "Not the whole catalogue, the catalogue that sells",
        paragraphs: [
          "The mistake I see most is trying to cover all 300 products at once. In most catalogues twenty to thirty products bring in most of the revenue, and that's where video pays for itself. The rest is better left with good photos until there's a reason to touch it: a launch, a promotion, or a large customer asking.",
          "And build one template per product line, not a unique video per SKU. Same structure, same camera move and same graphic language, with the product and the scene swapped. That's also what makes the catalogue look like one brand rather than twenty different suppliers, and it lowers the cost of every additional video.",
          "An order that usually works: first the products already running in ads, because there a new video replaces one that has worn out. Then new products at launch. Only then older products that sell well without video.",
        ],
      },
      {
        heading: "One version isn't enough for any channel",
        paragraphs: [
          "An importer's product video lives in several places at once: a Meta ad in 9:16, a product page in 1:1 or 16:9, a retailer's in-store screen, and sometimes a deck for a chain deciding whether to stock the product. Cropping a vertical video to horizontal after the fact cuts away half the frame, and usually the product with it. Decide on formats before production.",
          "Ads add another layer: the same product needs several different openings so the ad doesn't wear out after two weeks. How many versions a campaign really needs is in [the guide to campaign variations](/en/guides/how-many-campaign-variations).",
        ],
      },
      {
        heading: "Where it still falls short",
        paragraphs: [
          "Products whose sale depends on texture: fabrics, brushed surfaces, things you need to feel are soft. Shiny and transparent products like glass and jewellery, where reflection is the hardest thing to make convincing. And technical products where a number, a dimension or a connector must be exact, because there a small error is a factual mistake rather than a matter of style.",
          "One more limit worth knowing: Hebrew text inside the frame. Models still distort letters, so on-screen text is added in the edit rather than asking the model to write it. And products with regulated marketing, like supplements or medical products, need a check on what may be shown, regardless of how the video is made.",
          "None of these limits rules out a whole catalogue. They mean that inside the catalogue there are products suited to AI and products still worth shooting, and the decision should be made per product line rather than all at once.",
        ],
      },
      {
        heading: "What it costs, and how to start without committing the catalogue",
        paragraphs: [
          "Supplier pricing pages in the Israeli market usually quote 2,500 to 3,000 shekels for a 40-second video. My pilot for one short ad video is 1,800 shekels, and the monthly package of five short ad videos, concept included, is 6,000 shekels a month. Moving to the package within seven days of receiving the pilot credits the full 1,800, and the pilot counts as the first of the five. The full breakdown of what moves the price of AI video is in [the AI video cost guide](/en/guides/ai-video-cost-guide).",
          "It's worth being honest about the maths: five videos a month don't cover 300 products, and they aren't meant to. They cover the lead products and whatever is running in ads right now. The right way to start is one product line, one video running in a real ad, and measurement. If that product sells better with video, you have your answer on whether to expand, in your numbers rather than mine. Examples of what this produces are on [the work page](/en/work).",
        ],
      },
    ],
    faq: [
      {
        q: "Can you make an AI video of a product I only have a manufacturer's photo of?",
        a: "Usually yes, if the photo is sharp and shows the whole product. One photo limits the angles you can show, so three to five photos from different angles give a much better result. A blurry or small photo produces a blurry product, and that can't be fixed later.",
      },
      {
        q: "How long does an AI product video take?",
        a: "A short product video usually takes a few working days from the moment there are photos and a brief, including a revision round. Once a product line has a fixed template, each further video in that line is faster, because the structure and the graphic language are already decided.",
      },
      {
        q: "Can my retailers and distributors use the videos too?",
        a: "Yes. Once the video is paid for, the usage rights are full, including paid ads and passing it to retailers for in-store screens or their own sites. Just decide the formats up front, because a retailer with a landscape screen can't use a vertical video.",
      },
      {
        q: "What's the difference between an AI video and a product animation?",
        a: "Animation rebuilds the product as a 3D model, which is very precise but expensive and slow, often thousands of shekels per product. An AI video starts from a real photo of the product and places it in a scene that looks filmed. For a wide catalogue AI is faster and cheaper; for a technical product you need to show from the inside, animation is still better.",
      },
      {
        q: "Does this make sense for products I import in small quantities?",
        a: "It can, but first ask whether the product sells enough to justify video. A product that sells ten units a month won't pay back an 1,800-shekel video, however good it is. Start with products that already sell and that you want to grow, where video pays for itself fastest.",
      },
    ],
  },
  {
    slug: "sora-for-business",
    title: "Sora for Business: What It Can Actually Produce and What It Still Can't",
    excerpt:
      "What Sora can really do for a business ad, where it still breaks, and why a supplier who uses it every day doesn't rely on it alone.",
    category: "AI Visuals & Content",
    image: "/images/guides/cover-ai-visual.png",
    readTime: "6 min read",
    datePublished: "2026-10-27",
    relatedServiceSlug: "ai-content",
    sections: [
      {
        heading: "The real question isn't whether Sora is good, it's whether it will make your ad",
        paragraphs: [
          "A business owner who searches for \"Sora\" mostly finds news coverage of the technology. What they're actually asking is whether this tool can make their ad, and if it can, why they'd pay anyone else. I work with Sora and similar tools almost every day, so I'm answering as someone who produces with them, not someone who rates them.",
          "The short answer: Sora produces very impressive shots. An ad is not a shot. It's a sequence of scenes in which your product looks like itself, the message is clear and the edit holds attention to the end, and that's a process, not a click.",
        ],
      },
      {
        heading: "What Sora genuinely does well today",
        paragraphs: [
          "Atmosphere, motion and light. Coffee pouring in slow motion, a rainy street at night, a kitchen in the morning with light through the window: on shots like these Sora produces results that a few years ago would have needed a shoot day. The physics has also improved a lot, and liquids, fabric and hair behave far more naturally than they used to.",
          "Its second version also generates synchronised sound, including ambience and effects, which saves a whole step on simple shots. It's excellent for exploring an idea too: before investing in production you can quickly see how a concept looks in motion, and kill a direction that doesn't work before it has cost money.",
          "Where does that fit into an ad? Mostly in the transition and background shots: the opening that sets the mood, the setting the product appears in, the moment something happens in slow motion. Those are the shots that used to need a location, a lighting crew and a team, and today they're the cheap, fast part of production.",
        ],
      },
      {
        heading: "What it still doesn't do, and why that's exactly what a business needs",
        paragraphs: [
          "Your product. Sora doesn't know your bottle, your packaging or your logo, and in every new generation it reinvents them with small differences: a label that shifts, a colour that drifts, a shape that rounds off. In a mood video that doesn't matter. In an ad it's the difference between your brand and a generic product that looks a bit like it.",
          "Text inside the frame, and Hebrew above all. Hebrew letters on a sign, a package or a screen usually come out garbled, so every piece of text in my ads goes in during the edit rather than the generation. The same goes for spoken Hebrew: pronunciation and lip sync still aren't reliable enough for an actor talking to camera in a paid ad.",
          "And continuity. Each generation is a short clip of a few seconds. Joining several of them into one scene where the same character wears the same shirt in the same room takes work the tool doesn't do for you.",
        ],
      },
      {
        heading: "The myth: type a prompt and out comes an ad",
        paragraphs: [
          "This is the myth that misleads businesses most, because the videos they see online look like they were made in one click. In reality, what you're seeing is the best attempt out of dozens. One shot that makes it into an ad is usually preceded by ten, twenty, sometimes more attempts in which a hand came out with six fingers or the product melted halfway through.",
          "After selection comes editing, sound, music, captions, adapting to vertical and a revision round. I laid out what that timeline looks like end to end in the [guide to the AI commercial production timeline](/en/guides/ai-commercial-production-timeline). Sora shortens the filming stage enormously. It doesn't remove everything else.",
        ],
      },
      {
        heading: "A serious supplier doesn't work with Sora alone",
        paragraphs: [
          "Sora is one tool among several. Google's Veo and Kling are the main competitors, and each of them has kinds of shots it handles better. I don't choose a tool for a project, I choose a tool for a shot: an atmosphere shot in one tool, product motion in another, and sometimes a shot that starts from a still image prepared in advance.",
          'That last method, starting from an image rather than from text, is the main way to keep a real product inside an AI video. I explained how it works in the [guide to turning an image into video](/en/guides/image-to-video-ai-explained). Anyone comparing the tools only on "which is better" misses that real production uses several of them together.',
        ],
      },
      {
        heading: "What you can and can't generate, and why it matters to a business",
        paragraphs: [
          "Sora, like the comparable tools, has a content policy. It restricts generating real people without their consent, copyrighted characters and content that imitates someone else's brand. For an ad that's actually a good thing: an ad featuring a celebrity who didn't agree, or a character from a well-known film, is a legal problem even if the tool had allowed it.",
          "What you should check yourself is the commercial-use terms of the plan you're on, and whether the video carries a marking that identifies it as AI output. Meta, for example, labels some AI-generated content. That doesn't disqualify an ad, but it's better to know before the campaign goes live than after.",
        ],
      },
      {
        heading: "What it really costs when you do it yourself",
        paragraphs: [
          "The subscription is the cheap part. The real cost is time: writing prompts, generating, rejecting, generating again, then editing. A business owner trying for the first time to produce a 20-second ad good enough for a paid campaign will easily spend several evenings on it, and find at the end that their product looks slightly different in every scene. The part that's easiest to miss is the edit: even ten good shots don't become an ad without pacing, sound and captions holding them together.",
          "For comparison, a pilot with me is 1,800 shekels for one short ad video, and a monthly package is 6,000 shekels for five. You'll find the full picture of AI video pricing in the market in the [guide to what an AI business video costs](/en/guides/ai-video-cost-guide). I don't think every business needs to pay for this, and the next section explains when it doesn't.",
        ],
      },
      {
        heading: "When to do it yourself and when to commission a production",
        paragraphs: [
          "Doing it yourself makes sense when there's no product that has to look exact and no media budget behind the video: an atmospheric Story for a café, a rotating background for a website, an idea you want to see in motion before you talk to anyone. There Sora gives a great deal for very little, and it's worth learning.",
          "A production earns its cost when the video will run on paid media, when the product has to be your product and not something that resembles it, and when you need several versions every month because ads fatigue. There the tool is only part of the work, and what decides the result is the concept, the selection and the edit. You can see examples of what that produces in [the work](/en/work).",
        ],
      },
    ],
    faq: [
      {
        q: "Can I use a Sora video in a commercial ad?",
        a: "Generally yes, but it depends on the terms of your plan, and it's worth reading them before launching a campaign. You also can't include a real person who hasn't consented, protected characters or other companies' trademarks, even if the tool managed to generate them.",
      },
      {
        q: "Can Sora speak Hebrew?",
        a: "It can generate speech, but in Hebrew the pronunciation and lip sync still aren't reliable enough for a paid ad. In the ads I produce, Hebrew dialogue is recorded or generated separately and synced in the edit, and all on-screen text goes in during editing rather than generation.",
      },
      {
        q: "Which is better for an ad: Sora, Veo or Kling?",
        a: "There's no fixed winner, and serious production uses several tools in the same video. Each has kinds of shots it does better, so the choice is made shot by shot rather than per project.",
      },
      {
        q: "Can I put my real product into a Sora video?",
        a: "You can get closer by working from a photo of the product rather than a text description, but even then the product may shift slightly between scenes. Keeping the label, colour and shape identical through a whole video takes careful selection from many attempts and sometimes a fix in the edit.",
      },
      {
        q: "How long does it take to produce an ad with Sora?",
        a: "The shots themselves generate in minutes, but a short 15 to 20 second ad usually takes a few working days from brief to delivery. Most of the time goes into repeated attempts, selection, editing, sound and captions.",
      },
    ],
  },
  {
    slug: "ai-videos-for-beauty-brands",
    title: "AI Videos for Skincare and Beauty Brands: The Category That Burns Through Creative Fastest",
    excerpt:
      "Why beauty brands need more creative than any other category, what AI can honestly show, and what it should not show even when it can.",
    category: "AI Visuals & Content",
    image: "/images/guides/cover-ai-visual.png",
    readTime: "6 min read",
    datePublished: "2026-10-28",
    relatedServiceSlug: "ai-content",
    sections: [
      {
        heading: "Why beauty burns through creative fastest",
        paragraphs: [
          "Skincare and beauty is one of the most crowded categories on Meta. The same audience sees dozens of ads for creams, serums and shampoos every week, and an ad that worked beautifully starts to fatigue after two or three weeks. A brand spending 20,000 to 50,000 shekels a month on media needs several new creatives every week just to keep delivery alive.",
          "A shoot day cannot hold that pace. It produces one batch of assets, and the batch is burned before the next one is ready. That is the gap where AI video fits naturally: not as a cheap substitute for something that worked, but as a way to produce the volume the category demands.",
        ],
      },
      {
        heading: "What AI can actually do for a beauty product",
        paragraphs: [
          "A lot, when you start from the real product. I work from a photo of the bottle or the tube and build the scene from there: the product on a stone surface in morning light, a drop falling into a serum, cream resting on a fingertip, steam in a shower. The method itself is explained [in the guide to turning an image into video](/en/guides/image-to-video-ai-explained).",
          "The setting changes without a location, too: the same product on a bathroom shelf, in a travel bag and in sunset light, each one a separate video. In a category where the mood sells as much as the formula, that is exactly what needs replacing every week.",
          "Where it is still hard: labels with small text, and above all Hebrew on the packaging. A model can garble a letter in a single frame, so every video is checked frame by frame before it goes out, and some close-ups are built from the original photo instead of being generated again.",
        ],
      },
      {
        heading: "The myth: AI can show what the cream does",
        paragraphs: [
          'This is where you have to stop. A model can produce a face with smoother skin after "two weeks of use", and it will look completely convincing. But it is not a result of the product, it is an invented picture. An AI-generated before and after shows a change no product made.',
          "Beyond the ethical problem there is a practical one. Meta restricts before and after imagery in categories that touch the body and appearance, and those ads get rejected or limited in delivery. And a customer who bought because of a result that does not exist becomes a return, an angry comment and a review sitting under your next ad.",
          "So my rule is simple: AI shows the product, the texture, the ritual of using it and the mood. It does not show a result on skin. A real result, if you have one, comes from real footage of a real customer who agreed to it.",
        ],
      },
      {
        heading: "What the video may claim, however good it looks",
        paragraphs: [
          "A cosmetic product can claim to moisturise, refresh or improve the look of skin. It cannot claim to treat, heal or clear a medical condition, in Israel and in most markets, because a claim like that turns it into a medicinal product in the regulator's eyes.",
          "AI does not change that rule, but it makes it easy to break without noticing. When a scene shows a rash disappearing or a dark spot fading, the video makes a medical claim even if the caption is careful. So both the text and the picture are checked against the claims on the packaging, and anything not there stays out of the video.",
          "When a wording is in doubt, whoever registered the product for you, or your regulatory adviser, is the person to ask. It is a ten-minute conversation that saves an ad from being rejected.",
        ],
      },
      {
        heading: "Why beauty brands cannot show customers, and what to do instead",
        paragraphs: [
          "Someone who bought an acne cream does not want her face in an ad, and even a happy customer will not always sign off on her image being used. That is one reason AI is a genuine fit in beauty rather than a cheap substitute: it lets you show the product in use without exposing anyone.",
          'The honest way to do it is a character who presents, not a character who testifies. An AI character can apply a cream, explain what is in the bottle and show how to use it, like a model in any commercial. She should not say "this changed my skin", because she has no skin. A quote from a real customer, with her permission, can appear as on-screen text.',
          "For the character to stay the same person across a whole series, you build her once and keep her. How that works and where it falls short, [in the guide to character consistency](/en/guides/ai-character-consistency).",
        ],
      },
      {
        heading: "The technical flaw that shows more in beauty than anywhere else",
        paragraphs: [
          "Video models tend to smooth skin. In a car commercial nobody notices, but in a face cream ad skin without pores looks like a filter, and this category's audience spots a filter from a distance. It is the fastest giveaway of a cheap AI video.",
          "The fix is craft rather than a tool: choosing a model that keeps texture, prompting explicitly for real skin, and rejecting every take that looks smoothed. The same goes for the product's own texture: if your cream is thick and matte, it cannot appear runny and glossy on screen, because the customer will open the jar and see the difference.",
        ],
      },
      {
        heading: "How many videos a beauty brand really needs a month",
        paragraphs: [
          "More than any single supplier usually produces. A brand running serious media needs four to eight creatives a week, and that number includes hook and format variations, not just new ideas. I wrote about the difference between an idea and a version [in the guide to campaign variations](/en/guides/how-many-campaign-variations).",
          "What works in practice is a split: AI video as the layer that tests ideas and hooks quickly, and real creators for the concepts that have already proved out. That way you are not paying a creator for twenty attempts, only for what already works. I went deeper on that combination [in the guide to AI UGC content](/en/guides/ai-ugc-content-that-converts).",
        ],
      },
      {
        heading: "What it costs, and what to check in a pilot",
        paragraphs: [
          "A pilot with me is one short ad video for 1,800 shekels. The monthly package is 6,000 shekels for five videos: ideas and creative, production matched to the brand, and a steady monthly cadence. Moving to the package within seven days of delivery credits the full 1,800, and the pilot counts as the first of the five videos.",
          "In a pilot for a beauty brand, check three things: whether the label stays legible and correct in every frame, whether the texture resembles what is in the jar, and whether the character's skin looks like skin. If all three pass, the only question left is whether the video works in media, and that is measured in money. What the market charges and what drives it, [in the AI video cost guide](/en/guides/ai-video-cost-guide).",
        ],
      },
    ],
    faq: [
      {
        q: "Can I use an AI character in a cosmetics ad?",
        a: "Yes, as long as she presents the product rather than testifying to a result she supposedly had. A character showing how to apply a serum is a model; a character saying her wrinkles vanished is a fake testimonial. It is also worth checking the AI-content labelling rules of the platform you advertise on.",
      },
      {
        q: "Can you make a before and after video with AI?",
        a: "Technically yes, and I do not do it. A result generated by a model is not a result of the product, Meta restricts that kind of imagery in appearance and body categories, and the customer will find the gap within the first week. If you have real results, they come from real footage with written consent.",
      },
      {
        q: "Do I need to send a physical product to get an AI video made?",
        a: "Usually not. Sharp photos of the packaging from several angles are enough, plus a short phone video of the texture on a hand so the texture on screen matches what is in the jar. A product with a complex label or transparent packaging sometimes justifies shipping it.",
      },
      {
        q: "Are 5 videos a month enough for a cosmetics brand?",
        a: "For a brand spending a few thousand shekels a month on media, usually yes. A brand spending 30,000 or more needs more, and there five AI videos work as the testing layer alongside real creators, not instead of them. Size it by media budget, not by the number of products.",
      },
      {
        q: "Do AI videos make sense for a small beauty brand with no ad budget?",
        a: "For one video, yes: a 1,800 shekel pilot gives you an asset for the product page and Instagram. A monthly package does not fit a brand with no paid media, because without a running campaign nothing is burning through the creative and there is no reason to refresh it every week.",
      },
    ],
  },
]

// Everything from the daily routine is a file in content/guides; see
// contentGuides.ts. The handwritten list above stops growing there.
export const guidesEn: GuideEn[] = [...handwrittenGuidesEn, ...contentGuides.map(contentGuideToEn)]
