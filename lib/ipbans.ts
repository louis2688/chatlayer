import { and, desc, eq } from "drizzle-orm";
import { db } from "./db";
import { ipBan } from "./db/schema";

export async function isIpBanned(orgId: string, ip: string | null | undefined): Promise<boolean> {
  if (!ip || ip === "unknown") return false;
  const row = await db.query.ipBan.findFirst({
    where: and(eq(ipBan.organizationId, orgId), eq(ipBan.ip, ip)),
  });
  return !!row;
}

export function listIpBans(orgId: string) {
  return db.query.ipBan.findMany({
    where: eq(ipBan.organizationId, orgId),
    orderBy: [desc(ipBan.createdAt)],
  });
}

export async function addIpBan(orgId: string, ip: string, reason?: string | null) {
  const clean = ip.trim();
  if (!clean) return;
  await db
    .insert(ipBan)
    .values({ organizationId: orgId, ip: clean, reason: reason || null })
    .onConflictDoNothing({ target: [ipBan.organizationId, ipBan.ip] });
}

export async function removeIpBan(orgId: string, id: string) {
  await db.delete(ipBan).where(and(eq(ipBan.id, id), eq(ipBan.organizationId, orgId)));
}