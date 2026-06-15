"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getStorage } from "@/lib/storage";
import { requireCurrentUser } from "@/lib/auth/currentUser";
import { validateImage } from "./validate";

export type ImageUploadState = { error?: string; uploaded?: number };

export async function uploadDeviceImages(
  deviceId: string,
  _prev: ImageUploadState,
  formData: FormData,
): Promise<ImageUploadState> {
  const actor = await requireCurrentUser();

  const device = await prisma.device.findUnique({
    where: { id: deviceId },
    select: { id: true },
  });
  if (!device) return { error: "Device not found." };

  const files = formData
    .getAll("images")
    .filter((f): f is File => f instanceof File && f.size > 0);
  const captionRaw = (formData.get("caption") as string | null) ?? "";
  const caption = captionRaw.trim() || null;

  if (files.length === 0) return { error: "Choose at least one image to upload." };

  const storage = getStorage();
  let uploaded = 0;

  for (const file of files) {
    const result = await validateImage(file);
    if (!result.ok) {
      return { error: result.error, uploaded };
    }
    const key = `devices/${deviceId}/${randomUUID()}.${result.ext}`;
    await storage.save(key, result.data);
    await prisma.deviceImage.create({
      data: {
        deviceId,
        filePath: key,
        caption,
        uploadedByUserId: actor.id,
      },
    });
    uploaded += 1;
  }

  revalidatePath(`/devices/${deviceId}`);
  return { uploaded };
}

export async function deleteDeviceImage(imageId: string): Promise<void> {
  await requireCurrentUser();
  const image = await prisma.deviceImage.findUnique({ where: { id: imageId } });
  if (!image) return;

  await getStorage().delete(image.filePath);
  await prisma.deviceImage.delete({ where: { id: imageId } });
  revalidatePath(`/devices/${image.deviceId}`);
}
