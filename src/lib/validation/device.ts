import { z } from "zod";
import { DeviceType } from "@/generated/prisma/enums";
import { DEVICE_TYPE_VALUES } from "@/lib/labels";

/** Treat empty/whitespace-only form fields as "not provided". */
const emptyToUndefined = (v: unknown) =>
  typeof v === "string" && v.trim() === "" ? undefined : v;

const required = (max: number) => z.string().trim().min(1).max(max);
const optional = (max: number) =>
  z.preprocess(emptyToUndefined, z.string().trim().max(max).optional());

const deviceTypeEnum = z.enum(
  DEVICE_TYPE_VALUES as [DeviceType, ...DeviceType[]],
);

/** Descriptive fields shared by create and edit. */
export const deviceBaseSchema = z.object({
  assetTag: optional(64),
  serialNumber: optional(128),
  make: required(120),
  model: required(120),
  type: deviceTypeEnum,
  notes: optional(2000),
});

/** Create also captures where the device starts (an initial office movement). */
export const deviceCreateSchema = deviceBaseSchema.extend({
  officeSubLocation: optional(120),
  reason: optional(500),
});

export type DeviceBaseInput = z.infer<typeof deviceBaseSchema>;
export type DeviceCreateInput = z.infer<typeof deviceCreateSchema>;

/** Flatten zod errors into `{ field: message }` for form display. */
export function fieldErrors(
  error: z.ZodError,
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
