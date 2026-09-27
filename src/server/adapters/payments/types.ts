export type PaymentIntentResult = {
  redirectUrl: string | null;
  providerPaymentId: string;
};

/**
 * Every payment provider (LiqPay, Fondy, Monobank Acquiring, etc.) must implement
 * this interface. This keeps the checkout flow and order service independent of
 * a specific provider, so the real integration can be added later without
 * touching order creation logic.
 */
export interface PaymentAdapter {
  createPaymentIntent(params: {
    orderId: number;
    orderNumber: string;
    amount: number;
    currency: string;
  }): Promise<PaymentIntentResult>;

  verifyWebhookSignature(rawBody: string, signatureHeader: string | null): boolean;
}
