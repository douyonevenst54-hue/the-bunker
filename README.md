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
- [ ] Bunker map, drag-and-drop placement, Rooms 3–6, Power Outage scenario, admin + safety review

## Develop
```bash
npm install
cp .env.example .env   # DATABASE_URL, AUTH_SECRET
npm run migrate:dev    # schema changes: prisma migrate dev only, never db push
npm run dev
```
Tests: `DATABASE_URL=... ./tests/run-e2e.sh` (fresh database, production build, end-to-end checks).
Expert content review: `/room/<id>/review`.

Safety content is checked against EPA, FEMA/Ready.gov, CDC, AHA and American Red Cross guidance and reviewed by Dr. Jhon Evenst Douyon, MD, MPH.
For education only, not professional certification.
