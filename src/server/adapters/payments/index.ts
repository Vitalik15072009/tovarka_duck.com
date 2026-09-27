import type { PaymentAdapter } from "./types";
import { ManualCashOnDeliveryAdapter } from "./manualCashOnDelivery";

/**
 * TODO (when online payment is confirmed): implement e.g. LiqpayAdapter or
 * FondyAdapter against PaymentAdapter and select it here based on
 * order.paymentMethod === "ONLINE". Nothing else in the app needs to change.
 */
export function getPaymentAdapter(paymentMethod: string): PaymentAdapter {
  switch (paymentMethod) {
    case "CASH_ON_DELIVERY":
    default:
      return new ManualCashOnDeliveryAdapter();
  }
}
