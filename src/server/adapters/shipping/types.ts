export type ShippingLabelResult = {
  trackingNumber: string;
  labelUrl: string | null;
};

/**
 * Wraps whatever the shipping provider needs (Nova Poshta TTN creation, etc.).
 * The MVP ships with a manual adapter where staff enter the tracking number
 * by hand in the admin panel; swapping in the real Nova Poshta API later only
 * means implementing this interface.
 */
export interface ShippingAdapter {
  createLabel(params: {
    orderId: number;
    city: string;
    warehouse: string;
    weightKg?: number;
  }): Promise<ShippingLabelResult>;
}
