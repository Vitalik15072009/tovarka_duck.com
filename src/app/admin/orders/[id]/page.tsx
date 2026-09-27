import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/server/db";
import { orders, orderItems, orderStatusHistory, shipments } from "@/server/db/schema";
import { formatPrice } from "@/lib/utils/formatPrice";
import { updateOrderStatusAction, saveTrackingNumberAction } from "../actions";

export const dynamic = "force-dynamic";

const STATUS_OPTIONS = ["NEW", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "RETURNED"] as const;

export default async function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  const orderId = Number(params.id);
  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!order) notFound();

  const [items, history, [shipment]] = await Promise.all([
    db.select().from(orderItems).where(eq(orderItems.orderId, orderId)),
    db.select().from(orderStatusHistory).where(eq(orderStatusHistory.orderId, orderId)),
    db.select().from(shipments).where(eq(shipments.orderId, orderId)),
  ]);

  const updateStatus = updateOrderStatusAction.bind(null, orderId);
  const saveTracking = saveTrackingNumberAction.bind(null, orderId);

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Замовлення {order.orderNumber}</h1>
        <p className="text-sm text-muted">Створено: {new Date(order.createdAt).toLocaleString("uk-UA")}</p>
      </div>

      <section className="rounded-card border border-line bg-white p-6">
        <h2 className="text-lg font-semibold">Клієнт</h2>
        <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
          <Row label="Ім'я" value={order.customerName} />
          <Row label="Телефон" value={order.customerPhone} />
          <Row label="Email" value={order.customerEmail ?? "—"} />
          <Row label="Місто" value={order.city} />
          <Row label="Відділення / поштомат" value={order.warehouse} />
          <Row label="Спосіб доставки" value={order.shippingMethod} />
          <Row label="Спосіб оплати" value={order.paymentMethod} />
          <Row label="Коментар" value={order.customerComment ?? "—"} />
        </dl>
      </section>

      <section className="rounded-card border border-line bg-white p-6">
        <h2 className="text-lg font-semibold">Товари</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {items.map((item) => (
            <li key={item.id} className="flex justify-between border-b border-line pb-2">
              <span>
                {item.productName} {item.size && `/ ${item.size}`} {item.color && `/ ${item.color}`} × {item.quantity}
              </span>
              <span>{formatPrice(Number(item.totalPrice))}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex justify-between font-semibold">
          <span>Разом</span>
          <span>{formatPrice(Number(order.grandTotal))}</span>
        </div>
      </section>

      <section className="rounded-card border border-line bg-white p-6">
        <h2 className="text-lg font-semibold">Статус замовлення</h2>
        <p className="mt-1 text-sm text-muted">Поточний: <strong>{order.status}</strong></p>

        <form action={updateStatus} className="mt-4 space-y-3">
          <select name="status" defaultValue={order.status} className="h-11 rounded-card border border-line px-3">
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <textarea name="comment" placeholder="Внутрішній коментар (необов'язково)" className="w-full rounded-card border border-line p-3" rows={2} />
          <button type="submit" className="rounded-card bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground">
            Оновити статус
          </button>
        </form>

        {history.length > 0 && (
          <ul className="mt-4 space-y-1 text-xs text-muted">
            {history.map((h) => (
              <li key={h.id}>
                {new Date(h.createdAt).toLocaleString("uk-UA")}: {h.oldStatus ?? "—"} → {h.newStatus} {h.comment && `(${h.comment})`}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-card border border-line bg-white p-6">
        <h2 className="text-lg font-semibold">Доставка (Нова Пошта)</h2>
        <p className="mt-1 text-xs text-muted">
          MVP: номер ТТН вводиться вручну після створення відправлення в кабінеті Нової Пошти. Автоматичне створення ТТН
          підключається пізніше через src/server/adapters/shipping.
        </p>
        <form action={saveTracking} className="mt-3 flex gap-3">
          <input
            name="trackingNumber"
            defaultValue={shipment?.trackingNumber ?? ""}
            placeholder="Номер ТТН"
            className="h-11 flex-1 rounded-card border border-line px-3"
          />
          <button type="submit" className="rounded-card border border-ink px-4 py-2 text-sm font-semibold">Зберегти</button>
        </form>
      </section>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-muted">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
