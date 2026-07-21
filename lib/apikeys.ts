import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "./db";
import { apiKey } from "./db/schema";

function hash(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

// Returns the plaintext ONCE (never stored) plus the row to persist.
export async function createApiKey(orgId: string, name: string) {
  const plain = `sk_${randomBytes(24).toString("hex")}`;
  const [row] = await db
    .insert(apiKey)
    .values({ organizationId: orgId, name, hashedKey: hash(plain), prefix: plain.slice(0, 12) })
    .returning();
  return { plain, row };
}

export async function listApiKeys(orgId: string) {
  return db.select().from(apiKey).where(eq(apiKey.organizationId, orgId));
}

export async function revokeApiKey(orgId: string, id: string) {
  const row = await db.query.apiKey.findFirst({ where: eq(apiKey.id, id) });
  if (!row || row.organizationId !== orgId) return false;
  await db.delete(apiKey).where(eq(apiKey.id, id));
  return true;
}

// Validate a presented key; returns the owning org id or null. Constant-time
// on the hash to avoid leaking which prefix matched.
export async function validateApiKey(presented: string | null): Promise<string | null> {
  if (!presented || !presented.startsWith("sk_")) return null;
  const h = hash(presented);
  const row = await db.query.apiKey.findFirst({ where: eq(apiKey.hashedKey, h) });
  if (!row) return null;
  const a = Buffer.from(h);
  const b = Buffer.from(row.hashedKey);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  await db.update(apiKey).set({ lastUsedAt: new Date() }).where(eq(apiKey.id, row.id));
  return row.organizationId;
}