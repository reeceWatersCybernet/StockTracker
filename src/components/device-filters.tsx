import Link from "next/link";
import {
  DEVICE_TYPE_VALUES,
  DEVICE_STATUS_VALUES,
  deviceTypeLabel,
  deviceStatusLabel,
} from "@/lib/labels";

const controlClass =
  "rounded-lg border border-border bg-surface px-3 py-2 text-sm text-carbon shadow-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/30";

/**
 * Search and filter bar. A plain GET form so it works without JavaScript and
 * keeps the active filters in the URL (shareable, back-button friendly).
 */
export function DeviceFilters({
  q,
  type,
  status,
  customerId,
  customers,
  hasFilters,
}: {
  q?: string;
  type?: string;
  status?: string;
  customerId?: string;
  customers: { id: string; name: string }[];
  hasFilters: boolean;
}) {
  return (
    <form method="get" className="flex flex-wrap items-end gap-3">
      <div className="min-w-56 flex-1">
        <label htmlFor="q" className="mb-1 block text-xs font-medium text-muted">
          Search
        </label>
        <input
          id="q"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Make, model, asset tag, serial, ticket…"
          className={`${controlClass} w-full`}
        />
      </div>
      <div>
        <label htmlFor="type" className="mb-1 block text-xs font-medium text-muted">
          Type
        </label>
        <select id="type" name="type" defaultValue={type ?? ""} className={controlClass}>
          <option value="">All types</option>
          {DEVICE_TYPE_VALUES.map((t) => (
            <option key={t} value={t}>
              {deviceTypeLabel(t)}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="status" className="mb-1 block text-xs font-medium text-muted">
          Status
        </label>
        <select
          id="status"
          name="status"
          defaultValue={status ?? ""}
          className={controlClass}
        >
          <option value="">All statuses</option>
          {DEVICE_STATUS_VALUES.map((s) => (
            <option key={s} value={s}>
              {deviceStatusLabel(s)}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label
          htmlFor="customerId"
          className="mb-1 block text-xs font-medium text-muted"
        >
          Customer
        </label>
        <select
          id="customerId"
          name="customerId"
          defaultValue={customerId ?? ""}
          className={controlClass}
        >
          <option value="">All customers</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="submit"
          className="inline-flex h-10 items-center rounded-lg bg-brand px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
        >
          Filter
        </button>
        {hasFilters && (
          <Link
            href="/devices"
            className="inline-flex h-10 items-center rounded-lg border border-border bg-surface px-3 text-sm font-medium text-muted hover:bg-silver"
          >
            Clear
          </Link>
        )}
      </div>
    </form>
  );
}
