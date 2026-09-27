import { eq, sql } from "drizzle-orm";
import { db } from "@/server/db";
import {
  orders,
  orderItems,
  orderStatusHistory,
  cartItems,
  carts,
  productVariants,
  products,
  productImages,
  inventoryItems,
} from "@/server/db/schema";
import type { CheckoutFormValues } from "@/server/validators/checkout";
import type { OrderAttribution } from "@/types/order";
import { nanoid } from "nanoid";

function generateOrderNumber() {
  const date = new Date();
  const stamp = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(
    date.getDate()
  ).padStart(2, "0")}`;
  return `TD-${stamp}-${nanoid(6).toUpperCase()}`;
}

/**
 * Creates the order from the current cart inside a single DB transaction:
 * re-checks price and stock, reserves inventory, snapshots line items, and
 * clears the cart. This is the one place that must never oversell a variant.
 */
export async function createOrderFromCart(
  sessionId: string,
  input: CheckoutFormValues,
  attribution: OrderAttribution
) {
  return db.transaction(async (tx) => {
    const [cart] = await tx.select().from(carts).where(eq(carts.sessionId, sessionId)).limit(1);
    if (!cart) throw new Error("EMPTY_CART");

    const lines = await tx
      .select({
        variantId: cartItems.variantId,
        quantity: cartItems.quantity,
        price: productVariants.price,
        productId: productVariants.productId,
        productName: products.name,
        sku: productVariants.sku,
        size: productVariants.size,
        color: productVariants.color,
      })
      .from(cartItems)
      .innerJoin(productVariants, eq(productVariants.id, cartItems.variantId))
      .innerJoin(products, eq(products.id, productVariants.productId))
      .where(eq(cartItems.cartId, cart.id));

    if (lines.length === 0) throw new Error("EMPTY_CART");

    // Reserve stock line by line; abort the whole transaction on the first
    // line that cannot be fully reserved (row lock avoids a race with a
    // concurrent checkout for the same variant).
    for (const line of lines) {
      const [inventory] = await tx
        .select()
        .from(inventoryItems)
        .where(eq(inventoryItems.variantId, line.variantId))
        .for("update");

      const available = (inventory?.quantity ?? 0) - (inventory?.reservedQuantity ?? 0);
      if (!inventory || available < line.quantity) {
        throw new Error(`OUT_OF_STOCK:${line.sku}`);
      }

      await tx
        .update(inventoryItems)
        .set({ reservedQuantity: sql`${inventoryItems.reservedQuantity} + ${line.quantity}` })
        .where(eq(inventoryItems.variantId, line.variantId));
    }

    const subtotal = lines.reduce((sum, l) => sum + Number(l.price) * l.quantity, 0);
    // Shipping cost is intentionally 0 for MVP (manual Nova Poshta handling);
    // wire in real shipping pricing once rates are confirmed.
    const shippingTotal = 0;
    const discountTotal = 0;
    const grandTotal = subtotal + shippingTotal - discountTotal;

    const [order] = await tx
      .insert(orders)
      .values({
        orderNumber: generateOrderNumber(),
        customerName: input.customerName,
        customerPhone: input.customerPhone,
        customerEmail: input.customerEmail || null,
        city: input.city,
        warehouse: input.warehouse,
        shippingMethod: input.shippingMethod,
        paymentMethod: input.paymentMethod,
        customerComment: input.comment || null,
        subtotal: subtotal.toFixed(2),
        shippingTotal: shippingTotal.toFixed(2),
        discountTotal: discountTotal.toFixed(2),
        grandTotal: grandTotal.toFixed(2),
        paymentStatus: input.paymentMethod === "CASH_ON_DELIVERY" ? "CASH_ON_DELIVERY" : "PENDING",
        utmSource: attribution.utmSource,
        utmMedium: attribution.utmMedium,
        utmCampaign: attribution.utmCampaign,
        utmContent: attribution.utmContent,
        utmTerm: attribution.utmTerm,
        gclid: attribution.gclid,
        landingPage: attribution.landingPage,
      })
      .returning();

    for (const line of lines) {
      const [image] = await tx
        .select({ url: productImages.url })
        .from(productImages)
        .where(eq(productImages.productId, line.productId))
        .limit(1);

      await tx.insert(orderItems).values({
        orderId: order.id,
        productId: line.productId,
        variantId: line.variantId,
        productName: line.productName,
        sku: line.sku,
        size: line.size,
        color: line.color,
        imageUrl: image?.url ?? null,
        unitPrice: line.price,
        quantity: line.quantity,
        totalPrice: (Number(line.price) * line.quantity).toFixed(2),
      });
    }

    await tx.insert(orderStatusHistory).values({
      orderId: order.id,
      oldStatus: null,
      newStatus: "NEW",
      comment: "Order created from checkout",
    });

    // Clear the cart now that the order owns these lines.
    await tx.delete(cartItems).where(eq(cartItems.cartId, cart.id));

    return order;
  });
}

export async function getOrderByNumber(orderNumber: string) {
  const [order] = await db.select().from(orders).where(eq(orders.orderNumber, orderNumber)).limit(1);
  if (!order) return null;
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
  return { order, items };
}

export async function updateOrderStatus(orderId: number, newStatus: (typeof orders.$inferSelect)["status"], changedBy?: number, comment?: string) {
  return db.transaction(async (tx) => {
    const [current] = await tx.select().from(orders).where(eq(orders.id, orderId)).limit(1);
    if (!current) throw new Error("ORDER_NOT_FOUND");

    await tx.update(orders).set({ status: newStatus, updatedAt: new Date() }).where(eq(orders.id, orderId));

    await tx.insert(orderStatusHistory).values({
      orderId,
      oldStatus: current.status,
      newStatus,
      changedBy,
      comment,
    });

    // Releasing/consuming reserved inventory on cancellation keeps stock accurate.
    if (newStatus === "CANCELLED" && current.status !== "CANCELLED") {
      const items = await tx.select().from(orderItems).where(eq(orderItems.orderId, orderId));
      for (const item of items) {
        if (!item.variantId) continue;
        await tx
          .update(inventoryItems)
          .set({ reservedQuantity: sql`GREATEST(${inventoryItems.reservedQuantity} - ${item.quantity}, 0)` })
          .where(eq(inventoryItems.variantId, item.variantId));
      }
    }
  });
}
