import Link from "next/link";
import { listPublishedProducts, listActiveCategories } from "@/server/services/productService";
import { ProductCard } from "@/components/product/ProductCard";
import { TrustBadges } from "@/components/trust/TrustBadges";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "TovarkaDuck - сучасний бренд одягу",
  description: "Купуйте одяг TovarkaDuck: нова колекція, акції та швидка доставка по Україні.",
  path: "/",
});

export const revalidate = 60;

export default async function HomePage() {
  const [featured, newArrivals, sale, categories] = await Promise.all([
    listPublishedProducts({ featuredOnly: true, limit: 8 }),
    listPublishedProducts({ newOnly: true, limit: 8 }),
    listPublishedProducts({ saleOnly: true, limit: 8 }),
    listActiveCategories(),
  ]);

  return (
    <div>
      {/* HERO - intentionally compact so product cards appear within the first
          couple of viewports on mobile, as required by the brief. */}
      <section className="border-b border-line bg-white">
        <div className="container-page grid items-center gap-8 py-12 md:grid-cols-2 md:py-16">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight md:text-5xl">
              TovarkaDuck
            </h1>
            <p className="mt-4 max-w-md text-muted">
              {/* TODO: замінити на реальний бренд-меседж */}
              Сучасний одяг для щоденного стилю. Нова колекція вже в каталозі.
            </p>
            <Link
              href="/catalog"
              className="mt-6 inline-flex items-center rounded-card bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90"
            >
              Перейти до каталогу
            </Link>
          </div>
          <div className="aspect-[4/3] rounded-card bg-line md:aspect-[16/10]">
            {/* TODO: замінити на реальне hero-фото/відео товару через адмінку */}
          </div>
        </div>
      </section>

      <div className="container-page space-y-16 py-14">
        {featured.length > 0 && (
          <ProductSection title="Популярне" products={featured} />
        )}

        {newArrivals.length > 0 && (
          <ProductSection title="Новинки" products={newArrivals} />
        )}

        {sale.length > 0 && (
          <ProductSection title="Акції" products={sale} />
        )}

        {categories.length > 0 && (
          <section>
            <h2 className="mb-6 text-xl font-semibold">Категорії</h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {categories.map((c) => (
                <Link
                  key={c.id}
                  href={`/catalog/${c.slug}`}
                  className="rounded-card border border-line p-6 text-center font-medium transition-colors hover:border-ink"
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 className="mb-6 text-xl font-semibold">Чому обирають TovarkaDuck</h2>
          <TrustBadges />
        </section>

        {/* Відгуки та FAQ підключаються, коли з'являться реальні дані. */}

        <section className="rounded-card bg-ink px-8 py-12 text-center text-white">
          <h2 className="text-2xl font-semibold">Готові оновити гардероб?</h2>
          <Link
            href="/catalog"
            className="mt-6 inline-flex items-center rounded-card bg-white px-6 py-3 text-sm font-semibold text-ink transition-opacity hover:opacity-90"
          >
            Переглянути каталог
          </Link>
        </section>
      </div>
    </div>
  );
}

function ProductSection({ title, products }: { title: string; products: Awaited<ReturnType<typeof listPublishedProducts>> }) {
  return (
    <section>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold">{title}</h2>
        <Link href="/catalog" className="text-sm font-medium text-muted hover:text-ink">
          Дивитись усі
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
