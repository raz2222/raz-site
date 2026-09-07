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

## Quotes and contracts

`/admin/quotes` builds a quote; the "שליחה" step has a button that turns it into a
contract at `/admin/contracts`, carrying the client, the line items, the total and
the payment terms across. The client reads and signs it at `/portal/contract/:id`,
logging in with the same magic link as the portal.

Three things about this are load-bearing:

- **A contract snapshots itself.** `contract_templates` holds the reusable clause
  text with `{{variables}}`; `contracts.sections` holds the rendered result, and
  `contracts.provider` the business details. Editing a template later never
  rewrites an agreement someone already signed.
- **Signing is a row, not a status change.** Inserting into `contract_signatures`
  fires a trigger that flips the contract to `signed`, and the client has no
  update rights on `contracts` at all. A signed contract is locked in the admin.
- **A draft is invisible.** RLS gates the client's read on
  `status in ('sent','viewed','signed')`, so copying the link before sending
  shows the client nothing. Sending, or "סימון כנשלח", is what opens it.

**The clause text is Raz's own contracts, not a draft written here.** It lives
only in the database · there is no copy in this repository · and it is edited in
the admin, under חוזים · תבניות, with no deploy.

It did start as a draft invented in this project, and on 2026-09-07 Raz sent the
two Word files he actually uses and said what was missing. Everything material
was: force majeure (reserve duty, war, an AI provider pulling a model),
abandonment after thirty days of silence, bounced cheques, chargeback after
delivery as fundamental breach, shoot days, the client's indemnity, mediation
before court, 2% monthly late interest, the advance being non-refundable because
AI credits are spent the moment work starts, and the defined term **מאפייני AI**
· that reasonable generative artefacts are not a defect and not grounds to
withhold payment. `ai_creative` and `website` are now his files clause for
clause; `retainer` had no sample, so it inherits the AI one and differs only
where a monthly cycle genuinely differs.

**The one that changes what gets sold: usage rights.** The invented draft granted
a worldwide licence including paid media, for free. His contract sells organic
use only · the client's own social pages and site · and paid media or extended
commercial use is a separate rights package at extra cost. The price book has no
such line item yet, so a client who wants to run the video as an ad is currently
sold nothing and told in clause 6 that they need to buy it.

The clauses were adapted in one respect only: a Word file points at a
נספח א' holding the scope and the price, and these documents render both
themselves, so the clauses point at "מסמך זה" instead. Still not vetted by a
lawyer · but these are the words Raz chose, not words invented for him.

Signing immediately shows the client what to pay and where: the first instalment
from the contract's own payment schedule, then the bank details, the Bit number
and link, and PayBox. Those live in `payment_details`, edited at
**`/admin/business`**, and are the one thing here that is deliberately **not**
snapshotted onto the contract.

That screen exists because the fields used to sit at the bottom of the price
book's settings tab, and on 2026-09-07 Raz said there was no way in the admin to
enter his bank account or his Bit link. There was; nothing about a screen called
מחירון says so. It now owns his business identity and his payment details
together · the two answers a signed contract needs · and the price book keeps
prices. The dashboard leads with an amber card whenever no payment method is
filled in, because the failure is invisible from the admin: it only shows on the
client's screen, at the moment they are most willing to pay.
`hasAnyPaymentMethod` in `src/lib/contracts.ts` is the single decision behind
both that card and the client's panel, so they cannot disagree. If the bank account changes, a client opening a year-old
contract has to see the new one, not wire money to a closed account. Its RLS
gates the read on the reader having a contract of their own, because portal
signup is open to any email.

### Closing on the call

An ending that closed on a package offers **שליחת חוזה לחתימה**, which builds the
agreement, numbers it, renders its clauses and emails it, without leaving the
call screen. Raz asked for this after counting the screens between a lead saying
yes and a contract reaching them: builder, retype, save, find the send tab, send.
There is a quote equivalent next to it, and an "open for editing" route for the
deal that needs a change first.

**A quote carries its agreement.** Raz signed himself up to a test quote and
asked where the contract was: the page was the price, and under it a checkbox
agreeing to the site's `/terms`, which are not an agreement about this job. So
`quotes` now has `template_id`, `sections` and `provider`, mirroring `contracts`
column for column, and the client reads the whole thing on the page they sign.

The clause text is not a second copy · it renders from the same
`contract_templates` rows, so wording is edited once, under חוזים · תבניות.
Which template is chosen comes from `templateSlugForItems`, the same inference
the contract editor uses, so an AI video quote cannot go out on the website
agreement.

`src/lib/quoteAgreement.ts` holds the one rule that differs from a contract's.
A contract renders its clauses from a button; a quote is written and sent on one
screen, so it re-renders on every change **while the status is `draft` or
`ready`**, and freezes the moment it is `sent` · which is also the moment RLS
lets the client read it. Same snapshot guarantee, no button. It is tested.

A contract is still a separate, fuller document: scope annexes, a payment
schedule, a contract number, the pilot's delivery date.
`/admin/contracts/new?quoteId=…` builds one from a quote · same client, same
items, same total. That route was reachable only from the quote builder's send
step, which is before the client has signed anything; the signed quote is
announced in the notifications and listed in `/admin/quotes`, so it is one tap
from both of those now.

`src/lib/packageContract.ts` is the one definition of what a package becomes ·
the contract, the quote, and the clause rendering · so the editor and the call
cannot drift. `src/lib/sendDocument.ts` is the one definition of sending one,
which matters because marking a document `sent` is not cosmetic: RLS gates the
client's read on it, so a document left as a draft is invisible to the person who
just got the link.

The quote builder leads with the three offers under `short_ads_2026` and folds
the other 131 price-book items behind one disclosure. Typing in the search opens
it, because searching and opening the drawer are the same intent.

A signed quote works the way a signed contract does: inserting into
`quote_signatures` fires a trigger that flips the status and writes the
`admin_notifications` row Raz reads. The client used to run that UPDATE itself
and it silently did nothing · there is no client UPDATE policy on `quotes`, only
SELECT · so quotes never actually reached `signed`. The signature is drawn now,
with the same pad the contract uses.

### The pilot's seven days

The pilot is sold on an offset: 1,800 for one video, and converting to the
monthly package within seven days takes the whole amount off the price. That
promise used to live only in the spoken script and the contract's scope text,
with nothing counting the days.

Two columns carry it now. `contracts.package_key` records which package built a
contract, so a pilot is identifiable without sniffing its title or its total,
both of which are editable free text. `contracts.pilot_delivered_at` starts the
clock, and it starts at **delivery, not at signing**: the client signs before the
video exists, so a window measured from the signature could run out before they
had anything to judge. Stamping that date is one tap in the contract, and it is
the only write a signed contract still accepts.

`src/lib/pilotWindow.ts` holds the arithmetic, in whole calendar days rather than
timestamp subtraction, because two local midnights are not always 24 hours apart
and a DST boundary would otherwise eat a day. The window shows on the dashboard
sorted by what runs out first, and on the client's own signed contract while it
is open. An expired one disappears from both: there is nothing left to do about
it, and a client returning to an old contract should not be told what they
missed.

`PILOT_TOPUP` is `monthly.price - pilot.price`, not a third number written down.
The 4,200 Raz says on the phone, the one on the offer card and the one the
follow-up contract charges are that subtraction.

### Confetti when someone signs

Opening the admin throws confetti and a card naming the client when a contract
has been signed since this browser last looked. Raz asked for it, and it is the
one purely celebratory thing in here.

The watermark is per browser in `localStorage`, not a column: he wanted it on
arriving, so a laptop unopened for a week should still say so even if his phone
already did. A session flag stops it firing again on every navigation, since
every admin screen mounts its own `AdminGate`. `src/lib/celebration.ts` holds
the decision and is tested; a browser with no memory looks back 30 days, so a
cleared cache never celebrates a year-old deal.

It watches **both** signature tables. A quote carries the whole agreement now,
so the document a client actually signs is usually the quote · and watching only
`contract_signatures` meant it had never once fired: on 2026-09-07 that table
held zero rows and `quote_signatures` held two. Whichever signature is newer
wins, because a quote and its contract are signed minutes apart and two cards
for one deal is worse than one.

`Confetti.tsx` is written rather than installed. It is eighty lines, it only
runs inside `/admin`, and the homepage is already main-thread bound. It honours
`prefers-reduced-motion` by not running, and clears its own canvas when it ends.

## What the client sees

`/portal` is deliberately small: the work in flight and where it stands, the
contracts, the quotes, and one account setting. Nothing else.

**The status is the point.** `client_projects` is separate from `projects`,
which is the public portfolio and world-readable. A project carries a `stage`
from a fixed list of six and a `stage_note`, the sentence Raz types. The stage
draws the bar the client reads at a glance; the sentence is what actually
reassures them. `on_hold` sits outside the sequence and draws no bar at all,
because an empty bar reads as a stall rather than a pause. `src/lib/projectStage.ts`
holds the arithmetic and is tested. Raz moves the stage from the client's own
page in the admin, and the common case · this moved one step on · is one tap.

**There is no password.** Signing in is a one-time link to the client's address,
so the only account setting is how they want to be addressed. The email is not
editable and that is load-bearing: every contract, quote and project is matched
to the client by it, so changing it would hide their own documents from them.
A trigger on `clients` enforces this rather than the RLS policy, because RLS
chooses rows and not columns, and the owner and the client are the same Postgres
role · a column grant would have locked Raz out too.

## The sales call

`/admin/calls` is a teleprompter for a live call, and the record of it. The
script is a decision tree in `call_scripts.graph`: each node is one thing to say
plus the answers it can get, and every answer points at the next node or at a
named ending. Raz reads, taps what the lead said, and the next line is already
on screen.

- **A call starts from a person, not a blank form.** Every client card and every
  unconverted lead in `/admin/clients` has a שיחה button that carries the name,
  phone and company in. A client Raz types in by hand also becomes a lead, so
  the pipeline sees everyone.
- **A session freezes the script it ran against**, the same way a contract
  freezes its clauses. Editing the wording later never rewrites a past call.
- **Every answer is written through as it is given**, so a closed tab loses
  nothing, and the whole path sits on the lead afterwards.
- **The endings carry the outcome.** An ending that closed on a package points
  the summary at `/admin/contracts/new?package=…`, which fills the agreement
  with the same numbers the lead just heard. Call, contract, signature, payment
  is one line.

`{{contact}}` and `{{business}}` come from the call setup; `{{pain}}`,
`{{consequence}}`, `{{goal}}` and `{{start_when}}` are derived in
`src/lib/callScript.ts` from what the lead answered, so the summary Raz reads
back is in the lead's own terms. `{{context}}` appears only in a tip, never in a
spoken line: a fallback in the opener would have had him claim he sent something
he never sent.

The script is owner-only under RLS and is deliberately absent from
`scripts/backup-content.mjs`, which reads with the public anon key and writes
into this public repository. The sales copy, the objection handling and the
coaching notes are not things to publish.

The two packages the call closes on (pilot 1,800, monthly 6,000) are defined once
in `CALL_PACKAGES` and mirrored in the price book, so the number said out loud
and the number on the contract cannot drift.

## The one thing that needs a deploy

Prerendered HTML and `dist/sitemap.xml` are both produced at build time. A guide
whose date arrives between deploys is live for visitors and absent from the
sitemap. Any push to `main` rebuilds and fixes it, so batching articles keeps
this mostly moot — but a long gap between pushes leaves days of articles
uncrawled.

## Editing the site's own content

`/admin/pages` is the page editor, and its field system is the thing to extend
rather than route around: each block is a `site_content` row, and a field is
`text`, `textarea`, `image`, `stringlist`, `pairlist` or `triplelist`. Adding a
field means adding one entry to `BLOCKS`, not a new screen.

`image` renders the same `MediaField` the project and AI screens use, uploading
to the `site-media` bucket · public read, owner write, 20MB, images only. There
is one upload component in this codebase and it should stay that way; a second
one was written here and deleted the same hour.

**Never write site copy that was not asked for.** Stated plainly on 2026-09-06:
do not replace images or content on the site. This bites hardest in defaults · a
made-up fallback shows in the admin as though it were the current value, and one
save publishes it. So `PAGE_SEO_DEFAULTS` holds only strings copied verbatim
from the page they belong to, and a page joins that list only when its real text
moves across.

**SEO lives with whatever it describes.** Services and sub-services have
`meta_title` / `meta_description` / `seo_h1` on their own rows. Guides and
projects now have `meta_title` / `meta_description` too, and both are nullable
on purpose: empty falls back to the title and the excerpt or overview, which is
how every existing row already behaved. The hand-written pages · home, about,
contact, work, faq, the blog index, the tutorials index · keep theirs in
`site_content` under `seo_*` keys, resolved by `src/lib/pageSeo.ts` against the
values they shipped with, so clearing a field restores the original rather than
publishing an empty title.

**The layer Google reads is `src/lib/routeMeta.ts`, not the hook the page calls.**
`useDocumentMeta` mutates `document` in an effect, which never runs during
`renderToString`, so the prerendered `<head>` · the only one a crawler sees · is
patched by `scripts/prerender.mjs` from `resolveRouteMeta`. An admin field that
only feeds the hook changes the browser tab and nothing else; that is exactly
what shipped first, and the fix was to fetch the `seo_*` rows in `fetchSsrData`
and let them override `HE_STATIC` there. `SEO_KEY_FOR_ROUTE` is the map, and it
covers Hebrew only: the English mirror's copy is in the bundle, and a Hebrew
title leaking onto `/en` would be worse than not being editable.

This makes SEO the second thing on the deploy list at the top of this file. An
edit reaches visitors at once and reaches Google on the next push to `main`.

**Do not touch the homepage title.** Said on 2026-09-07, about
`Made by RAZ | סרטוני AI, פרסומות AI ובניית אתרים`. It carries the three head
terms and it is the string the whole site ranks under. The field exists in the
admin because he asked for one on every page; nothing should write to it.

Two consequences worth keeping in mind. `/guides` and `/tutorials` are one
component with a `section` prop but two indexed URLs, so they have two keys ·
one would have handed Google the same title twice. And the defaults in
`PAGE_SEO_DEFAULTS` are the crawler-facing strings, not the shorter ones the
pages used to pass to `useDocumentMeta`: those two had drifted, so the admin
was showing "עליי · RAZ" as the current title of a page Google had indexed as
"רז אברמוב · 200+ אתרים ו-6 שנות פיתוח", and one save would have replaced the
better one with the weaker one. A test in `src/lib/pageSeo.test.ts` now fails if
they drift again, and another proves that with nothing written in the admin the
homepage's `<head>` comes out of the build byte-identical.

Testimonials are deliberately still a `triplelist` in the page editor rather
than their own table. They already add, edit, reorder and delete there; a
separate table would buy a per-item photo and nothing else, at the cost of
migrating live content.

The admin says things in the page, not in a system dialog. `adminNotify` from
`src/components/admin/AdminToaster.tsx` replaced thirty-nine `alert()` calls · a
native alert blocks the page, cannot be styled, reads in the browser's language
around Raz's Hebrew, and on a phone drops a grey box that must be dismissed
before anything else can happen. It is imperative on purpose: the calls sit in
event handlers across a dozen screens, so the swap had to be one for one rather
than a prop threaded through everything that can fail. `confirm()` is untouched,
because it returns an answer and a toast cannot.

## The admin's design layer

Every admin screen is an `AdminPage` from `src/components/admin/AdminPage.tsx`,
which owns the padding, the width, the `h1`, the search field and the one primary
action. `AdminAction` is that action, lime, one per screen; everything else is an
outline `AdminButton`. Lists are `AdminRow` (one shape, 56px floor, a thumb not a
pointer) and `EmptyState` rather than a bare sentence. Adding another hand-rolled
page shell is the thing this file exists to prevent.

The look itself is a scoped skin: `.admin-shell` in `src/index.css`, applied by
`AdminGate`, overrides the Tailwind radius utilities and gives panels their
background and shadow. It is the visual language Raz picked out of the call-coach
prototype, so nothing inside `/admin` should style itself past it.

Five screens are deliberately bespoke and stay that way: the call teleprompter,
the client detail page, the contract editor, the price book's item form and the
quote builder. Each is a workspace, not a list.

## Video posters

Every clip in `public/videos` has an extracted frame in
`public/images/video-posters`, listed in the generated `src/lib/videoPosters.ts`.
`AutoVideo` reads that manifest, so a video gets its poster with no call site
passing one. After adding a clip, run
`npm i -D ffmpeg-static && node scripts/generate-video-posters.mjs` once and
commit both the WebP and the regenerated manifest; ffmpeg is deliberately not a
dependency, so a normal build and Vercel never install it.

Only `/work/serve` carries `VideoObject` markup, because the film really is that
page. The rest are muted loops behind headlines: Google rejects those under
"video is not the main content", and marking them up would assert something
untrue. A page earns the markup when it gets a real player and real copy about
the film.

## What is actually slow

Measured 2026-09-06 with three alternating Lighthouse runs per variant, against
the production bundle served with gzip. Mobile Performance sits around 75, with
Accessibility 100, Best Practices 96 and SEO 100.

The homepage is bound by **main-thread work**, not by transfer: roughly 650 ms
of style and layout and 470 ms of script evaluation. Converting the nine
homepage images to WebP cut 366 KB and moved the score by nothing, because the
posters were never on the critical path. Lighthouse listing an image under
"improve image delivery" is an opportunity, not a blocker — do not read it as
the cause of LCP again. The next real gain is in what runs on the main thread
during hydration.

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
