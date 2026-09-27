import Link from "next/link";
import { db } from "@/server/db";
import { orders } from "@/server/db/schema";
import { sql } from "drizzle-orm";
import { formatPrice } from "@/lib/utils/formatPrice";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const allOrders = await db.select().from(orders).orderBy(sql`${orders.createdAt} desc`).limit(100);

  return (
    <div>
      <h1 className="text-2xl font-semibold">Замовлення</h1>

      <table className="mt-6 w-full text-sm">
        <thead>
          <tr className="border-b border-line text-left text-muted">
            <th className="py-2">Номер</th>
            <th className="py-2">Клієнт</th>
            <th className="py-2">Телефон</th>
            <th className="py-2">Сума</th>
            <th className="py-2">Статус</th>
            <th className="py-2">Оплата</th>
          </tr>
        </thead>
        <tbody>
          {allOrders.map((order) => (
            <tr key={order.id} className="border-b border-line">
              <td className="py-2">
                <Link href={`/admin/orders/${order.id}`} className="font-medium underline">{order.orderNumber}</Link>
              </td>
              <td className="py-2">{order.customerName}</td>
              <td className="py-2">{order.customerPhone}</td>
              <td className="py-2">{formatPrice(Number(order.grandTotal))}</td>
              <td className="py-2">{order.status}</td>
              <td className="py-2">{order.paymentStatus}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {allOrders.length === 0 && <p className="mt-8 text-muted">Замовлень ще немає.</p>}
    </div>
  );
}
