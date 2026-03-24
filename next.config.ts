import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: false, // Ensure active in production and reliable checks
  register: true,
  fallbacks: {
    document: "/~offline",
  },
  workboxOptions: {
    skipWaiting: true,
    runtimeCaching: [
      {
        urlPattern: /\/dashboard(.*)|\/students(.*)/i,
        handler: "NetworkFirst",
        options: {
          cacheName: "app-views-cache",
          expiration: { maxEntries: 32, maxAgeSeconds: 86400 * 7 }, // 1 week
          networkTimeoutSeconds: 5, // Fallback to cache fast.
        },
      },
      {
        urlPattern: /\.(?:css|js|woff2?|eot|ttf|otf|png|jpg|jpeg|svg|webp|ico|gif)$/i,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "static-assets-cache",
          expiration: { maxEntries: 100, maxAgeSeconds: 86400 * 30 }, // 30 days
        },
      },
      {
        urlPattern: /^https:\/\/fonts\.(?:gstatic|googleapis)\.com\/.*/i,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "google-fonts-cache",
          expiration: { maxEntries: 20, maxAgeSeconds: 86400 * 365 }, // 1 year
        },
      },
    ],
  },
});

const nextConfig = {
  output: 'export' as const,
  images: {
    unoptimized: true,
  },
  // @ts-ignore
  eslint: {
    ignoreDuringBuilds: true,
  },
  // @ts-ignore
  typescript: {
    ignoreBuildErrors: true,
  },
  turbopack: {},
};

export default withPWA(nextConfig);
