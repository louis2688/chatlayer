import { sql } from "drizzle-orm";
import { boolean, index, integer, jsonb, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

const uid = () => crypto.randomUUID();
const now = () => new Date();
const ts = (name: string) => timestamp(name, { mode: "date", withTimezone: true });

// --- better-auth core ---
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull().default(false),
  image: text("image"),
  createdAt: ts("createdAt").notNull().$defaultFn(now),
  updatedAt: ts("updatedAt").notNull().$defaultFn(now),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: ts("expiresAt").notNull(),
  token: text("token").notNull().unique(),
  createdAt: ts("createdAt").notNull().$defaultFn(now),
  updatedAt: ts("updatedAt").notNull().$defaultFn(now),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId").notNull().references(() => user.id, { onDelete: "cascade" }),
  activeOrganizationId: text("activeOrganizationId"),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId").notNull().references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: ts("accessTokenExpiresAt"),
  refreshTokenExpiresAt: ts("refreshTokenExpiresAt"),
  scope: text("scope"),
  password: text("password"),
  createdAt: ts("createdAt").notNull().$defaultFn(now),
  updatedAt: ts("updatedAt").notNull().$defaultFn(now),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: ts("expiresAt").notNull(),
  createdAt: ts("createdAt").$defaultFn(now),
  updatedAt: ts("updatedAt").$defaultFn(now),
});

// --- organization plugin ---
export const organization = pgTable("organization", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").unique(),
  logo: text("logo"),
  createdAt: ts("createdAt").notNull().$defaultFn(now),
  metadata: text("metadata"),
  brandName: text("brandName"),
  hideBranding: boolean("hideBranding").notNull().default(false),
  customDomain: text("customDomain"),
  credits: integer("credits").notNull().default(100),
});

export const creditTxn = pgTable("creditTxn", {
  id: text("id").primaryKey().$defaultFn(uid),
  organizationId: text("organizationId").notNull().references(() => organization.id, { onDelete: "cascade" }),
  delta: integer("delta").notNull(),
  reason: text("reason").notNull(),
  createdAt: ts("createdAt").notNull().$defaultFn(now),
});

export const member = pgTable(
  "member",
  {
    id: text("id").primaryKey(),
    organizationId: text("organizationId").notNull().references(() => organization.id, { onDelete: "cascade" }),
    userId: text("userId").notNull().references(() => user.id, { onDelete: "cascade" }),
    role: text("role").notNull().default("member"),
    createdAt: ts("createdAt").notNull().$defaultFn(now),
  },
  (t) => [uniqueIndex("member_org_user_idx").on(t.organizationId, t.userId)],
);

export const invitation = pgTable("invitation", {
  id: text("id").primaryKey(),
  organizationId: text("organizationId").notNull().references(() => organization.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  role: text("role"),
  status: text("status").notNull().default("pending"),
  expiresAt: ts("expiresAt").notNull(),
  inviterId: text("inviterId").notNull().references(() => user.id, { onDelete: "cascade" }),
});

// --- app domain ---
export const bot = pgTable("bot", {
  id: text("id").primaryKey().$defaultFn(uid),
  organizationId: text("organizationId").notNull().references(() => organization.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  welcome: text("welcome").notNull().default("Hi! How can I help you today?"),
  color: text("color").notNull().default("#1c69d4"),
  logoUrl: text("logoUrl"),
  suggestedPrompts: jsonb("suggestedPrompts").$type<string[]>().notNull().default(sql`'[]'::jsonb`),
  webhookUrl: text("webhookUrl").notNull(),
  webhookAuthHeader: text("webhookAuthHeader"),
  webhookAuthValue: text("webhookAuthValue"),
  isPublic: boolean("isPublic").notNull().default(true),
  allowedOrigins: jsonb("allowedOrigins").$type<string[]>().notNull().default(sql`'[]'::jsonb`),
  ratePerSession: integer("ratePerSession").notNull().default(20),
  ratePerIp: integer("ratePerIp").notNull().default(60),
  rtl: boolean("rtl").notNull().default(false),
  customCss: text("customCss"),
  consentRequired: boolean("consentRequired").notNull().default(false),
  consentText: text("consentText"),
  allowFileUpload: boolean("allowFileUpload").notNull().default(false),
  maxFileSizeMb: integer("maxFileSizeMb").notNull().default(5),
  allowedFileTypes: jsonb("allowedFileTypes").$type<string[]>().notNull().default(sql`'[]'::jsonb`),
  createdAt: ts("createdAt").notNull().$defaultFn(now),
});

// Content-free usage events: one row per handled user message. Powers the
// stats/analytics (counts, per-day, per-bot, distinct sessions) without ever
// storing message text. ChatLayer is a secure UI + router, not a chat store.
export const usageEvent = pgTable(
  "usageEvent",
  {
    id: text("id").primaryKey().$defaultFn(uid),
    botId: text("botId").notNull().references(() => bot.id, { onDelete: "cascade" }),
    sessionId: text("sessionId").notNull(),
    createdAt: ts("createdAt").notNull().$defaultFn(now),
  },
  (t) => [index("usage_bot_idx").on(t.botId), index("usage_created_idx").on(t.createdAt)],
);

export const apiKey = pgTable("apiKey", {
  id: text("id").primaryKey().$defaultFn(uid),
  organizationId: text("organizationId").notNull().references(() => organization.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  hashedKey: text("hashedKey").notNull().unique(),
  prefix: text("prefix").notNull(),
  createdAt: ts("createdAt").notNull().$defaultFn(now),
  lastUsedAt: ts("lastUsedAt"),
});