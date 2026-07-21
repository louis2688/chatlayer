import { db } from "./db";
import { usageEvent } from "./db/schema";

// Record one content-free usage event per handled user message. We store the
// bot, the (anonymous) session id, and a timestamp so the dashboard can show
// stats. We deliberately do NOT store message text: ChatLayer is a secure UI +
// router for n8n, not a conversation store, so there is no message content to
// retain, leak, or be compelled to produce.
export async function recordUsage(botId: string, sessionId: string) {
  await db.insert(usageEvent).values({ botId, sessionId });
}