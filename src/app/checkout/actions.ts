"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { checkoutSchema } from "@/server/validators/checkout";
import { createOrderFromCart } from "@/server/services/orderService";
import { getCartWithDetails } from "@/server/services/cartService";
import { CART_COOKIE_NAME } from "@/lib/cart/session";

const ATTRIBUTION_COOKIE = "td_attribution";

export type CheckoutActionState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

export async function submitCheckoutAction(
  _prevState: CheckoutActionState,
  formData: FormData
): Promise<CheckoutActionState> {
  const sessionId = cookies().get(CART_COOKIE_NAME)?.value;
  if (!sessionId) return { error: "Кошик порожній." };

  const { items } = await getCartWithDetails(sessionId);
  if (items.length === 0) return { error: "Кошик порожній." };

  const raw = {
    customerName: String(formData.get("customerName") ?? ""),
    customerPhone: String(formData.get("customerPhone") ?? ""),
    customerEmail: String(formData.get("customerEmail") ?? ""),
    city: String(formData.get("city") ?? ""),
    warehouse: String(formData.get("warehouse") ?? ""),
    shippingMethod: String(formData.get("shippingMethod") ?? "NOVA_POSHTA_BRANCH"),
    paymentMethod: String(formData.get("paymentMethod") ?? "CASH_ON_DELIVERY"),
    comment: String(formData.get("comment") ?? ""),
    cart: items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
  };

  const parsed = checkoutSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[String(issue.path[0])] = issue.message;
    }
    return { error: "Перевірте форму.", fieldErrors };
  }

  let attribution = {};
  const attributionCookie = cookies().get(ATTRIBUTION_COOKIE)?.value;
  if (attributionCookie) {
    try {
      attribution = JSON.parse(attributionCookie);
    } catch {
      attribution = {};
    }
  }

  let orderNumber: string;
  try {
    const order = await createOrderFromCart(sessionId, parsed.data, attribution);
    orderNumber = order.orderNumber;
  } catch (err) {
    const message = err instanceof Error ? err.message : "UNKNOWN";
    if (message.startsWith("OUT_OF_STOCK")) {
      return { error: "Один із товарів у кошику щойно закінчився. Оновіть кошик." };
    }
    if (message === "EMPTY_CART") {
      return { error: "Кошик порожній." };
    }
    console.error("Checkout failed", err);
    return { error: "Не вдалося оформити замовлення. Спробуйте ще раз." };
  }

  redirect(`/order/success/${orderNumber}`);
}
