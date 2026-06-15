import { LocalStorageDriver } from "./local";

/**
 * Pluggable object storage. v0.1 uses the local filesystem driver; a MinIO
 * (S3-compatible) driver can be added later by implementing this same interface
 * and extending getStorage() — callers never change.
 *
 * Keys are opaque strings (e.g. "devices/<id>/<uuid>.jpg") stored in
 * DeviceImage.filePath. Bytes live outside the web root and are only served
 * through the authenticated /api/images/[id] route.
 */
export interface StorageDriver {
  save(key: string, data: Uint8Array): Promise<void>;
  read(key: string): Promise<Uint8Array | null>;
  delete(key: string): Promise<void>;
}

let driver: StorageDriver | null = null;

export function getStorage(): StorageDriver {
  if (driver) return driver;
  const kind = process.env.STORAGE_DRIVER ?? "local";
  switch (kind) {
    case "local":
      driver = new LocalStorageDriver();
      return driver;
    // case "minio": driver = new MinioStorageDriver(); return driver;
    default:
      throw new Error(`Unknown STORAGE_DRIVER: ${kind}`);
  }
}

/** Allowed image MIME types mapped to the extension we store them under. */
export const ALLOWED_IMAGE_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} as const;

export type AllowedMime = keyof typeof ALLOWED_IMAGE_TYPES;

const EXT_TO_MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

export function mimeForKey(key: string): string {
  const ext = key.split(".").pop()?.toLowerCase() ?? "";
  return EXT_TO_MIME[ext] ?? "application/octet-stream";
}

export function maxUploadBytes(): number {
  const value = Number(process.env.MAX_UPLOAD_BYTES);
  return Number.isFinite(value) && value > 0 ? value : 15 * 1024 * 1024;
}
