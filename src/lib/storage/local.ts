import { promises as fs } from "fs";
import path from "path";
import type { StorageDriver } from "./index";

/**
 * Local filesystem storage. Writes under UPLOAD_DIR (default ./uploads), which
 * sits outside the web root, so files are never served statically — only
 * through the authenticated route.
 */
export class LocalStorageDriver implements StorageDriver {
  private readonly root: string;

  constructor() {
    this.root = path.resolve(process.env.UPLOAD_DIR ?? "./uploads");
  }

  private resolve(key: string): string {
    const full = path.resolve(this.root, key);
    // Guard against path traversal — keys must stay within the root.
    if (full !== this.root && !full.startsWith(this.root + path.sep)) {
      throw new Error("Invalid storage key");
    }
    return full;
  }

  async save(key: string, data: Uint8Array): Promise<void> {
    const full = this.resolve(key);
    await fs.mkdir(path.dirname(full), { recursive: true });
    await fs.writeFile(full, data);
  }

  async read(key: string): Promise<Uint8Array | null> {
    try {
      return await fs.readFile(this.resolve(key));
    } catch {
      return null;
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await fs.unlink(this.resolve(key));
    } catch {
      // Already gone — nothing to do.
    }
  }
}
