# מחירון סרטוני פרסום AI

`ai-video-pricelist.html` is the source · `madebyraz-ai-video-pricelist.pdf` is the
two page PDF sent to clients who ask for a price list.

Edit the HTML, then run `node scripts/build-pricelist.mjs` to regenerate the PDF.
The HTML is self contained: Rubik's Hebrew and Latin subsets are inlined, so it
renders the same on any machine, offline.

The numbers come from the same places the call and the contract use them:

| What | Where it lives | Value here |
| --- | --- | --- |
| Pilot price | `CALL_PACKAGES.pilot` in `src/lib/callScript.ts` | 1,800 ₪ |
| Monthly package | `CALL_PACKAGES.monthly` | 6,000 ₪ · 5 videos |
| Conversion top up | `PILOT_TOPUP` in `src/lib/pilotWindow.ts` | 4,200 ₪ |
| Offset window | `PILOT_WINDOW_DAYS`, counted from delivery | 7 days |
| VAT, validity | `quote_settings` | 18%, 14 days |
| Revisions, usage rights, delivery | `contract_templates` · slug `ai_creative` | 2 rounds, organic only |

If any of those change, change them here too · this file is a printed copy of
them, not a second source.
