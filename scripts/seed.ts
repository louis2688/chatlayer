import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { eq } from "drizzle-orm";
import { organization, bot } from "../lib/db/schema.ts";

const client = createClient({ url: process.env.DATABASE_URL || "file:local.db" });
const db = drizzle(client, { schema: { organization, bot } });
const webhook = process.env.N8N_WEBHOOK_URL || "http://localhost:5678/webhook/mock/chat";

await db.insert(organization).values({ id: "demo-org", name: "ChatLayer Demo" }).onConflictDoNothing();

const existing = await db.query.bot.findFirst({ where: eq(bot.id, "demo") });
if (!existing) {
  await db.insert(bot).values({
    id: "demo",
    organizationId: "demo-org",
    name: "ChatLayer Support",
    welcome: "Hi! I'm ChatLayer Support. Ask me anything about your order, our products, or pricing.",
    color: "#10b981",
    suggestedPrompts: ["What can you do?", "Pricing plans", "Talk to a human"],
    webhookUrl: webhook,
    isPublic: true,
    allowedOrigins: [],
  });
  console.log("seeded demo bot (id: demo) ->", webhook);
} else {
  console.log("demo bot already exists");
}
process.exit(0);