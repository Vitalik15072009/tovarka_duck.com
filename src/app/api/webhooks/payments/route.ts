import { NextResponse } from "next/server";
import { getPaymentAdapter } from "@/server/adapters/payments";

/**
 * Placeholder webhook endpoint for the future online payment provider.
 * It intentionally does nothing beyond signature verification until a real
 * provider is chosen and PAYMENT_PROVIDER_API_KEY is configured - see
 * src/server/adapters/payments for where to plug in the real adapter.
 */
export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-signature");

  const adapter = getPaymentAdapter("ONLINE");
  const isValid = adapter.verifyWebhookSignature(rawBody, signature);

  if (!isValid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  // TODO: once a real provider is wired in, parse rawBody, find the order by
  // providerPaymentId, and call orderService to mark payment as PAID.
  return NextResponse.json({ received: true });
}
