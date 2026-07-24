import { sql } from "drizzle-orm";
import { UAParser } from "ua-parser-js";
import { db } from "./db";
import { chatSession } from "./db/schema";

export type SessionMeta = {
  ip?: string | null;
  ua?: string | null;
  country?: string | null;
  region?: string | null;
  city?: string | null;
};
export type Lead = { name?: string; email?: string; phone?: string };

function uaBits(ua?: string | null) {
  const r = ua ? new UAParser(ua).getResult() : null;
  return { browser: r?.browser.name ?? null, os: r?.os.name ?? null, device: r?.device.type ?? "desktop" };
}

// Per user message (chat route). Creates the session row on the first message of
// an anonymous chat, or just bumps the counter + lastSeenAt when the row already
// exists (lead sessions are created up front by recordLeadSession). Never
// overwrites the lead fields or the first-seen geo.
export async function recordSession(botId: string, sessionId: string, meta: SessionMeta) {
  const { browser, os, device } = uaBits(meta.ua);
  await db
    .insert(chatSession)
    .values({
      botId,
      sessionId,
      ip: meta.ip ?? null,
      country: meta.country ?? null,
      region: meta.region ?? null,
      city: meta.city ?? null,
      browser,
      os,
      device,
      messages: 1,
    })
    .onConflictDoUpdate({
      target: [chatSession.botId, chatSession.sessionId],
      set: { messages: sql`${chatSession.messages} + 1`, lastSeenAt: new Date() },
    });
}

// Lead capture (session route): persist the visitor's details on the session
// before the chat starts. messages stays 0 until the first real message.
export async function recordLeadSession(botId: string, sessionId: string, meta: SessionMeta, lead: Lead) {
  const { browser, os, device } = uaBits(meta.ua);
  await db
    .insert(chatSession)
    .values({
      botId,
      sessionId,
      ip: meta.ip ?? null,
      country: meta.country ?? null,
      region: meta.region ?? null,
      city: meta.city ?? null,
      browser,
      os,
      device,
      name: lead.name ?? null,
      email: lead.email ?? null,
      phone: lead.phone ?? null,
      messages: 0,
    })
    .onConflictDoUpdate({
      target: [chatSession.botId, chatSession.sessionId],
      set: { name: lead.name ?? null, email: lead.email ?? null, phone: lead.phone ?? null, lastSeenAt: new Date() },
    });
}