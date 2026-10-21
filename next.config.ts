import type { NextConfig } from "next";
// A static site on Cloudflare Pages: security headers live in public/_headers and the form endpoint in functions/.
const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  poweredByHeader: false,
  // Lets phones on the local network load dev scripts (dev server only).
  allowedDevOrigins: ["192.168.1.202"],
};
export default nextConfig;
