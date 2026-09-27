import Link from "next/link";
import Image from "next/image";
import { cookies } from "next/headers";
import { getCartWithDetails } from "@/server/services/cartService";
import { formatPrice } from "@/lib/utils/formatPrice";
import { CART_COOKIE_NAME } from "@/lib/cart/session";
import { CartLineControls } from "@/components/cart/CartLineControls";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({ title: "Кошик", path: "/cart" });
export const dynamic = "force-dynamic";

export default async function CartPage() {
  const sessionId = cookies().get(CART_COOKIE_NAME)?.value;
  const { items, subtotal } = await getCartWithDetails(sessionId);

  if (items.length === 0) {
    return (
      <div className="container-page py-20 text-center">
        <h1 className="text-2xl font-semibold">Кошик порожній</h1>
        <p className="mt-2 text-muted">Додайте товари з каталогу, щоб оформити замовлення.</p>
        <Link
          href="/catalog"
          className="mt-6 inline-flex rounded-card bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground"
        >
          Перейти до каталогу
        </Link>
      </div>
    );
  }

  return (
    <div className="container-page py-10">
      <h1 className="text-2xl font-semibold">Кошик</h1>

      <div className="mt-8 grid gap-10 md:grid-cols-3">
        <ul className="space-y-6 md:col-span-2">
          {items.map((item) => (
            <li key={item.itemId} className="flex gap-4 border-b border-line pb-6">
              <div className="relative h-24 w-20 flex-shrink-0 overflow-hidden rounded-card bg-line">
                {item.imageUrl && (
                  <Image src={item.imageUrl} alt={item.productName} fill sizes="80px" className="object-cover" />
                )}
              </div>
              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <p className="text-sm font-medium">{item.productName}</p>
                  <p className="text-xs text-muted">
                    {[item.color, item.size].filter(Boolean).join(" / ")}
                  </p>
                  {!item.inStock && (
                    <p className="mt-1 text-xs font-medium text-sale">Недостатньо на складі</p>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <CartLineControls itemId={item.itemId} quantity={item.quantity} />
                  <span className="text-sm font-semibold">{formatPrice(item.unitPrice * item.quantity)}</span>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <div className="h-fit rounded-card border border-line p-6">
          <div className="flex justify-between text-sm">
            <span>Сума товарів</span>
            <span className="font-semibold">{formatPrice(subtotal)}</span>
          </div>
          <p className="mt-1 text-xs text-muted">Вартість доставки розраховується при оформленні.</p>
          <Link
            href="/checkout"
            className="mt-6 block rounded-card bg-accent px-6 py-3 text-center text-sm font-semibold text-accent-foreground"
          >
            Оформити замовлення
          </Link>
        </div>
      </div>
    </div>
  );
}
