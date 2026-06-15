"use client";

import { useTransition } from "react";

export function DeleteCustomerButton({
  action,
}: {
  action: () => Promise<void>;
}) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (window.confirm("Delete this customer? This cannot be undone.")) {
          startTransition(() => action());
        }
      }}
      className="inline-flex h-9 items-center rounded-lg border border-border bg-surface px-3 text-sm font-medium text-muted transition-colors hover:border-carbon/40 hover:text-carbon disabled:opacity-60"
    >
      {pending ? "Deleting…" : "Delete"}
    </button>
  );
}
