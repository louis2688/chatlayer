import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
// prepare:false is required for pooled (transaction-mode) connections such as
// Neon's pooler or Supabase's PgBouncer.
const client = postgres(url!, { prepare: false });

export const db = drizzle(client, { schema });
export { schema };
