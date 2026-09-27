export type ProductListItem = {
  id: number;
  slug: string;
  name: string;
  imageUrl: string | null;
  imageAlt: string | null;
  price: number;
  compareAtPrice: number | null;
  isNew: boolean;
  isSale: boolean;
  inStock: boolean;
};

export type ProductVariantView = {
  id: number;
  size: string | null;
  color: string | null;
  colorHex: string | null;
  price: number;
  compareAtPrice: number | null;
  available: number;
};

export type ProductDetail = {
  id: number;
  slug: string;
  name: string;
  shortDescription: string | null;
  description: string | null;
  brand: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  images: { url: string; alt: string | null; variantId: number | null }[];
  variants: ProductVariantView[];
  attributes: { name: string; value: string }[];
  isNew: boolean;
  isSale: boolean;
};
