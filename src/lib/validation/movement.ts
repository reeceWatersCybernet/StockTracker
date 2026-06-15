import { z } from "zod";

const emptyToUndefined = (v: unknown) =>
  typeof v === "string" && v.trim() === "" ? undefined : v;

const optional = (max: number) =>
  z.preprocess(emptyToUndefined, z.string().trim().max(max).optional());

const requiredDate = z
  .string()
  .min(1, "A date is required.")
  .refine((v) => !Number.isNaN(Date.parse(v)), "That date isn't valid.");

const optionalDate = z.preprocess(
  emptyToUndefined,
  z
    .string()
    .refine((v) => !Number.isNaN(Date.parse(v)), "That date isn't valid.")
    .optional(),
);

export const deploySchema = z.object({
  customerId: z.string().min(1, "Choose a customer."),
  reason: z.string().trim().min(1, "Give a reason for the deployment.").max(500),
  ticketNumber: optional(60),
  installDate: requiredDate,
  proposedCollectionDate: optionalDate,
});

export const returnSchema = z.object({
  officeSubLocation: optional(120),
  reason: optional(500),
  collectionDate: optionalDate,
});

export const moveSchema = z.object({
  officeSubLocation: optional(120),
  reason: optional(500),
});

export const repairSchema = z.object({
  reason: z.string().trim().min(1, "Describe the fault.").max(500),
  officeSubLocation: optional(120),
});

export const collectionSchema = z.object({
  proposedCollectionDate: requiredDate,
});

export const retireSchema = z.object({
  reason: optional(500),
});

export function movementFieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
