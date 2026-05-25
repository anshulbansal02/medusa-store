import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const projectRoot = dirname(fileURLToPath(import.meta.url));
const workspaceRoot = resolve(projectRoot, "../..");
const turbopackRoot = process.env.VERCEL ? projectRoot : workspaceRoot;
const extraImageHostnames = new Set(
  (process.env.NEXT_PUBLIC_IMAGE_HOSTNAMES ?? "")
    .split(",")
    .map((hostname) => hostname.trim())
    .filter(Boolean),
);

const nextConfig: NextConfig = {
  cacheComponents: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "29181",
        pathname: "/uploads/**",
      },
      ...Array.from(extraImageHostnames).map((hostname) => ({
        protocol: "https" as const,
        hostname,
      })),
    ],
  },
  turbopack: {
    root: turbopackRoot,
  },
};

export default nextConfig;
