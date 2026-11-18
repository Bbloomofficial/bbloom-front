# bbloom frontend documentation

**Who this is for:** anyone at bbloom — technical or not — who needs to
understand what this repository puts in front of people.
**What it answers:** which document to read, and where the rules behind the
screens are written down.

## Start here: this repository is five products, not one

`bbloom-front` is a single React codebase that builds a single bundle. That
bundle then behaves as **five completely different things**, depending on the
address a visitor arrives at:

| Surface | What it is | Who sees it |
| --- | --- | --- |
| Marketing site | The public pitch on `bbloom.ge` | Strangers and prospects |
| Try editor | A sign-up-free sandbox for editing a demo site | Prospects |
| Customer dashboard | Where a paying customer runs their own website | Customers |
| Staff admin | Where the bbloom team administers the platform | bbloom staff |
| Client site renderer | Every customer's own live website | The customer's own visitors |

Almost every misunderstanding a newcomer has about this repository traces back
to not knowing this. [**surfaces.md**](surfaces.md) is the orientation
document; read it before anything else here.

## The documents in this repository

| Document | Read it when you want to know |
| --- | --- |
| [surfaces.md](surfaces.md) | What the five surfaces are, where each lives, and how an address picks one |
| [dashboard-guide.md](dashboard-guide.md) | What a customer can actually do, screen by screen |
| [admin-guide.md](admin-guide.md) | What staff can do, and which buttons are dangerous |
| [client-sites.md](client-sites.md) | How a customer's own website is built, edited, published and themed |
| [frontend-dev.md](frontend-dev.md) | Developer reference: layout, routing, API client, translations, tests |

For installing the project, running it and the theming tokens, see the
repository [`README.md`](../README.md). These documents deliberately do not
repeat it.

## The rules live in the backend repository

This repository **renders** decisions. It does not **make** them. What a plan
costs, what it includes, how long a trial runs, who is allowed to do what — all
of that is decided and enforced in
[`Bbloomofficial/bbloom-back`](https://github.com/Bbloomofficial/bbloom-back).

So these documents describe **what a person sees and does**. When you need a
rule, a limit, a price or a lifecycle, go to the backend documentation set:

| Backend document | What it covers |
| --- | --- |
| [docs/README.md](https://github.com/Bbloomofficial/bbloom-back/blob/main/docs/README.md) | Index of the canonical documentation |
| [docs/product-overview.md](https://github.com/Bbloomofficial/bbloom-back/blob/main/docs/product-overview.md) | What bbloom sells |
| [docs/glossary.md](https://github.com/Bbloomofficial/bbloom-back/blob/main/docs/glossary.md) | Shared vocabulary |
| [docs/business-rules.md](https://github.com/Bbloomofficial/bbloom-back/blob/main/docs/business-rules.md) | **Every business rule, limit and lifecycle** |
| [docs/architecture.md](https://github.com/Bbloomofficial/bbloom-back/blob/main/docs/architecture.md) | How the system fits together |
| [docs/data-model.md](https://github.com/Bbloomofficial/bbloom-back/blob/main/docs/data-model.md) | The database and its entities |
| [docs/operations.md](https://github.com/Bbloomofficial/bbloom-back/blob/main/docs/operations.md) | Running and deploying the system |

If you find a number in these pages that looks like a business rule, treat it
as a bug in the documentation and move it to `business-rules.md`.

## The one thing to be careful about

The code under `src/site/` renders **every paying customer's live website**. A
change there reaches every customer domain on the next deploy, and there is no
per-customer opt-out and no staged rollout. See
[surfaces.md](surfaces.md#the-blast-radius-of-srcsite) before touching it.
