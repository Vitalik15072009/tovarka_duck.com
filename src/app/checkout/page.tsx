import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getCartWithDetails } from "@/server/services/cartService";
import { CART_COOKIE_NAME } from "@/lib/cart/session";
import { CheckoutForm } from "@/components/cart/CheckoutForm";
import { formatPrice } from "@/lib/utils/formatPrice";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({ title: "Оформлення замовлення", path: "/checkout" });
export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const sessionId = cookies().get(CART_COOKIE_NAME)?.value;
  const { items, subtotal } = await getCartWithDetails(sessionId);

  if (items.length === 0) {
    redirect("/cart");
  }

  return (
    <div className="container-page py-10">
      <h1 className="text-2xl font-semibold">Оформлення замовлення</h1>

      <div className="mt-8 grid gap-10 md:grid-cols-3">
        <div className="md:col-span-2">
          <CheckoutForm />
        </div>

        <div className="h-fit space-y-4 rounded-card border border-line p-6">
          <p className="text-sm font-semibold">Ваше замовлення</p>
          <ul className="space-y-2 text-sm">
            {items.map((item) => (
              <li key={item.itemId} className="flex justify-between">
                <span className="text-muted">
                  {item.productName} × {item.quantity}
                </span>
                <span>{formatPrice(item.unitPrice * item.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="flex justify-between border-t border-line pt-4 text-sm font-semibold">
            <span>Разом</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
