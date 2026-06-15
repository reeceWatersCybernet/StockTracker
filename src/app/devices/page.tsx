import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { DeviceType, DeviceStatus } from "@/generated/prisma/enums";
import { DEVICE_TYPE_VALUES, DEVICE_STATUS_VALUES } from "@/lib/labels";
import { DeviceFilters } from "@/components/device-filters";
import { DeviceList, type DeviceListItem } from "@/components/device-list";

export const metadata: Metadata = { title: "Devices · Cybernet Stock Tracker" };

type SearchParams = Promise<{
  q?: string;
  type?: string;
  status?: string;
  customerId?: string;
}>;

export default async function DevicesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const q = sp.q?.trim() || undefined;
  const type = DEVICE_TYPE_VALUES.includes(sp.type as DeviceType)
    ? (sp.type as DeviceType)
    : undefined;
  const status = DEVICE_STATUS_VALUES.includes(sp.status as DeviceStatus)
    ? (sp.status as DeviceStatus)
    : undefined;
  const customerId = sp.customerId || undefined;

  const where: Prisma.DeviceWhereInput = {
    AND: [
      q
        ? {
            OR: [
              { make: { contains: q, mode: "insensitive" } },
              { model: { contains: q, mode: "insensitive" } },
              { assetTag: { contains: q, mode: "insensitive" } },
              { serialNumber: { contains: q, mode: "insensitive" } },
              { notes: { contains: q, mode: "insensitive" } },
              {
                movements: {
                  some: { ticketNumber: { contains: q, mode: "insensitive" } },
                },
              },
            ],
          }
        : {},
      type ? { type } : {},
      status ? { status } : {},
      customerId ? { movements: { some: { isCurrent: true, customerId } } } : {},
    ],
  };

  const [devices, customers] = await Promise.all([
    prisma.device.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      include: {
        movements: {
          where: { isCurrent: true },
          take: 1,
          select: {
            ticketNumber: true,
            locationType: true,
            officeSubLocation: true,
            customer: { select: { name: true, shortCode: true } },
          },
        },
      },
    }),
    prisma.customer.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  const items: DeviceListItem[] = devices.map((d) => ({
    id: d.id,
    assetTag: d.assetTag,
    serialNumber: d.serialNumber,
    make: d.make,
    model: d.model,
    type: d.type,
    status: d.status,
    current: d.movements[0] ?? null,
  }));

  const hasFilters = Boolean(q || type || status || customerId);

  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-carbon">Devices</h1>
          <p className="text-sm text-muted">
            {items.length} {items.length === 1 ? "device" : "devices"}
            {hasFilters ? " matching your filters" : " in the system"}
          </p>
        </div>
        <Link
          href="/devices/new"
          className="inline-flex h-10 shrink-0 items-center rounded-lg bg-brand px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
        >
          Add device
        </Link>
      </div>

      <DeviceFilters
        q={q}
        type={type}
        status={status}
        customerId={customerId}
        customers={customers}
        hasFilters={hasFilters}
      />

      <DeviceList devices={items} />
    </main>
  );
}
