"use client";

/**
 * Thin wrapper around the GTM/GA4 dataLayer so every call site sends a
 * consistent event shape. See README for wiring GTM_ID / GA4_ID.
 * All events map 1:1 to the GA4 Ecommerce spec so Google Ads conversion
 * import keeps working without custom mapping.
 */

type EcommerceItem = {
  item_id: string;
  item_name: string;
  item_category?: string;
  price: number;
  quantity?: number;
};

function pushToDataLayer(event: string, payload: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).dataLayer = (window as any).dataLayer || [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).dataLayer.push({ event, ecommerce: payload });
}

export function trackViewItem(item: EcommerceItem, currency = "UAH") {
  pushToDataLayer("view_item", { currency, value: item.price, items: [item] });
}

export function trackAddToCart(item: EcommerceItem, currency = "UAH") {
  pushToDataLayer("add_to_cart", { currency, value: item.price * (item.quantity ?? 1), items: [item] });
}

export function trackRemoveFromCart(item: EcommerceItem, currency = "UAH") {
  pushToDataLayer("remove_from_cart", { currency, value: item.price * (item.quantity ?? 1), items: [item] });
}

export function trackViewCart(items: EcommerceItem[], value: number, currency = "UAH") {
  pushToDataLayer("view_cart", { currency, value, items });
}

export function trackBeginCheckout(items: EcommerceItem[], value: number, currency = "UAH") {
  pushToDataLayer("begin_checkout", { currency, value, items });
}

export function trackAddShippingInfo(items: EcommerceItem[], value: number, shippingTier: string, currency = "UAH") {
  pushToDataLayer("add_shipping_info", { currency, value, shipping_tier: shippingTier, items });
}

export function trackAddPaymentInfo(items: EcommerceItem[], value: number, paymentType: string, currency = "UAH") {
  pushToDataLayer("add_payment_info", { currency, value, payment_type: paymentType, items });
}

/**
 * `transactionId` (the order number) must be unique per order so a page
 * refresh on the thank-you page never fires `purchase` twice. Call this only
 * from the thank-you page, gated by a "seen" check in sessionStorage.
 */
export function trackPurchase(
  transactionId: string,
  items: EcommerceItem[],
  value: number,
  shipping: number,
  currency = "UAH"
) {
  const dedupeKey = `td_purchase_tracked_${transactionId}`;
  if (typeof window !== "undefined" && window.sessionStorage.getItem(dedupeKey)) {
    return;
  }
  pushToDataLayer("purchase", {
    transaction_id: transactionId,
    currency,
    value,
    shipping,
    items,
  });
  if (typeof window !== "undefined") {
    window.sessionStorage.setItem(dedupeKey, "1");
  }
}
