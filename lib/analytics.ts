import { and, count, desc, eq, gte, sql } from "drizzle-orm";
import { db } from "./db";
import { bot, chatSession } from "./db/schema";

// Everything derives from chatSession (one row per session, metadata only). No
// message text is stored or read.

export type OrgStats = {
  bots: number;
  sessions: number;
  messages: number;
  countries: number;
};

export async function orgStats(orgId: string): Promise<OrgStats> {
  const [bots, sessions, messages, countries] = await Promise.all([
    db.select({ n: count() }).from(bot).where(eq(bot.organizationId, orgId)),
    db
      .select({ n: count() })
      .from(chatSession)
      .innerJoin(bot, eq(chatSession.botId, bot.id))
      .where(eq(bot.organizationId, orgId)),
    db
      .select({ n: sql<number>`coalesce(sum(${chatSession.messages}), 0)` })
      .from(chatSession)
      .innerJoin(bot, eq(chatSession.botId, bot.id))
      .where(eq(bot.organizationId, orgId)),
    db
      .select({ n: sql<number>`count(distinct ${chatSession.country})` })
      .from(chatSession)
      .innerJoin(bot, eq(chatSession.botId, bot.id))
      .where(eq(bot.organizationId, orgId)),
  ]);
  return {
    bots: bots[0]?.n ?? 0,
    sessions: sessions[0]?.n ?? 0,
    messages: Number(messages[0]?.n ?? 0),
    countries: Number(countries[0]?.n ?? 0),
  };
}

// New sessions per day, last N days.
export async function dailySessions(orgId: string, days = 14): Promise<{ day: string; n: number }[]> {
  const cutoff = new Date(Date.now() - (days - 1) * 86400_000);
  cutoff.setHours(0, 0, 0, 0);
  const rows = await db
    .select({ day: sql<string>`to_char(${chatSession.createdAt} AT TIME ZONE 'UTC', 'YYYY-MM-DD')`, n: count() })
    .from(chatSession)
    .innerJoin(bot, eq(chatSession.botId, bot.id))
    .where(and(eq(bot.organizationId, orgId), gte(chatSession.createdAt, cutoff)))
    .groupBy(sql`to_char(${chatSession.createdAt} AT TIME ZONE 'UTC', 'YYYY-MM-DD')`);
  const byDay = new Map(rows.map((r) => [r.day, Number(r.n)]));
  const out: { day: string; n: number }[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(cutoff.getTime() + i * 86400_000);
    const key = d.toISOString().slice(0, 10);
    out.push({ day: key, n: byDay.get(key) ?? 0 });
  }
  return out;
}

// Sessions per bot.
export async function perBotCounts(orgId: string): Promise<{ name: string; n: number }[]> {
  const rows = await db
    .select({ name: bot.name, n: count(chatSession.id) })
    .from(bot)
    .leftJoin(chatSession, eq(chatSession.botId, bot.id))
    .where(eq(bot.organizationId, orgId))
    .groupBy(bot.id)
    .orderBy(desc(count(chatSession.id)));
  return rows.map((r) => ({ name: r.name, n: Number(r.n) }));
}

export async function browserBreakdown(orgId: string): Promise<{ label: string; n: number }[]> {
  const rows = await db
    .select({ label: chatSession.browser, n: count() })
    .from(chatSession)
    .innerJoin(bot, eq(chatSession.botId, bot.id))
    .where(eq(bot.organizationId, orgId))
    .groupBy(chatSession.browser)
    .orderBy(desc(count()));
  return rows.map((r) => ({ label: r.label || "Unknown", n: Number(r.n) }));
}

export async function countryBreakdown(orgId: string): Promise<{ label: string; n: number }[]> {
  const rows = await db
    .select({ label: chatSession.country, n: count() })
    .from(chatSession)
    .innerJoin(bot, eq(chatSession.botId, bot.id))
    .where(eq(bot.organizationId, orgId))
    .groupBy(chatSession.country)
    .orderBy(desc(count()));
  return rows.map((r) => ({ label: r.label || "Unknown", n: Number(r.n) }));
}

export type SessionRow = {
  id: string;
  sessionId: string;
  ip: string | null;
  country: string | null;
  browser: string | null;
  os: string | null;
  device: string | null;
  messages: number;
  lastSeenAt: Date;
  botName: string;
};

export async function recentSessions(orgId: string, limit = 50): Promise<SessionRow[]> {
  return db
    .select({
      id: chatSession.id,
      sessionId: chatSession.sessionId,
      ip: chatSession.ip,
      country: chatSession.country,
      browser: chatSession.browser,
      os: chatSession.os,
      device: chatSession.device,
      messages: chatSession.messages,
      lastSeenAt: chatSession.lastSeenAt,
      botName: bot.name,
    })
    .from(chatSession)
    .innerJoin(bot, eq(chatSession.botId, bot.id))
    .where(eq(bot.organizationId, orgId))
    .orderBy(desc(chatSession.lastSeenAt))
    .limit(limit);
}