# madebyraz.co.il

Personal studio site for Raz Avramov. Two lines of business: building websites,
and AI creative (video, product photography, campaign visuals). Primary market
is Israel, so Hebrew is the product and `/en` is a mirror.

Vite + React SPA, Supabase as the CMS, deployed on Vercel behind Cloudflare.
The site is prerendered to static HTML at build time, which is what crawlers
read; the browser then hydrates and fetches live rows from Supabase.

## How Raz wants to work

**He does not want to operate this.** Stated plainly on 2026-09-03: he does not
want to touch the machinery at all. Treat every manual step as a defect in the
design, not as a task to hand him. Before writing "here is what you need to do",
spend the effort finding a way it needs nobody. If a step genuinely cannot be
removed — because it needs a credential or an account only he controls — say so
in one line, explain why it is irreducible, and keep it to a single action.

**No notifications that wake him.** Nothing scheduled between roughly 22:00 and
08:00 Israel time should push to his phone. A routine that fires at 04:00 is
fine; a routine that *notifies* at 04:00 is not.

**Do not hand him long checklists.** He has asked more than once, in frustration,
why every step needs his approval. Batch the work, do it, and report once.

## Standing content rules

- **No em dashes anywhere in site copy**, Hebrew or English. The replacement is
  the middle dot `·`. This applies to titles, body text, meta descriptions and
  FAQ answers alike.
- **Never rename or re-slug an existing page.** The service page names are the
  real names of the services, and the guide URLs are indexed.
- **Ask before generating any image** with Higgsfield or any paid tool.
- **Guide titles are search queries**, keyword first: `כמה עולה אתר שבנוי ב-AI`,
  not a clever headline that buries it. This is the single rule he cares most
  about; it is why the site publishes guides at all.
- **Guides run 760 to 1,140 Hebrew words** — a genuine 4 to 6 minute read.
  Measure, do not estimate.

## How publishing actually works

Guides live in the `guides` table with a `date_published`. A row dated in the
future is invisible: the `public_read_guides` RLS policy gates on
`date_published <= CURRENT_DATE`, and the app filters on it as well, so it stays
hidden even for Raz's own signed-in account.

**This is the publishing schedule, and it needs no robot.** Queue a batch of
articles with consecutive future dates and the site releases one a day by itself.
Raz asked for exactly this over a scheduled agent, and he was right: it has no
moving parts, nothing to authenticate, and he gets to review a piece before it
goes live.

To extend the queue, write the next batch in a normal session and date them
forward one per day from the last queued article. Do not build a routine that
writes them unattended — scheduled sessions in this org cannot attach the
Supabase connector, which was tried and rejected at the API level.

`kind` separates the two sections: `article` is the commercial blog at `/guides`,
`tutorial` is how-to content at `/tutorials` that Raz sends Instagram followers.
Tutorials are not SEO pages; see the table in `.claude/skills/raz-guide-writer/SKILL.md`
for which rules stop applying to them.

## The one thing that needs a deploy

Prerendered HTML and `dist/sitemap.xml` are both produced at build time. A guide
whose date arrives between deploys is live for visitors and absent from the
sitemap. Any push to `main` rebuilds and fixes it, so batching articles keeps
this mostly moot — but a long gap between pushes leaves days of articles
uncrawled.

## Video posters

Every clip in `public/videos` has an extracted frame in
`public/images/video-posters`, listed in the generated `src/lib/videoPosters.ts`.
`AutoVideo` reads that manifest, so a video gets its poster with no call site
passing one. After adding a clip, run
`npm i -D ffmpeg-static && node scripts/generate-video-posters.mjs` once and
commit both the JPEG and the regenerated manifest; ffmpeg is deliberately not a
dependency, so a normal build and Vercel never install it.

Only `/work/serve` carries `VideoObject` markup, because the film really is that
page. The rest are muted loops behind headlines: Google rejects those under
"video is not the main content", and marking them up would assert something
untrue. A page earns the markup when it gets a real player and real copy about
the film.

## Commands

```
npm run build     # tsc, vite build, prerender, then regenerate the sitemap
npm test          # vitest
npm run lint      # oxlint
```

`npm run build` fails soft on the sitemap step: if Supabase is unreachable it
keeps `public/sitemap.xml` as shipped rather than emitting an empty one. In this
container Supabase egress is blocked, so a local build always takes that path —
that is expected and not a failure.
