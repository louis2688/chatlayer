import { sql } from "drizzle-orm";
import { integer, sqliteTable, text, index, uniqueIndex } from "drizzle-orm/sqlite-core";

const uid = () => crypto.randomUUID();
const now = () => new Date();

// --- better-auth core ---
export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("emailVerified", { mode: "boolean" }).notNull().default(false),
  image: text("image"),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(now),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().$defaultFn(now),
});

export const session = sqliteTable("session", {
  id: text("id").primaryKey(),
  expiresAt: integer("expiresAt", { mode: "timestamp" }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(now),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().$defaultFn(now),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId").notNull().references(() => user.id, { onDelete: "cascade" }),
  activeOrganizationId: text("activeOrganizationId"),
});

export const account = sqliteTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId").notNull().references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: integer("accessTokenExpiresAt", { mode: "timestamp" }),
  refreshTokenExpiresAt: integer("refreshTokenExpiresAt", { mode: "timestamp" }),
  scope: text("scope"),
  password: text("password"),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(now),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().$defaultFn(now),
});

export const verification = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expiresAt", { mode: "timestamp" }).notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).$defaultFn(now),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).$defaultFn(now),
});

// --- organization plugin (also powers V3 teams / white-label) ---
export const organization = sqliteTable("organization", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").unique(),
  logo: text("logo"),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(now),
  metadata: text("metadata"),
  // V3 white-label
  brandName: text("brandName"),
  hideBranding: integer("hideBranding", { mode: "boolean" }).notNull().default(false),
  customDomain: text("customDomain"),
  // billing: message credits (1 credit = 1 user message)
  credits: integer("credits").notNull().default(100),
});

export const creditTxn = sqliteTable("creditTxn", {
  id: text("id").primaryKey().$defaultFn(uid),
  organizationId: text("organizationId").notNull().references(() => organization.id, { onDelete: "cascade" }),
  delta: integer("delta").notNull(),
  reason: text("reason").notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(now),
});

export const member = sqliteTable("member", {
  id: text("id").primaryKey(),
  organizationId: text("organizationId").notNull().references(() => organization.id, { onDelete: "cascade" }),
  userId: text("userId").notNull().references(() => user.id, { onDelete: "cascade" }),
  role: text("role").notNull().default("member"),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(now),
});

export const invitation = sqliteTable("invitation", {
  id: text("id").primaryKey(),
  organizationId: text("organizationId").notNull().references(() => organization.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  role: text("role"),
  status: text("status").notNull().default("pending"),
  expiresAt: integer("expiresAt", { mode: "timestamp" }).notNull(),
  inviterId: text("inviterId").notNull().references(() => user.id, { onDelete: "cascade" }),
});

// --- app domain ---
export const bot = sqliteTable("bot", {
  id: text("id").primaryKey().$defaultFn(uid),
  organizationId: text("organizationId").notNull().references(() => organization.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  welcome: text("welcome").notNull().default("Hi! How can I help you today?"),
  color: text("color").notNull().default("#10b981"),
  logoUrl: text("logoUrl"),
  suggestedPrompts: text("suggestedPrompts", { mode: "json" }).notNull().$type<string[]>().default(sql`'[]'`),
  webhookUrl: text("webhookUrl").notNull(),
  webhookAuthHeader: text("webhookAuthHeader"),
  webhookAuthValue: text("webhookAuthValue"),
  isPublic: integer("isPublic", { mode: "boolean" }).notNull().default(true),
  allowedOrigins: text("allowedOrigins", { mode: "json" }).notNull().$type<string[]>().default(sql`'[]'`),
  ratePerSession: integer("ratePerSession").notNull().default(20),
  ratePerIp: integer("ratePerIp").notNull().default(60),
  // widget-parity options
  rtl: integer("rtl", { mode: "boolean" }).notNull().default(false),
  customCss: text("customCss"),
  consentRequired: integer("consentRequired", { mode: "boolean" }).notNull().default(false),
  consentText: text("consentText"),
  allowFileUpload: integer("allowFileUpload", { mode: "boolean" }).notNull().default(false),
  maxFileSizeMb: integer("maxFileSizeMb").notNull().default(5),
  allowedFileTypes: text("allowedFileTypes", { mode: "json" }).notNull().$type<string[]>().default(sql`'[]'`),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(now),
});

export const conversation = sqliteTable(
  "conversation",
  {
    id: text("id").primaryKey().$defaultFn(uid),
    botId: text("botId").notNull().references(() => bot.id, { onDelete: "cascade" }),
    sessionId: text("sessionId").notNull(),
    userId: text("userId"),
    createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(now),
  },
  (t) => [uniqueIndex("conv_bot_session_idx").on(t.botId, t.sessionId)],
);

export const message = sqliteTable(
  "message",
  {
    id: text("id").primaryKey().$defaultFn(uid),
    conversationId: text("conversationId").notNull().references(() => conversation.id, { onDelete: "cascade" }),
    role: text("role").notNull(),
    content: text("content").notNull(),
    createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(now),
  },
  (t) => [index("msg_conv_idx").on(t.conversationId)],
);

// Org-scoped keys for programmatic (server-to-server) chat API access.
export const apiKey = sqliteTable("apiKey", {
  id: text("id").primaryKey().$defaultFn(uid),
  organizationId: text("organizationId").notNull().references(() => organization.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  hashedKey: text("hashedKey").notNull().unique(),
  prefix: text("prefix").notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(now),
  lastUsedAt: integer("lastUsedAt", { mode: "timestamp" }),
});