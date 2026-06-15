# Cybernet Stock Tracker — Project Brief

> Kept in the repo root so it stays in context for every session.
> See also `AGENTS.md` for Next.js 16 / React 19 framework rules.

## Goal

Build a self-hosted web app, usable on both desktop and mobile, for tracking
Cybernet IT's hardware stock. We need to know what kit we hold, where it is (our
office or a specific customer site), why it's there, and the relevant ticket and
dates. Field engineers should be able to log and photograph devices from their
phones.

## How to work on this

1. Read this whole brief, then propose a short plan and the folder structure
   before writing code. Wait for confirmation.
2. Build in phases (see "Build order"). After each phase, summarise what's done
   and what's next.
3. Set up git from the start with sensible commits. Add a `.gitignore`, an
   `.env.example`, and a `README.md` with setup and deploy steps.
4. Keep secrets out of the repo. All credentials and config go through
   environment variables.
5. Use British English in all UI copy and comments.
6. Ask when something's ambiguous rather than guessing.

## Stack

- **Framework:** Next.js (App Router, TypeScript) — single codebase serving both
  the web UI and the API.
- **Database:** PostgreSQL.
- **ORM / migrations:** Prisma.
- **Styling:** Tailwind CSS.
- **Auth:** see "Authentication".
- **Image storage:** local filesystem with paths stored in the DB for v1.
  Structure the storage layer behind a simple interface so we can swap in MinIO
  (S3-compatible) later without rewriting callers.
- **Packaging:** Docker + Docker Compose (app + Postgres). Caddy as a reverse
  proxy for automatic TLS.
- **PWA:** make the web app installable (manifest + service worker) so engineers
  can add it to their phone home screen. Mobile layout must be properly
  responsive and touch-friendly, not a desktop layout squeezed down.

## Data model

### Device
The physical item of stock.
- `id`
- `assetTag` (our internal reference, unique, optional but indexed)
- `serialNumber` (optional, indexed)
- `make`
- `model`
- `type` — enum: Laptop, Desktop, Server, Monitor, Switch, Router, Firewall,
  AccessPoint, Printer, VoIPPhone, MobileDevice, Dock, Peripheral, Other
- `status` — enum: InStock, Deployed, AwaitingCollection, InRepair, Retired
- `notes` (free text)
- `images` (one-to-many, see DeviceImage)
- `createdAt`, `updatedAt`

The device's *current* location and status should be derived from its latest
active Movement, with `status` on the device kept in sync for fast filtering.

### DeviceImage
- `id`, `deviceId`, `filePath`, `caption` (optional), `uploadedAt`,
  `uploadedByUserId`

### Customer
A lookup of customers we deploy to. Keep it simple for v1: manual list, name plus
optional short code. Leave a clear extension point to sync from the Autotask API
later.
- `id`, `name`, `shortCode` (optional), `isActive`

### Movement
The audit trail. Every time a device moves, we add a record. This is the heart of
the app.
- `id`, `deviceId`
- `locationType` — enum: Office, Customer
- `customerId` (nullable; required when locationType is Customer)
- `officeSubLocation` (optional free text, e.g. "Shelf B", "Goods-in")
- `reason` (free text — why it's there / why deployed)
- `ticketNumber` (free text for v1; validated against Autotask later)
- `installDate` (date the device went out / was placed)
- `proposedCollectionDate` (nullable)
- `actualCollectionDate` (nullable — set when it comes back)
- `isCurrent` (boolean — only one current movement per device)
- `createdAt`, `createdByUserId`

When a device is "collected" or moved, close the current movement (set
`actualCollectionDate`, `isCurrent = false`) and open a new one. Never overwrite
history.

### User
- `id`, `name`, `email`, `role` (enum: Admin, Engineer), plus whatever the auth
  method needs.

## Core features

### Devices
- List view with search and filters (by type, status, customer, make/model,
  ticket number, serial/asset tag).
- Device detail page showing current location, full movement history, and image
  gallery.
- Create / edit device.
- Upload images on web; on mobile, allow capture straight from the device camera.

### Movements
- "Deploy to customer" action: pick customer, enter reason, ticket number,
  install date, optional proposed collection date.
- "Return to office" / "Mark collected" action.
- "Move within office" and "Send to repair" actions.
- All actions create Movement records and update the device status.

### Dashboard
- Counts by status (in stock, deployed, awaiting collection, in repair).
- Devices past their proposed collection date (overdue list).
- Recently added / recently moved.

### Customers
- Simple CRUD list of customers.

## Authentication

Deliberately phased.

**Keep the `User` table and all its foreign keys in the schema from the very
start**, including `createdByUserId` on movements and image uploads. The user
concept must never be absent, because retrofitting those relationships later is
the expensive part.

**v0.1 — auth stub.** No real authentication yet. A trivial stub: a no-password
dropdown that lets the tester pick which seeded engineer they're acting as. This
exercises the audit-trail wiring without any login friction. Do not expose the app
externally while it runs this way.

**v1 — Entra SSO.** Replace the stub with Microsoft Entra ID (Azure AD) single
sign-on via NextAuth (Auth.js), restricted to our tenant. Because the `User`
model and the `createdByUser` references already exist, this is a provider swap,
not a data-model change. Protect every page and API route at this point.

Build the session / "current user" access behind a single helper so swapping the
stub for Entra touches one place, not the whole app.

## Branding (internal Cybernet tool)

- Foundations: Carbon `#101010`, Silver `#EFEFEF`, White `#FFFFFF`.
- One expression colour throughout this app: Blue `#0084FF` (primary actions,
  links, active states). Don't mix in other expression colours.
- Fonts: TASA Orbiter (Regular/SemiBold/Bold/ExtraBold) with Inter as fallback.
  If TASA Orbiter isn't available locally, use Inter and leave a clear note on
  where to add the font files.
- Tagline for the login screen footer: "Take control in a connected world."
- Tone: confident, clear, approachable. Technical without being cold.
- The Signal Grid motif (modular pixel/checker pattern) may appear as a subtle,
  secondary background element only. Never let it compete with content.

## Non-functional requirements

- Validate and sanitise all inputs. Use Prisma's parameterised queries; never
  build raw SQL from user input.
- Restrict image uploads by file type and size; store outside the web root and
  serve through an authenticated route.
- Confidentiality matters: this data shows which kit sits at which client. Treat
  it as client-confidential. Auth on everything, TLS in transit, no data in logs.
- Provide a `docker-compose.yml` that brings up the app and Postgres, and a
  documented `pg_dump` backup approach.
- Seed script with a handful of example devices, customers, and movements for
  local testing (clearly fake data).

## Release phasing

### v0.1 — internal validation (local only)
Prove the underlying system works, nothing more. Throwaway data, fast feedback.
- Runs on localhost or the LAN only. No Cloudflare Tunnel, no public DNS, no
  internet exposure.
- Auth stub only. No Entra, no real login wall.
- Goal: confirm the database, schema, device CRUD, image upload, and the full
  movement/history flow all work end to end.
- Data is disposable. Resetting the DB is expected and fine.

### v1 — production
- Swap the auth stub for Entra ID SSO.
- Put it behind Cloudflare Tunnel + Access (or VPN-only), with TLS and the proper
  subdomain.
- Real data, backups in place, route protection on everything.

## Build order

1. Scaffold Next.js + TypeScript + Tailwind + Prisma. Define the full schema,
   including the `User` table and all `createdByUser` foreign keys, and run the
   first migration. Set up Docker Compose with Postgres. Add the seed script.
2. Add the auth stub and the single "current user" helper. Wire `createdByUser`
   through movements and image uploads so the audit trail is exercised from the
   start.
3. Device CRUD + list/search/filter + detail page.
4. Image upload (web + mobile camera capture) behind the storage interface.
5. Customers CRUD.
6. Movements: deploy, return, move, repair actions with full history.
7. Dashboard, including the overdue-collection list.

**— v0.1 ends here. Validate the core before going further. —**

8. Replace the auth stub with Entra ID SSO via the "current user" helper. Lock
   down every page and API route.
9. PWA setup (manifest, service worker, installable), mobile polish.
10. Production deploy: Cloudflare Tunnel + Access (or VPN), TLS, backups. README,
    backup docs, deploy notes. Final pass on branding and copy.

## Out of scope for v1 (future extension points)

- Live Autotask API validation/linking of ticket numbers and customer sync.
- Barcode / serial scanning via camera.
- MinIO object storage.
- Van / multi-site stock locations beyond a free-text office sub-location.
