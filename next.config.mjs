/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: false,
  experimental: {
    serverComponentsHmrCache: false, // defaults to true
  },
  images: {
    qualities: [75, 85, 90, 95],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 2560, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "dhbljsytzmtiwoassnym.supabase.co",
        pathname: "/**",
      },
    ],
  },

  async headers() {
    return [
      {
        source: "/embed",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors 'self' https://waitlist-376.created.app",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
