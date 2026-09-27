import Link from "next/link";
import { listAllProductsForAdmin } from "@/server/services/adminProductService";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await listAllProductsForAdmin();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Товари</h1>
        <Link href="/admin/products/new" className="rounded-card bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground">
          + Новий товар
        </Link>
      </div>

      <table className="mt-6 w-full text-sm">
        <thead>
          <tr className="border-b border-line text-left text-muted">
            <th className="py-2">Назва</th>
            <th className="py-2">Статус</th>
            <th className="py-2">Мітки</th>
            <th className="py-2" />
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id} className="border-b border-line">
              <td className="py-2 font-medium">{p.name}</td>
              <td className="py-2">{p.status}</td>
              <td className="py-2 text-muted">
                {[p.isNew && "Новинка", p.isSale && "Акція", p.isFeatured && "Популярне"].filter(Boolean).join(", ")}
              </td>
              <td className="py-2 text-right">
                <Link href={`/admin/products/${p.id}`} className="underline">Редагувати</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {products.length === 0 && <p className="mt-8 text-muted">Товарів ще немає. Додайте перший товар.</p>}
    </div>
  );
}
