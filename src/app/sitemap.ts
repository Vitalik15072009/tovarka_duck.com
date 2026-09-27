import type { MetadataRoute } from "next";
import { db } from "@/server/db";
import { products, categories } from "@/server/db/schema";
import { eq } from "drizzle-orm";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tovarkaduck.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [publishedProducts, activeCategories] = await Promise.all([
    db.select({ slug: products.slug, updatedAt: products.updatedAt }).from(products).where(eq(products.status, "PUBLISHED")),
    db.select({ slug: categories.slug }).from(categories).where(eq(categories.isActive, true)),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/catalog`, changeFrequency: "daily", priority: 0.9 },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = activeCategories.map((c) => ({
    url: `${SITE_URL}/catalog/${c.slug}`,
    changeFrequency: "daily",
    priority: 0.7,
  }));

  const productRoutes: MetadataRoute.Sitemap = publishedProducts.map((p) => ({
    url: `${SITE_URL}/product/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
