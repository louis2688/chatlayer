import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { eq, sql } from "drizzle-orm";
import { bot, conversation, message, member } from "../lib/db/schema.ts";

const db = drizzle(createClient({ url: process.env.DATABASE_URL || "file:local.db" }), { schema: { bot, conversation, message, member } });
const webhook = process.env.N8N_WEBHOOK_URL || "http://localhost:5678/webhook/mock/chat";

// bot table was wiped -> all conversations/messages are orphaned; clean them
await db.run(sql`delete from message where conversationId in (select id from conversation where botId not in (select id from bot))`);
await db.run(sql`delete from conversation where botId not in (select id from bot)`);

if (!(await db.query.bot.findFirst({ where: eq(bot.id, "demo") }))) {
  await db.insert(bot).values({
    id: "demo", organizationId: "demo-org", name: "ChatLayer Support",
    welcome: "Hi! I'm ChatLayer Support. Ask me anything about your order, our products, or pricing.",
    color: "#10b981", suggestedPrompts: ["What can you do?", "Pricing plans", "Talk to a human"],
    webhookUrl: webhook, isPublic: true, allowedOrigins: [],
  });
  console.log("demo bot recreated");
}

const louisOrg = (await db.select({ id: member.organizationId }).from(member))[0]?.id;
if (louisOrg && louisOrg !== "demo-org") {
  const existing = await db.select().from(bot).where(eq(bot.organizationId, louisOrg));
  if (existing.length === 0) {
    const [row] = await db.insert(bot).values({
      organizationId: louisOrg, name: "Sales Assistant",
      welcome: "Hi! Ask me about pricing or book a demo.",
      color: "#10b981", suggestedPrompts: ["What are your prices?", "Book a demo"],
      webhookUrl: webhook, isPublic: true, allowedOrigins: [],
    }).returning();
    console.log("Sales Assistant recreated in", louisOrg, "id", row.id);
  }
}
console.log("recovery done");
process.exit(0);