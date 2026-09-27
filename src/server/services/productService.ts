import { and, asc, desc, eq, sql } from "drizzle-orm";
import { db } from "@/server/db";
import {
  products,
  productVariants,
  productImages,
  productAttributes,
  productCategories,
  categories,
  inventoryItems,
} from "@/server/db/schema";
import type { ProductDetail, ProductListItem } from "@/types/product";

/**
 * Published catalog listing, ordered by newest first.
 * `categorySlug` filters to a single category when provided.
 */
export async function listPublishedProducts(options?: {
  categorySlug?: string;
  featuredOnly?: boolean;
  saleOnly?: boolean;
  newOnly?: boolean;
  limit?: number;
}): Promise<ProductListItem[]> {
  const limit = options?.limit ?? 24;

  const rows = await db
    .select({
      id: products.id,
      slug: products.slug,
      name: products.name,
      isNew: products.isNew,
      isSale: products.isSale,
      isFeatured: products.isFeatured,
      variantId: productVariants.id,
      price: productVariants.price,
      compareAtPrice: productVariants.compareAtPrice,
      imageUrl: productImages.url,
      imageAlt: productImages.alt,
      availableQty: inventoryItems.quantity,
      reservedQty: inventoryItems.reservedQuantity,
    })
    .from(products)
    .innerJoin(productVariants, eq(productVariants.productId, products.id))
    .leftJoin(
      productImages,
      and(eq(productImages.productId, products.id), eq(productImages.isPrimary, true))
    )
    .leftJoin(inventoryItems, eq(inventoryItems.variantId, productVariants.id))
    .leftJoin(productCategories, eq(productCategories.productId, products.id))
    .leftJoin(categories, eq(categories.id, productCategories.categoryId))
    .where(
      and(
        eq(products.status, "PUBLISHED"),
        options?.categorySlug ? eq(categories.slug, options.categorySlug) : undefined,
        options?.featuredOnly ? eq(products.isFeatured, true) : undefined,
        options?.saleOnly ? eq(products.isSale, true) : undefined,
        options?.newOnly ? eq(products.isNew, true) : undefined
      )
    )
    .orderBy(desc(products.publishedAt))
    .limit(limit);

  // One row per product (first matching variant/image) - good enough for the
  // catalog grid; the product page does its own full variant lookup.
  const seen = new Set<number>();
  const items: ProductListItem[] = [];
  for (const row of rows) {
    if (seen.has(row.id)) continue;
    seen.add(row.id);
    const available = (row.availableQty ?? 0) - (row.reservedQty ?? 0);
    items.push({
      id: row.id,
      slug: row.slug,
      name: row.name,
      imageUrl: row.imageUrl,
      imageAlt: row.imageAlt,
      price: Number(row.price),
      compareAtPrice: row.compareAtPrice ? Number(row.compareAtPrice) : null,
      isNew: row.isNew,
      isSale: row.isSale,
      inStock: available > 0,
    });
  }
  return items;
}

export async function getProductBySlug(slug: string): Promise<ProductDetail | null> {
  const [product] = await db
    .select()
    .from(products)
    .where(and(eq(products.slug, slug), eq(products.status, "PUBLISHED")))
    .limit(1);

  if (!product) return null;

  const [variantRows, imageRows, attributeRows] = await Promise.all([
    db
      .select({
        id: productVariants.id,
        size: productVariants.size,
        color: productVariants.color,
        colorHex: productVariants.colorHex,
        price: productVariants.price,
        compareAtPrice: productVariants.compareAtPrice,
        quantity: inventoryItems.quantity,
        reserved: inventoryItems.reservedQuantity,
      })
      .from(productVariants)
      .leftJoin(inventoryItems, eq(inventoryItems.variantId, productVariants.id))
      .where(and(eq(productVariants.productId, product.id), eq(productVariants.isActive, true))),
    db
      .select({ url: productImages.url, alt: productImages.alt, variantId: productImages.variantId })
      .from(productImages)
      .where(eq(productImages.productId, product.id))
      .orderBy(asc(productImages.sortOrder)),
    db
      .select({ name: productAttributes.attributeName, value: productAttributes.attributeValue })
      .from(productAttributes)
      .where(eq(productAttributes.productId, product.id))
      .orderBy(asc(productAttributes.sortOrder)),
  ]);

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    shortDescription: product.shortDescription,
    description: product.description,
    brand: product.brand,
    seoTitle: product.seoTitle,
    seoDescription: product.seoDescription,
    isNew: product.isNew,
    isSale: product.isSale,
    images: imageRows,
    attributes: attributeRows,
    variants: variantRows.map((v) => ({
      id: v.id,
      size: v.size,
      color: v.color,
      colorHex: v.colorHex,
      price: Number(v.price),
      compareAtPrice: v.compareAtPrice ? Number(v.compareAtPrice) : null,
      available: (v.quantity ?? 0) - (v.reserved ?? 0),
    })),
  };
}

export async function listActiveCategories() {
  return db
    .select({ id: categories.id, name: categories.name, slug: categories.slug, imageUrl: categories.imageUrl })
    .from(categories)
    .where(eq(categories.isActive, true))
    .orderBy(asc(categories.sortOrder));
}

/** Row count helper used by the admin dashboard "low stock" widget. */
export async function countLowStockVariants() {
  const [row] = await db
    .select({ count: sql<number>`count(*)` })
    .from(inventoryItems)
    .where(sql`${inventoryItems.quantity} - ${inventoryItems.reservedQuantity} <= ${inventoryItems.lowStockThreshold}`);
  return Number(row?.count ?? 0);
}
