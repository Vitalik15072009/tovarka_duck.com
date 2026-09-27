import { notFound } from "next/navigation";
import { listPublishedProducts, listActiveCategories } from "@/server/services/productService";
import { ProductCard } from "@/components/product/ProductCard";
import { buildMetadata, breadcrumbJsonLd } from "@/lib/seo/metadata";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: { categorySlug: string } }) {
  const categories = await listActiveCategories();
  const category = categories.find((c) => c.slug === params.categorySlug);
  if (!category) return buildMetadata({ title: "Категорія", path: `/catalog/${params.categorySlug}` });

  return buildMetadata({
    title: category.name,
    description: `${category.name} - TovarkaDuck`,
    path: `/catalog/${category.slug}`,
  });
}

export default async function CategoryPage({ params }: { params: { categorySlug: string } }) {
  const categories = await listActiveCategories();
  const category = categories.find((c) => c.slug === params.categorySlug);
  if (!category) notFound();

  const products = await listPublishedProducts({ categorySlug: category.slug, limit: 48 });

  const jsonLd = breadcrumbJsonLd([
    { name: "Головна", path: "/" },
    { name: "Каталог", path: "/catalog" },
    { name: category.name, path: `/catalog/${category.slug}` },
  ]);

  return (
    <div className="container-page py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <h1 className="text-2xl font-semibold">{category.name}</h1>

      {products.length === 0 ? (
        <p className="mt-16 text-center text-muted">У цій категорії поки немає товарів.</p>
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
