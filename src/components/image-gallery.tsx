"use client";

import { useTransition } from "react";
import { deleteDeviceImage } from "@/lib/images/actions";

export type GalleryImage = {
  id: string;
  caption: string | null;
  uploadedByName: string | null;
};

function GalleryItem({ image, alt }: { image: GalleryImage; alt: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <li className="group relative overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/api/images/${image.id}`}
        alt={image.caption ?? alt}
        className="aspect-square w-full object-cover"
      />
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (window.confirm("Remove this image?")) {
            startTransition(() => deleteDeviceImage(image.id));
          }
        }}
        className="absolute right-2 top-2 rounded-lg bg-carbon/80 px-2 py-1 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100 disabled:opacity-60"
      >
        {pending ? "Removing…" : "Remove"}
      </button>
      {image.caption && (
        <p className="px-2 py-1 text-xs text-muted">{image.caption}</p>
      )}
    </li>
  );
}

export function ImageGallery({
  images,
  alt,
}: {
  images: GalleryImage[];
  alt: string;
}) {
  if (images.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border bg-surface p-6 text-center text-sm text-muted">
        No images yet.
      </p>
    );
  }
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {images.map((image) => (
        <GalleryItem key={image.id} image={image} alt={alt} />
      ))}
    </ul>
  );
}
