import { randomUUID } from "node:crypto";
import { cache } from "react";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "./auth";
import { db } from "./db";
import { member, organization } from "./db/schema";

// Memoized per request so the layout and the page don't each re-run the auth
// lookup on every navigation.
export const getServerSession = cache(async () => auth.api.getSession({ headers: await headers() }));

export type ActiveContext = {
  user: { id: string; name: string; email: string };
  orgId: string;
  orgName: string;
  role: string;
};

export const requireContext = cache(async (): Promise<ActiveContext> => {
  const s = await getServerSession();
  if (!s) redirect("/login");
  const user = s.user;

  // Membership + org details in a single round-trip.
  const rows = await db
    .select({
      orgId: member.organizationId,
      role: member.role,
      name: organization.name,
      brandName: organization.brandName,
    })
    .from(member)
    .innerJoin(organization, eq(member.organizationId, organization.id))
    .where(eq(member.userId, user.id))
    .limit(1);
  let ctx = rows[0];

  if (!ctx) {
    // First login: create the workspace idempotently (concurrent calls are safe).
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
      ctx = { orgId: org.id, role: "owner", name: org.name, brandName: org.brandName };
    }
  }
  if (!ctx) redirect("/login");

  return {
    user: { id: user.id, name: user.name, email: user.email },
    orgId: ctx.orgId,
    orgName: ctx.brandName || ctx.name || "Workspace",
    role: ctx.role,
  };
});
