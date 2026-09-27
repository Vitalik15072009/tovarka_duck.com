import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "@/server/db";
import { users } from "@/server/db/schema";

export async function verifyAdminCredentials(email: string, password: string) {
  const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1);
  if (!user || !user.isActive) return null;

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return null;

  await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, user.id));

  return { id: user.id, email: user.email, role: user.role, name: user.name };
}

/** Used by the seed script / a one-off setup script to create the first admin user. */
export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}
