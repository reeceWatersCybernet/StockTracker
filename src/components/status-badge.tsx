import { DeviceStatus } from "@/generated/prisma/enums";
import { deviceStatusLabel } from "@/lib/labels";

/**
 * Status pill. Kept within the brand palette (Carbon / Silver / White, with Blue
 * as the only expression colour) — we distinguish statuses by treatment, not by
 * introducing other colours.
 */
const STYLES: Record<DeviceStatus, string> = {
  InStock: "bg-brand/10 text-brand ring-1 ring-brand/20",
  Deployed: "bg-carbon text-white",
  AwaitingCollection: "bg-silver text-carbon ring-1 ring-border",
  InRepair: "bg-white text-carbon ring-1 ring-carbon/30",
  Retired: "bg-transparent text-muted ring-1 ring-border",
};

export function StatusBadge({ status }: { status: DeviceStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${STYLES[status]}`}
    >
      {deviceStatusLabel(status)}
    </span>
  );
}
