# Loxion Mart — continuation checkpoint

## Product identity (do not dilute)
An online shopping mall for local South African businesses. One customer account, many shops, real products and bookable services. Motto: **Shop Local, Shop Lekker!** Keep it prominent in the home page and shared brand/navigation. Preserve the Canva Loxion Mart logo, black/cream/green identity, GitHub repo and Render setup. Ozow/payment activation is deferred until Ivyson has the business bank account.

## Current batch: online mall foundation
Status: implementation started. Working branch: `mall-foundation`. Starting main commit: `363fb106ed260bfae08ee3707889567fb3c2d25a`.

Deliver this complete batch:
- Product/service catalogue with query, type, category, location, price, availability, sorting and pagination.
- Product/service detail pages with actual seller images, description, specifications and booking or basket actions.
- Shop storefronts with own logo/banner, catalogue, location, opening hours and fulfilment information.
- Account-synced saved items and followed shops; local explorer collection and recent discoveries without fake urgency or rewards.
- Owner application, admin approval and owner-only catalogue management, including photo uploads.
- Keep financial activation deferred; clearly describe basket/booking status.
- Meaningful API authorization/catalogue/upload tests; production frontend build; migrations checked on PostgreSQL where available.

## Implementation decisions
Retain FastAPI, SQLAlchemy, Alembic and PostgreSQL; React/Vite CSS modules. `Service` currently represents both product and booking listings: extend it rather than breaking existing IDs, orders or bookings. Additive migration only. Existing admin-created businesses remain approved. Public endpoints must exclude hidden/pending shops. Owner editing must never grant access to another shop or admin-only settings. Photos must survive Render restarts: use bounded database storage for this first release; migrate to object storage as scale grows. Never use stock or generated imagery as a photo of an actual product. Mall illustration is brand artwork only.

## Carry-forward facts
Canva design `DAHNrQJOXv8` title `loxion`: Stay → Mart correction committed. Repo: `IvysonGoaliath/Loxionmart`. Frontend https://loxionmart-web.onrender.com, API https://loxionmart-api.onrender.com. User wants batched implementation and tests, not repeated toggle/re-toggle requests. No shared credentials in this document.

## Resume
Fetch `main` and `mall-foundation`, read this file and commit history, inspect working tree before edits. Continue incomplete checklist items instead of restarting. Update this checkpoint at each coherent commit and before final handoff. No backend/user database resets.

## Later, after this batch
Payment onboarding/settlements/refunds; stock reservation and variant-specific stock; multi-shop payment splitting; verified-purchase reviews; notifications with opt-in; operational policy review and seller verification; object storage/CDN and hosting capacity. These require concrete business decisions or services and must not be represented as already operational.
