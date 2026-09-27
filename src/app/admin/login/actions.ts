"use server";

import { redirect } from "next/navigation";
import { verifyAdminCredentials } from "@/server/services/authService";
import { createAdminSession } from "@/server/auth/session";

export type LoginState = { error?: string };

export async function loginAction(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const user = await verifyAdminCredentials(email, password);
  if (!user) {
    return { error: "Невірний email або пароль." };
  }

  await createAdminSession({ userId: user.id, role: user.role as "ADMIN" | "MANAGER" | "EDITOR", email: user.email });
  redirect("/admin/dashboard");
}
