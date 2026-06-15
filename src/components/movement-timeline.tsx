import { LocationType } from "@/generated/prisma/enums";
import { formatDate, formatDateTime, isOverdue } from "@/lib/format";
import { formatLocation, type LocationLike } from "@/lib/location";

export type TimelineMovement = LocationLike & {
  id: string;
  reason: string;
  ticketNumber: string | null;
  installDate: Date | string;
  proposedCollectionDate: Date | string | null;
  actualCollectionDate: Date | string | null;
  isCurrent: boolean;
  createdAt: Date | string;
  createdBy: { name: string } | null;
};

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex gap-2">
      <dt className="w-32 shrink-0 text-xs text-muted">{label}</dt>
      <dd className="text-sm text-carbon">{value}</dd>
    </div>
  );
}

export function MovementTimeline({ movements }: { movements: TimelineMovement[] }) {
  if (movements.length === 0) {
    return <p className="text-sm text-muted">No movement history.</p>;
  }

  return (
    <ol className="space-y-4">
      {movements.map((m) => {
        const overdue =
          m.isCurrent && isOverdue(m.proposedCollectionDate, m.actualCollectionDate);
        return (
          <li
            key={m.id}
            className={`relative rounded-xl border bg-surface p-4 shadow-sm ${
              m.isCurrent ? "border-brand/40 ring-1 ring-brand/20" : "border-border"
            }`}
          >
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="font-semibold text-carbon">
                {formatLocation(m)}
              </span>
              {m.isCurrent && (
                <span className="inline-flex items-center rounded-full bg-brand/10 px-2 py-0.5 text-xs font-semibold text-brand">
                  Current
                </span>
              )}
              {overdue && (
                <span className="inline-flex items-center rounded-full bg-carbon px-2 py-0.5 text-xs font-semibold text-white">
                  Overdue for collection
                </span>
              )}
              <span className="ml-auto text-xs text-muted">
                {m.locationType === LocationType.Customer ? "Deployment" : "Office"}
              </span>
            </div>
            <dl className="space-y-1">
              <DetailRow label="Reason" value={m.reason} />
              {m.ticketNumber && (
                <DetailRow label="Ticket" value={m.ticketNumber} />
              )}
              <DetailRow label="Install date" value={formatDate(m.installDate)} />
              {m.proposedCollectionDate && (
                <DetailRow
                  label="Proposed collection"
                  value={formatDate(m.proposedCollectionDate)}
                />
              )}
              {m.actualCollectionDate && (
                <DetailRow
                  label="Collected"
                  value={formatDate(m.actualCollectionDate)}
                />
              )}
              <DetailRow
                label="Logged"
                value={`${formatDateTime(m.createdAt)}${
                  m.createdBy ? ` · ${m.createdBy.name}` : ""
                }`}
              />
            </dl>
          </li>
        );
      })}
    </ol>
  );
}
