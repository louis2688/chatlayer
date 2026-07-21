import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";

export type ChatSession = { sid: string; botId: string; iat: number; exp: number };

function secret(): string {
  const s = process.env.SESSION_SECRET || process.env.BETTER_AUTH_SECRET;
  if (s && s.length >= 32) return s;
  if (process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET (>= 32 chars) is required in production");
  }
  return "dev-only-secret-never-use-in-production";
}

function hmac(body: string): Buffer {
  return createHmac("sha256", secret()).update(body).digest();
}

// Anonymous widget session, bound to one bot so a token can't cross bots.
export function issueSession(botId: string, ttlSeconds = 60 * 60 * 24): string {
  const now = Math.floor(Date.now() / 1000);
  const payload: ChatSession = { sid: randomUUID(), botId, iat: now, exp: now + ttlSeconds };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${hmac(body).toString("base64url")}`;
}

export function verifySession(token: string | null): ChatSession | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [body, sig] = parts;
  let given: Buffer;
  try {
    given = Buffer.from(sig, "base64url");
  } catch {
    return null;
  }
  const expected = hmac(body);
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString()) as ChatSession;
    if (typeof payload.sid !== "string" || typeof payload.botId !== "string") return null;
    if (typeof payload.exp !== "number" || payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}