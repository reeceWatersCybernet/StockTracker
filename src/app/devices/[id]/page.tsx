import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { deviceTypeLabel } from "@/lib/labels";
import { formatLocation } from "@/lib/location";
import { formatDate } from "@/lib/format";
import { StatusBadge } from "@/components/status-badge";
import { MovementTimeline } from "@/components/movement-timeline";
import { DeleteDeviceButton } from "@/components/delete-device-button";
import { ImageUploader } from "@/components/image-uploader";
import { ImageGallery } from "@/components/image-gallery";
import { deleteDevice } from "@/lib/devices/actions";
import { uploadDeviceImages } from "@/lib/images/actions";

export const metadata: Metadata = { title: "Device · Cybernet Stock Tracker" };

export default async function DeviceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const device = await prisma.device.findUnique({
    where: { id },
    include: {
      movements: {
        orderBy: [{ isCurrent: "desc" }, { createdAt: "desc" }],
        include: {
          customer: { select: { name: true, shortCode: true } },
          createdBy: { select: { name: true } },
        },
      },
      images: {
        orderBy: { uploadedAt: "desc" },
        include: { uploadedBy: { select: { name: true } } },
      },
    },
  });

  if (!device) notFound();

  const current = device.movements.find((m) => m.isCurrent) ?? null;

  return (
    <main className="mx-auto w-full max-w-4xl space-y-6 px-4 py-6">
      <div>
        <Link href="/devices" className="text-sm text-muted hover:text-brand">
          ← Devices
        </Link>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-carbon">
              {device.make} {device.model}
            </h1>
            <StatusBadge status={device.status} />
          </div>
          <p className="mt-1 text-sm text-muted">
            {deviceTypeLabel(device.type)}
            {device.assetTag ? ` · ${device.assetTag}` : ""}
            {device.serialNumber ? ` · ${device.serialNumber}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/devices/${device.id}/edit`}
            className="inline-flex h-9 items-center rounded-lg border border-border bg-surface px-3 text-sm font-medium text-carbon hover:bg-silver"
          >
            Edit
          </Link>
          <DeleteDeviceButton action={deleteDevice.bind(null, device.id)} />
        </div>
      </div>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">
            Current location
          </h2>
          <p className="mt-1 text-lg font-semibold text-carbon">
            {formatLocation(current)}
          </p>
          {current?.ticketNumber && (
            <p className="text-sm text-muted">Ticket {current.ticketNumber}</p>
          )}
          {current && (
            <p className="mt-1 text-sm text-muted">
              Since {formatDate(current.installDate)}
            </p>
          )}
        </div>
        {device.notes && (
          <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">
              Notes
            </h2>
            <p className="mt-1 whitespace-pre-wrap text-sm text-carbon">
              {device.notes}
            </p>
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-carbon">Images</h2>
        <ImageUploader action={uploadDeviceImages.bind(null, device.id)} />
        <ImageGallery
          alt={`${device.make} ${device.model}`}
          images={device.images.map((img) => ({
            id: img.id,
            caption: img.caption,
            uploadedByName: img.uploadedBy?.name ?? null,
          }))}
        />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-carbon">Movement history</h2>
        <MovementTimeline movements={device.movements} />
      </section>
    </main>
  );
}
