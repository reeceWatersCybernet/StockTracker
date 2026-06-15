"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DeviceStatus, LocationType } from "@/generated/prisma/enums";
import { requireCurrentUser } from "@/lib/auth/currentUser";
import {
  deploySchema,
  returnSchema,
  moveSchema,
  repairSchema,
  collectionSchema,
  retireSchema,
  movementFieldErrors,
} from "@/lib/validation/movement";

export type MovementState = {
  errors?: Record<string, string>;
  values?: Record<string, string>;
};

function formValues(formData: FormData): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string") out[key] = value;
  }
  return out;
}

type NewMovement = {
  locationType: LocationType;
  customerId?: string | null;
  officeSubLocation?: string | null;
  reason: string;
  ticketNumber?: string | null;
  installDate: Date;
  proposedCollectionDate?: Date | null;
};

/**
 * The core transition: never overwrite history. Close the current movement
 * (record when it ended) and open a new current one, keeping Device.status in
 * sync — all in one transaction so exactly one movement stays current.
 */
async function transition(
  deviceId: string,
  actorId: string,
  status: DeviceStatus,
  movement: NewMovement,
  endedAt: Date,
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const device = await tx.device.findUnique({
      where: { id: deviceId },
      select: { id: true },
    });
    if (!device) throw new Error("Device not found.");

    await tx.movement.updateMany({
      where: { deviceId, isCurrent: true },
      data: { isCurrent: false, actualCollectionDate: endedAt },
    });

    await tx.movement.create({
      data: {
        deviceId,
        locationType: movement.locationType,
        customerId: movement.customerId ?? null,
        officeSubLocation: movement.officeSubLocation ?? null,
        reason: movement.reason,
        ticketNumber: movement.ticketNumber ?? null,
        installDate: movement.installDate,
        proposedCollectionDate: movement.proposedCollectionDate ?? null,
        isCurrent: true,
        createdByUserId: actorId,
      },
    });

    await tx.device.update({ where: { id: deviceId }, data: { status } });
  });
}

function done(deviceId: string): never {
  revalidatePath(`/devices/${deviceId}`);
  revalidatePath("/devices");
  redirect(`/devices/${deviceId}`);
}

export async function deployToCustomer(
  deviceId: string,
  _prev: MovementState,
  formData: FormData,
): Promise<MovementState> {
  const actor = await requireCurrentUser();
  const parsed = deploySchema.safeParse(formValues(formData));
  if (!parsed.success) {
    return { errors: movementFieldErrors(parsed.error), values: formValues(formData) };
  }
  const data = parsed.data;

  const customer = await prisma.customer.findUnique({
    where: { id: data.customerId },
    select: { id: true },
  });
  if (!customer) {
    return { errors: { customerId: "That customer no longer exists." } };
  }

  const installDate = new Date(data.installDate);
  await transition(
    deviceId,
    actor.id,
    DeviceStatus.Deployed,
    {
      locationType: LocationType.Customer,
      customerId: data.customerId,
      reason: data.reason,
      ticketNumber: data.ticketNumber,
      installDate,
      proposedCollectionDate: data.proposedCollectionDate
        ? new Date(data.proposedCollectionDate)
        : null,
    },
    installDate,
  );
  done(deviceId);
}

export async function returnToOffice(
  deviceId: string,
  _prev: MovementState,
  formData: FormData,
): Promise<MovementState> {
  const actor = await requireCurrentUser();
  const parsed = returnSchema.safeParse(formValues(formData));
  if (!parsed.success) {
    return { errors: movementFieldErrors(parsed.error), values: formValues(formData) };
  }
  const data = parsed.data;
  const collectedAt = data.collectionDate ? new Date(data.collectionDate) : new Date();

  await transition(
    deviceId,
    actor.id,
    DeviceStatus.InStock,
    {
      locationType: LocationType.Office,
      officeSubLocation: data.officeSubLocation,
      reason: data.reason ?? "Returned to the office.",
      installDate: collectedAt,
    },
    collectedAt,
  );
  done(deviceId);
}

export async function moveWithinOffice(
  deviceId: string,
  _prev: MovementState,
  formData: FormData,
): Promise<MovementState> {
  const actor = await requireCurrentUser();
  const parsed = moveSchema.safeParse(formValues(formData));
  if (!parsed.success) {
    return { errors: movementFieldErrors(parsed.error), values: formValues(formData) };
  }
  const data = parsed.data;
  const now = new Date();

  // A device relocated to an office spot is back in general stock — this also
  // serves as the way back from In repair or Retired.
  await transition(
    deviceId,
    actor.id,
    DeviceStatus.InStock,
    {
      locationType: LocationType.Office,
      officeSubLocation: data.officeSubLocation,
      reason: data.reason ?? "Moved within the office.",
      installDate: now,
    },
    now,
  );
  done(deviceId);
}

export async function sendToRepair(
  deviceId: string,
  _prev: MovementState,
  formData: FormData,
): Promise<MovementState> {
  const actor = await requireCurrentUser();
  const parsed = repairSchema.safeParse(formValues(formData));
  if (!parsed.success) {
    return { errors: movementFieldErrors(parsed.error), values: formValues(formData) };
  }
  const data = parsed.data;
  const now = new Date();

  await transition(
    deviceId,
    actor.id,
    DeviceStatus.InRepair,
    {
      locationType: LocationType.Office,
      officeSubLocation: data.officeSubLocation ?? "Repair bench",
      reason: data.reason,
      installDate: now,
    },
    now,
  );
  done(deviceId);
}

export async function retireDevice(
  deviceId: string,
  _prev: MovementState,
  formData: FormData,
): Promise<MovementState> {
  const actor = await requireCurrentUser();
  const parsed = retireSchema.safeParse(formValues(formData));
  if (!parsed.success) {
    return { errors: movementFieldErrors(parsed.error), values: formValues(formData) };
  }
  const now = new Date();

  await transition(
    deviceId,
    actor.id,
    DeviceStatus.Retired,
    {
      locationType: LocationType.Office,
      officeSubLocation: "Disposal",
      reason: parsed.data.reason ?? "Retired.",
      installDate: now,
    },
    now,
  );
  done(deviceId);
}

/**
 * Status-only: the device is still at the customer but flagged to be collected.
 * No new movement (it hasn't moved) — we annotate the current one and update
 * the status for filtering.
 */
export async function markForCollection(
  deviceId: string,
  _prev: MovementState,
  formData: FormData,
): Promise<MovementState> {
  await requireCurrentUser();
  const parsed = collectionSchema.safeParse(formValues(formData));
  if (!parsed.success) {
    return { errors: movementFieldErrors(parsed.error), values: formValues(formData) };
  }

  await prisma.$transaction(async (tx) => {
    await tx.movement.updateMany({
      where: { deviceId, isCurrent: true },
      data: { proposedCollectionDate: new Date(parsed.data.proposedCollectionDate) },
    });
    await tx.device.update({
      where: { id: deviceId },
      data: { status: DeviceStatus.AwaitingCollection },
    });
  });
  done(deviceId);
}
