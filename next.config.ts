import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // dev-only route badge: bottom corners are taken by the Spotify disc and the phone
  devIndicators: { position: 'top-right' },
  // old recruiter-mode links now land on the résumé page
  async redirects() {
    return [{ source: '/', has: [{ type: 'query', key: 'mode', value: 'recruiter' }], destination: '/resume', permanent: false }];
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
