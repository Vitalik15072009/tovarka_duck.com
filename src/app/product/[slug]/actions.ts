"use server";

import { cookies } from "next/headers";
import { nanoid } from "nanoid";
import { addToCart } from "@/server/services/cartService";
import { CART_COOKIE_NAME } from "@/lib/cart/session";

export async function addToCartAction(variantId: number, quantity: number) {
  const cookieStore = cookies();
  let sessionId = cookieStore.get(CART_COOKIE_NAME)?.value;

  if (!sessionId) {
    sessionId = nanoid(24);
    cookieStore.set(CART_COOKIE_NAME, sessionId, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });
  }

  await addToCart(sessionId, variantId, quantity);
  return { ok: true };
}
