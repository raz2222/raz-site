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

4. **Write the English translation** — not a literal word-for-word translation, a natural equivalent in the same direct register (see the existing `guidesEn.ts` entries for the pairing pattern).

5. **Assign metadata:**
   - `slug`: clean, readable, keyword-relevant English words, hyphenated, lowercase. Never transliterated Hebrew (e.g. never `kama-ole-X` — that mistake is exactly what was fixed sitewide before this skill existed).
   - `category`: exactly one of `אתרים ופיתוח`, `ויז'ואל ותוכן AI`, `שדרוג אתרים` (Hebrew) / `Websites & Development`, `AI Visuals & Content`, `Website Upgrades` (English) — must match one of the three existing categories, do not invent a fourth.
   - `image`: reuse the existing category cover, no new image generation — `/images/guides/cover-web-dev.png`, `/images/guides/cover-ai-visual.png`, or `/images/guides/cover-site-upgrades.png` matching the category above.
   - `hero_video`: leave `null`. The 28 original guides reused generic showreel b-roll for this field, which isn't really per-article content — don't perpetuate that; the category cover image is the article's visual.
   - `related_service_slug`: only set it when genuinely topically relevant, and only to one of the real `sub_services.slug` values (query `select slug, hub_slug, title from sub_services` to get the current list — don't guess). Leave `null` if nothing fits well.
   - `read_time`: `"6 דקות קריאה"` unless the piece is meaningfully shorter/longer, matching the site's existing convention.
   - `date_published`: today's date. This is real-time new content at a natural 1/day cadence — no need for the artificial future-staggering used for the original 28-article backlog dump.
   - `sort_order`: current `max(sort_order)` + 1.

6. **Publish:**
   - Insert the Hebrew row into the `guides` table via Supabase MCP (`execute_sql` / `apply_migration`).
   - Append the English entry to `src/lib/guidesEn.ts` (same slug, category→English label mapping above, `image` field included — see existing entries for the exact shape).
   - Add two lines to `public/sitemap.xml` for the new slug (`/guides/<slug>` priority 0.6, `/en/guides/<slug>` priority 0.5, `changefreq monthly`), alongside the other guide entries.
   - Check off the topic in `reference/topic-backlog.md`.
   - Run `npm install` (if `node_modules` is missing), then `npm run build` and `npm run lint` — both must be clean before committing, since `guidesEn.ts` and `sitemap.xml` are real code files, not just DB rows.
   - Commit (message: `Add guide: <slug>`) and push to the branch from step "Repo & branch" (`git push -u origin <branch>`, retry up to 4x with backoff only on network failure).

7. Do not open a pull request unless explicitly asked. Do not message the user unless something needs a human decision (e.g. the backlog is exhausted and you're unsure whether to keep generating topics, or the target branch situation is unclear).

## Non-negotiables (carried over from the original SEO fixes — don't regress them)

- No transliterated-Hebrew slugs, ever.
- `image` and `category` always set and always one of the three valid pairs above.
- Hebrew and English versions must share the exact same `slug`.
- Build + lint must pass before pushing.
