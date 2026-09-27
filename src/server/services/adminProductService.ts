import { eq } from "drizzle-orm";
import { db } from "@/server/db";
import { products, productVariants, productImages, categories, productCategories, inventoryItems } from "@/server/db/schema";

export async function listAllProductsForAdmin() {
  return db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      status: products.status,
      isFeatured: products.isFeatured,
      isNew: products.isNew,
      isSale: products.isSale,
      updatedAt: products.updatedAt,
    })
    .from(products)
    .orderBy(products.updatedAt);
}

export async function getProductForAdmin(id: number) {
  const [product] = await db.select().from(products).where(eq(products.id, id)).limit(1);
  if (!product) return null;

  const variants = await db
    .select({
      id: productVariants.id,
      sku: productVariants.sku,
      size: productVariants.size,
      color: productVariants.color,
      price: productVariants.price,
      compareAtPrice: productVariants.compareAtPrice,
      isActive: productVariants.isActive,
      quantity: inventoryItems.quantity,
    })
    .from(productVariants)
    .leftJoin(inventoryItems, eq(inventoryItems.variantId, productVariants.id))
    .where(eq(productVariants.productId, id));

  const images = await db.select().from(productImages).where(eq(productImages.productId, id));

  return { product, variants, images };
}

type ProductFormInput = {
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  isFeatured: boolean;
  isNew: boolean;
  isSale: boolean;
  seoTitle: string;
  seoDescription: string;
};

export async function createProduct(input: ProductFormInput) {
  const [product] = await db
    .insert(products)
    .values({
      ...input,
      publishedAt: input.status === "PUBLISHED" ? new Date() : null,
    })
    .returning();
  return product;
}

export async function updateProduct(id: number, input: ProductFormInput) {
  await db
    .update(products)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(products.id, id));
}

export async function deleteProduct(id: number) {
  await db.delete(products).where(eq(products.id, id));
}

export async function addVariant(productId: number, input: {
  sku: string;
  size: string;
  color: string;
  colorHex: string;
  price: string;
  compareAtPrice: string;
  quantity: number;
}) {
  const [variant] = await db
    .insert(productVariants)
    .values({
      productId,
      sku: input.sku,
      size: input.size || null,
      color: input.color || null,
      colorHex: input.colorHex || null,
      price: input.price,
      compareAtPrice: input.compareAtPrice || null,
    })
    .returning();

  await db.insert(inventoryItems).values({ variantId: variant.id, quantity: input.quantity });
  return variant;
}

export async function updateVariantStock(variantId: number, quantity: number) {
  await db
    .update(inventoryItems)
    .set({ quantity, updatedAt: new Date() })
    .where(eq(inventoryItems.variantId, variantId));
}

export async function addProductImage(productId: number, url: string, alt: string, isPrimary: boolean) {
  await db.insert(productImages).values({ productId, url, alt, isPrimary });
}

export async function listAllCategoriesForAdmin() {
  return db.select().from(categories).orderBy(categories.sortOrder);
}

export async function createCategory(input: { name: string; slug: string; description: string; isActive: boolean }) {
  return db.insert(categories).values(input).returning();
}

export async function setProductCategories(productId: number, categoryIds: number[]) {
  await db.delete(productCategories).where(eq(productCategories.productId, productId));
  if (categoryIds.length > 0) {
    await db.insert(productCategories).values(categoryIds.map((categoryId) => ({ productId, categoryId })));
  }
}
