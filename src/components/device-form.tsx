"use client";

import { useActionState } from "react";
import Link from "next/link";
import { DEVICE_TYPE_VALUES, deviceTypeLabel } from "@/lib/labels";
import type { DeviceFormState } from "@/lib/devices/actions";

type DeviceDefaults = {
  assetTag?: string | null;
  serialNumber?: string | null;
  make?: string;
  model?: string;
  type?: string;
  notes?: string | null;
};

const inputClass =
  "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-carbon shadow-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/30";

function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1 block text-sm font-medium text-carbon">
        {label}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-muted">{hint}</p>}
      {error && <p className="mt-1 text-xs font-medium text-brand-dark">{error}</p>}
    </div>
  );
}

export function DeviceForm({
  action,
  mode,
  defaults,
  cancelHref,
}: {
  action: (state: DeviceFormState, formData: FormData) => Promise<DeviceFormState>;
  mode: "create" | "edit";
  defaults?: DeviceDefaults;
  cancelHref: string;
}) {
  const [state, formAction, pending] = useActionState<DeviceFormState, FormData>(
    action,
    {},
  );
  const err = (name: string) => state.errors?.[name];

  return (
    <form action={formAction} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Make" htmlFor="make" error={err("make")}>
          <input
            id="make"
            name="make"
            required
            defaultValue={defaults?.make ?? ""}
            className={inputClass}
            placeholder="e.g. Dell"
          />
        </Field>
        <Field label="Model" htmlFor="model" error={err("model")}>
          <input
            id="model"
            name="model"
            required
            defaultValue={defaults?.model ?? ""}
            className={inputClass}
            placeholder="e.g. Latitude 7440"
          />
        </Field>
        <Field label="Type" htmlFor="type" error={err("type")}>
          <select
            id="type"
            name="type"
            defaultValue={defaults?.type ?? "Laptop"}
            className={inputClass}
          >
            {DEVICE_TYPE_VALUES.map((t) => (
              <option key={t} value={t}>
                {deviceTypeLabel(t)}
              </option>
            ))}
          </select>
        </Field>
        <Field
          label="Asset tag"
          htmlFor="assetTag"
          error={err("assetTag")}
          hint="Our internal reference. Optional, but must be unique."
        >
          <input
            id="assetTag"
            name="assetTag"
            defaultValue={defaults?.assetTag ?? ""}
            className={inputClass}
            placeholder="e.g. CYB-0001"
          />
        </Field>
      </div>

      <Field label="Serial number" htmlFor="serialNumber" error={err("serialNumber")}>
        <input
          id="serialNumber"
          name="serialNumber"
          defaultValue={defaults?.serialNumber ?? ""}
          className={inputClass}
        />
      </Field>

      <Field label="Notes" htmlFor="notes" error={err("notes")}>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          defaultValue={defaults?.notes ?? ""}
          className={inputClass}
        />
      </Field>

      {mode === "create" && (
        <fieldset className="rounded-xl border border-border bg-background/60 p-4">
          <legend className="px-1 text-sm font-semibold text-carbon">
            Initial placement
          </legend>
          <p className="mb-3 text-xs text-muted">
            New devices start in stock at the office. You can deploy or move them
            afterwards from the device page.
          </p>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label="Office location"
              htmlFor="officeSubLocation"
              error={err("officeSubLocation")}
              hint='e.g. "Shelf B", "Goods-in"'
            >
              <input
                id="officeSubLocation"
                name="officeSubLocation"
                className={inputClass}
              />
            </Field>
            <Field label="Reason" htmlFor="reason" error={err("reason")}>
              <input
                id="reason"
                name="reason"
                className={inputClass}
                placeholder="Added to stock."
              />
            </Field>
          </div>
        </fieldset>
      )}

      <div className="flex items-center gap-3 pt-1">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-10 items-center rounded-lg bg-brand px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
        >
          {pending
            ? "Saving…"
            : mode === "create"
              ? "Add device"
              : "Save changes"}
        </button>
        <Link
          href={cancelHref}
          className="inline-flex h-10 items-center rounded-lg border border-border bg-surface px-4 text-sm font-medium text-carbon hover:bg-silver"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
