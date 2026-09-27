import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrderByNumber } from "@/server/services/orderService";
import { formatPrice } from "@/lib/utils/formatPrice";
import { PurchaseTracker } from "@/components/product/PurchaseTracker";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({ title: "Дякуємо за замовлення", path: "/order/success" });
export const dynamic = "force-dynamic";

export default async function OrderSuccessPage({ params }: { params: { orderNumber: string } }) {
  const result = await getOrderByNumber(params.orderNumber);
  if (!result) notFound();

  const { order, items } = result;

  return (
    <div className="container-page max-w-2xl py-16 text-center">
      {/* This is the canonical Google Ads / GA4 conversion page: it fires
          `purchase` exactly once per order number (see PurchaseTracker). */}
      <PurchaseTracker
        transactionId={order.orderNumber}
        value={Number(order.grandTotal)}
        shipping={Number(order.shippingTotal)}
        items={items.map((i) => ({
          item_id: String(i.productId ?? i.id),
          item_name: i.productName,
          price: Number(i.unitPrice),
          quantity: i.quantity,
        }))}
      />

      <h1 className="text-2xl font-semibold">Дякуємо за замовлення!</h1>
      <p className="mt-2 text-muted">Номер замовлення: <strong>{order.orderNumber}</strong></p>

      <div className="mt-8 rounded-card border border-line p-6 text-left">
        <ul className="space-y-2 text-sm">
          {items.map((item) => (
            <li key={item.id} className="flex justify-between">
              <span className="text-muted">
                {item.productName} × {item.quantity}
              </span>
              <span>{formatPrice(Number(item.totalPrice))}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex justify-between border-t border-line pt-4 text-sm font-semibold">
          <span>Разом до сплати</span>
          <span>{formatPrice(Number(order.grandTotal))}</span>
        </div>
      </div>

      <div className="mt-8 space-y-1 text-sm text-muted">
        <p>Ми зв'яжемося з вами за номером {order.customerPhone} для підтвердження.</p>
        <p>Доставка: {order.city}, {order.warehouse}.</p>
      </div>

      <Link href="/catalog" className="mt-8 inline-flex rounded-card bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground">
        Повернутись до каталогу
      </Link>
    </div>
  );
}
