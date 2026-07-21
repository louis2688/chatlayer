import { sql } from "drizzle-orm";
import { UAParser } from "ua-parser-js";
import { db } from "./db";
import { chatSession } from "./db/schema";

export type SessionMeta = { ip?: string | null; ua?: string | null; country?: string | null };

// Upsert one row per (bot, session). First message creates it with the parsed
// user-agent (browser/os/device), ip and geo country; later messages just bump
// the counter and lastSeenAt. Metadata only, no message text is stored.
export async function recordSession(botId: string, sessionId: string, meta: SessionMeta) {
  const r = meta.ua ? new UAParser(meta.ua).getResult() : null;
  await db
    .insert(chatSession)
    .values({
      botId,
      sessionId,
      ip: meta.ip ?? null,
      country: meta.country ?? null,
      browser: r?.browser.name ?? null,
      os: r?.os.name ?? null,
      device: r?.device.type ?? "desktop", // ua-parser leaves desktop undefined
      messages: 1,
    })
    .onConflictDoUpdate({
      target: [chatSession.botId, chatSession.sessionId],
      set: { messages: sql`${chatSession.messages} + 1`, lastSeenAt: new Date() },
    });
}