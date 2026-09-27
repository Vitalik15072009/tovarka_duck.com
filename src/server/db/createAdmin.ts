import { db } from "./index";
import { users } from "./schema";
import { hashPassword } from "@/server/services/authService";

/**
 * One-off script to create the first admin user.
 * Usage: tsx src/server/db/createAdmin.ts admin@tovarkaduck.com "StrongPassword123"
 */
async function main() {
  const [, , email, password] = process.argv;
  if (!email || !password) {
    console.error('Usage: tsx src/server/db/createAdmin.ts <email> "<password>"');
    process.exit(1);
  }

  const passwordHash = await hashPassword(password);
  await db.insert(users).values({
    email: email.toLowerCase(),
    passwordHash,
    name: "Admin",
    role: "ADMIN",
  });

  console.log(`Admin user created: ${email}`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
