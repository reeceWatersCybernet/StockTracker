"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireCurrentUser } from "@/lib/auth/currentUser";
import { customerSchema, customerFieldErrors } from "@/lib/validation/customer";

export type CustomerFormState = {
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

export async function createCustomer(
  _prev: CustomerFormState,
  formData: FormData,
): Promise<CustomerFormState> {
  await requireCurrentUser();
  const parsed = customerSchema.safeParse(formValues(formData));
  if (!parsed.success) {
    return {
      errors: customerFieldErrors(parsed.error),
      values: formValues(formData),
    };
  }

  await prisma.customer.create({
    data: {
      name: parsed.data.name,
      shortCode: parsed.data.shortCode,
      isActive: formData.get("isActive") != null,
    },
  });

  revalidatePath("/customers");
  redirect("/customers");
}

export async function updateCustomer(
  customerId: string,
  _prev: CustomerFormState,
  formData: FormData,
): Promise<CustomerFormState> {
  await requireCurrentUser();
  const parsed = customerSchema.safeParse(formValues(formData));
  if (!parsed.success) {
    return {
      errors: customerFieldErrors(parsed.error),
      values: formValues(formData),
    };
  }

  await prisma.customer.update({
    where: { id: customerId },
    data: {
      name: parsed.data.name,
      shortCode: parsed.data.shortCode ?? null,
      isActive: formData.get("isActive") != null,
    },
  });

  revalidatePath("/customers");
  redirect("/customers");
}

/**
 * Hard delete is only offered when a customer has no movement history (the
 * Movement.customer relation uses onDelete: Restrict to protect the audit
 * trail). Otherwise the UI offers deactivation instead.
 */
export async function deleteCustomer(customerId: string): Promise<void> {
  await requireCurrentUser();
  const movements = await prisma.movement.count({ where: { customerId } });
  if (movements === 0) {
    await prisma.customer.delete({ where: { id: customerId } });
  }
  revalidatePath("/customers");
  redirect("/customers");
}
