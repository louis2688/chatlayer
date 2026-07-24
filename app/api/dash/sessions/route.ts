import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { member } from "@/lib/db/schema";
import { recentSessions, activeSessionCount } from "@/lib/analytics";
import { rateLimit } from "@/lib/ratelimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Cookie-authed read for the dashboard's live Sessions view to poll.
export async function GET() {
  const s = await auth.api.getSession({ headers: await headers() });
  if (!s) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const m = await db.query.member.findFirst({ where: eq(member.userId, s.user.id) });
  if (!m) return NextResponse.json({ error: "no_org" }, { status: 403 });
  const rl = await rateLimit(`dash:sessions:${s.user.id}`, 30, 60_000);
  if (!rl.ok) return NextResponse.json({ error: "rate_limited" }, { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } });
  const [sessions, active] = await Promise.all([
    recentSessions(m.organizationId, 100),
    activeSessionCount(m.organizationId),
  ]);
  return NextResponse.json({ sessions, active }, { headers: { "Cache-Control": "no-store" } });
}