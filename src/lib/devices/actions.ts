"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { DeviceStatus, LocationType } from "@/generated/prisma/enums";
import { requireCurrentUser } from "@/lib/auth/currentUser";
import {
  deviceBaseSchema,
  deviceCreateSchema,
  fieldErrors,
} from "@/lib/validation/device";

export type DeviceFormState = {
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

function isUniqueViolation(error: unknown): error is Prisma.PrismaClientKnownRequestError {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}

export async function createDevice(
  _prev: DeviceFormState,
  formData: FormData,
): Promise<DeviceFormState> {
  const actor = await requireCurrentUser();
  const parsed = deviceCreateSchema.safeParse(formValues(formData));

  if (!parsed.success) {
    return { errors: fieldErrors(parsed.error), values: formValues(formData) };
  }
  const data = parsed.data;

  let deviceId: string;
  try {
    const device = await prisma.$transaction(async (tx) => {
      const created = await tx.device.create({
        data: {
          assetTag: data.assetTag,
          serialNumber: data.serialNumber,
          make: data.make,
          model: data.model,
          type: data.type,
          status: DeviceStatus.InStock,
          notes: data.notes,
        },
      });
      // Every device starts with a movement so its location is never unknown.
      await tx.movement.create({
        data: {
          deviceId: created.id,
          locationType: LocationType.Office,
          officeSubLocation: data.officeSubLocation,
          reason: data.reason ?? "Added to stock.",
          installDate: new Date(),
          isCurrent: true,
          createdByUserId: actor.id,
        },
      });
      return created;
    });
    deviceId = device.id;
  } catch (error) {
    if (isUniqueViolation(error)) {
      return {
        errors: { assetTag: "That asset tag is already in use." },
        values: formValues(formData),
      };
    }
    throw error;
  }

  revalidatePath("/devices");
  redirect(`/devices/${deviceId}`);
}

export async function updateDevice(
  deviceId: string,
  _prev: DeviceFormState,
  formData: FormData,
): Promise<DeviceFormState> {
  await requireCurrentUser();
  const parsed = deviceBaseSchema.safeParse(formValues(formData));

  if (!parsed.success) {
    return { errors: fieldErrors(parsed.error), values: formValues(formData) };
  }
  const data = parsed.data;

  try {
    await prisma.device.update({
      where: { id: deviceId },
      data: {
        assetTag: data.assetTag ?? null,
        serialNumber: data.serialNumber ?? null,
        make: data.make,
        model: data.model,
        type: data.type,
        notes: data.notes ?? null,
      },
    });
  } catch (error) {
    if (isUniqueViolation(error)) {
      return {
        errors: { assetTag: "That asset tag is already in use." },
        values: formValues(formData),
      };
    }
    throw error;
  }

  revalidatePath("/devices");
  revalidatePath(`/devices/${deviceId}`);
  redirect(`/devices/${deviceId}`);
}

export async function deleteDevice(deviceId: string): Promise<void> {
  await requireCurrentUser();
  // Disposable data in v0.1; cascades remove the device's movements and images.
  await prisma.device.delete({ where: { id: deviceId } });
  revalidatePath("/devices");
  redirect("/devices");
}
