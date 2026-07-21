import type { NextConfig } from "next";

const baseSecurityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      { source: "/(.*)", headers: baseSecurityHeaders },
      // The embeddable widget may be framed; per-origin control is enforced at
      // token issuance (parent origin is checked when minting the session).
      {
        source: "/widget/:botId*",
        headers: [{ key: "Content-Security-Policy", value: "frame-ancestors *" }],
      },
      // Everything else refuses to be framed (clickjacking defense).
      {
        source: "/((?!widget).*)",
        headers: [{ key: "X-Frame-Options", value: "DENY" }],
      },
    ];
  },
};

export default nextConfig;