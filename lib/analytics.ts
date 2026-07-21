import { and, count, desc, eq, gte, sql } from "drizzle-orm";
import { db } from "./db";
import { bot, conversation, message } from "./db/schema";

export type OrgStats = {
  bots: number;
  conversations: number;
  messagesToday: number;
  messagesTotal: number;
};

export async function orgStats(orgId: string): Promise<OrgStats> {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [bots, convs, total, today] = await Promise.all([
    db.select({ n: count() }).from(bot).where(eq(bot.organizationId, orgId)),
    db
      .select({ n: count() })
      .from(conversation)
      .innerJoin(bot, eq(conversation.botId, bot.id))
      .where(eq(bot.organizationId, orgId)),
    db
      .select({ n: count() })
      .from(message)
      .innerJoin(conversation, eq(message.conversationId, conversation.id))
      .innerJoin(bot, eq(conversation.botId, bot.id))
      .where(eq(bot.organizationId, orgId)),
    db
      .select({ n: count() })
      .from(message)
      .innerJoin(conversation, eq(message.conversationId, conversation.id))
      .innerJoin(bot, eq(conversation.botId, bot.id))
      .where(and(eq(bot.organizationId, orgId), gte(message.createdAt, startOfToday))),
  ]);

  return {
    bots: bots[0]?.n ?? 0,
    conversations: convs[0]?.n ?? 0,
    messagesToday: today[0]?.n ?? 0,
    messagesTotal: total[0]?.n ?? 0,
  };
}

export async function dailyMessages(orgId: string, days = 14): Promise<{ day: string; n: number }[]> {
  const cutoff = new Date(Date.now() - (days - 1) * 86400_000);
  cutoff.setHours(0, 0, 0, 0);
  const rows = await db
    .select({ day: sql<string>`to_char(${message.createdAt} AT TIME ZONE 'UTC', 'YYYY-MM-DD')`, n: count() })
    .from(message)
    .innerJoin(conversation, eq(message.conversationId, conversation.id))
    .innerJoin(bot, eq(conversation.botId, bot.id))
    .where(and(eq(bot.organizationId, orgId), gte(message.createdAt, cutoff)))
    .groupBy(sql`to_char(${message.createdAt} AT TIME ZONE 'UTC', 'YYYY-MM-DD')`);
  const byDay = new Map(rows.map((r) => [r.day, Number(r.n)]));
  const out: { day: string; n: number }[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(cutoff.getTime() + i * 86400_000);
    const key = d.toISOString().slice(0, 10);
    out.push({ day: key, n: byDay.get(key) ?? 0 });
  }
  return out;
}

export async function perBotCounts(orgId: string): Promise<{ name: string; n: number }[]> {
  const rows = await db
    .select({ name: bot.name, n: count(message.id) })
    .from(bot)
    .leftJoin(conversation, eq(conversation.botId, bot.id))
    .leftJoin(message, eq(message.conversationId, conversation.id))
    .where(eq(bot.organizationId, orgId))
    .groupBy(bot.id)
    .orderBy(desc(count(message.id)));
  return rows.map((r) => ({ name: r.name, n: Number(r.n) }));
}