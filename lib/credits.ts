import { and, desc, eq, gt, sql } from "drizzle-orm";
import { db } from "./db";
import { creditTxn, organization } from "./db/schema";

export type CreditPackage = { id: string; label: string; credits: number; price: number; popular?: boolean };

export const PACKAGES: CreditPackage[] = [
  { id: "starter", label: "Starter", credits: 5000, price: 19 },
  { id: "growth", label: "Growth", credits: 10000, price: 39 },
  { id: "professional", label: "Professional", credits: 25000, price: 70, popular: true },
  { id: "ultimate", label: "Ultimate", credits: 100000, price: 199 },
];

export async function getBalance(orgId: string): Promise<number> {
  const o = await db.query.organization.findFirst({ where: eq(organization.id, orgId) });
  return o?.credits ?? 0;
}

// Atomic decrement guarded by balance > 0. Returns false when out of credits.
export async function consumeCredit(orgId: string, reason = "message"): Promise<boolean> {
  const res = await db
    .update(organization)
    .set({ credits: sql`${organization.credits} - 1` })
    .where(and(eq(organization.id, orgId), gt(organization.credits, 0)))
    .returning({ credits: organization.credits });
  if (res.length === 0) return false;
  await db.insert(creditTxn).values({ organizationId: orgId, delta: -1, reason }).catch(() => {});
  return true;
}

export async function addCredits(orgId: string, amount: number, reason: string): Promise<void> {
  await db.update(organization).set({ credits: sql`${organization.credits} + ${amount}` }).where(eq(organization.id, orgId));
  await db.insert(creditTxn).values({ organizationId: orgId, delta: amount, reason });
}

export async function recentTxns(orgId: string, limit = 10) {
  return db.select().from(creditTxn).where(eq(creditTxn.organizationId, orgId)).orderBy(desc(creditTxn.createdAt)).limit(limit);
}