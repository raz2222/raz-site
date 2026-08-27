---
name: video-creation
description: >
  Router for planning AI-generated video/ad/UGC/product-photo content on Higgsfield —
  use whenever the user asks in Hebrew or English to make a product ad, UGC video,
  unboxing, tutorial, TV spot, product photoshoot, or any "make me a video/campaign"
  request. Maps the request to the right Marketing Studio preset or genre template,
  then hands off to the vendored `higgsfield` skill for exact prompt construction.
  Also owns the weekly refresh log of what's known about Higgsfield's tools/presets.
user-invocable: true
metadata:
  tags: [higgsfield, video, ugc, ads, marketing-studio, router]
  owner: raz
  created: 2026-08-27
---

# Video Creation Router

Entry point for "today I want to make X" requests, before actually generating anything
in Higgsfield. It doesn't replace the vendored `higgsfield` skill (`.claude/skills/higgsfield/`,
33 sub-skills, MIT-licensed, pulled from the `OSideMedia/higgsfield-ai-prompt-skill`
community project) — it sits in front of it and decides *which* sub-skill(s) apply,
so the answer to "one giant master prompt or many small ones" is: neither — one small
router (this file) that reads the request and opens the 1-3 relevant files from the
big vendored library. That's exactly the pattern the vendored skill already uses
internally (root `SKILL.md` → sub-skills), so this file just extends the same
dispatch table one level up, in Raz's own words/categories.

**Do not invent Higgsfield vocabulary.** Every camera name, preset name, and model name
must come from the vendored skill files, never from training-data guesses — see
`../higgsfield/SKILL.md` § HARD RULES for why.

## Request → route table

| Raz says (he/en) | Video type | Route to |
|---|---|---|
| "פרסומת למוצר" / product ad / TV spot | Commerce ad, 4-15s | `../higgsfield/skills/higgsfield-marketing-studio/SKILL.md` (TV Spot / Wild Card / Hyper Motion presets) |
| "UGC" / "משפיען מדבר למצלמה" / talking-head review | UGC ad | `../higgsfield/skills/higgsfield-marketing-studio/SKILL.md` (UGC / Tutorial / Unboxing presets) |
| "תמונות מוצר" / product photoshoot, static | Static product images | `../higgsfield/skills/higgsfield-gpt-image-2/static-ads-workflow.md` + `reference-sheet-workflow.md` |
| "וידאו קולנועי" / cinematic short/narrative | Cinematic scene | `../higgsfield/skills/higgsfield-cinema/SKILL.md` + `../higgsfield/templates/` (10 genre templates) |
| "דמות עקבית" / consistent character across shots | Character consistency | `../higgsfield/skills/higgsfield-soul/SKILL.md` |
| "קמפיין שלם" / full campaign, research→publish | Multi-asset campaign | `../higgsfield/skills/higgsfield-content-factory/SKILL.md` |
| "לא עובד" / generation failed or looks wrong | Troubleshooting | `../higgsfield/skills/higgsfield-troubleshoot/SKILL.md` |
| Anything else video/image-prompt related | — | `../higgsfield/SKILL.md` root dispatcher — let its own routing table decide |

## Process

1. Identify the video/image type from the table above (ask if genuinely ambiguous — e.g. "ad" alone doesn't say UGC vs TV Spot vs Unboxing).
2. Open the routed sub-skill file(s) with the Read tool and actually read them — grepped snippets aren't enough (this mirrors the vendored skill's own rule).
3. Check `specs/model-specs.yaml` (under `../higgsfield/specs/`) for the current model's real parameters/aspect ratios before writing them into a prompt.
4. Build the prompt (MCSLA formula for video: Model · Camera · Subject · Look · Action) and hand it back ready to paste into higgsfield.ai, or via the Higgsfield CLI/MCP if Raz has that connected.
5. Log anything genuinely new (a preset, workflow, or technique not yet reflected in `research-log.md`) at the end of the session — see below.

## Known gaps — read before assuming full coverage

- **`higgsfield.ai` and `blog.higgsfield.ai` are blocked by this Claude Code environment's network egress policy.** This means no direct crawl of the live blog, help center, or the free downloadable preset/LUT pages (`/viral-presets`, `/sora-2-ai-video-presets`, `/marketing-studio`) has happened yet — everything currently in `../higgsfield/` came from a vendored community GitHub repo plus search-engine snippets, not a first-hand site read.
- **Fix:** in the environment settings (claude.ai/code), widen the Network Policy to allow `higgsfield.ai`. Once that's done, tell Claude to re-run the weekly refresh — see `research-log.md` for the exact plan for what a real crawl should capture (blog posts, help-center articles, and the literal downloadable asset files on the presets pages).
- **No literal downloadable asset files (LUTs, visual preset packs) have been saved anywhere yet** — only prompt/technique knowledge. Getting the actual files requires the network-policy fix above.

## Weekly refresh

A scheduled Routine re-pulls `OSideMedia/higgsfield-ai-prompt-skill` (the vendored source, actively maintained — was v3.35.0 as of 2026-08-22) and diffs it against `../higgsfield/`, updating anything changed. It also retries the `higgsfield.ai` fetch each time in case the network policy has been fixed, and appends findings to `research-log.md`. See that file's changelog for the run history.
