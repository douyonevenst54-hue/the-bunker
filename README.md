# THE BUNKER

A free emergency-preparedness game in English and Haitian Creole.
Players build and run a survival bunker room by room, learning real skills that keep families safe.

**Live:** https://buildthebunker.com

## Stack
Next.js (App Router) · TypeScript · Prisma · Neon PostgreSQL · Vercel

## Status (MVP)
- [x] Room 1: Water Management
- [x] Room 2: Medical & First Aid
- [x] Guest + registered accounts, server-scored progress, room unlocking
- [x] Critical safety errors block unlocking (a high score can't hide them)
- [x] Bunker floor-plan map and badges
- [x] Forgot password (bilingual email via Resend, 1-hour one-time links)
- [x] Drag-and-drop placement (correct / incorrect / unsafe; drag, tap, or keyboard)
- [x] Rooms 3–6: Security & Entrance, Food & Nutrition, Air & Ventilation, Energy & Electricity
- [x] Power Outage cross-room scenario (unlocks after all six rooms)
- [x] Admin panel: learning analytics, reviewed content edits (EN/HT) with audit log, expert sign-off shown to players
- [x] Levels: each scenario unlocks the next. Level 2: Hurricane (before, during and after the storm)
- [x] Level 3: Flood (watch, flash flood, return home, food, wells, mold, wiring)
- [ ] Level 4: Conflict / civil unrest · Level 5: Nuclear emergency (plus earthquake)
- [x] Free / subscription split: Rooms 1–2 free; members ($2.99/mo or $24.99/yr via Stripe) get rooms 3–6 and every level
- [x] 3D Water room (beta): first-person, tap-to-move; same content and scoring; 2D stays as Lite mode
- [x] 3D Medical room (clinic look; spots: closet, high cabinet, bathroom, fridge, attic, kids table)
- [ ] 3D for rooms 3–6
- [ ] School / organization licenses

## Develop
```bash
npm install
cp .env.example .env   # DATABASE_URL, AUTH_SECRET
npm run migrate:dev    # schema changes: prisma migrate dev only, never db push
npm run dev
```
Tests: `DATABASE_URL=... ./tests/run-e2e.sh` (fresh database, production build, API checks). Add `UI_TESTS=1` with Playwright installed for real-browser drag-and-drop tests.
Expert content review: `/room/<id>/review`.

Safety content is checked against EPA, FEMA/Ready.gov, CDC, AHA and American Red Cross guidance and reviewed by Dr. Jhon Evenst Douyon, MD, MPH.
For education only, not professional certification.

## Admin
Accounts whose email is in `ADMIN_EMAILS` (Vercel env, comma-separated) see an **Admin** link.
- `/admin`: players, pass rates, average scores, critical errors and most-missed questions per room.
- `/admin/content/<id>`: edit any English or Kreyòl text. Edits are pending until approved; approved edits reach players immediately; every change is logged. Answer keys change only in code.
- Sign off a room once reviewed. Players see "Content reviewed by … · date".

## Memberships (Stripe)
The paywall turns on by itself once these Vercel env vars are set (until then everything stays open):
`STRIPE_SECRET_KEY`, `STRIPE_PRICE_MONTHLY`, `STRIPE_PRICE_YEARLY`, `STRIPE_WEBHOOK_SECRET`.
Webhook endpoint: `https://buildthebunker.com/api/billing/webhook` with events `checkout.session.completed`,
`customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`.
Admins are always members. Free rooms are listed in `lib/plan.ts` (`FREE_ROOMS`).
