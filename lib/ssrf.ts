import { lookup } from "node:dns/promises";
import net from "node:net";

// Blocks webhook URLs that target the host's own network (cloud metadata,
// loopback, RFC1918, link-local) — otherwise a tenant could point a bot at an
// internal service and read its response through the chat reply (SSRF).
const PRIVATE_V4 = [
  /^0\./, /^10\./, /^127\./, /^169\.254\./, /^192\.168\./,
  /^172\.(1[6-9]|2\d|3[01])\./, /^100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\./,
];

function v4Private(ip: string): boolean {
  return PRIVATE_V4.some((r) => r.test(ip));
}
function ipPrivate(ip: string): boolean {
  if (net.isIPv4(ip)) return v4Private(ip);
  const l = ip.toLowerCase();
  if (l === "::1" || l === "::") return true;
  if (l.startsWith("fc") || l.startsWith("fd") || l.startsWith("fe80")) return true;
  const m = l.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  return m ? v4Private(m[1]) : false;
}

// Dev escape hatch so the local n8n mock (localhost:5678) works. Never set in prod.
const allowPrivate = () => process.env.ALLOW_PRIVATE_WEBHOOKS === "true";

// Sync: scheme + literal-host checks, at bot save time.
export function assertHttpUrl(raw: string): URL {
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    throw new Error("Invalid webhook URL");
  }
  if (u.protocol !== "http:" && u.protocol !== "https:") throw new Error("Webhook must be http(s)");
  if (allowPrivate()) return u;
  const h = u.hostname.toLowerCase();
  const hostIp = h.replace(/^\[|\]$/g, ""); // unwrap IPv6 literal [::1]
  if (h === "localhost" || h.endsWith(".localhost") || h.endsWith(".local") || h === "metadata.google.internal") {
    throw new Error("Internal hosts are not allowed");
  }
  if (net.isIP(hostIp) && ipPrivate(hostIp)) throw new Error("Private-IP webhooks are not allowed");
  return u;
}

// Async: DNS-resolve and re-check, at fetch time (defeats rebinding + hostnames
// that point at internal IPs).
export async function assertPublicHost(u: URL): Promise<void> {
  if (allowPrivate()) return;
  const { address } = await lookup(u.hostname);
  if (ipPrivate(address)) throw new Error("Webhook resolves to a private IP");
}