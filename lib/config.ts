import type { NextRequest } from "next/server";

// Parse a positive-integer env var; empty/whitespace/garbage falls back to the
// default (Number("") === 0 would otherwise brick a rate limiter).
export function intEnv(name: string, fallback: number): number {
  const n = Number.parseInt((process.env[name] ?? "").trim(), 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

// Instant credit top-up grants credits with NO payment. It is a development
// affordance and must never be reachable in production, where any signed-in
// user could mint themselves unlimited credits. Real payments take over once
// STRIPE_SECRET_KEY is set; ALLOW_DEV_TOPUP=true is a deliberate escape hatch
// for demo/preview deploys.
export function devTopUpAllowed(): boolean {
  if (process.env.STRIPE_SECRET_KEY) return false;
  if ((process.env.ALLOW_DEV_TOPUP ?? "").trim() === "true") return true;
  return process.env.NODE_ENV !== "production";
}

function normalize(o: string): string {
  return o.trim().replace(/\/$/, "");
}

export function globalAllowedOrigins(): string[] {
  return (process.env.ALLOWED_ORIGINS ?? "").split(",").map(normalize).filter(Boolean);
}

// Real client IP for rate-limit keys. The leftmost X-Forwarded-For entry is
// client-controlled (append-style proxies put the real peer on the right). We
// trust TRUST_PROXY_HOPS entries from the right, so a spoofed left entry can't
// mint a fresh bucket per request. 0 ignores XFF (directly exposed).
export function clientIp(req: NextRequest): string {
  const parsed = Number.parseInt((process.env.TRUST_PROXY_HOPS ?? "").trim(), 10);
  const hops = Number.isFinite(parsed) && parsed >= 0 ? parsed : 1;
  const xff = req.headers.get("x-forwarded-for");
  if (hops > 0 && xff) {
    const parts = xff.split(",").map((s) => s.trim()).filter(Boolean);
    const ip = parts[parts.length - hops];
    if (ip) return ip;
  }
  return req.headers.get("x-real-ip")?.trim() || "unknown";
}

export function selfHost(req: NextRequest): string | null {
  return req.headers.get("x-forwarded-host") ?? req.headers.get("host");
}

export function isSameOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).host === selfHost(req);
  } catch {
    return false;
  }
}

// True if the request Origin may use this endpoint: same-origin (our iframe),
// or listed in the bot's allowlist / global allowlist. Blocks cross-site
// browser requests (CSRF); not a bot gate (non-browsers forge headers but
// still need a valid token/key).
export function originAllowed(req: NextRequest, extra: string[] = []): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return false;
  if (isSameOrigin(req)) return true;
  const norm = normalize(origin);
  return extra.map(normalize).includes(norm) || globalAllowedOrigins().includes(norm);
}

// CORS headers for an allowlisted cross-origin caller; empty otherwise.
export function corsHeaders(req: NextRequest, extra: string[] = []): Record<string, string> {
  const origin = req.headers.get("origin");
  if (!origin || !originAllowed(req, extra)) return {};
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-API-Key",
    "Access-Control-Max-Age": "600",
    Vary: "Origin",
  };
}