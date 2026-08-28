# Cost log — Higgsfield credits

Real prices, confirmed via `get_cost` preflight calls and actual transaction
history on 2026-08-28 (not estimates from documentation).

## Confirmed unit prices

| Item | Cost |
|---|---|
| Soul ID training (1 character) | 25 credits flat |
| Image, Cinema Studio 2.5, 1K | 2 credits |
| Image, Cinema Studio 2.5, 4K | 4 credits |
| Video, Seedance 2.5, 720p | ~6.5 credits/sec (audio on/off makes no difference) |
| Video, Seedance 2.5, 1080p | ~9 credits/sec |
| Element creation from an existing image | free (registration only) |
| Video upscale | no `get_cost` preflight support in this tool — unconfirmed, budget ~15-25/clip as a rough placeholder until tested |

## Real transaction history (most recent first, as of 2026-08-28)

- Nano Banana 2: -2 (2026-08-28)
- Seedance 2.5: -54 ×2 (2026-08-27) — prototype video tests
- Credit Package: +100 (2026-08-27) — top-up
- Soul ID: -25 ×3 (2026-08-21) — Hero_Survivor, Hero_Infected, Infected_A
- Nano Banana Pro: -2 × ~50 (2026-08-21) — the 72-image reference sheets
  (some with +2 refunds on a handful of failed generations)

No "Soul ID" charge exists for Infected B/C/D/E/F — they never actually ran,
so no credits were lost on the earlier "failed" attempts.

## Remaining-work estimate (highest-quality bar, no shortcuts on final pixels)

| Phase | Calc | Credits |
|---|---|---|
| Soul Training B–F | 5 × 25 | 125 |
| Elements (World/Shelter/Bathroom/Product) | free | 0 |
| 12 scene stills, 4K, ~3 attempts avg | 12 × 3 × 4 | 144 |
| Blocking rehearsal, 720p, 4 hardest crowd shots, 2 attempts | 4 × 2 × 26 | 208 |
| Final video, 1080p, 9 clips, ~1.5 takes avg, ~4.5s | 9 × 1.5 × 40 | 540 |
| 4K video upscale, 9 clips (unconfirmed rate) | 9 × ~20 | ~180 |
| Retry/safety buffer (~15%) | | ~180 |
| **Total** | | **≈1,350–1,400** |

Balance on 2026-08-28: **18.86 credits**. Needed top-up: **≈1,300–1,400 more**.

## Rule going forward

Every entry in this log should be a real transaction, not a plan — append
actual spends here as they happen so the running total stays honest.
