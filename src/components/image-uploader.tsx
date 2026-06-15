"use client";

import { useActionState, useEffect, useRef } from "react";
import type { ImageUploadState } from "@/lib/images/actions";

/**
 * Image upload control. On the web you pick files; on a phone the "Take photo"
 * button opens the rear camera directly (capture="environment"). Both feed the
 * same multipart form, validated and stored server-side.
 */
export function ImageUploader({
  action,
}: {
  action: (state: ImageUploadState, formData: FormData) => Promise<ImageUploadState>;
}) {
  const [state, formAction, pending] = useActionState<ImageUploadState, FormData>(
    action,
    {},
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.uploaded) formRef.current?.reset();
  }, [state.uploaded]);

  const fileInputClass =
    "block w-full text-sm text-carbon file:mr-3 file:rounded-lg file:border-0 file:bg-brand file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-brand-dark";

  return (
    <form
      ref={formRef}
      action={formAction}
      className="rounded-xl border border-border bg-surface p-4 shadow-sm"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-carbon">
            Choose images
          </label>
          <input
            type="file"
            name="images"
            multiple
            accept="image/jpeg,image/png,image/webp"
            className={fileInputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-carbon">
            Take a photo
          </label>
          <input
            type="file"
            name="images"
            accept="image/*"
            capture="environment"
            className={fileInputClass}
          />
        </div>
      </div>

      <div className="mt-3">
        <label htmlFor="caption" className="mb-1 block text-sm font-medium text-carbon">
          Caption <span className="text-muted">(optional)</span>
        </label>
        <input
          id="caption"
          name="caption"
          className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-carbon shadow-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/30"
          placeholder="e.g. Asset label, damage to lid"
        />
      </div>

      <div className="mt-3 flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-10 items-center rounded-lg bg-brand px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
        >
          {pending ? "Uploading…" : "Upload"}
        </button>
        {state.error && (
          <p className="text-sm font-medium text-brand-dark">{state.error}</p>
        )}
        {state.uploaded ? (
          <p className="text-sm text-muted">
            Uploaded {state.uploaded} {state.uploaded === 1 ? "image" : "images"}.
          </p>
        ) : null}
      </div>

      <p className="mt-2 text-xs text-muted">
        JPEG, PNG or WebP. Stored privately and only viewable when signed in.
      </p>
    </form>
  );
}
