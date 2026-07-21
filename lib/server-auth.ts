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
    const orgId = randomUUID();
    const base = (user.name || user.email.split("@")[0]).trim();
    await db.insert(organization).values({
      id: orgId,
      name: `${base}'s workspace`,
      slug: `w-${user.id.slice(0, 8)}`,
    });
    await db.insert(member).values({ id: randomUUID(), organizationId: orgId, userId: user.id, role: "owner" });
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