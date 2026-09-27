"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { formatPrice, discountPercent } from "@/lib/utils/formatPrice";
import { trackAddToCart } from "@/lib/analytics/gtag";
import type { ProductVariantView } from "@/types/product";
import { addToCartAction } from "@/app/product/[slug]/actions";

export function ProductPurchasePanel({
  productId,
  productName,
  variants,
}: {
  productId: number;
  productName: string;
  variants: ProductVariantView[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [added, setAdded] = useState(false);

  const sizes = useMemo(() => Array.from(new Set(variants.map((v) => v.size).filter(Boolean))), [variants]);
  const colors = useMemo(() => Array.from(new Set(variants.map((v) => v.color).filter(Boolean))), [variants]);

  const [selectedSize, setSelectedSize] = useState<string | null>(sizes[0] ?? null);
  const [selectedColor, setSelectedColor] = useState<string | null>(colors[0] ?? null);
  const [quantity, setQuantity] = useState(1);

  const selectedVariant = useMemo(
    () =>
      variants.find(
        (v) => (sizes.length === 0 || v.size === selectedSize) && (colors.length === 0 || v.color === selectedColor)
      ) ?? variants[0],
    [variants, selectedSize, selectedColor, sizes.length, colors.length]
  );

  if (!selectedVariant) {
    return <p className="text-sm text-muted">Товар тимчасово недоступний.</p>;
  }

  const discount = discountPercent(selectedVariant.price, selectedVariant.compareAtPrice);
  const inStock = selectedVariant.available > 0;

  function handleAddToCart(redirectToCheckout: boolean) {
    startTransition(async () => {
      await addToCartAction(selectedVariant.id, quantity);
      trackAddToCart(
        { item_id: String(productId), item_name: productName, price: selectedVariant.price, quantity },
      );
      if (redirectToCheckout) {
        router.push("/checkout");
      } else {
        setAdded(true);
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-baseline gap-3">
        <span className="text-2xl font-semibold">{formatPrice(selectedVariant.price)}</span>
        {selectedVariant.compareAtPrice && (
          <span className="text-lg text-muted line-through">{formatPrice(selectedVariant.compareAtPrice)}</span>
        )}
        {discount && <span className="text-sm font-medium text-sale">-{discount}%</span>}
      </div>

      {colors.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-medium">Колір</p>
          <div className="flex gap-2">
            {colors.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setSelectedColor(color)}
                aria-pressed={selectedColor === color}
                className={`rounded-full border px-3 py-1.5 text-sm ${
                  selectedColor === color ? "border-ink" : "border-line"
                }`}
              >
                {color}
              </button>
            ))}
          </div>
        </div>
      )}

      {sizes.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-medium">Розмір</p>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setSelectedSize(size)}
                aria-pressed={selectedSize === size}
                className={`min-w-[44px] rounded-card border px-3 py-2 text-sm ${
                  selectedSize === size ? "border-ink" : "border-line"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-3">
        <p className="text-sm font-medium">Кількість</p>
        <div className="flex items-center rounded-card border border-line">
          <button
            type="button"
            className="h-11 w-11 text-lg"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            aria-label="Зменшити кількість"
          >
            −
          </button>
          <span className="w-8 text-center" aria-live="polite">{quantity}</span>
          <button
            type="button"
            className="h-11 w-11 text-lg"
            onClick={() => setQuantity((q) => Math.min(selectedVariant.available, q + 1))}
            aria-label="Збільшити кількість"
          >
            +
          </button>
        </div>
      </div>

      <p className="text-sm" role="status">
        {inStock ? "В наявності" : "Немає в наявності"}
      </p>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          disabled={!inStock || isPending}
          onClick={() => handleAddToCart(true)}
          className="h-12 flex-1 rounded-card bg-accent text-sm font-semibold text-accent-foreground disabled:opacity-40"
        >
          Купити
        </button>
        <button
          type="button"
          disabled={!inStock || isPending}
          onClick={() => handleAddToCart(false)}
          className="h-12 flex-1 rounded-card border border-ink text-sm font-semibold disabled:opacity-40"
        >
          {added ? "Додано ✓" : "Додати в кошик"}
        </button>
      </div>

      {/* Mobile sticky purchase bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white p-3 sm:hidden">
        <div className="flex items-center gap-3">
          <span className="flex-1 text-sm font-semibold">{formatPrice(selectedVariant.price)}</span>
          <button
            type="button"
            disabled={!inStock || isPending}
            onClick={() => handleAddToCart(true)}
            className="h-12 flex-1 rounded-card bg-accent text-sm font-semibold text-accent-foreground disabled:opacity-40"
          >
            Купити
          </button>
        </div>
      </div>
    </div>
  );
}
