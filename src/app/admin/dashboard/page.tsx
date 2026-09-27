import Link from "next/link";
import { db } from "@/server/db";
import { orders, products } from "@/server/db/schema";
import { eq, sql } from "drizzle-orm";
import { countLowStockVariants } from "@/server/services/productService";
import { formatPrice } from "@/lib/utils/formatPrice";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [[newOrders], [processingOrders], [draftProducts], lowStockCount] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(orders).where(eq(orders.status, "NEW")),
    db.select({ count: sql<number>`count(*)` }).from(orders).where(eq(orders.status, "PROCESSING")),
    db.select({ count: sql<number>`count(*)` }).from(products).where(eq(products.status, "DRAFT")),
    countLowStockVariants(),
  ]);

  const recentOrders = await db.select().from(orders).orderBy(sql`${orders.createdAt} desc`).limit(5);

  const cards = [
    { label: "Нові замовлення", value: Number(newOrders?.count ?? 0), href: "/admin/orders" },
    { label: "В обробці", value: Number(processingOrders?.count ?? 0), href: "/admin/orders" },
    { label: "Товари-чернетки", value: Number(draftProducts?.count ?? 0), href: "/admin/products" },
    { label: "Низький залишок", value: lowStockCount, href: "/admin/products" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold">Дашборд</h1>

      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        {cards.map((card) => (
          <Link key={card.label} href={card.href} className="rounded-card border border-line bg-white p-5">
            <p className="text-2xl font-semibold">{card.value}</p>
            <p className="mt-1 text-sm text-muted">{card.label}</p>
          </Link>
        ))}
      </div>

      <div className="mt-10">
        <h2 className="text-lg font-semibold">Останні замовлення</h2>
        <table className="mt-4 w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-muted">
              <th className="py-2">Номер</th>
              <th className="py-2">Клієнт</th>
              <th className="py-2">Сума</th>
              <th className="py-2">Статус</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.map((order) => (
              <tr key={order.id} className="border-b border-line">
                <td className="py-2">
                  <Link href={`/admin/orders/${order.id}`} className="font-medium underline">
                    {order.orderNumber}
                  </Link>
                </td>
                <td className="py-2">{order.customerName}</td>
                <td className="py-2">{formatPrice(Number(order.grandTotal))}</td>
                <td className="py-2">{order.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
