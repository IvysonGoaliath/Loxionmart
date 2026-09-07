# Loxion Mart — continuation checkpoint

## Product identity (do not dilute)
An online shopping mall for local South African businesses. One customer account, many shops, real products and bookable services. Motto: **Shop Local, Shop Lekker!** Keep it prominent in the home page and shared brand/navigation. Preserve the Canva Loxion Mart logo, black/cream/green identity, GitHub repo and Render setup. Ozow/payment activation is deferred until Ivyson has the business bank account.

## Current batch: online mall foundation
Status: implementation complete; automated checks passed; publication pending. Working branch: `mall-foundation`. Starting main commit: `363fb106ed260bfae08ee3707889567fb3c2d25a`.

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



## Completed in the mall foundation batch (2026-09-07)
- Restored the exact motto in top navigation, home and footer; made catalogue entrances prominent.
- Added /mall, /item/:id, rich /business/:slug storefronts, /saved, /sell, /merchant and /merchant/:id, and /admin/applications.
- Paginated catalogue and shop directory; server-side type/category/location/price/availability filtering and sorting.
- Actual seller photos, gallery, descriptions, specifications, duration, stock information, related listings, share and shop enquiry links.
- Multi-shop basket with migration of old carts; guest browsing and account return destinations.
- Account-synced saved products/services/followed shops; new items from followed shops, Local Explorer category collection and clearable recent history on the device.
- Shop applications, admin approval/feedback/resubmission, owner catalogue/profile/photo editing and scoped booking management.
- Durable photo uploads (JPG/PNG/WebP, 2 MB per stored photo, 20 MB per uploader), browser compression, no paid external storage prerequisite. Public media URLs are intended for catalogue photos, never confidential documents.
- Additive Alembic 0003 migration preserves existing IDs, accounts, orders and bookings. Existing shops default to approved. No user-role enum change.
- Payments explicitly disabled in configuration; order endpoint refuses checkout while disabled. Basket text accurately states no order/payment occurs.

## Validation evidence
- 13 backend tests passed: existing admin visibility, catalogue/directory queries, pending/hidden shop exclusions, ownership/admin access, application-to-public flow, partial item updates, safe image URLs, saved isolation/idempotency, media roundtrip/size/type/ownership, booking ownership/transitions and payment gate.
- 3 frontend basket tests passed: cross-shop totals/removal, stock/type restrictions, and legacy cart migration.
- Production Vite build passed. PostgreSQL migration SQL generated successfully for 0002 → 0003; a local PostgreSQL server was unavailable, so execution against PostgreSQL must be confirmed by Render deployment and read-only endpoint checks.
- Browser interaction/visual QA has not been run. User did not request browser QA; do not claim it passed.

## Business inputs still needed after release
Add actual product/service photos and specifications for real shops through Admin → Businesses → Catalogue & photos. Existing seeded listings intentionally have no invented product photography, ratings, discounts or verified claims. Invite initial owners to /sell after reviewing the live flow. Existing admin-created shops are still admin-managed; transfer of an existing shop to an owner requires an explicit ownership-verification workflow, not a self-claim shortcut.

## First actions when resuming
1. Check the latest branch/main commit and live /api/catalogue, /api/catalogue/shops, /api/mall-config and static bundle.
2. If deployment is healthy, focus on real merchant content and one batched customer/owner browser walkthrough if requested.
3. Next engineering milestones: photo allowance management and object storage, verified existing-shop ownership transfer, password recovery and legal/support pages, option/variant selection, stock reservation, then payment onboarding after business-bank readiness.
4. Before enabling payments, implement/review per-shop checkout, idempotent payment notifications, stock reservation, refunds, delivery costs and merchant settlements. Do not just flip PAYMENTS_ENABLED.

## Design implementation references
W3C form labels and feedback: https://www.w3.org/WAI/tutorials/forms/ . Image sizing/loading: https://web.dev/learn/images/performance-issues . Applied as implementation guidance, not a claim of audited compliance. The mall storefront illustration is original generated brand artwork, served as a ~92 KB WebP; it is not photography of actual participating shops or inventory.
