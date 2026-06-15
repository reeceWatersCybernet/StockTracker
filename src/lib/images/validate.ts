import {
  ALLOWED_IMAGE_TYPES,
  maxUploadBytes,
  type AllowedMime,
} from "@/lib/storage";

export type ValidatedImage =
  | { ok: true; ext: string; contentType: AllowedMime; data: Uint8Array }
  | { ok: false; error: string };

function megabytes(bytes: number): string {
  return (bytes / (1024 * 1024)).toFixed(0);
}

/** Confirm the bytes actually look like the declared image type (magic bytes). */
function sniff(buf: Uint8Array, mime: AllowedMime): boolean {
  if (mime === "image/jpeg") {
    return buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
  }
  if (mime === "image/png") {
    return (
      buf[0] === 0x89 &&
      buf[1] === 0x50 &&
      buf[2] === 0x4e &&
      buf[3] === 0x47 &&
      buf[4] === 0x0d &&
      buf[5] === 0x0a &&
      buf[6] === 0x1a &&
      buf[7] === 0x0a
    );
  }
  // WebP: "RIFF" .... "WEBP"
  const ascii = (i: number) => String.fromCharCode(buf[i]);
  return (
    ascii(0) === "R" &&
    ascii(1) === "I" &&
    ascii(2) === "F" &&
    ascii(3) === "F" &&
    ascii(8) === "W" &&
    ascii(9) === "E" &&
    ascii(10) === "B" &&
    ascii(11) === "P"
  );
}

/**
 * Validate an uploaded file by size, declared MIME type, and magic bytes.
 * Returns the bytes so callers don't read the file twice.
 */
export async function validateImage(file: File): Promise<ValidatedImage> {
  if (file.size === 0) {
    return { ok: false, error: "That file is empty." };
  }
  const limit = maxUploadBytes();
  if (file.size > limit) {
    return {
      ok: false,
      error: `That image is too large (maximum ${megabytes(limit)} MB).`,
    };
  }
  const mime = file.type as AllowedMime;
  if (!(mime in ALLOWED_IMAGE_TYPES)) {
    return { ok: false, error: "Only JPEG, PNG or WebP images are allowed." };
  }

  const data = new Uint8Array(await file.arrayBuffer());
  if (!sniff(data, mime)) {
    return {
      ok: false,
      error: "That file doesn't look like a valid image.",
    };
  }

  return { ok: true, ext: ALLOWED_IMAGE_TYPES[mime], contentType: mime, data };
}
