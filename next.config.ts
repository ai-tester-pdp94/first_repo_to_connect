import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The phone action bar owns the bottom edge. The dev badge sits up
  // with the header so it does not cover Look up, Edit, or Investigate.
  devIndicators: {
    position: "top-right",
  },
  serverExternalPackages: ["better-sqlite3"],
  // The book is opened at http://127.0.0.1 while `next dev` is bound to
  // 0.0.0.0. That host is not allowlisted, so the HMR socket is rejected.
  // The client retries, then calls location.reload() and wipes the form.
  allowedDevOrigins: ["127.0.0.1"],
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        ...config.watchOptions,
        ignored: [config.watchOptions?.ignored, "**/data/**"].filter(Boolean),
      };
    }
    return config;
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
