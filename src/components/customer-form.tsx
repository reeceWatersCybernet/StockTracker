"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { CustomerFormState } from "@/lib/customers/actions";

const inputClass =
  "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-carbon shadow-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/30";

export function CustomerForm({
  action,
  mode,
  defaults,
}: {
  action: (state: CustomerFormState, formData: FormData) => Promise<CustomerFormState>;
  mode: "create" | "edit";
  defaults?: { name?: string; shortCode?: string | null; isActive?: boolean };
}) {
  const [state, formAction, pending] = useActionState<CustomerFormState, FormData>(
    action,
    {},
  );
  const err = (name: string) => state.errors?.[name];
  const isActive = defaults?.isActive ?? true;

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-medium text-carbon">
          Name
        </label>
        <input
          id="name"
          name="name"
          required
          defaultValue={defaults?.name ?? ""}
          className={inputClass}
          placeholder="e.g. Northwind Trading"
        />
        {err("name") && (
          <p className="mt-1 text-xs font-medium text-brand-dark">{err("name")}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="shortCode"
          className="mb-1 block text-sm font-medium text-carbon"
        >
          Short code <span className="text-muted">(optional)</span>
        </label>
        <input
          id="shortCode"
          name="shortCode"
          defaultValue={defaults?.shortCode ?? ""}
          className={inputClass}
          placeholder="e.g. NWT"
        />
        {err("shortCode") && (
          <p className="mt-1 text-xs font-medium text-brand-dark">
            {err("shortCode")}
          </p>
        )}
      </div>

      <label className="flex items-center gap-2 text-sm text-carbon">
        <input
          type="checkbox"
          name="isActive"
          defaultChecked={isActive}
          className="h-4 w-4 rounded border-border text-brand focus:ring-brand"
        />
        Active (available when deploying devices)
      </label>

      <div className="flex items-center gap-3 pt-1">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-10 items-center rounded-lg bg-brand px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
        >
          {pending ? "Saving…" : mode === "create" ? "Add customer" : "Save changes"}
        </button>
        <Link
          href="/customers"
          className="inline-flex h-10 items-center rounded-lg border border-border bg-surface px-4 text-sm font-medium text-carbon hover:bg-silver"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
