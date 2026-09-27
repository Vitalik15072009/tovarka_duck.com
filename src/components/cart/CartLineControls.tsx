"use client";

import { useTransition } from "react";
import { updateQuantityAction, removeItemAction } from "@/app/cart/actions";

export function CartLineControls({ itemId, quantity }: { itemId: number; quantity: number }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center rounded-card border border-line">
        <button
          type="button"
          className="h-9 w-9"
          disabled={isPending}
          onClick={() => startTransition(() => updateQuantityAction(itemId, quantity - 1))}
          aria-label="Зменшити кількість"
        >
          −
        </button>
        <span className="w-6 text-center text-sm">{quantity}</span>
        <button
          type="button"
          className="h-9 w-9"
          disabled={isPending}
          onClick={() => startTransition(() => updateQuantityAction(itemId, quantity + 1))}
          aria-label="Збільшити кількість"
        >
          +
        </button>
      </div>
      <button
        type="button"
        className="text-xs text-muted underline"
        disabled={isPending}
        onClick={() => startTransition(() => removeItemAction(itemId))}
      >
        Видалити
      </button>
    </div>
  );
}
