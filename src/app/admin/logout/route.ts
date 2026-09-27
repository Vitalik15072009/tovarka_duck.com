import { NextResponse } from "next/server";
import { clearAdminSession } from "@/server/auth/session";

export async function POST(request: Request) {
  clearAdminSession();
  return NextResponse.redirect(new URL("/admin/login", request.url));
}
