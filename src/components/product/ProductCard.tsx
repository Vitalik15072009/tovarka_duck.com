import Link from "next/link";
import Image from "next/image";
import { formatPrice, discountPercent } from "@/lib/utils/formatPrice";
import type { ProductListItem } from "@/types/product";

export function ProductCard({ product }: { product: ProductListItem }) {
  const discount = discountPercent(product.price, product.compareAtPrice);

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group block"
      data-item-id={product.id}
    >
      <div className="relative aspect-[3/4] overflow-hidden rounded-card bg-line">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.imageAlt ?? product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-muted">
            Фото відсутнє
          </div>
        )}

        <div className="absolute left-2 top-2 flex gap-1">
          {product.isNew && (
            <span className="rounded bg-ink px-2 py-1 text-[11px] font-medium text-white">Новинка</span>
          )}
          {discount && (
            <span className="rounded bg-sale px-2 py-1 text-[11px] font-medium text-white">-{discount}%</span>
          )}
        </div>

        {!product.inStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70 text-sm font-medium">
            Немає в наявності
          </div>
        )}
      </div>

      <div className="mt-3 space-y-1">
        <p className="line-clamp-2 text-sm font-medium">{product.name}</p>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">{formatPrice(product.price)}</span>
          {product.compareAtPrice && (
            <span className="text-sm text-muted line-through">{formatPrice(product.compareAtPrice)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
