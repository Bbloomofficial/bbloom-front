# The customer dashboard

**Who this is for:** anyone at bbloom who needs to know what a customer can do
with their own website — support, sales, onboarding, and new developers.
**What it answers:** screen by screen, in the order a customer meets them, what
is on the page and what each action actually does.

This describes the behaviour of the code in `src/dashboard/`. It deliberately
does not state limits, prices or lifecycle rules; those are in
[business-rules.md](https://github.com/Bbloomofficial/bbloom-back/blob/main/docs/business-rules.md).

## Vocabulary

| Term | Meaning here |
| --- | --- |
| **Site** | One website belonging to a customer. An account can hold several. |
| **Enquiry** | A message a visitor sent through the website's form. Shown in the Inbox. |
| **Draft** | Edits that are saved but not yet visible to the public. |
| **Publish** | Make the saved draft the live website. |
| **Design tier** | How elaborate a template's design is — Simple, Classic or Modern. **Not** the subscription plan. |
| **Paid features** | The extras a subscription unlocks, as opposed to the website itself. |

> **The word "tier" means two different things and they are constantly
> confused.** A *design tier* describes a template. A *plan* is what the
> customer bought. The plan codes happen to echo the tier names, which is
> exactly why people conflate them. When you write anything, say which you mean.

## How a customer gets in

Sign-in and registration open as a dialog over the public bbloom.ge page the
visitor was reading. A new customer enters a name, an email and a password, and
is then shown a six-digit confirmation code screen — the boxes auto-advance,
accept a pasted code, and submit themselves once all six digits are in.

Two things worth knowing for support calls:

- If someone starts signing up, abandons it, and comes back, the form tells
  them the email already exists and offers **"Confirm instead"**, so they can
  finish the original signup rather than being stuck.
- If someone tries to sign in with an unconfirmed email, the sign-in screen
  turns into the same code screen rather than just refusing.

**Confirming the email address is what unlocks publishing.** It is an
anti-abuse check, not a commercial one.

## The shape of the dashboard

Two levels of navigation:

- **The side rail**, always present: *My websites* and *Account*.
- **The tabs across the top**, once a website is open: Overview, Page, Inbox,
  Orders, Ads, QR, Billing, Team.

Two tabs are conditional:

- **Orders** appears only where the website can actually sell. Elsewhere the
  tab is hidden, because a tab that always leads to "you cannot do this" teaches
  people to ignore the navigation. The page itself is still reachable by its
  address and explains why.
- **Team** appears only for owners.

**Ads and QR are shown to everybody**, including customers who have never
bought either. For them the tab is the sales pitch — hiding it would mean the
only people who learn the feature exists are the ones who already knew.

---

## Screen by screen

### My websites

The list of every website on the account. Each card shows the business name,
the address, whether it is published, the subscription state, the customer's
role, and whether there are **unpublished changes waiting**.

This page only lists and links. A website cannot be deleted from here — or
anywhere else in the customer dashboard. Deletion is staff-only.

### Creating a website

A short form: business name, default language (Georgian or English), and a
template chosen from a grid grouped by business type.

Templates above the account's design tier are **shown but locked**, with a
route to upgrade rather than being hidden. The check is repeated on the server
when the site is created, so a locked template cannot be forced through.

There is no "include sample content" choice here. The backend seeds the new
site's starting content. (Staff creating a site *do* get that choice — see
[admin-guide.md](admin-guide.md).)

### Overview

The home page for one website, and the screen support will usually be looking
at. It shows:

- a greeting, the site's status, and a **View site** link to the real thing;
- the template, the **design tier**, product count, languages, currency,
  address, domains, and when it was created and published;
- enquiry counts — unread, last seven days, last thirty days, total — each of
  which is a link into a filtered Inbox;
- the most recent enquiries;
- contact details (phone, email, address in both languages, map link, social
  links), editable here and saved immediately;
- the visitor message form settings.

Owners also get **Change design** and the **Publish / Unpublish** button.

Two behaviours to understand:

- **Publishing is disabled while the email is unconfirmed**, and the banner
  explains why.
- If publishing this *additional* website would need a plan, the page shows a
  **warning but leaves the button enabled**. This is deliberate. That fact can
  go stale in a tab that has been open a while, and a stale warning that hid the
  button would leave a customer who had just freed up the slot staring at a
  screen with no way to act. Leaving it enabled costs one refused request, which
  explains itself in their own language.

### Page — the content editor

Opens in a window of its own. The left side lists the website's sections; the
right side is a live preview of the real website.

**Editing never touches the public site.** Everything is saved into a draft
first. The customer can keep editing over days; visitors see the old version
until the moment they press Publish. The full model is explained in
[client-sites.md](client-sites.md#the-draft-then-publish-model).

Controls:

| Control | What it does |
| --- | --- |
| Save | Stores this section's changes in the draft. Not public yet. |
| Publish changes | Makes **all** saved draft sections public at once. |
| Discard | Throws away every unpublished change. Asks for confirmation. |
| Reset section | Returns one section to the original template text. Asks for confirmation. |
| Show / hide section | Takes a section off the page without deleting its content. |
| Move up / Move down | Reorders the sections. |

A genuinely nice touch worth telling customers about: they can **click directly
on the text or image in the preview** to jump to the field that controls it,
rather than hunting through the section list. The preview labels these as
"Click to edit this text" and "Click to change this image".

Two things that are *not* part of the draft cycle:

- **Images.** Uploading a picture puts it in the media library straight away.
  Deleting one from the media library is immediate and permanent, and — worth
  flagging — the editor does not ask for confirmation before doing so.
- **The location panel** (address and map link) saves to the site's settings
  directly, like the Overview contact details, rather than waiting for Publish.

### Inbox

Every message a visitor sent through the website: general enquiries, questions
about a specific product, reservation requests and newsletter sign-ups.

Filters by type and by status, paginated, with a detail panel on the side where
the customer can change the status and write a private internal note.

Two points that come up constantly in support:

- **bbloom does not email these messages out.** They live in this inbox. The
  code is explicit that nothing is sent on the customer's behalf. A customer who
  expects a message in their own mailbox will think the form is broken.
- The **"reply by email"** link is an ordinary `mailto:` link. It opens
  whatever email program the customer already uses. It is not a bbloom mailbox
  and nothing is sent through us.

The filters are kept in the page address, so a filtered view can be bookmarked
or pasted to a colleague.

### Orders

Only relevant where the website can sell. If it cannot, the page explains why
rather than showing an empty list, and links to Billing when the reason is the
plan.

When it is available: order statistics, filters by payment status and
fulfilment status, a paginated list, and a detail panel.

**The dashboard cannot move money.** The customer can change the *fulfilment*
status and write internal notes. They cannot change the payment status. The
"refund" action **records a refund that has already been made elsewhere** — it
does not send anybody any money. A new support person could easily get this
wrong.

> **Current state — unverified from this repository.** A note in
> `src/dashboard/ordering.tsx` records that the ordering status endpoint was
> answering "not enabled" for every site, and that no template turned online
> ordering on. That is a comment, not executable logic: the only code here asks
> the API at runtime and believes the answer. This repository therefore cannot
> establish what any site actually answers today, and the comment may be stale.
> **Confirm the live position in
> [business-rules.md](https://github.com/Bbloomofficial/bbloom-back/blob/main/docs/business-rules.md)
> before telling a customer anything about it.**

### Ads

**Read-only.** The customer can see their impression allowance and how much of
it is used, which channels they are on, and each campaign's name, status,
budget, spend and launch date.

There is no way for a customer to create, edit, pause or stop a campaign. All
of that is done by bbloom staff. A customer with no advertising sees the offer
and a "write to us" link instead.

### QR code

A printable QR card pointing at the website, generated by the backend and
designed for a shop window or a menu. Preview on screen, download as PDF or
PNG, in Georgian or English.

This is a paid feature. Customers without it see an explanation and — if they
are the owner — a route to Billing. Their website stays online regardless.

If the site has a custom domain that is not verified yet, the page warns that
the card would point at an address that does not resolve.

### Billing

Shows the current subscription state, plan, renewal or cancellation date, any
pending payment, the payment history, and the plans available to switch to,
with a promo-code box.

**Card payment is not live.** The screen says so in as many words: *"We can't
take card payments online just yet — the bank side is still being arranged."*
Choosing a plan starts a checkout that currently returns manual-payment
instructions rather than taking a card. There is no card number field anywhere
in this repository.

**Stop renewing** asks for confirmation, and is not a deletion: the
subscription runs to the end of the period already paid for, and the content
stays.

And the single most important reassurance for a lapsed customer:

> **Nothing goes dark when a subscription lapses.** The website stays up, stays
> theirs, and keeps showing their phone number and address. What changes is that
> the bbloom badge comes back, the custom domain goes quiet, and the visitor
> message form stops accepting new messages. Messages already received stay in
> the inbox and stay readable. Telling a customer "your website is offline"
> would send them into a panic about a shop that is serving perfectly well.

### Account

Name and email, with a verified badge, and a password change form.

There is **no way for a customer to change their own name or email address.**
That has to go through staff.

### Team

Owner-only, per website. Owners can see the members, add one, promote an editor
to owner, demote an owner to editor, and remove someone (with confirmation).
Roles are owner and editor.

**"Invite" is the wrong word for what the button does.** It attaches an account
that **already exists** to the website. No invitation email is sent. If the
colleague has not registered on bbloom yet, this will not work and the customer
will not be told why in a way that explains it. This is the most likely support
call on this screen.

Editors see a short "owners only" message instead of the member list.

---

## What a new staff member should be careful about

1. **"Change design" is irreversible.** It is the only customer-facing action
   with lasting consequences. The customer is shown a preview of exactly what
   will be removed, must tick an acknowledgement, and must confirm. Moving away
   from the Modern design removes order and payment buttons from the public
   site.
2. **The refund button does not refund anything.** It records a refund made
   elsewhere.
3. **Enquiries are not emailed.** Customers must be told to check the inbox.
4. **"Invite a colleague" requires them to already have an account.**
5. **Deleting an image from the media library is immediate and unconfirmed.**
6. **Lapsed is not offline.** See the Billing section above.
7. **A plan is not a design tier.** A customer on a plan whose name resembles a
   tier name is not thereby on that design.

## Features that are advertised but not built

- **"Business email, where the address allows it"** appears in the advertised
  feature list of every plan. There is **no implementation of it anywhere in
  this repository** — no mailbox, no provisioning, no Gmail integration, no
  setting. The only email features that exist are account confirmation, and the
  `mailto:` links that open the customer's own email program.
- **Card payment**, as described under Billing.
- **Online ordering** — the screens exist and the gate is live, but whether any
  site is actually allowed to sell today cannot be established from this
  repository. See the note under Orders.
