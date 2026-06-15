import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DeviceForm } from "@/components/device-form";
import { updateDevice } from "@/lib/devices/actions";

export const metadata: Metadata = { title: "Edit device · Cybernet Stock Tracker" };

export default async function EditDevicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const device = await prisma.device.findUnique({ where: { id } });
  if (!device) notFound();

  return (
    <main className="mx-auto w-full max-w-2xl space-y-6 px-4 py-6">
      <div>
        <Link
          href={`/devices/${device.id}`}
          className="text-sm text-muted hover:text-brand"
        >
          ← Back to device
        </Link>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-carbon">
          Edit device
        </h1>
        <p className="text-sm text-muted">
          Location and status are managed from the device page, not here.
        </p>
      </div>
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <DeviceForm
          action={updateDevice.bind(null, device.id)}
          mode="edit"
          cancelHref={`/devices/${device.id}`}
          defaults={{
            assetTag: device.assetTag,
            serialNumber: device.serialNumber,
            make: device.make,
            model: device.model,
            type: device.type,
            notes: device.notes,
          }}
        />
      </div>
    </main>
  );
}
