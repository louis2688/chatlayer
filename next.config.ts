import type { NextConfig } from "next";

const baseSecurityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

// CSP limited to directives that do NOT restrict scripts/styles, so it hardens
// without nonce plumbing (a script-src would break Next's inline bootstrap and
// the theme-init script). frame-ancestors differs per route.
const cspBase = "object-src 'none'; base-uri 'self';";

const nextConfig: NextConfig = {
  async headers() {
    return [
      { source: "/(.*)", headers: baseSecurityHeaders },
      // The embeddable widget may be framed; per-origin control is enforced at
      // token issuance (parent origin is checked when minting the session).
      {
        source: "/widget/:botId*",
        headers: [{ key: "Content-Security-Policy", value: `${cspBase} frame-ancestors *` }],
      },
      // Everything else refuses to be framed (clickjacking defense).
      {
        source: "/((?!widget).*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Content-Security-Policy", value: `${cspBase} frame-ancestors 'none'` },
        ],
      },
    ];
  },
};

export default nextConfig;