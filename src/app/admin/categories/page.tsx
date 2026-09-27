import { listAllCategoriesForAdmin } from "@/server/services/adminProductService";
import { createCategoryAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const categories = await listAllCategoriesForAdmin();

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold">Категорії</h1>

      <ul className="mt-6 space-y-2">
        {categories.map((c) => (
          <li key={c.id} className="flex items-center justify-between rounded-card border border-line bg-white p-4">
            <span className="font-medium">{c.name}</span>
            <span className="text-sm text-muted">/{c.slug}</span>
          </li>
        ))}
      </ul>

      <form action={createCategoryAction} className="mt-6 space-y-3 rounded-card border border-line bg-white p-6">
        <h2 className="text-lg font-semibold">Нова категорія</h2>
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="name">Назва</label>
          <input id="name" name="name" required className="h-12 w-full rounded-card border border-line px-3" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="description">Опис</label>
          <textarea id="description" name="description" className="w-full rounded-card border border-line p-3" />
        </div>
        <button type="submit" className="rounded-card bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground">
          Створити категорію
        </button>
      </form>
    </div>
  );
}
