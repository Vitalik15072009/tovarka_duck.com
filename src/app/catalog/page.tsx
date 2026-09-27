import { listPublishedProducts, listActiveCategories } from "@/server/services/productService";
import { ProductCard } from "@/components/product/ProductCard";
import { buildMetadata, breadcrumbJsonLd } from "@/lib/seo/metadata";
import Link from "next/link";

export const metadata = buildMetadata({
  title: "Каталог",
  description: "Весь асортимент TovarkaDuck: одяг, новинки та акції.",
  path: "/catalog",
});

export const revalidate = 60;

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: { filter?: string };
}) {
  const products = await listPublishedProducts({
    newOnly: searchParams.filter === "new",
    saleOnly: searchParams.filter === "sale",
    limit: 48,
  });
  const categories = await listActiveCategories();

  const jsonLd = breadcrumbJsonLd([
    { name: "Головна", path: "/" },
    { name: "Каталог", path: "/catalog" },
  ]);

  return (
    <div className="container-page py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <h1 className="text-2xl font-semibold">Каталог</h1>

      <div className="mt-6 flex flex-wrap gap-2">
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/catalog/${c.slug}`}
            className="rounded-full border border-line px-4 py-2 text-sm hover:border-ink"
          >
            {c.name}
          </Link>
        ))}
      </div>

      {/* TODO: підключити повноцінні фільтри (ціна, розмір, колір, наявність)
          через client-компонент з query-параметрами, коли з'явиться реальний
          асортимент з достатньою кількістю варіантів для фільтрації. */}

      {products.length === 0 ? (
        <p className="mt-16 text-center text-muted">
          За цими параметрами товарів не знайдено. Спробуйте змінити фільтри або переглянути весь каталог.
        </p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
