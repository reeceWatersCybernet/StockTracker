"use client";

import { useActionState, useState } from "react";
import { DeviceStatus } from "@/generated/prisma/enums";
import {
  deployToCustomer,
  returnToOffice,
  moveWithinOffice,
  sendToRepair,
  markForCollection,
  retireDevice,
  type MovementState,
} from "@/lib/movements/actions";

type BoundAction = (
  state: MovementState,
  formData: FormData,
) => Promise<MovementState>;

const inputClass =
  "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-carbon shadow-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/30";

function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1 block text-sm font-medium text-carbon">
        {label}
      </label>
      {children}
      {error && <p className="mt-1 text-xs font-medium text-brand-dark">{error}</p>}
    </div>
  );
}

function SubmitRow({
  pending,
  label,
  onCancel,
}: {
  pending: boolean;
  label: string;
  onCancel: () => void;
}) {
  return (
    <div className="flex items-center gap-3 pt-1">
      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-10 items-center rounded-lg bg-brand px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
      >
        {pending ? "Saving…" : label}
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="inline-flex h-10 items-center rounded-lg border border-border bg-surface px-4 text-sm font-medium text-carbon hover:bg-silver"
      >
        Cancel
      </button>
    </div>
  );
}

function useMovementForm(action: BoundAction) {
  return useActionState<MovementState, FormData>(action, {});
}

function DeployForm({
  deviceId,
  customers,
  today,
  onCancel,
}: {
  deviceId: string;
  customers: { id: string; name: string }[];
  today: string;
  onCancel: () => void;
}) {
  const [state, formAction, pending] = useMovementForm(
    deployToCustomer.bind(null, deviceId),
  );
  const err = (n: string) => state.errors?.[n];
  return (
    <form action={formAction} className="space-y-4">
      <Field label="Customer" htmlFor="customerId" error={err("customerId")}>
        <select id="customerId" name="customerId" className={inputClass} defaultValue="">
          <option value="" disabled>
            Choose a customer…
          </option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Reason" htmlFor="reason" error={err("reason")}>
        <input id="reason" name="reason" className={inputClass} placeholder="Why is it being deployed?" />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Ticket number" htmlFor="ticketNumber" error={err("ticketNumber")}>
          <input id="ticketNumber" name="ticketNumber" className={inputClass} placeholder="e.g. T-1234" />
        </Field>
        <Field label="Install date" htmlFor="installDate" error={err("installDate")}>
          <input id="installDate" name="installDate" type="date" defaultValue={today} className={inputClass} />
        </Field>
      </div>
      <Field
        label="Proposed collection date (optional)"
        htmlFor="proposedCollectionDate"
        error={err("proposedCollectionDate")}
      >
        <input id="proposedCollectionDate" name="proposedCollectionDate" type="date" className={inputClass} />
      </Field>
      <SubmitRow pending={pending} label="Deploy to customer" onCancel={onCancel} />
    </form>
  );
}

function ReturnForm({
  deviceId,
  today,
  onCancel,
}: {
  deviceId: string;
  today: string;
  onCancel: () => void;
}) {
  const [state, formAction, pending] = useMovementForm(
    returnToOffice.bind(null, deviceId),
  );
  const err = (n: string) => state.errors?.[n];
  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Collection date" htmlFor="collectionDate" error={err("collectionDate")}>
          <input id="collectionDate" name="collectionDate" type="date" defaultValue={today} className={inputClass} />
        </Field>
        <Field label="Office location" htmlFor="officeSubLocation" error={err("officeSubLocation")}>
          <input id="officeSubLocation" name="officeSubLocation" className={inputClass} placeholder='e.g. "Goods-in"' />
        </Field>
      </div>
      <Field label="Reason (optional)" htmlFor="reason" error={err("reason")}>
        <input id="reason" name="reason" className={inputClass} placeholder="Returned to the office." />
      </Field>
      <SubmitRow pending={pending} label="Return to office" onCancel={onCancel} />
    </form>
  );
}

function MoveForm({ deviceId, onCancel }: { deviceId: string; onCancel: () => void }) {
  const [state, formAction, pending] = useMovementForm(
    moveWithinOffice.bind(null, deviceId),
  );
  const err = (n: string) => state.errors?.[n];
  return (
    <form action={formAction} className="space-y-4">
      <Field label="Office location" htmlFor="officeSubLocation" error={err("officeSubLocation")}>
        <input id="officeSubLocation" name="officeSubLocation" className={inputClass} placeholder='e.g. "Shelf B"' />
      </Field>
      <Field label="Reason (optional)" htmlFor="reason" error={err("reason")}>
        <input id="reason" name="reason" className={inputClass} placeholder="Moved within the office." />
      </Field>
      <SubmitRow pending={pending} label="Move / return to stock" onCancel={onCancel} />
    </form>
  );
}

function RepairForm({ deviceId, onCancel }: { deviceId: string; onCancel: () => void }) {
  const [state, formAction, pending] = useMovementForm(
    sendToRepair.bind(null, deviceId),
  );
  const err = (n: string) => state.errors?.[n];
  return (
    <form action={formAction} className="space-y-4">
      <Field label="Fault" htmlFor="reason" error={err("reason")}>
        <input id="reason" name="reason" className={inputClass} placeholder="Describe the fault" />
      </Field>
      <Field label="Location (optional)" htmlFor="officeSubLocation" error={err("officeSubLocation")}>
        <input id="officeSubLocation" name="officeSubLocation" className={inputClass} placeholder="Repair bench" />
      </Field>
      <SubmitRow pending={pending} label="Send to repair" onCancel={onCancel} />
    </form>
  );
}

function CollectForm({
  deviceId,
  today,
  onCancel,
}: {
  deviceId: string;
  today: string;
  onCancel: () => void;
}) {
  const [state, formAction, pending] = useMovementForm(
    markForCollection.bind(null, deviceId),
  );
  const err = (n: string) => state.errors?.[n];
  return (
    <form action={formAction} className="space-y-4">
      <Field
        label="Proposed collection date"
        htmlFor="proposedCollectionDate"
        error={err("proposedCollectionDate")}
      >
        <input id="proposedCollectionDate" name="proposedCollectionDate" type="date" defaultValue={today} className={inputClass} />
      </Field>
      <SubmitRow pending={pending} label="Mark for collection" onCancel={onCancel} />
    </form>
  );
}

function RetireForm({ deviceId, onCancel }: { deviceId: string; onCancel: () => void }) {
  const [state, formAction, pending] = useMovementForm(
    retireDevice.bind(null, deviceId),
  );
  const err = (n: string) => state.errors?.[n];
  return (
    <form action={formAction} className="space-y-4">
      <Field label="Reason (optional)" htmlFor="reason" error={err("reason")}>
        <input id="reason" name="reason" className={inputClass} placeholder="End of life, etc." />
      </Field>
      <SubmitRow pending={pending} label="Retire device" onCancel={onCancel} />
    </form>
  );
}

type ActionKey = "deploy" | "return" | "move" | "repair" | "collect" | "retire";

function actionsForStatus(status: DeviceStatus): { key: ActionKey; label: string }[] {
  switch (status) {
    case DeviceStatus.InStock:
      return [
        { key: "deploy", label: "Deploy to customer" },
        { key: "move", label: "Move within office" },
        { key: "repair", label: "Send to repair" },
        { key: "retire", label: "Retire" },
      ];
    case DeviceStatus.InRepair:
      return [
        { key: "move", label: "Return to stock" },
        { key: "deploy", label: "Deploy to customer" },
        { key: "retire", label: "Retire" },
      ];
    case DeviceStatus.Deployed:
      return [
        { key: "return", label: "Return to office" },
        { key: "collect", label: "Mark for collection" },
        { key: "retire", label: "Retire" },
      ];
    case DeviceStatus.AwaitingCollection:
      return [
        { key: "return", label: "Return to office" },
        { key: "retire", label: "Retire" },
      ];
    case DeviceStatus.Retired:
      return [{ key: "move", label: "Return to stock" }];
    default:
      return [];
  }
}

export function MovementActions({
  deviceId,
  status,
  customers,
  today,
}: {
  deviceId: string;
  status: DeviceStatus;
  customers: { id: string; name: string }[];
  today: string;
}) {
  const [open, setOpen] = useState<ActionKey | null>(null);
  const actions = actionsForStatus(status);
  const close = () => setOpen(null);

  return (
    <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
      <div className="flex flex-wrap gap-2">
        {actions.map((a) => {
          const active = open === a.key;
          return (
            <button
              key={a.key}
              type="button"
              onClick={() => setOpen(active ? null : a.key)}
              className={`inline-flex h-9 items-center rounded-lg px-3 text-sm font-medium transition-colors ${
                active
                  ? "bg-brand text-white"
                  : "border border-border bg-surface text-carbon hover:bg-silver"
              }`}
            >
              {a.label}
            </button>
          );
        })}
      </div>

      {open && (
        <div className="mt-4 border-t border-border pt-4">
          {open === "deploy" && (
            <DeployForm deviceId={deviceId} customers={customers} today={today} onCancel={close} />
          )}
          {open === "return" && <ReturnForm deviceId={deviceId} today={today} onCancel={close} />}
          {open === "move" && <MoveForm deviceId={deviceId} onCancel={close} />}
          {open === "repair" && <RepairForm deviceId={deviceId} onCancel={close} />}
          {open === "collect" && <CollectForm deviceId={deviceId} today={today} onCancel={close} />}
          {open === "retire" && <RetireForm deviceId={deviceId} onCancel={close} />}
        </div>
      )}
    </div>
  );
}
