export type CheckoutInput = {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  city: string;
  warehouse: string;
  shippingMethod: string;
  paymentMethod: string;
  comment?: string;
};

export type CartLine = {
  variantId: number;
  quantity: number;
};

export type OrderAttribution = {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  gclid?: string;
  landingPage?: string;
};
