import type { NextConfig } from "next";

// Single image-size knob: MAX_UPLOAD_MB (megabytes, default 15). Server Actions
// cap the request body at 1MB by default, which rejects phone-camera photos
// before our own validation runs — so we derive the body limit from the same
// value, with headroom for multipart overhead and selecting a few files at once.
const maxUploadMb = Number(process.env.MAX_UPLOAD_MB) || 15;
const bodySizeLimitBytes = (maxUploadMb * 2 + 2) * 1024 * 1024;

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: bodySizeLimitBytes,
    },
  },
};

export default nextConfig;
