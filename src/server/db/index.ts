import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set. Copy .env.example to .env.local and fill it in.");
}

// A single pooled connection reused across the app (works well with Vercel + Neon/Supabase).
const client = postgres(process.env.DATABASE_URL, { max: 1 });

export const db = drizzle(client, { schema });
export * as schemaTables from "./schema";
