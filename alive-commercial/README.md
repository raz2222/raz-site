# SMELL ALIVE — production project

Premium cinematic AI spec commercial for the fictional deodorant brand **ALIVE**.
Vertical 9:16, ~20-25s. Built in Higgsfield (Cinema Studio 2.5 + Soul + Elements).

This folder lives inside the `raz-site` repo only because that's the GitHub
access already available to this session — it has nothing to do with the
website itself. All real media assets (images, video, trained characters)
live in the Higgsfield cloud workspace, not here. This folder is the
production paper trail: status, prompts, decisions, and cost tracking, so
work can resume across sessions without re-deriving everything.

See `STATUS.md` for where things stand and `COST-LOG.md` for the credit math.

## Folder map

| Folder | Contents |
|---|---|
| `01_HERO_MASTER` | Hero_Survivor — notes, prompts, reference sheet links |
| `02_INFECTED_HERO_MASTER` | Hero_Infected — same |
| `03_INFECTED_SECONDARY` | Infected A–F — same |
| `04_WORLD_MASTER` | Abandoned downtown avenue master + supplemental refs |
| `05_SHELTER_MASTER` | Shelter entrance master |
| `06_PRODUCT_MASTER` | ALIVE deodorant master + detail refs |
| `07_BATHROOM_MASTER` | Flashback bathroom master |
| `08_SCENE_STILLS` | The ~12 approved scene keyframes (source of truth before animation) |
| `09_VIDEO_GENERATIONS` | Raw Seedance/Cinema Studio video takes, prototype + final |
| `10_FINAL_SELECTS` | Approved final clips, ready for edit |
| `11_SOUND` | SFX/score notes, native-audio prompt lines |
| `12_EDIT` | Rough cut, color, typography, export |

## Tools

- Production: Higgsfield MCP connector ("higgsfield" in claude.ai connectors)
- Character consistency: Soul ID (trained identities) + Elements (locations/props)
- Video: Seedance 2.5 via Cinema Studio 2.5
- Reference: `.claude/skills/higgsfield/` (this repo doesn't have it installed —
  it was uploaded once to the chat session as a zip; re-upload if a fresh
  session needs it)

## Rule

Nothing gets generated or trained without explicit per-step approval in chat —
this project does not run unattended.
