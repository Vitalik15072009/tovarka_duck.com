import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tovarkaduck.com";
const DEFAULT_TITLE = "TovarkaDuck";

export function buildMetadata(params: {
  title: string;
  description?: string;
  path: string;
  ogImage?: string;
}): Metadata {
  const url = `${SITE_URL}${params.path}`;
  return {
    title: `${params.title} | ${DEFAULT_TITLE}`,
    description: params.description,
    alternates: { canonical: url },
    openGraph: {
      title: params.title,
      description: params.description,
      url,
      siteName: DEFAULT_TITLE,
      images: params.ogImage ? [{ url: params.ogImage }] : undefined,
      locale: "uk_UA",
      type: "website",
    },
  };
}

export function productJsonLd(params: {
  name: string;
  description: string | null;
  slug: string;
  imageUrl: string | null;
  price: number;
  currency: string;
  available: boolean;
  brand?: string | null;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: params.name,
    description: params.description ?? undefined,
    image: params.imageUrl ? [params.imageUrl] : undefined,
    brand: params.brand ? { "@type": "Brand", name: params.brand } : undefined,
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/product/${params.slug}`,
      priceCurrency: params.currency,
      price: params.price,
      availability: params.available
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}

export function organizationJsonLd(storeName: string, logoUrl?: string | null) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: storeName,
    url: SITE_URL,
    logo: logoUrl ?? undefined,
  };
}
