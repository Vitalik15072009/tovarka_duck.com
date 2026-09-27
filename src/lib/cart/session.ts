import { cookies } from "next/headers";

export const CART_COOKIE_NAME = "td_cart_session";

/** Reads the guest cart session id from cookies without creating one. */
export function readCartSessionId(): string | undefined {
  return cookies().get(CART_COOKIE_NAME)?.value;
}
