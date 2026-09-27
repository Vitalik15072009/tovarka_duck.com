import { notFound } from "next/navigation";
import { getProductBySlug } from "@/server/services/productService";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductPurchasePanel } from "@/components/product/ProductPurchasePanel";
import { buildMetadata, productJsonLd, breadcrumbJsonLd } from "@/lib/seo/metadata";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const product = await getProductBySlug(params.slug);
  if (!product) return buildMetadata({ title: "Товар", path: `/product/${params.slug}` });

  return buildMetadata({
    title: product.seoTitle ?? product.name,
    description: product.seoDescription ?? product.shortDescription ?? undefined,
    path: `/product/${product.slug}`,
    ogImage: product.images[0]?.url,
  });
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProductBySlug(params.slug);
  if (!product) notFound();

  const primaryVariant = product.variants[0];
  const jsonLd = productJsonLd({
    name: product.name,
    description: product.description,
    slug: product.slug,
    imageUrl: product.images[0]?.url ?? null,
    price: primaryVariant?.price ?? 0,
    currency: "UAH",
    available: product.variants.some((v) => v.available > 0),
    brand: product.brand,
  });

  const breadcrumb = breadcrumbJsonLd([
    { name: "Головна", path: "/" },
    { name: "Каталог", path: "/catalog" },
    { name: product.name, path: `/product/${product.slug}` },
  ]);

  return (
    <div className="container-page py-10 pb-24 sm:pb-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />

      <div className="grid gap-10 md:grid-cols-2">
        <ProductGallery images={product.images} />

        <div>
          <h1 className="text-2xl font-semibold">{product.name}</h1>
          {product.shortDescription && (
            <p className="mt-2 text-muted">{product.shortDescription}</p>
          )}

          <div className="mt-6">
            <ProductPurchasePanel
              productId={product.id}
              productName={product.name}
              variants={product.variants}
            />
          </div>

          {/* Доставка/оплата/повернення - тексти підтягуються з /admin/settings */}
          <div className="mt-8 space-y-2 border-t border-line pt-6 text-sm text-muted">
            <p>Доставка: Нова Пошта по всій Україні.</p>
            <p>Оплата: готівкою при отриманні або онлайн (додається пізніше).</p>
            <p>Повернення та обмін: за умовами магазину, див. сторінку «Обмін і повернення».</p>
          </div>

          {product.description && (
            <div className="mt-8 border-t border-line pt-6">
              <h2 className="text-lg font-semibold">Опис</h2>
              <p className="mt-2 whitespace-pre-line text-sm text-muted">{product.description}</p>
            </div>
          )}

          {product.attributes.length > 0 && (
            <div className="mt-8 border-t border-line pt-6">
              <h2 className="text-lg font-semibold">Характеристики</h2>
              <dl className="mt-3 divide-y divide-line text-sm">
                {product.attributes.map((attr) => (
                  <div key={attr.name} className="flex justify-between py-2">
                    <dt className="text-muted">{attr.name}</dt>
                    <dd className="font-medium">{attr.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {/* Реальні відгуки з'являться тут після модерації в адмінці. */}
        </div>
      </div>

      {/* Схожі товари підключаються окремим запитом по категорії, коли
          товар має призначену категорію з достатньою кількістю сусідів. */}
    </div>
  );
}
