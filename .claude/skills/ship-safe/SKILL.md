---
name: ship-safe
description: The abuse and cost audit every project of Raz's gets before it is public, and again whenever a new endpoint, form or public write path is added. Covers rate limiting, quotas, throttling, bot filtering and cost controls on anything that spends money, sends mail or writes to a database from the open internet. Also says how to record the outcome in the project's own CLAUDE.md, so a decision keeps its reason. Use when building or reviewing a site, an app or an API that will be reachable from the internet, before a first deploy, when adding a public endpoint or form, or when asked whether a project is safe to put online.
---

# Ship safe

Raz asked for this on 2026-09-09, after an audit of madebyraz.co.il found that
`/api/generate-image` had been sitting open on the internet, calling a paid image
model with no authentication, for as long as it had existed. Nothing had gone
wrong yet. That is the point: none of these failures announce themselves. A
spent API budget arrives as an invoice, a subscribed stranger arrives as
nothing at all, and a flooded leads table looks exactly like a busy week until
someone reads it.

**Run this before a project is first reachable from the internet, and again
every time a new endpoint, form or public write path is added.** Do it without
being asked, report what was found in one message, and fix what is fixable in
the same pass rather than handing over a list.

## The five questions

The five come from the same list any competent review would produce; what
matters is that they are asked of every entry point rather than of the project
in general.

### 1. Rate limiting · everywhere the public can reach

Enumerate every entry point first · every file under `api/`, every serverless
function, every form, and every table the client can write to with a publishable
key. Then say, for each one, what stops the thousandth request in a minute.
"Nobody would find it" is not an answer: an unlisted endpoint is a public
endpoint.

Count the attempt **before** serving it, not after, or a request that fails
every time is never throttled at all. Keep the counter in the database rather
than in memory · serverless instances do not share memory, so an in-process
counter throttles nothing.

### 2. Usage quotas · per caller and per day

A limit per minute stops a burst; a quota per day stops a slow drain. Anything
that costs money per call needs both. Quotas are counted from the ledger of what
actually happened, never from the queue of what is planned, or a reopened screen
spends the same budget twice.

### 3. Request throttling · the expensive path specifically

Generation, transcoding, mail and anything calling another company's API. These
are slow as well as costly, so the limit protects the function's own time budget
as much as the bill. Cap concurrency, not only frequency.

### 4. Bot filtering · in that order

A honeypot field first · it is free, invisible and catches most of it. Then a
per-address counter. A CAPTCHA only when real spam has actually arrived: it is
a tax on every real visitor, and on a Hebrew site it is a tax on the ones least
likely to persist through it. Answer a caught bot with a success, never an
error · an error is a hint about what to change.

### 5. Cost controls · the invoice question

For every third-party key in the project, answer plainly: **what is the worst
someone could spend with it in an hour, if they wanted to?** If the answer is
"unlimited", that is the finding. Then set a hard cap at the provider as well ·
a spend limit on the account is the only control that holds when the code is
wrong.

## The second pass: everything that is not an endpoint

The five questions cover what the public can call. They do not cover what the
public can already read, and that is where the second half of the findings
always are.

- **Every row-level policy, read aloud.** For each table: who can select, who
  can insert, who can update. A policy that matches on an identity from the
  token (an email, a user id) is right; one that matches on an id from the URL
  is not. Check that a client sees their own row and nothing else by reading
  **as** that client, not by reading the policy and agreeing with it.
- **Whatever the API exposes besides tables.** On Supabase every function in the
  `public` schema answers at `/rest/v1/rpc/<name>`, trigger functions included.
  Revoke `EXECUTE` from `anon` and `authenticated` on the ones no browser calls
  · but never on a function an RLS policy calls, which the policy evaluates as
  the querying role.
- **Anything built from a request header.** `Host`, `X-Forwarded-Host`,
  `Origin`, `Referer` are all written by the caller. A URL built from one and
  then emailed is the classic account-takeover: the victim gets a real sign-in
  link pointing at the attacker's site. Pin it to an allowlist, and make the
  allowlist specific · `*.somehost.app` is every customer of that platform.
- **File storage.** Which buckets are public, what they hold, and what a
  public bucket allows: on Supabase a public read policy lets anyone list the
  objects, not only fetch a URL they were given. A signed document never
  belongs in one.
- **Anything the project publishes about itself.** A backup script, an export,
  a seeded fixture, a repository that is public. Read the allowlist, then check
  what credentials it reads with · reading as the anonymous role means RLS
  filters the export too, which is a second lock rather than a first.
- **The headers and the bundle.** A CSP without `unsafe-inline`,
  `frame-ancestors`, and a grep of the built assets for the key prefixes of
  every provider in the project. Then `npm audit --omit=dev`.

## The third pass: what a legitimate account can do

The first two ask who may call and who may read. This one assumes a real,
signed-in user acting in bad faith · which is the account the other two both
treat as trusted.

- **Anything the client sends that is later treated as a fact.** An IP, a
  timestamp, a total, a status. If a record is evidence about the person who
  wrote it, the server has to be the one writing it.
- **The same action across two documents.** Where a flow was copied · a quote
  and a contract, an invoice and a receipt · read both policies side by side.
  The copy is where the condition gets dropped.
- **Doing the one-time thing twice.** Signing, redeeming, claiming, converting.
  A UNIQUE constraint refuses the second one for good; a screen that hides the
  button refuses nothing.
- **The client-side route guard.** It is a convenience, never a control: what
  keeps the data safe is the policy on the row, and that is what to test.

## What actually goes wrong, in order of how often

1. **An endpoint whose only caller is the admin UI, but which never checks who
   is calling.** The UI being behind a login says nothing about the endpoint.
   This is the commonest finding by a distance, and the cheapest to fix.
2. **A public key that can write.** A publishable or anon key ships inside the
   bundle. Every policy that lets it write is a policy that lets anyone write,
   so the limit has to live in the database · a trigger, a constraint · and not
   in the form.
3. **An open mail path.** A recipient and a body taken from the request and sent
   from the project's own domain. The cost is the domain's sending reputation,
   which is far harder to get back than money.
4. **A subscription endpoint.** Push, webhooks, notification registration.
   Whoever can subscribe can read everything the notifications carry.
5. **A key in the browser bundle that was meant for the server.** Grep the built
   assets for the provider's key prefixes before the first deploy.

## Writing it down

A report is read once. The reason behind a decision has to outlive it, or the
next run rediscovers the same finding and · worse · reverses it: a throttle
with no reason attached looks arbitrary and gets loosened, and a missing CAPTCHA
looks like an oversight rather than a choice.

So after each pass, write the outcome into the project's own `CLAUDE.md`, in
the voice of the rest of that file · reasons, not a changelog. The git history
already holds the changelog. Five things belong there:

- **What was found, and what it would have cost.** "Open, calling a paid model"
  is the finding; "added auth" is not.
- **What was deliberately not done.** No CAPTCHA until real spam arrives. These
  buckets stay publicly readable because that is what they are for. These two
  functions keep `EXECUTE` because RLS policies call them. Every one of these is
  a thing a later reader would otherwise "fix".
- **What was verified rather than changed**, so it does not get re-litigated
  every time someone gets nervous.
- **The numbers, with the reason for the number.** Three a day per address
  because a real person sends the form twice. Five an hour because his inbox is
  the thing being protected, not the database.
- **What is still on the owner to do**, and why nobody else can do it · a spend
  cap on an account only he holds.

Prefer a check that fails loudly over a paragraph wherever one exists: a test,
a UNIQUE constraint, a trigger. The paragraph explains the decision; the check
is what stops it being undone by accident. Write both.

For madebyraz.co.il that record is **"What stands between these endpoints and
the internet"** in `CLAUDE.md`, with "The second pass, over everything else"
and "The third pass, over the signing itself" under it. Read those before
auditing this project again · they say which parts are settled, which is the
difference between a re-audit and repeating the first one.

## Reporting it

One message, ordered by what it would cost to be wrong, with the exact file and
line. Say what is already correct as well as what is not · a list of only
failures reads as though nothing was ever done right, and Raz needs to know
which parts he can stop thinking about.

Then fix them. He does not want a checklist to work through; he wants to be told
what was found and what was done about it.
