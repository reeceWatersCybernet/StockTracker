import Link from "next/link";
import type { Metadata } from "next";
import { DeviceForm } from "@/components/device-form";
import { createDevice } from "@/lib/devices/actions";

export const metadata: Metadata = { title: "Add device · Cybernet Stock Tracker" };

export default function NewDevicePage() {
  return (
    <main className="mx-auto w-full max-w-2xl space-y-6 px-4 py-6">
      <div>
        <Link href="/devices" className="text-sm text-muted hover:text-brand">
          ← Devices
        </Link>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-carbon">
          Add device
        </h1>
      </div>
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <DeviceForm action={createDevice} mode="create" cancelHref="/devices" />
      </div>
    </main>
  );
}
