import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { DeviceStatus } from "@/generated/prisma/enums";
import { deviceStatusLabel } from "@/lib/labels";
import { formatDate, formatDateTime } from "@/lib/format";
import { formatLocation } from "@/lib/location";
import { StatusBadge } from "@/components/status-badge";

export const metadata: Metadata = { title: "Dashboard · Cybernet Stock Tracker" };

const DAY = 24 * 60 * 60 * 1000;
const SUMMARY_STATUSES: DeviceStatus[] = [
  DeviceStatus.InStock,
  DeviceStatus.Deployed,
  DeviceStatus.AwaitingCollection,
  DeviceStatus.InRepair,
];

export default async function DashboardPage() {
  const now = new Date();

  const [grouped, overdue, recentlyAdded, recentMovements] = await Promise.all([
    prisma.device.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.movement.findMany({
      where: {
        isCurrent: true,
        actualCollectionDate: null,
        proposedCollectionDate: { lt: now },
      },
      orderBy: { proposedCollectionDate: "asc" },
      include: {
        device: { select: { id: true, make: true, model: true, assetTag: true } },
        customer: { select: { name: true } },
      },
    }),
    prisma.device.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        movements: {
          where: { isCurrent: true },
          take: 1,
          select: {
            locationType: true,
            officeSubLocation: true,
            customer: { select: { name: true, shortCode: true } },
          },
        },
      },
    }),
    prisma.movement.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      include: {
        device: { select: { id: true, make: true, model: true, assetTag: true } },
        customer: { select: { name: true, shortCode: true } },
        createdBy: { select: { name: true } },
      },
    }),
  ]);

  const countOf = (status: DeviceStatus) =>
    grouped.find((g) => g.status === status)?._count._all ?? 0;
  const total = grouped.reduce((sum, g) => sum + g._count._all, 0);

  return (
    <main className="mx-auto w-full max-w-6xl space-y-8 px-4 py-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-carbon">Dashboard</h1>
        <p className="text-sm text-muted">{total} devices tracked.</p>
      </div>

      {/* Status counts */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {SUMMARY_STATUSES.map((status) => (
          <Link
            key={status}
            href={`/devices?status=${status}`}
            className="rounded-xl border border-border bg-surface p-4 shadow-sm transition-colors hover:border-brand/40"
          >
            <div className="text-3xl font-bold text-carbon">{countOf(status)}</div>
            <div className="mt-1 text-sm text-muted">{deviceStatusLabel(status)}</div>
          </Link>
        ))}
      </section>

      {/* Overdue collections */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-carbon">Overdue for collection</h2>
          {overdue.length > 0 && (
            <span className="inline-flex items-center rounded-full bg-brand px-2 py-0.5 text-xs font-semibold text-white">
              {overdue.length}
            </span>
          )}
        </div>
        {overdue.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border bg-surface p-6 text-center text-sm text-muted">
            Nothing overdue. Everything is within its proposed collection date.
          </p>
        ) : (
          <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
            {overdue.map((m) => {
              const daysLate = Math.floor(
                (now.getTime() - new Date(m.proposedCollectionDate!).getTime()) / DAY,
              );
              return (
                <li key={m.id}>
                  <Link
                    href={`/devices/${m.device.id}`}
                    className="flex items-center justify-between gap-3 p-4 hover:bg-background/60"
                  >
                    <div>
                      <div className="font-semibold text-carbon">
                        {m.device.make} {m.device.model}
                      </div>
                      <div className="text-xs text-muted">
                        {m.customer?.name ?? "Customer site"}
                        {m.device.assetTag ? ` · ${m.device.assetTag}` : ""}
                        {m.ticketNumber ? ` · ${m.ticketNumber}` : ""}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-brand-dark">
                        {daysLate} {daysLate === 1 ? "day" : "days"} overdue
                      </div>
                      <div className="text-xs text-muted">
                        Due {formatDate(m.proposedCollectionDate)}
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recently added */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-carbon">Recently added</h2>
          {recentlyAdded.length === 0 ? (
            <p className="text-sm text-muted">No devices yet.</p>
          ) : (
            <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
              {recentlyAdded.map((d) => (
                <li key={d.id}>
                  <Link
                    href={`/devices/${d.id}`}
                    className="flex items-center justify-between gap-3 p-4 hover:bg-background/60"
                  >
                    <div>
                      <div className="font-semibold text-carbon">
                        {d.make} {d.model}
                      </div>
                      <div className="text-xs text-muted">
                        {formatLocation(d.movements[0] ?? null)} ·{" "}
                        {formatDate(d.createdAt)}
                      </div>
                    </div>
                    <StatusBadge status={d.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Recently moved */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-carbon">Recent movements</h2>
          {recentMovements.length === 0 ? (
            <p className="text-sm text-muted">No movements yet.</p>
          ) : (
            <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
              {recentMovements.map((m) => (
                <li key={m.id}>
                  <Link
                    href={`/devices/${m.device.id}`}
                    className="block p-4 hover:bg-background/60"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-semibold text-carbon">
                        {m.device.make} {m.device.model}
                      </div>
                      <div className="text-xs text-muted">
                        {formatDateTime(m.createdAt)}
                      </div>
                    </div>
                    <div className="mt-0.5 text-xs text-muted">
                      → {formatLocation(m)}
                      {m.createdBy ? ` · ${m.createdBy.name}` : ""}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
