import type { NextConfig } from "next";
import path from "path";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
  },
  allowedDevOrigins: ['192.168.0.102'],
};

// Sentry options (combines Webpack plugin and SDK configuration)
const sentryOptions = {
  silent: true, // Suppresses source map uploading logs
  org: "ulavi-technologies",
  project: "voiceberry",
  widenClientFileUpload: true,
  transpileClientSDK: true,
  hideSourceMaps: true,
  automaticVercelCronJobs: true,
  webpack: {
    treeshake: {
      removeDebugLogging: true,
    },
  },
};

export default withSentryConfig(nextConfig, sentryOptions);