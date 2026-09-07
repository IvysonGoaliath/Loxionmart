# Loxion Mart — continuation checkpoint

## Product identity (do not dilute)
An online shopping mall for local South African businesses. One customer account, many shops, real products and bookable services. Motto: **Shop Local, Shop Lekker!** Keep it prominent in the home page and shared brand/navigation. Preserve the Canva Loxion Mart logo, black/cream/green identity, GitHub repo and Render setup. Ozow/payment activation is deferred until Ivyson has the business bank account.

## Current batch: online mall foundation
Status: LIVE on Render. Ivyson explicitly approved production deployment and additive migration 0003. PR #1 merged into main as `fa1c1303c87a81b89f13e8ec42f0b0718a5c21e7` on 2026-09-07. Both frontend and API deployments report success; read-only production checks passed. Implementation commit: `0d0d82e75f9225b1ede56bf1c0e10aaad47b70af`. Starting main commit: `363fb106ed260bfae08ee3707889567fb3c2d25a`. Payments remain disabled.

## Current repair: shop application review
Ivyson reported that applicants see In review while the administrator can only find the active/inactive toggle. Root causes: the admin sidebar was hidden below 768px with no mobile replacement; the business list omitted application status and review links; the existing review page labelled rejection only as Request changes.

Implemented on top of `fa1c1303c87a81b89f13e8ec42f0b0718a5c21e7`:
- Mobile admin navigation with a visible Shop applications shortcut, plus review links on the dashboard, business list and admin shop workspace.
- `/admin/applications` filters for In review, Rejected and Approved; `/admin/applications/:id` for a complete application and decision controls.
- Explicit Approve & publish shop and Reject application actions. Rejection reason is trimmed and required in both frontend and backend. Existing feedback stays visible in the application record; owners see it and can update/resubmit.
- Admin business responses include review status. Application and visibility are distinct columns; pending/rejected shops link directly to review. A visibility update cannot approve a shop; the API rejects activation until approval.
- No migration or new external service. Payment configuration is unchanged and disabled. Real shop decisions are left to Ivyson.

Validation: 16 backend regression tests passed, including 3 new end-to-end API tests for rejection feedback/resubmission, decision/visibility separation and completed application filters. Production Vite build passed (local JS `index-Iy1R_Z3p.js`, CSS `index-Ct1MxOii.css`; deployment environment can change the JS hash). `git diff --check` passed. Browser interaction/visual QA has not been run. Publication verification is the remaining step for this repair.

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
- Production Vite build passed. PostgreSQL migration SQL generated successfully for 0002 → 0003. A local PostgreSQL server was unavailable. Render subsequently completed its migration/start command successfully, and production catalogue/shop queries returned the new fields without database errors.
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


## Production release and continuation (2026-09-07)
The earlier automatic approval blocker is resolved: after being asked explicitly about deploying this update and its database migration, Ivyson replied, "Yes, I approve!" PR #1 was marked ready and merged normally with an expected-head SHA check. No forced branch update was used.

- Release commit: `fa1c1303c87a81b89f13e8ec42f0b0718a5c21e7`; PR: https://github.com/IvysonGoaliath/Loxionmart/pull/1 .
- Render frontend deployment `6301974991` reported success at 04:29:23 UTC; API deployment `6301988745` reported success at 04:32:08 UTC. These are GitHub deployment IDs, not Render service IDs.
- Production `/api/health` returned HTTP 200, status ok, environment production.
- `/api/catalogue?page_size=1` returned HTTP 200 with 12 public listings and the new image/specification/stock/duration/business fields; `/api/catalogue/shops?page_size=1` returned HTTP 200 with 2 public shops and their new branding/fulfilment fields. Counts describe this verification snapshot, not a marketing claim.
- `/api/mall-config` returned `{"payments_enabled":false}`. Do not activate Ozow or payments before the deferred business and engineering work.
- Anonymous requests to `/api/saved` and `/api/merchant/shops` returned HTTP 403 as expected; authenticated ownership behaviour is covered by the local regression suite. No customer account, booking, order or upload was created during production verification.
- API CORS headers allow the actual frontend origin `https://loxionmart-web.onrender.com`.
- Frontend `/mall` and `/sell` returned HTTP 200. Served bundle `/assets/index-XPLXtcTi.js` contains the restored motto, Local Explorer, saved/merchant routes and correct public API hostname. Original mall artwork returned HTTP 200 as a valid 93,916-byte WebP.
- Production verification was read-only HTTP and deployment-status inspection. Browser interaction/visual QA remains unperformed; do not claim otherwise.
- The intended documentation-only checkpoint commit uses `[skip render]` to avoid another application deployment (Render reference: https://render.com/docs/deploys#skipping-an-auto-deploy).

### Checkpoint sync still pending
The application release is live, but the subsequent GitHub update of this file was rejected by automatic approval review because its usage limit was reached. The rejection was not a deployment failure. Ivyson confirmed approval again; this does not remove a service usage limit. This updated file is available locally for the handoff. Remote main remains the successful release commit above, with the older checkpoint text. Once normal tool availability returns, fetch main and the current blob SHA, sync this updated checkpoint with a documentation-only `[skip render]` commit, and do not redeploy or rerun the migration just to update these notes.

Resume from current `main`, not the old working-tree baseline. The next useful batch is real merchant catalogue content and, if requested, a single complete customer/owner/admin browser walkthrough. Follow the engineering milestones above after addressing real findings. Preserve the motto, existing Canva Mart logo, approved records and deferred payment decision.
