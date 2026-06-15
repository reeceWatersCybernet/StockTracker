"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { ACTOR_COOKIE } from "./currentUser";

/**
 * v0.1 auth stub: set the acting user (no password). Validates the id against
 * the database so an arbitrary cookie value can't be injected. In v1 this is
 * replaced by the Entra sign-in flow.
 */
export async function switchActor(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });
  if (!user) {
    throw new Error("Unknown user.");
  }

  const cookieStore = await cookies();
  cookieStore.set(ACTOR_COOKIE, user.id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // a year
  });

  // The header (and anything attributing work) reflects the new actor.
  revalidatePath("/", "layout");
}
