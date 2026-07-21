import { and, eq } from "drizzle-orm";
import { db } from "./db";
import { conversation, message } from "./db/schema";

// Upsert the (bot, session) conversation atomically (unique index prevents the
// TOCTOU double-insert), then append the exchange.
export async function recordExchange(
  botId: string,
  sessionId: string,
  userId: string | null,
  userText: string,
  botText: string,
) {
  await db
    .insert(conversation)
    .values({ botId, sessionId, userId })
    .onConflictDoNothing({ target: [conversation.botId, conversation.sessionId] });
  const conv = await db.query.conversation.findFirst({
    where: and(eq(conversation.botId, botId), eq(conversation.sessionId, sessionId)),
  });
  if (!conv) return;
  await db.insert(message).values([
    { conversationId: conv.id, role: "user", content: userText },
    { conversationId: conv.id, role: "bot", content: botText },
  ]);
}