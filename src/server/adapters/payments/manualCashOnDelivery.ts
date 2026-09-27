import type { PaymentAdapter, PaymentIntentResult } from "./types";

/**
 * MVP default: no online payment provider is connected yet. Orders paid
 * "cash on delivery" never call an external API - this adapter exists so
 * the checkout code path is identical to what a real provider will use later.
 */
export class ManualCashOnDeliveryAdapter implements PaymentAdapter {
  async createPaymentIntent(): Promise<PaymentIntentResult> {
    return { redirectUrl: null, providerPaymentId: `cod_${Date.now()}` };
  }

  verifyWebhookSignature(): boolean {
    // No webhook for cash on delivery.
    return false;
  }
}
