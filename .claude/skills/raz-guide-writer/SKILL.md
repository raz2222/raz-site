---
name: raz-guide-writer
description: Writes and publishes one new Hebrew (+ English) guide article for madebyraz.co.il in Raz's established voice, matching the site's existing content/technical-SEO conventions exactly. Use when asked to write a new guide/article/מדריך/כתבה for the site, or when running the daily content pipeline.
---

# Raz Guide Writer

Writes one complete guide article end-to-end — topic selection, Hebrew content, English translation, category/image/slug/SEO wiring, and publishing to Supabase + the sitemap — matching the voice and technical structure of the 28 existing guides at madebyraz.co.il exactly. Built after a full technical-SEO overhaul of those 28 guides (image/JSON-LD/slugs/staggered-publish); this skill exists so future articles are born correct instead of needing the same retrofit.

Read `reference/voice-and-structure.md` before writing anything — it has the full style rulebook plus one complete real article as a calibration example. Read `reference/topic-backlog.md` to pick (and then update) the next topic.

## Repo & branch

Work in `raz2222/raz-site`. Push to `claude/raz-articles-review-uxn7hj` — the branch this whole SEO project has lived on so far — **unless the user tells you it has since been merged to `main`**, in which case branch off `main` instead and say so. Never invent a new branch name for this without being told to.

## Process

1. **Pick a topic.** Open `reference/topic-backlog.md`. Take the next unchecked item. If the backlog is empty or every item is checked off, generate 5–10 new candidate topics yourself following the same rules described there (niche/vertical guides, comparison/decision content, freshness-tagged pricing/redesign topics — the categories Red Ghost does that Raz's guides under-index on), append them unchecked, then take the first one.

2. **Check for duplication.** Query the `guides` table (Supabase project_id `beobkcttzwiqcawrprgg`, `select slug, title from guides order by sort_order`) so you don't rewrite an existing topic under a new slug. If the backlog topic substantially overlaps an existing guide, pick the next one instead.

3. **Write the Hebrew article** following `reference/voice-and-structure.md` exactly: 5–7 sections, each a real heading (never "מבוא"/"סיכום"), 1–3 paragraphs, direct and concrete, myth-correcting where relevant, occasional first-person, no sales pitch inside the content (the page template already has a CTA block — don't duplicate it).

   **Internal links, naturally, inside paragraphs**: write `[טקסט](/guides/some-slug)` (or `/services/web-design`, `/services/ai-content`, `/work`) at the point in a sentence where mentioning that other page is genuinely relevant — never bolted on. The article renderer (`RichParagraph`) turns this into a real link automatically; plain paragraph text with no markdown gets rendered as-is. Aim for 2–4 per article across the whole piece, pointing at *existing* guide slugs or real site sections — query the `guides` table first so you're not linking to something that doesn't exist. Quality over count: one well-placed link beats four forced ones.

   **Section image, optional**: a section object can carry `image: "/path.png"`, rendered under that section's paragraphs. Most sections won't need one — only add it where a visual genuinely clarifies something (a before/after, a structural comparison, a checklist). If you do add one, generate it the same way the category covers were made (a small branded HTML/CSS graphic screenshotted with headless Chromium — see `/tmp` history or ask if you need the exact recipe) rather than paying for AI image generation for a decorative section image.

4. **Write the English translation** — not a literal word-for-word translation, a natural equivalent in the same direct register (see the existing `guidesEn.ts` entries for the pairing pattern).

5. **Assign metadata:**
   - `slug`: clean, readable, keyword-relevant English words, hyphenated, lowercase. Never transliterated Hebrew (e.g. never `kama-ole-X` — that mistake is exactly what was fixed sitewide before this skill existed).
   - `category`: exactly one of `אתרים ופיתוח`, `ויז'ואל ותוכן AI`, `שדרוג אתרים` (Hebrew) / `Websites & Development`, `AI Visuals & Content`, `Website Upgrades` (English) — must match one of the three existing categories, do not invent a fourth.
   - `image`: reuse the existing category cover, no new image generation — `/images/guides/cover-web-dev.png`, `/images/guides/cover-ai-visual.png`, or `/images/guides/cover-site-upgrades.png` matching the category above.
   - `hero_video`: leave `null`. The 28 original guides reused generic showreel b-roll for this field, which isn't really per-article content — don't perpetuate that; the category cover image is the article's visual.
   - `related_service_slug`: only set it when genuinely topically relevant. Despite the field's name, it's matched against `service_hubs.slug` in `GuideArticle.tsx` (`serviceHubs.find(s => s.slug === guide.related_service_slug)`), not `sub_services.slug` — every existing guide row uses one of exactly two values, `web-design` or `ai-content`. Using a `sub_services` slug here (e.g. `site-design`, `ecommerce`) silently breaks the "related service" block on the article page. Leave `null` if genuinely nothing fits.
   - `read_time`: `"6 דקות קריאה"` unless the piece is meaningfully shorter/longer, matching the site's existing convention.
   - `date_published`: today's date. This is real-time new content at a natural 1/day cadence — no need for the artificial future-staggering used for the original 28-article backlog dump.
   - `sort_order`: current `max(sort_order)` + 1.

6. **Publish:**
   - Insert the Hebrew row into the `guides` table via Supabase MCP (`execute_sql` / `apply_migration`), then verify with a follow-up `select * from guides where slug = '<slug>'` — don't just trust a silent/empty insert response.
   - Append the English entry to `src/lib/guidesEn.ts` (same slug, category→English label mapping above, `image` field included — see existing entries for the exact shape).
   - Add two lines to `public/sitemap.xml` for the new slug (`/guides/<slug>` priority 0.6, `/en/guides/<slug>` priority 0.5, `changefreq monthly`), alongside the other guide entries.
   - Check off the topic in `reference/topic-backlog.md`.
   - Run `npm install` (if `node_modules` is missing), then `npm run build` and `npm run lint` — both must be clean before committing, since `guidesEn.ts` and `sitemap.xml` are real code files, not just DB rows.
   - Commit (message: `Add guide: <slug>`) and push to the branch from step "Repo & branch" (`git push -u origin <branch>`, retry up to 4x with backoff only on network failure).
   - **The Supabase insert and the git push are two independent operations — a successful DB insert does not guarantee the push will succeed too.** If `git push` fails with something like "access denied by the git proxy" or "not in this session's authorized repository set," that's an environment-level repo-authorization gap, not something to work around (no force-push, no alternate remote, no committing to a different branch). Report the exact error and stop — but the DB row is already live at that point, so also say so explicitly, since it leaves the Hebrew article live with no English mirror and no sitemap entry until someone finishes the git-side half by hand.

7. Do not open a pull request unless explicitly asked. Do not message the user unless something needs a human decision (e.g. the backlog is exhausted and you're unsure whether to keep generating topics, or the target branch situation is unclear).

## Non-negotiables (carried over from the original SEO fixes — don't regress them)

- No transliterated-Hebrew slugs, ever.
- `image` and `category` always set and always one of the three valid pairs above.
- Hebrew and English versions must share the exact same `slug`.
- Build + lint must pass before pushing.
- Every article should carry 2–4 genuine inline internal links (see Process step 3) — this was a real gap found in the first batch of 28 guides (no in-paragraph links or images at all, unlike the Red Ghost competitor benchmark) and the whole reason the `RichParagraph`/section-`image` support exists. Don't regress back to plain unlinked text.
