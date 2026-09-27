import type { ShippingAdapter, ShippingLabelResult } from "./types";

/**
 * MVP default: city/warehouse are free-text fields collected at checkout.
 * No call to the Nova Poshta API is made. Staff create the actual shipment in
 * Nova Poshta's own tools and paste the tracking number into the admin panel
 * (see /admin/orders/[id]).
 */
export class ManualNovaPoshtaAdapter implements ShippingAdapter {
  async createLabel(): Promise<ShippingLabelResult> {
    return { trackingNumber: "", labelUrl: null };
  }
}
