export type GuideSectionEn = { heading: string; paragraphs: string[] }

export type GuideEn = {
  slug: string
  title: string
  excerpt: string
  category: string
  readTime: string
  datePublished: string
  heroVideo?: string
  heroImage?: string
  relatedServiceSlug?: string
  sections: GuideSectionEn[]
}

export const guidesEn: GuideEn[] = [
  {
    slug: "kama-ole-livnot-atar",
    title: "How Much Does It Cost to Build a Website for a Small Business in 2026 — A Real Pricing Guide",
    excerpt: "Price ranges, what actually drives them, and how to tell if a quote you received makes sense — no vague numbers.",
    category: "Websites & Development",
    readTime: "6 min read",
    datePublished: "2026-08-15",
    heroVideo: "/videos/raz-showreel-7.mp4",
    heroImage: "/images/guides/kama-ole-livnot-atar.jpg",
    relatedServiceSlug: "web-design",
    sections: [
      {
        heading: "Why there's no single number",
        paragraphs: [
          "Every time someone asks me, \"How much does a website cost?\" the honest answer is — it depends. Not because I'm dodging the question, but because \"website\" is a term that covers dozens of completely different scenarios: a single landing page for a campaign, a multi-page brochure site, an e-commerce store with inventory management, or a custom system with its own business logic. The price changes accordingly.",
          "That said, I can give realistic ranges, so you'll know whether a quote you received makes sense or not.",
        ],
      },
      {
        heading: "Standard price ranges in the Israeli market",
        paragraphs: [
          "A single landing page — usually starts around ₪3,000 (~$800). Good for a focused campaign, not for a full digital presence.",
          "A basic brochure site, 5-7 pages, without custom development — ranges between ₪2,500 and ₪5,000 for simple projects, and up to ₪8,000-12,000 when you add a blog, smart forms, and SEO built in from the ground up.",
          "An online store (e-commerce) — usually starts around ₪15,000 and goes up from there, depending on the number of products and the integrations needed for payments and logistics.",
          "A site with custom development (React / dedicated code, not a template) — here the range is genuinely wide, because there's no ceiling on the performance and interactivity you can build. Projects like this can run anywhere from several tens of thousands of shekels and up, depending on scope.",
          "There's also a monthly subscription model (roughly ₪300-1,200 a month) that bundles building, hosting, and maintenance into one package — convenient for businesses that don't want one big upfront payment, but it's worth calculating the cumulative cost over 2-3 years and comparing it to a one-time payment.",
        ],
      },
      {
        heading: "What actually drives the price",
        paragraphs: [
          "The number of pages and the complexity of each page is the most obvious variable, but not the only one. The questions that really determine price: Do you need dynamic content that updates (like a product catalog, a blog, a project gallery)? Are there third-party integrations (CRM, a payment system, a lead management system)? Is the design a customized template or a unique design concept built from scratch? And is the end product WordPress (faster to build, a huge ecosystem of plugins) or custom development (more flexibility and performance, but also more development time)?",
          "One component people often forget to price: briefing and content time. A website isn't built from code alone — it needs images, copy, and sometimes video. A project where the client arrives with ready materials is cheaper and faster than one where everything has to be produced from scratch.",
        ],
      },
      {
        heading: "Where AI changes the equation",
        paragraphs: [
          "AI tools don't make a complex site cheap, but they do significantly cut development time in certain parts — writing code, generating initial content, and even producing images and video instead of expensive commercial photography. In practice this means: the same finish quality, in less time, and sometimes at a lower cost — not because quality dropped, but because some of the manual work has been replaced by smarter tools under professional supervision.",
          "It's important to distinguish: a site built \"with AI\" as a workflow is completely different from a site built by a fully automated website builder with no human touch. The first can reach a high professional standard. The second is limited in flexibility, performance, and support for large, complex sites.",
        ],
      },
      {
        heading: "How to tell if a quote is reasonable",
        paragraphs: [
          "Ask for a breakdown: how many pages, what's included in maintenance, and what changes cost after delivery. A vague quote (\"website build — ₪5,000\") is a small red flag. A good quote spells out exactly what's included, what isn't, and what happens after launch.",
        ],
      },
      {
        heading: "Common mistakes when choosing a vendor",
        paragraphs: [
          "The most common one: choosing based on the lowest price without checking exactly what's included. A ₪2,000 gap between two quotes usually reflects a real difference in scope of work — not \"the same thing for less money.\"",
          "Second mistake: not checking previous work examples that are actually relevant to your field. A beautiful site for a fashion brand doesn't prove the ability to build a complex booking system.",
          "Third mistake: not asking upfront who owns the code and content once the project ends. In some cases (mainly on closed platforms) the client effectively can't switch to another vendor without rebuilding everything from scratch.",
        ],
      },
      {
        heading: "What happens after launch",
        paragraphs: [
          "A launched site isn't a finished site — it's a site that's starting to live. Within a month or two, small needs almost always come up: fixing text, adding a page, changing an image.",
          "It's worth knowing in advance how this is priced: some vendors give a free support hour in the first month, and some charge for every change from day one. It's a small detail that significantly affects the real cost over the first year.",
        ],
      },
    ],
  },
  {
    slug: "tachzukat-atarim-ai",
    title: "AI-Powered Website Maintenance — How It Actually Works",
    excerpt: "Not just another buzzword. What AI actually does in website maintenance, where it helps, and where you still need a human.",
    category: "Websites & Development",
    readTime: "6 min read",
    datePublished: "2026-08-15",
    heroVideo: "/videos/raz-showreel-4.mp4",
    heroImage: "/images/guides/tachzukat-atarim-ai.jpg",
    relatedServiceSlug: "web-design",
    sections: [
      {
        heading: "What this actually means",
        paragraphs: [
          "\"AI-powered website maintenance\" sounds like a marketing term, but behind it is concrete work: content and image updates using generative tools, automatic detection of performance and SEO issues, and writing/editing new content at a pace far faster than a fully manual process. That doesn't mean the site \"maintains itself\" — it means the work a human does is significantly shorter, because a large share of the repetitive tasks (writing product descriptions, optimizing images, suggesting content improvements) is done with smart tools and then reviewed and approved.",
        ],
      },
      {
        heading: "What AI is actually good at here",
        paragraphs: [
          "Writing and editing content — first drafts for pages, blog posts, and product descriptions, based on existing style and information and then edited by hand.",
          "Optimizing images and media — compression, modern formats, faster loading, without hurting quality.",
          "Detecting technical SEO issues — missing meta descriptions, broken heading structure, dead links — tasks that used to require manual scanning.",
          "Quickly generating design or content variations, to test what actually performs better with a real audience.",
        ],
      },
      {
        heading: "What still requires a human",
        paragraphs: [
          "Strategic decisions — what to prioritize, what the brand's message is, what stays the same even as trends shift. Subtle design decisions tied to brand identity. And everything related to security, backups, and infrastructure — where a mistake is costly, and where strict human oversight isn't optional.",
          "In short: AI speeds up repetitive work, it doesn't replace judgment. Good AI-assisted website maintenance is a human with smart tools — not smart tools alone.",
        ],
      },
      {
        heading: "What to check before signing a maintenance package",
        paragraphs: [
          "What's the guaranteed response time when something breaks. Whether backups happen automatically and how often. Whether content updates are included or billed separately. And most important — who actually reviews and approves what the AI generates, before it goes live.",
        ],
      },
      {
        heading: "What a typical maintenance week looks like",
        paragraphs: [
          "An automatic performance and security check at the start of the week — an alert if something changed for the worse. Requested content updates (text, images, prices) get done within a day or two, not left waiting for a monthly cycle.",
          "Periodically — a technical SEO check: missing meta tags, dead links, load speed. This is the \"boring\" routine work that used to get pushed off because it ate up so much manual time, and that AI now makes genuinely practical.",
        ],
      },
      {
        heading: "When AI maintenance isn't enough",
        paragraphs: [
          "When there's a problem that requires a deep understanding of the code itself — a bug that comes from the interaction between several systems, not just \"a plugin clashing with a plugin.\" There you need a developer who understands the architecture, not just a tool that spots symptoms.",
          "And when there's a strategic decision tied to the site's business direction — whether to add a feature, change the navigation structure, enter a new market. These are decisions that require understanding the business, not just the code.",
        ],
      },
    ],
  },
  {
    slug: "maavar-wordpress-le-ai",
    title: "Moving From WordPress to an AI-Based Site — What to Know Before You Decide",
    excerpt: "An honest guide, including when it's the right move and when it's a mistake. No single tool sold to you as a magic fix.",
    category: "Websites & Development",
    readTime: "6 min read",
    datePublished: "2026-08-15",
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
          "When you need your in-house team (non-developers) to be able to edit content, add pages, and run a blog themselves. When the business depends on a plugin ecosystem (store, memberships, bookings). When the site is large and complex with a lot of content and pages — pure AI tools still struggle at that scale.",
        ],
      },
      {
        heading: "When it's worth considering leaving WordPress",
        paragraphs: [
          "When the site is chronically slow, cluttered with old plugins that are hard to maintain, and every small change means \"figuring out what broke.\" When you need performance and interactivity that WordPress inherently limits. When the old site simply no longer represents the brand, and it's better to design a new concept from scratch.",
          "This is where AI enters the picture as a layer of the workflow, not necessarily as a replacement for WordPress: you can use AI tools to quickly shape a concept, structure, and initial content, and then build the final result professionally — sometimes back on WordPress with a new design, sometimes through custom development.",
        ],
      },
      {
        heading: "The limitation worth knowing",
        paragraphs: [
          "End-to-end AI website builders are great for speed and prototypes, but they're generally limited in flexibility for large, complex sites and in fine-grained design control. They're an excellent tool at the idea and planning stage — less so as the final infrastructure for a core business site that needs to grow with you for years to come.",
        ],
      },
      {
        heading: "Practical recommendation",
        paragraphs: [
          "Before deciding, map out exactly what's hurting on the current site: speed? design? ease of management? missing capabilities? The answer to that — not the trend — is what should determine whether the move is to a different infrastructure, a redesign within WordPress, or custom development with AI as part of the workflow.",
        ],
      },
      {
        heading: "Checklist before deciding",
        paragraphs: [
          "Does your in-house team need to edit content on an ongoing basis? If so — that's a heavy consideration in favor of staying on WordPress.",
          "Does the site depend on dedicated plugins (bookings, memberships, industry-specific integrations)? Check whether there's an equivalent in AI tools before deciding to switch.",
          "Is the real problem speed/design, or is it actually a content and messaging problem? A technology switch doesn't fix an unclear message.",
        ],
      },
      {
        heading: "How long a real migration takes, and what it costs",
        paragraphs: [
          "A standard migration (a mid-sized brochure site) usually takes 3-6 weeks from final decision to launch — including a critical step of reviewing existing content and migrating it properly, not just a raw copy-paste.",
          "The cost depends on how much content needs to be moved manually versus content that can be migrated automatically. A site with dozens of pages and dynamic content (blog, catalog) is more expensive to migrate than a small brochure site.",
        ],
      },
    ],
  },
  {
    slug: "srtonei-ai-le-asakim",
    title: "AI Videos for Businesses — How It Replaces a Shoot Day Without Losing Quality",
    excerpt: "What's really happening behind the scenes of AI video production, and why it's not \"just another weird internet video.\"",
    category: "AI Visuals & Content",
    readTime: "6 min read",
    datePublished: "2026-08-15",
    heroVideo: "/videos/raz-showreel-2.mp4",
    heroImage: "/images/guides/srtonei-ai-le-asakim.jpg",
    relatedServiceSlug: "ai-content",
    sections: [
      {
        heading: "The old equation vs. the new one",
        paragraphs: [
          "Producing a product video or a commercial the traditional way requires coordinating a location, a film crew, equipment, and sometimes actors — a full day or more, and a budget that typically starts in the thousands of shekels and up. AI production replaces a large part of that process with work using dedicated generative tools, at significantly lower cost and time — sometimes a quarter of the price of a traditional production.",
        ],
      },
      {
        heading: "How it actually works",
        paragraphs: [
          "The process doesn't start with \"write a prompt and get a finished video.\" It starts with building a concept — what's the story, what's the message, what's the tone. From there you build consistent assets (character, product, location) that repeat across all the scenes, so the video looks like one production and not a collection of disconnected clips. Only then do you produce the scenes themselves, and edit them together — lighting, grain, sound, pacing.",
          "This stage — consistency and production — is the difference between content that looks like an AI experiment and content that looks like a real campaign.",
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
          "Ask to see real work examples, not just generic demo reels. Ask how they handle character/product consistency across a whole video — that's the point that's easiest to miss. And make sure they understand: concept content (without a real client) is clearly labeled as such, and content that uses real brands or intellectual property is only made with explicit permission.",
        ],
      },
      {
        heading: "What it actually costs",
        paragraphs: [
          "A short AI video (up to 30 seconds) with a simple concept and no recurring consistent character — usually in the cheapest range, typically a few thousand shekels.",
          "When there's a character or product that needs to stay consistent across several scenes, the cost rises in proportion to the technical work required — this is the stage that demands the most experience and manual oversight.",
        ],
      },
      {
        heading: "The mistake that ruins results the most",
        paragraphs: [
          "Skipping the concept stage and jumping straight to production. AI content created without thinking about message and story always ends up looking like a collection of pretty clips with no direction — even if every individual scene looks good.",
          "Second mistake: settling for the first version that comes out without a revision round. Just like in a regular production, the first cut is almost never the best final version.",
        ],
      },
    ],
  },
  {
    slug: "eich-atar-nizkar",
    title: "Web Design in 2026: What Makes a Site Memorable, Not Just Good-Looking",
    excerpt: "There's a difference between a beautiful site and a site that works. Here's what actually determines whether a visitor remembers your brand.",
    category: "Websites & Development",
    readTime: "6 min read",
    datePublished: "2026-08-15",
    heroVideo: "/videos/raz-showreel-5.mp4",
    heroImage: "/images/guides/eich-atar-nizkar.jpg",
    relatedServiceSlug: "web-design",
    sections: [
      {
        heading: "Beautiful isn't enough",
        paragraphs: [
          "You can build a site with clean design, beautiful fonts, and polished images — and still have a visitor forget it a second after closing the tab. Memorable design isn't measured by graphic beauty alone, but by identity: is there something on the site that couldn't be copied onto a competitor's site without looking out of place. That's the question that determines whether a design works.",
        ],
      },
      {
        heading: "Three things that actually create memory",
        paragraphs: [
          "A consistent visual tone — not just logo and colors, but how the images are shot, how the buttons behave, how the copy sounds. Consistency is what turns a collection of pages into a brand identity.",
          "Motion in the right place — animation that serves the content (revealing information, transitions between states) builds a sense of quality. Animation that exists just \"because it's possible\" does the opposite and pulls attention away from the message.",
          "One clear point of view — a site that tries to say everything on the homepage ends up saying nothing. A memorable site always starts from one clear sentence about what the brand does, and builds around it.",
        ],
      },
      {
        heading: "Where AI helps in this process",
        paragraphs: [
          "AI doesn't create that identity for you — but it significantly shortens the time it takes to test several design directions before picking one, and to produce visual content (images, background video) that matches the chosen direction without an expensive traditional production. The decision about the identity itself stays human.",
        ],
      },
      {
        heading: "A real-world example",
        paragraphs: [
          "Think of two restaurant websites. One has a menu, photos, and a map — technically fine, but just like every other restaurant site. The other uses distinctive typography, one large image that tells the story of the place, and subtle motion that guides you between the site's \"floors.\" The same basic content, a completely different memory left behind.",
        ],
      },
      {
        heading: "How to check if a design works",
        paragraphs: [
          "A simple test: if you removed the logo and the colors, could you still tell it's your site? If the answer isn't obvious — the design isn't distinctive enough yet.",
          "Another test: let someone look at the site for 5 seconds and describe what they remember. If the answer is \"nice site\" with no concrete detail, that's a sign the design didn't leave an impression.",
        ],
      },
    ],
  },
  {
    slug: "atar-tadmit-mul-hanut",
    title: "Brochure Site vs. Online Store: How to Choose What Your Business Needs",
    excerpt: "Not every business needs e-commerce. A short guide to making the right call based on how you actually sell.",
    category: "Websites & Development",
    readTime: "6 min read",
    datePublished: "2026-08-15",
    heroVideo: "/videos/raz-showreel-7.mp4",
    heroImage: "/images/guides/atar-tadmit-mul-hanut.jpg",
    relatedServiceSlug: "web-design",
    sections: [
      {
        heading: "The question that decides everything",
        paragraphs: [
          "It's not \"how many products do I have\" but \"how does the deal actually close.\" If a deal closes through a call, a meeting, or a custom quote — an online store is a waste of time and budget. If a product sells at the same price to everyone and can be bought instantly — a store is exactly the right tool.",
        ],
      },
      {
        heading: "When a brochure site is enough",
        paragraphs: [
          "Personalized services (consulting, design, construction), businesses where the deal requires a conversation or a quote, and brands whose goal is to build trust and drive a contact — not to close a purchase with a click. A good brochure site does one job: get the right person to reach out.",
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
          "A business that built a store without a real need finds itself maintaining a complex system (inventory updates, payments, shipping) for nothing — because in practice every deal still closes over the phone.",
          "And the reverse: a business with a real product catalog that only built a brochure site loses sales from people who wanted to buy now, not wait for a reply to an email.",
        ],
      },
      {
        heading: "A hybrid approach works too",
        paragraphs: [
          "It's not always a binary choice. You can have a brochure site with a \"request a quote\" catalog for complex products, alongside direct purchase for standard ones. The right solution comes from how your business actually sells, not from a ready-made template.",
        ],
      },
    ],
  },
  {
    slug: "kampain-ai-mikatze-lekatze",
    title: "An End-to-End AI Campaign: What It Actually Looks Like",
    excerpt: "From the initial idea to the file ready for publishing — step by step, without dressing up the process.",
    category: "AI Visuals & Content",
    readTime: "6 min read",
    datePublished: "2026-08-15",
    heroVideo: "/videos/raz-showreel-2.mp4",
    heroImage: "/images/guides/kampain-ai-mikatze-lekatze.jpg",
    relatedServiceSlug: "ai-content",
    sections: [
      {
        heading: "Step 1: Brief and message",
        paragraphs: [
          "Before touching any AI tool — what's the message, who is it for, and where will it run (a specific social network, a website, a screen). A campaign that starts from a tool instead of a message always feels like an experiment, not like advertising.",
        ],
      },
      {
        heading: "Step 2: Concept and visual direction",
        paragraphs: [
          "Building several quick concept directions — color palette, photography style, tone (minimalist / dramatic / friendly). This is the stage where AI lets you test several directions within hours instead of days.",
        ],
      },
      {
        heading: "Step 3: Consistent assets",
        paragraphs: [
          "If there's a product, character, or location that recurs throughout the campaign — you build them as one consistent asset and use it across all the scenes. This is what separates a cohesive campaign from a collection of disconnected images.",
        ],
      },
      {
        heading: "Step 4: Production and editing",
        paragraphs: [
          "Actually generating the scenes, and then editing — color, pacing, typography, different formats for each platform (story, feed, ad). Here, the difference between amateur and professional content is almost always in the editing, not the initial generation.",
        ],
      },
      {
        heading: "What's important to know upfront",
        paragraphs: [
          "An AI campaign that looks good usually takes a few days, not weeks — but it still requires iteration. If someone promises a finished campaign within an hour with no reviews, you should be suspicious of the quality of the result.",
        ],
      },
      {
        heading: "What drags out the process unnecessarily",
        paragraphs: [
          "Changing the concept direction after production has already started — which is exactly why the early approval stage is so critical. Lack of clarity about who signs off on the final product, which creates endless revision rounds with no clear decision.",
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
    slug: "prasomet-ai-zman-taalich",
    title: "AI Commercials: How Long It Takes and What the Process Involves",
    excerpt: "Realistic expectations: what happens at each stage, and how long it actually takes from brief to finished file.",
    category: "AI Visuals & Content",
    readTime: "6 min read",
    datePublished: "2026-08-15",
    heroVideo: "/videos/raz-showreel-4.mp4",
    heroImage: "/images/guides/prasomet-ai-zman-taalich.jpg",
    relatedServiceSlug: "ai-content",
    sections: [
      {
        heading: "A realistic timeline",
        paragraphs: [
          "A short AI commercial (up to 30 seconds) with a clear concept and consistent assets — usually between a few days and a week, depending on complexity and the number of revision rounds. This is significantly faster than a traditional production, but not \"ready instantly\" the way it's sometimes marketed.",
        ],
      },
      {
        heading: "What affects how long it takes",
        paragraphs: [
          "The number of scenes and the transitions between them. Whether there's one consistent character that needs to be built and maintained throughout the whole video — this is the stage that requires the most iterations. And whether there are specific requirements (a brand, a real product) that need to be matched precisely.",
        ],
      },
      {
        heading: "What's included in a proper process",
        paragraphs: [
          "A brief and concept approval, building consistent assets, producing the scenes, editing and sound, and one or two revision rounds. If someone offers an AI commercial without a concept stage or without the option for revisions — that's probably a generic result, not a tailored production.",
        ],
      },
      {
        heading: "What happens during a revision round",
        paragraphs: [
          "A revision requesting a small change (color, editing pace) is usually fast — a day or two. A revision that asks to change the concept itself after production has already started effectively means starting a new production stage, not a \"small fix.\"",
        ],
      },
      {
        heading: "A direct comparison with traditional production",
        paragraphs: [
          "Traditional production: coordinating a location, equipment, a crew, and usually weeks of advance scheduling. AI commercial: no dependency on people's availability or a physical location — the only bottleneck is the creative work time itself.",
        ],
      },
    ],
  },
  {
    slug: "simanim-le-atzuv-mechadash",
    title: "5 Signs It's Time to Redesign Your Website",
    excerpt: "Not every old site needs an upgrade. Here's how to know if yours does.",
    category: "Website Upgrades",
    readTime: "6 min read",
    datePublished: "2026-08-15",
    heroVideo: "/videos/raz-showreel-5.mp4",
    heroImage: "/images/guides/simanim-le-atzuv-mechadash.jpg",
    relatedServiceSlug: "web-design",
    sections: [
      {
        heading: "1. The site is chronically slow",
        paragraphs: [
          "If page load consistently takes more than 3 seconds, that's no longer an aesthetic issue — it's actively losing you customers. Old sites with a pile of unmaintained plugins are the most common cause.",
        ],
      },
      {
        heading: "2. Updating content has become a chore",
        paragraphs: [
          "If every small change requires calling a developer, or you're afraid to touch the system \"because something always breaks\" — the site is limiting you instead of serving you.",
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
          "If the business has changed — target audience, positioning, services — but the site still looks like it did a few years ago, there's a gap between what you actually offer and what shows on the outside.",
        ],
      },
      {
        heading: "5. It just doesn't convert",
        paragraphs: [
          "There's traffic, but no inquiries. That's usually a sign of an unclear message, a weak call to action, or a confusing user experience — not a problem that's solved with more content, but one that requires redesigning the journey itself.",
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
          "Start with a real diagnosis — not a guess. A speed check (PageSpeed Insights), a review of usage data if you have analytics, and mapping out content management issues. From there, decide whether this calls for a targeted upgrade or a full redesign.",
        ],
      },
    ],
  },
  {
    slug: "maavar-platforma-bli-leabed-seo",
    title: "Switching Platforms Without Losing SEO: How to Do It Right",
    excerpt: "A site upgrade can reset your Google rankings if done wrong. Here's what you have to check.",
    category: "Website Upgrades",
    readTime: "6 min read",
    datePublished: "2026-08-15",
    heroVideo: "/videos/raz-showreel.mp4",
    heroImage: "/images/guides/maavar-platforma-bli-leabed-seo.jpg",
    relatedServiceSlug: "web-design",
    sections: [
      {
        heading: "The real risk",
        paragraphs: [
          "A platform switch (WordPress to a custom site, or the reverse) changes URLs, page structure, and sometimes entire pieces of content — and Google has to discover and re-crawl everything. Without proper planning, this can reset months or years of organic ranking.",
        ],
      },
      {
        heading: "What must happen before the move",
        paragraphs: [
          "Mapping every existing URL and its ranking in Google (which pages actually bring in traffic). Precisely documenting the titles, descriptions, and content that already work. And a redirect plan from every old URL to its equivalent new URL — not a default fallback to the homepage.",
        ],
      },
      {
        heading: "What must happen on migration day",
        paragraphs: [
          "301 redirects (not temporary ones) from every old URL to the new one, checking that the sitemap.xml is updated and submitted to Google immediately, and making sure there's no accidental indexing block (a robots.txt rule or a noindex tag that survived from the development environment — a common and damaging mistake).",
        ],
      },
      {
        heading: "After the migration",
        paragraphs: [
          "Monitoring Google Search Console for crawl errors and sudden traffic drops in the first few weeks. A small, temporary dip is normal while Google updates its index — a sharp, sustained drop is a sign something in the redirects isn't right.",
        ],
      },
      {
        heading: "Tools to check before and after",
        paragraphs: [
          "Google Search Console is the first tool to check — it shows exactly which URLs are ranking and which crawl errors show up after the move. Screaming Frog or a similar tool helps map out all existing URLs before you start.",
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
    slug: "ma-ze-vibe-coding",
    title: "What Is Vibe Coding, and Why It's Changing How Websites Get Built",
    excerpt: "The new term everyone's talking about — what it actually means, and why it's not just hype.",
    category: "Websites & Development",
    readTime: "6 min read",
    datePublished: "2026-08-15",
    heroVideo: "/videos/raz-showreel-7.mp4",
    heroImage: "/images/guides/ma-ze-vibe-coding.jpg",
    relatedServiceSlug: "web-design",
    sections: [
      {
        heading: "The simple definition",
        paragraphs: [
          "Vibe coding means working with an AI tool that writes code based on a plain-language description — \"add a button that opens a menu\" instead of writing it line by line. It's not magic, and it's not blind generation either: every result is reviewed, tested, and fixed by a developer.",
        ],
      },
      {
        heading: "Why it changed the pace of work",
        paragraphs: [
          "Tasks that used to take hours (building a component, wiring up a form, sorting out responsive layout) now take minutes. That doesn't mean quality dropped — it means the time that used to go into mechanical typing now goes into design decisions and testing.",
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
          "A morning brief: exactly what needs to happen on the site today. From there, iterative work — describe, test, fix, repeat — in short cycles instead of long upfront planning that isn't always accurate.",
          "The important part you don't see from the outside: reviewing the code, running tests, and making sure the result actually works across every browser and device — not just that it looks good in one preview.",
        ],
      },
      {
        heading: "What doesn't change, even with AI",
        paragraphs: [
          "Understanding the real business need behind the request. If a client asks for a specific button, the question to ask is what they're actually trying to achieve — sometimes the right solution is different from what was originally requested, and that's work that requires experience, not just a fast tool.",
        ],
      },
    ],
  },
  {
    slug: "ux-ui-im-ai",
    title: "How AI Helps Design UX/UI Faster",
    excerpt: "Testing several design directions within hours, not days — without giving up human judgment.",
    category: "Websites & Development",
    readTime: "6 min read",
    datePublished: "2026-08-15",
    heroVideo: "/videos/raz-showreel-5.mp4",
    heroImage: "/images/guides/ux-ui-im-ai.jpg",
    relatedServiceSlug: "web-design",
    sections: [
      {
        heading: "The problem with traditional design",
        paragraphs: [
          "Traditional UX/UI design requires building several versions by hand — each one taking hours. In practice, one direction usually gets picked too early, because there's no time to test real alternatives.",
        ],
      },
      {
        heading: "What AI changes in the process",
        paragraphs: [
          "AI tools make it possible to create several design variations — layout, color, typography — in significantly less time. That turns the spec stage from \"picking too early\" into \"an actual comparison between options.\"",
        ],
      },
      {
        heading: "What still requires a professional eye",
        paragraphs: [
          "Visual hierarchy, user flow, accessibility, and brand consistency — these are areas where AI offers options but doesn't decide. The final choice and the fine-tuning always stay under professional judgment.",
        ],
      },
      {
        heading: "A concrete example of the process",
        paragraphs: [
          "A request for a new landing page turns into three design proposals within hours — one minimalist, one bolder, and one in between. The client picks a direction, and only then does the fine detail work begin.",
        ],
      },
      {
        heading: "The risk to watch out for",
        paragraphs: [
          "Choosing too quickly between variations without testing them against a real audience. More options are only an advantage if you actually test them — not just pick based on one moment's personal taste.",
        ],
      },
    ],
  },
  {
    slug: "landing-page-yom-yomayim",
    title: "Building a Landing Page With AI in Two Days",
    excerpt: "From brief to live page — what you can realistically expect timeline-wise, without inflated promises.",
    category: "Websites & Development",
    readTime: "6 min read",
    datePublished: "2026-08-15",
    heroVideo: "/videos/raz-showreel.mp4",
    heroImage: "/images/guides/landing-page-yom-yomayim.jpg",
    relatedServiceSlug: "web-design",
    sections: [
      {
        heading: "Why a landing page is where AI stands out the most",
        paragraphs: [
          "A landing page is usually a single page with one clear goal — exactly the kind of project where AI tools speed things up the most, because there isn't much structural complexity that requires lengthy planning.",
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
          "Tracking conversions from day one — not waiting until the end of the campaign to find out something wasn't working. Quickly tweaking a headline or a call to action based on the first data is a natural part of the process.",
        ],
      },
    ],
  },
  {
    slug: "otomatziot-lachsoch-shaot",
    title: "Business Automations: How to Save Hours of Work a Week",
    excerpt: "Manual processes you can automate without changing how the business runs.",
    category: "Websites & Development",
    readTime: "6 min read",
    datePublished: "2026-08-15",
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
          "Processes that require delicate human judgment — like how to respond to an angry customer, or deciding on an exceptional discount. These stay with a human, even if the parts around them are automated.",
        ],
      },
    ],
  },
  {
    slug: "elementor-pro-mata-shave",
    title: "Elementor Pro: When It's Worth It",
    excerpt: "Not every WordPress site needs the paid version. How to know if yours does.",
    category: "Websites & Development",
    readTime: "6 min read",
    datePublished: "2026-08-15",
    heroVideo: "/videos/raz-showreel-5.mp4",
    heroImage: "/images/guides/elementor-pro-mata-shave.jpg",
    relatedServiceSlug: "web-design",
    sections: [
      {
        heading: "What you get in Pro that the free version doesn't have",
        paragraphs: [
          "A Theme Builder (designing the header/footer/full archive pages), advanced dynamic forms, CRM and content-system integrations, and additional design templates. The free version is enough for a simple single page — Pro is needed for a full site with structural consistency.",
        ],
      },
      {
        heading: "When it's unnecessary",
        paragraphs: [
          "For a single, simple landing page with no need for complex forms — the free version is entirely sufficient, and there's no reason to pay for capabilities that won't be used.",
        ],
      },
      {
        heading: "When it's essential",
        paragraphs: [
          "A full brochure site with several page types, a WooCommerce store, or any project where content needs to be managed consistently through repeating templates — there, Pro pays for itself quickly in saved work time.",
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
    slug: "woocommerce-lifney-shemathilim",
    title: "Opening a WooCommerce Store: What You Need to Know Before You Start",
    excerpt: "The questions worth answering before you start building, not after.",
    category: "Websites & Development",
    readTime: "6 min read",
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
          "An initial product list, a shipping and returns policy, and a payment provider chosen in advance — these are the three things worth locking down before you actually start building.",
        ],
      },
      {
        heading: "Questions worth answering upfront",
        paragraphs: [
          "How is inventory updated — manually, or synced from another system? Who's responsible for product photos and descriptions? The answers to these determine how fast and smooth the actual build will be.",
        ],
      },
      {
        heading: "What happens at the first launch",
        paragraphs: [
          "The first purchase always teaches you something — a checkout flow that looked clear in the design sometimes turns out to be confusing in practice. A testing round with real users before a wide launch saves a lot of headaches.",
        ],
      },
    ],
  },
  {
    slug: "atar-tadmit-professionali",
    title: "A Professional Brochure Site: What It Must Have",
    excerpt: "Not every pretty \"About\" page makes a brochure site effective. The list that actually matters.",
    category: "Websites & Development",
    readTime: "6 min read",
    datePublished: "2026-08-15",
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
          "Clients, projects, testimonials — something that proves the business actually operates, not just claims to. Even a few real work examples are worth more than a long marketing paragraph.",
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
          "Filling the homepage with every possible piece of information instead of leading toward one clear message. A good homepage sparks curiosity and leads you further in — it doesn't try to tell you everything at once.",
        ],
      },
    ],
  },
  {
    slug: "lama-atar-iti",
    title: "Why My Website Is Slow, and How to Fix It",
    excerpt: "The diagnosis and the fix — not just \"compress your images,\" but a real understanding of what causes slowness.",
    category: "Websites & Development",
    readTime: "6 min read",
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
          "Google PageSpeed Insights gives you a score and concrete findings — not just \"the site is slow,\" but exactly which file is too big and what's blocking load. That's the right starting point before any fix.",
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
          "Compressing images alone, without touching anything else, is usually enough for a noticeable improvement in load time on the very same day — this is typically the most cost-effective starting point.",
        ],
      },
    ],
  },
  {
    slug: "acf-cpt-matai-tzarich",
    title: "When You Need ACF and Custom Post Types on a WordPress Site",
    excerpt: "When regular pages are no longer enough to manage your content.",
    category: "Websites & Development",
    readTime: "6 min read",
    datePublished: "2026-08-15",
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
          "If you have recurring content in a fixed structure — dozens of projects, products, or articles that all need the same fields — regular pages turn into an unmanaged mess. CPT+ACF gives you a consistent structure that's easy to maintain.",
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
          "A site with dozens of projects in a portfolio — without a CPT, every project is a separate page whose design can easily go wrong. With CPT+ACF, every new project goes in through one uniform form and automatically appears in the right template.",
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
    slug: "integraziot-api-wordpress",
    title: "Connecting Systems to a WordPress Site: What's Possible and What Isn't",
    excerpt: "CRM, payments, newsletters — a realistic guide to integrations that actually work.",
    category: "Websites & Development",
    readTime: "6 min read",
    datePublished: "2026-08-15",
    heroVideo: "/videos/raz-showreel-7.mp4",
    heroImage: "/images/guides/integraziot-api-wordpress.jpg",
    relatedServiceSlug: "web-design",
    sections: [
      {
        heading: "What counts as a good integration",
        paragraphs: [
          "A system with an open API and clear documentation — almost every serious CRM, payment, or newsletter system meets that bar. The trouble starts with old or proprietary systems that lack accessible documentation.",
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
    slug: "ai-ugc-mamir-yoter",
    title: "AI UGC: The Content That Converts Better Than a Regular Ad",
    excerpt: "Why content that looks like a personal recommendation outperforms an overly polished ad.",
    category: "AI Visuals & Content",
    readTime: "6 min read",
    datePublished: "2026-08-15",
    heroVideo: "/videos/raz-showreel-2.mp4",
    heroImage: "/images/guides/ai-ugc-mamir-yoter.jpg",
    relatedServiceSlug: "ai-content",
    sections: [
      {
        heading: "What AI UGC is",
        paragraphs: [
          "Video content in the style of \"user-generated content\" — an AI character talking to the camera in a natural style, like a real story post, instead of a polished, glossy commercial.",
        ],
      },
      {
        heading: "Why it works well in advertising",
        paragraphs: [
          "Social media audiences have developed an \"allergy\" to overly polished ads. Content that looks authentic and personal gets a higher level of trust, even when the viewer knows it's branded content.",
        ],
      },
      {
        heading: "Where this is most effective",
        paragraphs: [
          "Product recommendations, virtual unboxings, \"before and after\" comparisons — formats that were originally born as authentic creator content, and can now be produced with AI at a significantly lower cost.",
        ],
      },
      {
        heading: "What separates good UGC from weak UGC",
        paragraphs: [
          "A natural speaking tone, not overly salesy. AI UGC that sounds like a regular commercial with different narration misses the whole point — the goal is for it to feel like a real recommendation.",
        ],
      },
      {
        heading: "Where this is most effective",
        paragraphs: [
          "At the top of the marketing funnel, while you're still building trust with an audience that doesn't know the brand yet. At later stages (customers who already know it) more direct product content works better.",
        ],
      },
    ],
  },
  {
    slug: "character-consistency-ai",
    title: "Why It's Hard to Keep a Character Consistent in AI, and How to Solve It",
    excerpt: "The technical problem that separates amateur AI production from professional AI production.",
    category: "AI Visuals & Content",
    readTime: "6 min read",
    datePublished: "2026-08-15",
    heroVideo: "/videos/raz-showreel-4.mp4",
    heroImage: "/images/guides/character-consistency-ai.jpg",
    relatedServiceSlug: "ai-content",
    sections: [
      {
        heading: "The problem",
        paragraphs: [
          "AI tools for generating video and images tend to \"forget\" details between scenes — a face changes slightly, clothes shift, a product looks a bit different in every image. This is what makes AI content look \"not real.\"",
        ],
      },
      {
        heading: "Why this happens",
        paragraphs: [
          "Every generation is essentially a new process based on text/visual instructions — with no built-in \"memory\" between images, unless you deliberately build that in with dedicated techniques and consistent reference assets.",
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
          "Comparing facial features, lighting, and angles between adjacent scenes. A trained eye spots inconsistency within seconds — which is exactly why careful manual review is an inseparable part of the process.",
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
    slug: "image-to-video-eich-ze-oved",
    title: "From a Static Image to a Video: How It Works",
    excerpt: "Have a good product photo? That's all you need to get started.",
    category: "AI Visuals & Content",
    readTime: "6 min read",
    datePublished: "2026-08-15",
    heroVideo: "/videos/raz-showreel.mp4",
    heroImage: "/images/guides/image-to-video-eich-ze-oved.jpg",
    relatedServiceSlug: "ai-content",
    sections: [
      {
        heading: "The basic principle",
        paragraphs: [
          "AI tools take a static image (a product, a logo, a brand photo) and generate motion from it — a subtle zoom, a rotation, shifting light — turning it into a short video asset.",
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
          "The quality and resolution of the original image directly affects the result — a sharp, properly lit image produces a far more convincing video than a blurry one.",
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
    slug: "tmunot-mutzar-ai-bli-studio",
    title: "Professional Product Photos Without a Studio Shoot",
    excerpt: "Backgrounds, lighting, and angles — all of it can be generated with AI from an existing product.",
    category: "AI Visuals & Content",
    readTime: "6 min read",
    datePublished: "2026-08-15",
    heroVideo: "/videos/raz-showreel-5.mp4",
    heroImage: "/images/guides/tmunot-mutzar-ai-bli-studio.jpg",
    relatedServiceSlug: "ai-content",
    sections: [
      {
        heading: "What's actually possible",
        paragraphs: [
          "Changing the background of an existing product photo, adding virtual studio lighting, generating several angles from one image — all without coordinating a reshoot or renting a studio.",
        ],
      },
      {
        heading: "When it beats real photography",
        paragraphs: [
          "When you already have a good base product photo and need additional versions (different backgrounds for different platforms, different seasons) — instead of hiring a photographer again for every variation.",
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
          "You don't have to choose one or the other — one high-quality product photo can serve as the base for dozens of AI variations, a combination that maximizes both quality and quantity.",
        ],
      },
    ],
  },
  {
    slug: "ma-ze-concept-ad",
    title: "What Is a Concept Ad, and Why It's Worth Seeing One Before You Order a Commercial",
    excerpt: "Demo pieces that show exactly what to expect — without paying for a real project just to find out.",
    category: "AI Visuals & Content",
    readTime: "6 min read",
    datePublished: "2026-08-15",
    heroVideo: "/videos/raz-showreel-2.mp4",
    heroImage: "/images/guides/ma-ze-concept-ad.jpg",
    relatedServiceSlug: "ai-content",
    sections: [
      {
        heading: "What a Concept Ad is",
        paragraphs: [
          "A concept ad is a demo piece — built like a real project (concept, consistent assets, editing) but with no real client behind it, and clearly labeled as such.",
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
          "A concept ad isn't meant to sell a real product — it's meant to demonstrate a level of capability. That changes the whole process: more creative freedom, fewer constraints from a real brand.",
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
    slug: "kama-variaziot-kampain",
    title: "How Many Creative Variations Does a Successful Campaign Need",
    excerpt: "More isn't always better — how to know how many variations you actually need.",
    category: "AI Visuals & Content",
    readTime: "6 min read",
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
          "Instead of producing each variation from scratch with a film crew, AI makes it possible to generate several versions significantly faster from the same consistent assets — which makes real A/B testing practical even on a limited budget.",
        ],
      },
      {
        heading: "How to choose which variations to test",
        paragraphs: [
          "Don't change everything at once between versions — change one variable at a time (message, color, call to action) so you know clearly what exactly affected the result.",
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
    slug: "wordpress-mul-pituach-mutam",
    title: "WordPress vs. Custom Development: What Fits Your Business",
    excerpt: "The direct comparison — not which one is better, but what's right for your specific need.",
    category: "Websites & Development",
    readTime: "6 min read",
    datePublished: "2026-08-15",
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
          "You need maximum performance, interactivity that doesn't exist in any template, or a unique user experience that's part of the brand's own identity — not just \"another good site.\"",
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
          "Who will actually update the site after launch — an in-house team, or always me? That answer alone usually decides between WordPress and custom development more than any other consideration.",
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
    slug: "kama-ole-srton-ai",
    title: "How Much Does an AI Video Cost for a Business — A Pricing Guide",
    excerpt: "Realistic price ranges for AI video production, so you'll know if a quote you received makes sense.",
    category: "AI Visuals & Content",
    readTime: "6 min read",
    datePublished: "2026-08-15",
    heroVideo: "/videos/raz-showreel-7.mp4",
    heroImage: "/images/guides/kama-ole-srton-ai.jpg",
    relatedServiceSlug: "ai-content",
    sections: [
      {
        heading: "Why it's hard to give one number",
        paragraphs: [
          "The price depends on complexity: a short video with a simple concept and no consistent character is completely different in price from a full commercial with a character that recurs across several scenes and full editing.",
        ],
      },
      {
        heading: "What affects the price the most",
        paragraphs: [
          "The number of scenes, whether there's a consistent character/product that needs to be built and maintained, and the length of the final video. Professional editing and sound are also part of the cost, not an add-on afterward.",
        ],
      },
      {
        heading: "Why it's still much cheaper than a traditional production",
        paragraphs: [
          "Without a film crew, equipment, and production days — the main cost shifts to creative work time (concept, building, editing) rather than logistics. This is what allows for a significant cost gap compared to traditional production.",
        ],
      },
      {
        heading: "What's usually not included in the base price",
        paragraphs: [
          "Original music (as opposed to stock music libraries), professional narration in additional languages, and extra variations beyond one version — these are usually billed separately, not automatically part of the base price.",
        ],
      },
      {
        heading: "How to compare quotes",
        paragraphs: [
          "Ask to know exactly how many revision rounds are included, and which final formats you'll receive. A cheap quote without real revision rounds can end up costing more in the end.",
        ],
      },
    ],
  },
]
