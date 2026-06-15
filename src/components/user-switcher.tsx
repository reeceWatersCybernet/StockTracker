"use client";

import { useTransition } from "react";
import { switchActor } from "@/lib/auth/actions";

type SwitchableUser = { id: string; name: string; role: string };

/**
 * v0.1 auth stub UI: a no-password dropdown to choose which seeded engineer
 * you're acting as. Removed when Entra SSO lands in v1.
 */
export function UserSwitcher({
  users,
  currentUserId,
}: {
  users: SwitchableUser[];
  currentUserId: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <label className="flex items-center gap-2 text-sm text-muted">
      <span className="hidden sm:inline">Acting as</span>
      <select
        aria-label="Acting as"
        value={currentUserId}
        disabled={pending}
        onChange={(event) => {
          const userId = event.target.value;
          startTransition(() => switchActor(userId));
        }}
        className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm font-medium text-carbon shadow-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/30 disabled:opacity-60"
      >
        {users.map((user) => (
          <option key={user.id} value={user.id}>
            {user.name} · {user.role}
          </option>
        ))}
      </select>
    </label>
  );
}
