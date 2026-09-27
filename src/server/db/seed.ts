import { db } from "./index";
import { categories, products, productVariants, productImages, inventoryItems, storeSettings } from "./schema";

/**
 * Minimal seed data so the storefront is browsable right after setup.
 * Replace with real TovarkaDuck products through the admin panel - do not treat
 * this as production content (no invented reviews, prices or claims are included).
 */
async function main() {
  console.log("Seeding store settings...");
  await db.insert(storeSettings).values({
    storeName: "TovarkaDuck",
  }).onConflictDoNothing();

  console.log("Seeding demo category...");
  const [category] = await db
    .insert(categories)
    .values({
      name: "Демо категорія",
      slug: "demo",
      description: "Тимчасова категорія для перевірки каталогу. Замініть через адмінку.",
      isActive: true,
      sortOrder: 0,
    })
    .returning();

  console.log("Seeding demo product...");
  const [product] = await db
    .insert(products)
    .values({
      slug: "demo-product",
      name: "Демо товар",
      shortDescription: "Тестовий товар для перевірки каталогу та сторінки товару.",
      status: "PUBLISHED",
      isFeatured: true,
      publishedAt: new Date(),
    })
    .returning();

  const [variant] = await db
    .insert(productVariants)
    .values({
      productId: product.id,
      sku: "DEMO-001-M-BLACK",
      size: "M",
      color: "Чорний",
      colorHex: "#111111",
      price: "999.00",
      currency: "UAH",
    })
    .returning();

  await db.insert(inventoryItems).values({
    variantId: variant.id,
    quantity: 10,
  });

  await db.insert(productImages).values({
    productId: product.id,
    variantId: variant.id,
    url: "/placeholder-product.svg",
    alt: "Демо товар TovarkaDuck",
    isPrimary: true,
  });

  console.log("Seed complete. Category:", category.slug, "Product:", product.slug);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
