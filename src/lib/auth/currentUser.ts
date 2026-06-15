import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
// Prisma 7's prisma-client generator exports row types as `<Model>Model`.
import type { UserModel as User } from "@/generated/prisma/models";

/**
 * The single "current user" helper.
 *
 * v0.1 (auth stub): the acting user is whoever is chosen in the no-password
 * switcher, stored in a cookie, falling back to a default seeded user.
 *
 * v1 (Entra ID SSO): swap the body of getCurrentUser() to read the Auth.js /
 * Entra session. Every caller (movements, image uploads, page guards) goes
 * through this module, so nothing else has to change.
 */
export const ACTOR_COOKIE = "st_actor";

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const actorId = cookieStore.get(ACTOR_COOKIE)?.value;

  if (actorId) {
    const user = await prisma.user.findUnique({ where: { id: actorId } });
    if (user) return user;
  }

  // No valid selection yet: default to the first Admin, else the earliest user.
  // (UserRole.Admin sorts before Engineer, so role "asc" prefers an admin.)
  return prisma.user.findFirst({
    orderBy: [{ role: "asc" }, { createdAt: "asc" }],
  });
}

/**
 * Use in any action that must attribute work to a user (creating movements,
 * uploading images). Throws if there is no user at all (e.g. unseeded DB).
 */
export async function requireCurrentUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error(
      "No users exist. Run `npm run db:seed` to create the seed users.",
    );
  }
  return user;
}

/** v0.1 only — the switcher offers every user to act as. */
export async function listSelectableUsers(): Promise<User[]> {
  return prisma.user.findMany({ orderBy: [{ role: "asc" }, { name: "asc" }] });
}
