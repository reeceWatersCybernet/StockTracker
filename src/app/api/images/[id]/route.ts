import { getCurrentUser } from "@/lib/auth/currentUser";
import { prisma } from "@/lib/prisma";
import { getStorage, mimeForKey } from "@/lib/storage";

/**
 * Authenticated image serving. Files live outside the web root and are only
 * reachable here, behind the current-user check (which becomes the Entra gate
 * in v1). Never served statically.
 */
export async function GET(
  _request: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) {
    return new Response("Unauthorised", { status: 401 });
  }

  const { id } = await ctx.params;
  const image = await prisma.deviceImage.findUnique({
    where: { id },
    select: { filePath: true },
  });
  if (!image) {
    return new Response("Not found", { status: 404 });
  }

  const data = await getStorage().read(image.filePath);
  if (!data) {
    return new Response("Not found", { status: 404 });
  }

  // Copy into a fresh ArrayBuffer-backed view so it satisfies BodyInit's typing.
  const body = new Uint8Array(data);
  return new Response(body, {
    headers: {
      "Content-Type": mimeForKey(image.filePath),
      "Content-Length": String(body.byteLength),
      "Cache-Control": "private, max-age=3600",
    },
  });
}
