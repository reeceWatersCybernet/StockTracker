// British English date formatting helpers.

const DATE = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

const DATE_TIME = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function toDate(value: Date | string | null | undefined): Date | null {
  if (!value) return null;
  const date = typeof value === "string" ? new Date(value) : value;
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDate(value: Date | string | null | undefined): string {
  const date = toDate(value);
  return date ? DATE.format(date) : "—";
}

export function formatDateTime(value: Date | string | null | undefined): string {
  const date = toDate(value);
  return date ? DATE_TIME.format(date) : "—";
}

/** True when a proposed collection date is in the past and nothing was collected. */
export function isOverdue(
  proposedCollectionDate: Date | string | null | undefined,
  actualCollectionDate: Date | string | null | undefined,
): boolean {
  const proposed = toDate(proposedCollectionDate);
  if (!proposed || toDate(actualCollectionDate)) return false;
  return proposed.getTime() < Date.now();
}
