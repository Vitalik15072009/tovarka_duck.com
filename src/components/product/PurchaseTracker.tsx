"use client";

import { useEffect } from "react";
import { trackPurchase } from "@/lib/analytics/gtag";

export function PurchaseTracker({
  transactionId,
  value,
  shipping,
  items,
}: {
  transactionId: string;
  value: number;
  shipping: number;
  items: { item_id: string; item_name: string; price: number; quantity: number }[];
}) {
  useEffect(() => {
    trackPurchase(transactionId, items, value, shipping);
    // Runs once per mount; trackPurchase itself de-dupes per transactionId
    // via sessionStorage in case this page is visited again.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
