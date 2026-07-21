import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "./auth";
import { db } from "./db";
import { member, organization } from "./db/schema";

export async function getServerSession() {
  return auth.api.getSession({ headers: await headers() });
}

export type ActiveContext = {
  user: { id: string; name: string; email: string };
  orgId: string;
  orgName: string;
  role: string;
};

// Resolve the signed-in user and their organization. Read-only w.r.t. cookies
// (safe to call during render): the active org is the user's first membership,
// created on first use. Redirects to /login when unauthenticated.
export async function requireContext(): Promise<ActiveContext> {
  const s = await getServerSession();
  if (!s) redirect("/login");
  const user = s.user;

  let m = await db.query.member.findFirst({ where: eq(member.userId, user.id) });
  if (!m) {
    // Deterministic slug + conflict-safe inserts so concurrent calls (layout +
    // page both run requireContext) don't collide when creating the first org.
    const base = (user.name || user.email.split("@")[0]).trim();
    const slug = `w-${user.id.slice(0, 8)}`;
    await db
      .insert(organization)
      .values({ id: randomUUID(), name: `${base}'s workspace`, slug })
      .onConflictDoNothing({ target: organization.slug });
    const org = await db.query.organization.findFirst({ where: eq(organization.slug, slug) });
    if (org) {
      await db
        .insert(member)
        .values({ id: randomUUID(), organizationId: org.id, userId: user.id, role: "owner" })
        .onConflictDoNothing({ target: [member.organizationId, member.userId] });
    }
    m = await db.query.member.findFirst({ where: eq(member.userId, user.id) });
  }

  const org = await db.query.organization.findFirst({ where: eq(organization.id, m!.organizationId) });
  return {
    user: { id: user.id, name: user.name, email: user.email },
    orgId: m!.organizationId,
    orgName: org?.brandName || org?.name || "Workspace",
    role: m!.role,
  };
}