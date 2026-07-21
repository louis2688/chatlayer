import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "./db";
import { bot, conversation, message } from "./db/schema";

export type ConversationRow = {
  id: string;
  botName: string;
  sessionId: string;
  createdAt: Date;
  messages: number;
  lastMessage: string | null;
};

export async function listConversations(orgId: string, limit = 100): Promise<ConversationRow[]> {
  const rows = await db
    .select({
      id: conversation.id,
      sessionId: conversation.sessionId,
      createdAt: conversation.createdAt,
      botName: bot.name,
      messages: sql<number>`(select count(*) from ${message} where ${message.conversationId} = ${conversation.id})`,
      lastMessage: sql<string | null>`(select ${message.content} from ${message} where ${message.conversationId} = ${conversation.id} order by ${message.seq} desc limit 1)`,
    })
    .from(conversation)
    .innerJoin(bot, eq(conversation.botId, bot.id))
    .where(eq(bot.organizationId, orgId))
    .orderBy(desc(conversation.createdAt))
    .limit(limit);
  return rows.map((r) => ({ ...r, messages: Number(r.messages) }));
}

export async function getConversationMessages(orgId: string, conversationId: string) {
  const conv = await db
    .select({ id: conversation.id, botName: bot.name, sessionId: conversation.sessionId })
    .from(conversation)
    .innerJoin(bot, eq(conversation.botId, bot.id))
    .where(and(eq(conversation.id, conversationId), eq(bot.organizationId, orgId)))
    .limit(1);
  if (conv.length === 0) return null;
  const msgs = await db.select().from(message).where(eq(message.conversationId, conversationId)).orderBy(message.seq);
  return { ...conv[0], messages: msgs };
}