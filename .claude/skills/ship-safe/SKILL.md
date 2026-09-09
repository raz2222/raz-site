---
name: ship-safe
description: The abuse and cost audit every project of Raz's gets before it is public, and again whenever a new endpoint, form or public write path is added. Covers rate limiting, quotas, throttling, bot filtering and cost controls on anything that spends money, sends mail or writes to a database from the open internet. Use when building or reviewing a site, an app or an API that will be reachable from the internet, before a first deploy, when adding a public endpoint or form, or when asked whether a project is safe to put online.
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

## Reporting it

One message, ordered by what it would cost to be wrong, with the exact file and
line. Say what is already correct as well as what is not · a list of only
failures reads as though nothing was ever done right, and Raz needs to know
which parts he can stop thinking about.

Then fix them. He does not want a checklist to work through; he wants to be told
what was found and what was done about it.
