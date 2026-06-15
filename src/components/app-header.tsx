import Link from "next/link";
import {
  getCurrentUser,
  listSelectableUsers,
} from "@/lib/auth/currentUser";
import { UserSwitcher } from "./user-switcher";

/**
 * The app shell header: brand, primary navigation, and the v0.1 user switcher.
 * Navigation links are added as each area lands (devices, customers, dashboard).
 */
export async function AppHeader() {
  const [users, current] = await Promise.all([
    listSelectableUsers(),
    getCurrentUser(),
  ]);

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-surface/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4">
        <Link href="/" className="flex items-center gap-2 font-bold tracking-tight text-carbon">
          <span className="inline-block h-3 w-3 rounded-sm bg-brand" aria-hidden />
          Stock Tracker
        </Link>

        {current ? (
          <UserSwitcher
            users={users.map((u) => ({ id: u.id, name: u.name, role: u.role }))}
            currentUserId={current.id}
          />
        ) : (
          <span className="text-sm text-muted">
            No users — run <code className="rounded bg-silver px-1">npm run db:seed</code>
          </span>
        )}
      </div>
    </header>
  );
}
