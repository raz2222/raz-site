# Research log — Higgsfield / video-creation knowledge base

Running log of what's been learned about Higgsfield's tools, presets, and techniques,
and what the weekly refresh Routine changed. Newest entry first.

---

## 2026-08-27 — initial setup

**What happened:** First pass at building this knowledge base. Direct access to
`higgsfield.ai` / `blog.higgsfield.ai` failed — both are blocked by this Claude Code
environment's network egress policy (`EGRESS_BLOCKED` / DNS failure). Per the agent
proxy's own rules, blocked hosts are reported, not routed around.

**What was used instead:**
- Vendored `OSideMedia/higgsfield-ai-prompt-skill` (MIT, GitHub) into `../higgsfield/` —
  a comprehensive, actively-maintained (v3.35.0, updated 2026-08-22) community prompt-
  engineering library for Higgsfield: MCSLA formula, camera/motion vocabulary, model
  routing (Kling 3.0, Sora 2, Veo 3.1, Seedance 2.0/2.5, Wan, Minimax Hailuo, DoP, Soul,
  Nano Banana, Seedream, Flux, GPT Image 2.0), Cinema Studio 2.5/3.0/3.5, Soul ID
  character consistency, 10 genre templates, and — most relevant to Raz's ask — a
  **Marketing Studio + Content Factory** sub-skill covering the 9 DTC ad presets:
  UGC, Tutorial, Unboxing, Hyper Motion, TV Spot, Wild Card, Virtual Try-On (UGC + Pro),
  Product Review, at 4-15s ad length.
- Search-engine snippets (not full page fetches) confirming: Marketing Studio lets you
  paste a product URL and pick a shot style (closeup / faceless / full body / editorial /
  UGC); Wild Card and Hyper Motion are toggles for extra "energy"/camera physics; the
  platform gives 40 free daily credits on signup with no watermark on the free tier.

**Not yet done (needs the network-policy fix, see SKILL.md § Known gaps):**
- Full crawl of `higgsfield.ai/blog` (post list + content of each post).
- Help center (`higgsfield.ai/creator-hub/help-center/...`).
- The actual downloadable asset files on `/viral-presets` and `/sora-2-ai-video-presets`
  (as opposed to just knowing the presets exist by name).
- Anything from `higgsfield.ai/marketing-studio` and `/marketing-studio-intro` directly
  (currently known only via search snippets, not the real page).

**Next weekly run should:** re-check whether `higgsfield.ai` is reachable yet; if so, do
the full crawl above and fold results into `../higgsfield/` and this log. If still
blocked, just refresh the vendored repo (diff + update) and note "still blocked" here
rather than repeating the same failed fetch attempts.
