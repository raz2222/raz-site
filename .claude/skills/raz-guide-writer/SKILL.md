---
name: raz-guide-writer
description: Writes and publishes one new Hebrew (+ English) guide article for madebyraz.co.il in Raz's established voice, matching the site's existing content/technical-SEO conventions exactly. Use when asked to write a new guide/article/מדריך/כתבה for the site, or when running the daily content pipeline.
---

# Raz Guide Writer

Writes one complete guide article end-to-end — topic selection, Hebrew content, English translation, category/image/slug/SEO wiring, and publishing to Supabase — matching the voice and technical structure of the 28 existing guides at madebyraz.co.il exactly. Built after a full technical-SEO overhaul of those 28 guides (image/JSON-LD/slugs/staggered-publish); this skill exists so future articles are born correct instead of needing the same retrofit.

Read `reference/voice-and-structure.md` before writing anything — it has the full style rulebook plus one complete real article as a calibration example. Read `reference/topic-backlog.md` to pick (and then update) the next topic.

## Repo & branch

Work in `raz2222/raz-site` and push straight to `main`. The SEO project branch this skill was written on was merged in Sep 2026 and Raz asked for the daily pipeline to land on `main` directly, so there is no review branch to stack on any more. Never invent a new branch name for this without being told to, and never open a pull request unless asked.

## Two sections, and which one you write for

The `guides` table holds both, told apart by the `kind` column:

- `kind: 'article'` lives at `/guides`, labelled **בלוג**. Written to be found in Google by someone pricing a purchase. This is what the daily pipeline writes, and the default for anything unspecified.
- `kind: 'tutorial'` lives at `/tutorials`, labelled **מדריכים**. How-to content Raz sends his Instagram followers as added value; the traffic arrives from a link, not a search. Only write one when Raz asks for it by name.

A slug resolves only under its own section, so the two never serve the same content at two URLs. The split exists so a how-to never dilutes the commercial cluster it sits beside: keep tutorials linking out to the service pages, and do not have a commercial article present a tutorial as the do-it-yourself alternative to hiring him.

## Cadence

One guide a day, every day, indefinitely, until Raz says stop. There is no end date and no final article. A run that finds the backlog short refills it (see `reference/topic-backlog.md`) instead of reporting that the queue ran out.

## Process

1. **Pick a topic.** Open `reference/topic-backlog.md`. Take the next unchecked item. If fewer than 7 unchecked items remain, generate 10 more following the rules there and append them before you continue — the pipeline runs indefinitely, so the backlog is refilled during a run, never left to empty.

   **The title has to be the search query itself.** Raz's whole goal for this site is being found for what customers type into Google, in their words: `כמה עולה סרטון UGC`, `כמה עולה אתר שבנוי ב-AI`, `מה עדיף אתר בוורדפרס או אתר ב-AI`. The query goes at the front of the title, before any colon or qualifier. A clever opener that buries it (`קמפיין AI מקצה לקצה: איך זה נראה בפועל`) is the exact shape to avoid: nobody searches for it, so it ranks for nothing. `reference/topic-backlog.md` opens with the full rule and the query patterns worth writing for; read it before picking, and apply it to a backlog title too if that title was written before this rule existed.

2. **Check for duplication.** Query the `guides` table (Supabase project_id `beobkcttzwiqcawrprgg`, `select slug, title from guides order by sort_order`) so you don't rewrite an existing topic under a new slug. If the backlog topic substantially overlaps an existing guide, pick the next one instead.

3. **Write the Hebrew article** following `reference/voice-and-structure.md` exactly: 7–9 sections, each a real heading (never "מבוא"/"סיכום"), 1–3 paragraphs, direct and concrete, myth-correcting where relevant, occasional first-person, no sales pitch inside the content (the page template already has a CTA block — don't duplicate it).

   **Internal links, naturally, inside paragraphs**: write `[טקסט](/guides/some-slug)` (or `/services/web-design`, `/services/ai-content`, `/work`) at the point in a sentence where mentioning that other page is genuinely relevant — never bolted on. The article renderer (`RichParagraph`) turns this into a real link automatically; plain paragraph text with no markdown gets rendered as-is. Aim for 3–5 per article across the whole piece, pointing at *existing* guide slugs or real site sections — query the `guides` table first so you're not linking to something that doesn't exist. Quality over count: one well-placed link beats four forced ones.

   **Section image, optional**: a section object can carry `image: "/path.png"`, rendered under that section's paragraphs. Most sections won't need one — only add it where a visual genuinely clarifies something (a before/after, a structural comparison, a checklist). If you do add one, generate it the same way the category covers were made (a small branded HTML/CSS graphic screenshotted with headless Chromium — see `/tmp` history or ask if you need the exact recipe) rather than paying for AI image generation for a decorative section image.

4. **Write 4 to 6 FAQ entries** into the `faq` column, as `[{"q": "...", "a": "..."}]`. These render as a real accordion at the bottom of the article and are emitted as `FAQPage` JSON-LD, so:

   - Each `q` is a question a customer actually types, in their words, phrased as a question. The article title answers one query; the FAQ is where the neighbouring queries go ("כמה זמן זה לוקח?", "האם זה כולל תיקונים?", "מה ההבדל בין X ל-Y?").
   - Each `a` is a real answer in 2 to 4 sentences, with a number or a concrete fact wherever the question invites one. Never "תלוי, דברו איתי".
   - Do not restate a section heading as a question. The FAQ covers what the body did not.
   - Never mark up an answer that is not on the page. The renderer only emits schema for entries in this column, and the accordion keeps them in the HTML, so this stays true as long as you don't put schema-only text anywhere else.

   Worth knowing: Google restricted FAQ rich results to government and health sites in 2023, so this will not draw an accordion into the search result. It still earns its place, because AI Overviews and the LLM answer engines read `FAQPage` directly, and the visible block is what lets a guide rank for the question queries around its main one.

5. **Write the English translation** — not a literal word-for-word translation, a natural equivalent in the same direct register (see the existing `guidesEn.ts` entries for the pairing pattern).

6. **Assign metadata:**
   - `slug`: clean, readable, keyword-relevant English words, hyphenated, lowercase. Never transliterated Hebrew (e.g. never `kama-ole-X` — that mistake is exactly what was fixed sitewide before this skill existed).
   - `category`: for an **article**, exactly one of `אתרים ופיתוח`, `ויז'ואל ותוכן AI`, `שדרוג אתרים` (Hebrew) / `Websites & Development`, `AI Visuals & Content`, `Website Upgrades` (English) — must match one of the three existing categories, do not invent a fourth. For a **tutorial**, the category is the topic tab it appears under on `/tutorials`, and it is not restricted to those three: reuse a topic another tutorial already uses when one fits, and coin a new one only when it will hold more than a single tutorial. The tabs are generated from what is actually published, so a topic used once is a tab of one.
   - `image`: reuse the existing category cover, no new image generation — `/images/guides/cover-web-dev.png`, `/images/guides/cover-ai-visual.png`, or `/images/guides/cover-site-upgrades.png` matching the category above.
   - `hero_video`: leave `null`. The 28 original guides reused generic showreel b-roll for this field, which isn't really per-article content — don't perpetuate that; the category cover image is the article's visual.
   - `hero_image`: leave `null` unless a file that actually exists in `public/images/guides/` is being reused. A previous run invented `/images/guides/law-firm-website-checklist.jpg` for a guide without producing the file, which shipped a broken hero and a 404 `og:image` to a live article. The renderer falls back with `hero_image ?? image`, so `null` cleanly yields the category cover; a wrong path does not fall back, it just breaks.
   - Never invent an image path. If a guide genuinely needs artwork that doesn't exist yet, stop and ask Raz before generating anything.
   - `related_service_slug`: only set it when genuinely topically relevant. Despite the field's name, it's matched against `service_hubs.slug` in `GuideArticle.tsx` (`serviceHubs.find(s => s.slug === guide.related_service_slug)`), not `sub_services.slug` — every existing guide row uses one of exactly two values, `web-design` or `ai-content`. Using a `sub_services` slug here (e.g. `site-design`, `ecommerce`) silently breaks the "related service" block on the article page. Leave `null` if genuinely nothing fits.
   - `read_time`: **Raz's standing rule from Sep 2026 is that every guide must be a genuine 4 to 6 minute read.** That is a length requirement, not just a label. Measure it: Hebrew bodies run ~5.7 characters per word including spaces, and 190 words per minute is the conservative adult reading speed. So the target band is **760 to 1,140 words, roughly 4,300 to 6,500 characters** of body text across all paragraphs. Compute `round(words / 190)` and write that number. Do not label a 500-word piece "4 דקות קריאה" — the site has now been through two rounds of correcting inflated read times, and a third would be self-inflicted. The English mirror carries the matching `"N min read"`, computed the same way from its own text.
   - `date_published`: today's date. This is real-time new content at a natural 1/day cadence — no need for the artificial future-staggering used for the original 28-article backlog dump.
   - `sort_order`: current `max(sort_order)` + 1.
   - `kind`: `article` unless Raz asked for a tutorial (see the section above).

7. **Publish:**
   - Insert the Hebrew row into the `guides` table via Supabase MCP (`execute_sql` / `apply_migration`), then verify with a follow-up `select * from guides where slug = '<slug>'` — don't just trust a silent/empty insert response.
   - Append the English entry to `src/lib/guidesEn.ts`, including its own `faq: [{ q, a }]` array translated from the Hebrew one, (same slug, category→English label mapping above, `image` field included — see existing entries for the exact shape).
   - Don't touch `public/sitemap.xml`. `scripts/generate-sitemap.mjs` runs after every build and enumerates every guide slug straight from Supabase and from `guidesEn.ts`, so a new guide is in the sitemap the moment it's inserted and pushed. The static file is only the fail-soft fallback for a deploy where Supabase is unreachable.
   - Check off the topic in `reference/topic-backlog.md`.
   - Run `npm install` (if `node_modules` is missing), then `npm run build`, `npm run lint` and `npm test` — all must be clean before committing, since `guidesEn.ts` is a real code file, not just a DB row.
   - Commit (message: `Add guide: <slug>`) and push to the branch from step "Repo & branch" (`git push -u origin <branch>`, retry up to 4x with backoff only on network failure).
   - **The Supabase insert and the git push are two independent operations — a successful DB insert does not guarantee the push will succeed too.** If `git push` fails with something like "access denied by the git proxy" or "not in this session's authorized repository set," that's an environment-level repo-authorization gap, not something to work around (no force-push, no alternate remote, no committing to a different branch). Report the exact error and stop — but the DB row is already live at that point, so also say so explicitly, since it leaves the Hebrew article live with no English mirror until someone finishes the git-side half by hand.

8. Do not open a pull request unless explicitly asked. Do not message the user unless something needs a human decision (e.g. the backlog is exhausted and you're unsure whether to keep generating topics, or the target branch situation is unclear).

## Non-negotiables (carried over from the original SEO fixes — don't regress them)

- The Hebrew title reads as a search query, keyword first (see Process step 1). This is the single rule Raz cares most about — it is the reason the site publishes guides at all.
- Every guide ships with 4 to 6 FAQ entries in the `faq` column, Hebrew and English alike (see Process step 4).
- No transliterated-Hebrew slugs, ever.
- `image` and `category` always set and always one of the three valid pairs above.
- Hebrew and English versions must share the exact same `slug`.
- Build + lint must pass before pushing.
- Every article should carry 3–5 genuine inline internal links (raised from 2–4 alongside the 4–6 minute length rule: a longer guide has more places a link genuinely belongs, and internal linking is what turns 30 separate guides into a topic cluster Google can read) (see Process step 3) — this was a real gap found in the first batch of 28 guides (no in-paragraph links or images at all, unlike the Red Ghost competitor benchmark) and the whole reason the `RichParagraph`/section-`image` support exists. Don't regress back to plain unlinked text.
