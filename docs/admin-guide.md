# The staff admin console

**Who this is for:** bbloom staff who use the admin console, and whoever is
training them.
**What it answers:** what each area is for, what every action does, and which
actions you cannot take back.

This describes the code in `src/admin/`. Rules, limits and lifecycles belong in
[business-rules.md](https://github.com/Bbloomofficial/bbloom-back/blob/main/docs/business-rules.md).

## Contents

- [Read this before you touch anything](#read-this-before-you-touch-anything) — **start here on your first day**
- [Signing in](#signing-in) — how staff access works, and what it does not check
- [Areas](#areas):
  - [Sites](#sites) — every customer website we host
  - [Site detail](#site-detail) — one site's settings, accounts, domains, payment and danger zone
  - [Creating a site](#creating-a-site) — setting one up on a customer's behalf
  - [Accounts](#accounts) — customer logins and their free-site allowance
  - [Plans](#plans) — **live pricing; the easiest place to do real damage**
  - [Promo codes](#promo-codes) — discount codes and their restrictions
  - [New customer offer](#new-customer-offer) — the first-purchase discount
  - [Ads](#ads) — campaigns, which spend real money
  - [Ad tools](#ad-tools) — direct Meta operations
  - [System status](#system-status) — health of the backing services
- [Quick reference: what cannot be undone](#quick-reference-what-cannot-be-undone)
- [Things that are not what they look like](#things-that-are-not-what-they-look-like)

## Read this before you touch anything

The admin console operates on **live customer businesses with real money in
them**. Six things are worth knowing before your first session:

| | What |
| --- | --- |
| 1 | **Deleting a site is permanent.** It takes the content, the customer's user accounts and their uploaded images with it. Nothing in this console can undo it. |
| 2 | **Publishing is immediate.** "Publish changes" puts a customer's pending edits in front of their visitors the moment you press it. |
| 3 | **Creating an ad campaign launches it.** There is no draft and no paused-first state. The customer's money starts being spent when it succeeds. |
| 4 | **Resuming a paused campaign starts spending again immediately.** |
| 5 | **Editing a plan changes what customers are charged and entitled to.** There is no approval step, no future effective date, and no warning that you are touching live pricing. |
| 6 | **The console does not check your role.** It only checks that you are signed in. What you are allowed to do is decided by the backend, so a forbidden action fails at the server rather than being hidden from you. |

## Signing in

Email and password. The session is kept in the browser and re-checked against
the server on every reload; an expired or revoked session signs you out rather
than leaving you clicking dead buttons.

One exception worth knowing: the background system-status poll does **not**
sign you out if it is refused, because a perfectly valid staff account may
simply not be allowed to read system status. If `/system` shows you nothing at
all, that is most likely what has happened.

The console lives at `admin.bbloom.ge` and also answers at `bbloom.ge/admin`.

---

## Areas

### Sites

A searchable, paginated list of every website on the platform, with its status,
template, design tier, address and whether it has unpublished changes. The list
itself changes nothing.

### Site detail

The main working screen for one customer website. Alongside the site's
identity, status, category, tier, template, products, languages, currency and
dates, it carries five panels.

**Publishing.** *Publish* / *Unpublish* changes what the public sees
immediately. *Publish pending changes* makes the customer's saved-but-unpublished
edits public — be sure that is what the customer asked for, because you are
publishing **their** draft, not yours.

**Settings.** Business name, languages, currency, contact details, SEO fields,
social links and map link. Saved as a partial update.

**Client accounts.** The customer's own logins for this site. You can create
one (email, name, password, and owner or editor role), enable or disable one,
and reset a password. Disabling an account or resetting a password locks the
customer out **immediately** — tell them first.

> The underlying API client has a delete-user call, but no delete button is
> wired to this panel. Use disable.

**Domains.** Add a hostname, mark one primary, remove one. **Removing a domain
has no confirmation dialog** and changes where the customer's website answers.
It is the easiest serious mistake available on this screen.

**Payment account.** The customer's own merchant credentials — provider,
merchant reference, client ID and secret, currency, return URL. *Disable* is a
soft disable rather than a deletion, and it asks for confirmation. It can stop
future ordering while leaving orders already in flight alone.

**Danger zone.** Deletes the entire site. You must type the site's exact slug
before the button becomes usable. This removes the site's content, its client
accounts and its stored images, and there is no undo anywhere in this product.

### Creating a site

A step-by-step wizard: template, business name and slug, languages and default
language, currency, contact email and phone, then a review step. Unlike the
customer's own version of this form, staff can choose whether to seed the site
with **sample content**.

The site is created as a draft. It does not go public until someone publishes
it.

### Accounts

A searchable list of customer accounts with their verification state, whether
they are enabled, their free-site allowance and their sites.

Opening one gives you three actions:

| Action | Effect |
| --- | --- |
| Confirm email | Marks the address confirmed without the customer entering a code. Use when their mail is not arriving. |
| Resend confirmation | Sends a real email. Subject to a daily limit, which the screen reports along with when it lifts. |
| Change free-site allowance | Changes what the account may create. Takes effect at once. |

There is no account deletion and no password reset here.

### Plans

**The highest-consequence screen in the console.** The list shows every plan,
including inactive and non-purchasable ones.

The editor controls, in one place:

- the **billable price**, currency and billing period;
- whether the plan is **active**, **purchasable by customers**, **coming soon**
  and **featured**;
- the **highest design tier** it unlocks;
- the **monthly ad impression allowance** and the **ad channels**;
- a **discount** percentage and its date window;
- the Georgian and English name, summary, call to action, cadence wording and
  feature bullets.

Four traps, in order of how easily they catch people:

1. **The displayed price text is not the price.** The translated price string
   is copy. The billable amount is a separate field. Editing the words does not
   change what anyone is charged, and editing the amount does not change the
   words.
2. **A blank ad allowance means *unlimited*, not zero.** Zero means no
   impressions at all. These are opposite outcomes from two very similar-looking
   inputs.
3. **The design tier field is a ceiling, not a single choice.** Selecting
   Modern unlocks Simple and Classic too. The editor spells out the included
   list under the field precisely because staff read "Modern" and picture a plan
   offering one design.
4. **Saving writes the whole record.** A stale editor tab can therefore push
   old values back over newer ones. Reload before editing a plan you have had
   open for a while.

Deleting a plan asks for confirmation, and the server refuses while any
subscription or historical payment still points at it. **Deactivate rather than
delete** — payment history has to keep making sense.

> Whether an existing subscriber's price follows a plan price change is decided
> by the backend and is not visible from this repository. Do not promise either
> answer; check
> [business-rules.md](https://github.com/Bbloomofficial/bbloom-back/blob/main/docs/business-rules.md).

### Promo codes

Create and edit discount codes: the code itself, percentage off, expiry,
maximum redemptions, active state, and which plans it applies to.

**An empty plan restriction means the code works on *every* plan**, not on
none. The used count is derived from real redemptions.

As with plans, the server refuses to delete a code that a payment has already
used, because deleting it would orphan the audit trail. Deactivate instead.

### New customer offer

A single switch and a percentage: the discount on a new customer's first
billing period. Turning it off does not claw back discounts already granted;
changing the percentage affects future eligible customers.

### Ads

The platform-wide advertising view: integration status plus every customer
campaign, filtered by status.

**Creating a campaign launches it for real.** You choose the site, campaign
name, channels, destination URL, copy, image, and country, city and age
targeting. The form asks for confirmation, and then the campaign is live at
Meta and spending. There is no budget field on the form — the budget is
configured server-side.

On a campaign: refresh insights, pause, resume, or delete at Meta. Every
state-changing action asks for confirmation.

> **The failure case that costs money.** If Meta refuses an action, the
> campaign may still be running and still spending. Read the failure reason and
> the still-spending indicator rather than assuming a failed request means
> nothing happened. If in doubt, delete the campaign and verify at Meta.

### Ad tools

An internal test harness. It launches **real Meta campaigns that spend real
money** at a server-configured budget, and keeps a history of test campaigns
you can delete. It is rate-limited per admin. Treat it as live advertising,
because it is.

### System status

The health of outgoing email: current state, consecutive failures, the last
successful send, recent failures, and the people still owed an email. It polls
itself in the background, and a warning banner appears across the whole console
when mail is unhealthy.

Four things to understand before acting on it:

- **"Off" is not a failure.** It means mail is deliberately not configured.
  "Degraded" and "failing" are the states that need you.
- **This is a live snapshot, not an incident log.** It is held in memory and
  resets when the service is deployed.
- **The unresolved-recipients list is the one that matters.** The status can go
  green again while people are still owed an email.
- **The mail test sends a genuine email.** A refusal comes back as a successful
  HTTP response carrying a failed outcome, so read the result on screen rather
  than assuming success because nothing went red.

---

## Quick reference: what cannot be undone

| Action | Where | Undo? |
| --- | --- | --- |
| Delete a site | Site detail → Danger zone | **None.** Content, client accounts and images go with it |
| Delete an ad campaign | Campaign detail | None at Meta |
| Create / resume an ad campaign | Ads | Money already spent is spent |
| Remove a domain | Site detail → Domains | Re-addable, but the site is unreachable at that address meanwhile; **no confirmation prompt** |
| Publish / unpublish | Site detail | Reversible, but the public saw it |
| Reset a client password | Site detail → Client accounts | Locks the customer out until told the new one |
| Change a plan price or entitlement | Plan editor | Reversible by editing back; customers may have transacted meanwhile |
| Change the free-site allowance | Account detail | Reversible |
| Send a mail test or resend a confirmation | System / Account detail | The email has been sent |

## Things that are not what they look like

- **Payment account** manages the *customer's* merchant credentials. There is
  no card processing in this console at all.
- **"Business email, where the address allows it"** is advertised on every
  plan, but there is **no implementation of it** in this repository. The email
  fields on the settings panel are ordinary contact details for the customer's
  website. There is no mailbox, no provisioning and no Gmail integration.
- **The console shows you buttons you may not be allowed to press.** With no
  client-side role check, an action you lack permission for fails at the server
  rather than being hidden.
- **System status showing nothing** usually means your account is not permitted
  to read it, not that the system is healthy.
