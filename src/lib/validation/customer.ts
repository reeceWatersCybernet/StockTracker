import { z } from "zod";

const emptyToUndefined = (v: unknown) =>
  typeof v === "string" && v.trim() === "" ? undefined : v;

export const customerSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(120),
  shortCode: z.preprocess(
    emptyToUndefined,
    z.string().trim().max(20).optional(),
  ),
});

export type CustomerInput = z.infer<typeof customerSchema>;

export function customerFieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
