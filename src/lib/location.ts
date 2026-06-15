import { LocationType } from "@/generated/prisma/enums";

/** The minimal shape needed to describe where a device currently is. */
export type LocationLike = {
  locationType: LocationType;
  officeSubLocation: string | null;
  customer: { name: string; shortCode: string | null } | null;
};

/** A short, human-readable location, e.g. "Northwind Trading" or "Office · Shelf B". */
export function formatLocation(movement: LocationLike | null | undefined): string {
  if (!movement) return "Unknown";
  if (movement.locationType === LocationType.Customer) {
    return movement.customer?.name ?? "Customer site";
  }
  return movement.officeSubLocation
    ? `Office · ${movement.officeSubLocation}`
    : "Office";
}
