import Link from "next/link";
import { DeviceStatus, DeviceType } from "@/generated/prisma/enums";
import { deviceTypeLabel } from "@/lib/labels";
import { formatLocation, type LocationLike } from "@/lib/location";
import { StatusBadge } from "./status-badge";

export type DeviceListItem = {
  id: string;
  assetTag: string | null;
  serialNumber: string | null;
  make: string;
  model: string;
  type: DeviceType;
  status: DeviceStatus;
  current: (LocationLike & { ticketNumber: string | null }) | null;
};

function PrimaryName({ device }: { device: DeviceListItem }) {
  return (
    <div>
      <div className="font-semibold text-carbon">
        {device.make} {device.model}
      </div>
      <div className="text-xs text-muted">
        {device.assetTag ? device.assetTag : "No asset tag"}
        {device.serialNumber ? ` · ${device.serialNumber}` : ""}
      </div>
    </div>
  );
}

export function DeviceList({ devices }: { devices: DeviceListItem[] }) {
  if (devices.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-surface p-10 text-center text-muted">
        No devices match your filters.
      </div>
    );
  }

  return (
    <>
      {/* Mobile: cards */}
      <ul className="space-y-3 md:hidden">
        {devices.map((d) => (
          <li key={d.id}>
            <Link
              href={`/devices/${d.id}`}
              className="block rounded-xl border border-border bg-surface p-4 shadow-sm active:bg-silver"
            >
              <div className="flex items-start justify-between gap-3">
                <PrimaryName device={d} />
                <StatusBadge status={d.status} />
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <dt className="text-xs text-muted">Type</dt>
                  <dd className="text-carbon">{deviceTypeLabel(d.type)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted">Location</dt>
                  <dd className="text-carbon">{formatLocation(d.current)}</dd>
                </div>
                {d.current?.ticketNumber && (
                  <div>
                    <dt className="text-xs text-muted">Ticket</dt>
                    <dd className="text-carbon">{d.current.ticketNumber}</dd>
                  </div>
                )}
              </dl>
            </Link>
          </li>
        ))}
      </ul>

      {/* Desktop: table */}
      <div className="hidden overflow-hidden rounded-xl border border-border bg-surface shadow-sm md:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-background/60 text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Device</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Location</th>
              <th className="px-4 py-3 font-medium">Ticket</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {devices.map((d) => (
              <tr key={d.id} className="hover:bg-background/60">
                <td className="px-4 py-3">
                  <Link href={`/devices/${d.id}`} className="hover:text-brand">
                    <PrimaryName device={d} />
                  </Link>
                </td>
                <td className="px-4 py-3 text-carbon">{deviceTypeLabel(d.type)}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={d.status} />
                </td>
                <td className="px-4 py-3 text-carbon">{formatLocation(d.current)}</td>
                <td className="px-4 py-3 text-muted">
                  {d.current?.ticketNumber ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
