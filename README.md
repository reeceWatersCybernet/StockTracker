# Cybernet Stock Tracker

A self-hosted web app for tracking Cybernet IT's hardware stock — what kit we
hold, where it is (our office or a customer site), why it's there, and the
relevant ticket and dates. Built mobile-first so field engineers can log and
photograph devices from their phones.

The full product brief lives in [`CLAUDE.md`](./CLAUDE.md).

## Status

**v0.1 — internal validation (local/LAN only).** The auth is a no-password user
switcher; do **not** expose this to the internet while that is the case. Data is
disposable and resetting the database is expected. Entra ID SSO, the PWA, and a
public deployment come in v1.

## Stack

- **Next.js 16** (App Router, TypeScript) — UI and API in one codebase
- **PostgreSQL 16** with **Prisma 7** (driver adapter: `@prisma/adapter-pg`)
- **Tailwind CSS v4** (CSS-first config in `src/app/globals.css`)
- **Docker + Docker Compose** (app + Postgres)
- Image storage behind a small interface (local filesystem now; MinIO later)

## Prerequisites

- **Docker + Docker Compose** (recommended path), or
- **Node.js 22+** and a local **PostgreSQL 16** for non-Docker development

## Quick start (Docker Compose)

```bash
cp .env.example .env          # adjust POSTGRES_* and secrets for your machine
docker compose up --build     # starts Postgres + the app
```

The entrypoint runs `prisma migrate deploy` automatically. To load the fake
sample data once the stack is up:

```bash
docker compose exec app npm run db:seed
```

The app is then on <http://localhost:3000>.

## Quick start (local Node + Postgres)

1. Ensure PostgreSQL is running and create the role/database (defaults match
   `.env.example`):

   ```sql
   CREATE ROLE stocktracker LOGIN PASSWORD 'stocktracker' CREATEDB;
   CREATE DATABASE stocktracker OWNER stocktracker;
   ```

2. Install deps and set up the database:

   ```bash
   cp .env.example .env        # point DATABASE_URL at 127.0.0.1
   npm install                 # runs `prisma generate` via postinstall
   npm run db:migrate          # applies migrations (creates the schema)
   npm run db:seed             # loads clearly-fake sample data
   npm run dev                 # http://localhost:3000
   ```

## Environment variables

See [`.env.example`](./.env.example) for the full list. Key ones:

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Postgres connection string (host `127.0.0.1` locally, `db` under Compose) |
| `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` | Provision the Compose Postgres container |
| `AUTH_STUB_ENABLED` | `true` in v0.1 (no-password user switcher) |
| `STORAGE_DRIVER` | `local` for now (filesystem); `minio` later |
| `UPLOAD_DIR` | Where the local driver writes images (outside the web root) |
| `MAX_UPLOAD_BYTES` | Image size cap (default 10 MB) |

Secrets never go in the repo. `.env` is git-ignored; only `.env.example` is
committed.

## NPM scripts

| Script | Does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` / `npm run start` | Production build / serve |
| `npm run lint` | ESLint |
| `npm run db:migrate` | Create/apply a dev migration (`prisma migrate dev`) |
| `npm run db:deploy` | Apply migrations in production (`prisma migrate deploy`) |
| `npm run db:seed` | Load fake sample data |
| `npm run db:reset` | Drop, re-migrate and re-seed (destructive) |
| `npm run db:studio` | Open Prisma Studio |

## Project structure

```
prisma/
  schema.prisma        Full data model (User, Device, DeviceImage, Customer, Movement)
  migrations/          Generated SQL migrations
  seed.ts              Clearly-fake sample data
prisma.config.ts       Prisma 7 config (datasource URL + seed command)
src/
  app/                 App Router pages, layout, globals.css (brand tokens), API routes
  generated/prisma/    Generated Prisma client (git-ignored)
  lib/
    prisma.ts          PrismaClient singleton (pg driver adapter)
public/fonts/          Where to add TASA Orbiter (see its README)
uploads/               Local image storage (git-ignored)
Dockerfile, docker-compose.yml, docker-entrypoint.sh
```

## Database backups (pg_dump)

Take a logical backup of the Postgres volume with `pg_dump`:

```bash
# Under Docker Compose (writes a compressed dump to the host)
docker compose exec -T db pg_dump -U stocktracker -d stocktracker -Fc \
  > backup-$(date +%F).dump

# Restore into an empty database
docker compose exec -T db pg_restore -U stocktracker -d stocktracker --clean \
  < backup-2026-01-01.dump
```

Uploaded images live in the `uploads` volume — back that up alongside the DB dump
(e.g. `docker run --rm -v stocktracker_uploads:/data -v "$PWD":/backup alpine \
tar czf /backup/uploads-$(date +%F).tgz -C /data .`).

For v1, schedule the dump via cron and keep off-box copies.

## Deployment (v1 — not yet)

v0.1 is local/LAN only. For v1:

- Swap the auth stub for **Entra ID SSO** (the change is isolated to the
  "current user" helper) and protect every page and API route.
- Front the app with **Caddy** (automatic TLS) and put it behind a **Cloudflare
  Tunnel + Access** (or VPN), on the proper subdomain.
- Put backups on a schedule and store them off-box.

## Branding & fonts

Brand tokens (Carbon, Silver, White, and the single Blue `#0084FF`) are defined
in `src/app/globals.css`. The brand typeface is **TASA Orbiter** with **Inter**
as the fallback; Inter loads automatically. To add TASA Orbiter, follow
[`public/fonts/README.md`](./public/fonts/README.md).
