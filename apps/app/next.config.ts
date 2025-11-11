import { withToolbar } from "@repo/feature-flags/lib/toolbar";
import { config, withAnalyzer } from "@repo/next-config";
import { withLogging } from "@repo/observability/next-config";
import type { NextConfig } from "next";
import { env } from "@/env";
import path from "path";

let nextConfig: NextConfig = {
  ...config,
  // Configure Turbopack root for monorepo
  turbopack: {
    root: path.join(__dirname, '../../'),
  },
  // Temporarily ignore TypeScript build errors
  typescript: {
    ignoreBuildErrors: true, // Remove this after fixing tsconfig issues
  },
  // Configure experimental features
  experimental: {
    ...config.experimental,
  },
};

nextConfig = withToolbar(withLogging(nextConfig));

// if (env.VERCEL) {
//   nextConfig = withSentry(nextConfig);
// }

if (env.ANALYZE === "true") {
  nextConfig = withAnalyzer(nextConfig);
}

export default nextConfig;
