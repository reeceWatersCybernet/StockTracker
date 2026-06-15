import Link from "next/link";

// Placeholder home page. The real dashboard arrives in a later phase; for now
// this confirms the brand foundations and that the app builds and runs.
export default function Home() {
  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <div className="w-full max-w-xl rounded-2xl border border-border bg-surface p-8 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-medium text-brand">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-brand" />
          Cybernet
        </div>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-carbon">
          Stock Tracker
        </h1>
        <p className="mt-2 text-muted">
          Track our hardware stock — what we hold, where it is (our office or a
          customer site), why it&rsquo;s there, and the relevant ticket and
          dates.
        </p>
        <p className="mt-6 inline-flex items-center rounded-full bg-silver px-3 py-1 text-xs font-medium text-carbon">
          v0.1 — internal validation
        </p>
        <p className="mt-6 text-sm text-muted">
          Setup is in progress. Devices, customers, movements and the dashboard
          arrive in the coming phases.
        </p>
        <div className="mt-6">
          <Link
            href="/"
            className="inline-flex h-10 items-center rounded-lg bg-brand px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
          >
            Take control in a connected world
          </Link>
        </div>
      </div>
    </main>
  );
}
