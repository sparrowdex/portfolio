import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // dev-only route badge: bottom corners are taken by the Spotify disc and the phone
  devIndicators: { position: 'top-right' },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
