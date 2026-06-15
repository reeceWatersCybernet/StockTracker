import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Server Actions cap the request body at 1MB by default, which rejects
      // phone-camera photos before our own validation runs. Raise it so uploads
      // reach the image validator (per-file size is enforced by MAX_UPLOAD_BYTES).
      bodySizeLimit: "30mb",
    },
  },
};

export default nextConfig;
