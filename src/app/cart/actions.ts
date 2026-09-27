"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { updateCartItemQuantity, removeCartItem } from "@/server/services/cartService";
import { CART_COOKIE_NAME } from "@/lib/cart/session";

export async function updateQuantityAction(itemId: number, quantity: number) {
  const sessionId = cookies().get(CART_COOKIE_NAME)?.value;
  if (!sessionId) return;
  await updateCartItemQuantity(sessionId, itemId, quantity);
  revalidatePath("/cart");
}

export async function removeItemAction(itemId: number) {
  const sessionId = cookies().get(CART_COOKIE_NAME)?.value;
  if (!sessionId) return;
  await removeCartItem(sessionId, itemId);
  revalidatePath("/cart");
}
