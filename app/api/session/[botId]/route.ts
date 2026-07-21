import { NextRequest, NextResponse } from "next/server";
import { corsHeaders, originAllowed, clientIp } from "@/lib/config";
import { rateLimit } from "@/lib/ratelimit";
import { issueSession } from "@/lib/token";
import { getBot } from "@/lib/bots";

export const runtime = "nodejs";

type Params = { params: Promise<{ botId: string }> };

export async function OPTIONS(req: NextRequest, { params }: Params) {
  const bot = await getBot((await params).botId);
  return new NextResponse(null, { status: 204, headers: corsHeaders(req, bot?.allowedOrigins ?? []) });
}

// Anonymous widget session for a PUBLIC bot. The parent page cross-origin fetch
// carries a real Origin header, checked against the bot allowlist here, so the
// token is only issued to approved sites.
export async function POST(req: NextRequest, { params }: Params) {
  const bot = await getBot((await params).botId);
  if (!bot) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const cors = corsHeaders(req, bot.allowedOrigins ?? []);
  if (!bot.isPublic) {
    return NextResponse.json({ error: "auth_required" }, { status: 403, headers: cors });
  }
  if (!originAllowed(req, bot.allowedOrigins ?? [])) {
    return NextResponse.json({ error: "origin_not_allowed" }, { status: 403, headers: cors });
  }
  const rl = rateLimit(`session:${bot.id}:${clientIp(req)}`, 10, 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "rate_limited" },
      { status: 429, headers: { ...cors, "Retry-After": String(rl.retryAfterSec) } },
    );
  }
  return NextResponse.json({ token: issueSession(bot.id) }, { headers: cors });
}