import { and, eq } from "drizzle-orm";
import { db } from "@/server/db";
import { carts, cartItems, productVariants, inventoryItems, products, productImages } from "@/server/db/schema";
import { nanoid } from "nanoid";

const CART_TTL_DAYS = 30;

export async function getOrCreateCart(sessionId: string | undefined) {
  if (sessionId) {
    const [existing] = await db.select().from(carts).where(eq(carts.sessionId, sessionId)).limit(1);
    if (existing) return existing;
  }

  const newSessionId = sessionId ?? nanoid(24);
  const expiresAt = new Date(Date.now() + CART_TTL_DAYS * 24 * 60 * 60 * 1000);

  const [created] = await db
    .insert(carts)
    .values({ sessionId: newSessionId, expiresAt })
    .onConflictDoNothing()
    .returning();

  if (created) return created;

  // Race condition fallback: another request created it first.
  const [existing] = await db.select().from(carts).where(eq(carts.sessionId, newSessionId)).limit(1);
  return existing;
}

export async function addToCart(sessionId: string, variantId: number, quantity: number) {
  const cart = await getOrCreateCart(sessionId);

  const [variant] = await db
    .select({ price: productVariants.price })
    .from(productVariants)
    .where(eq(productVariants.id, variantId))
    .limit(1);

  if (!variant) throw new Error("Variant not found");

  const [existingItem] = await db
    .select()
    .from(cartItems)
    .where(and(eq(cartItems.cartId, cart.id), eq(cartItems.variantId, variantId)))
    .limit(1);

  if (existingItem) {
    await db
      .update(cartItems)
      .set({ quantity: existingItem.quantity + quantity })
      .where(eq(cartItems.id, existingItem.id));
  } else {
    await db.insert(cartItems).values({
      cartId: cart.id,
      variantId,
      quantity,
      unitPrice: variant.price,
    });
  }

  return cart;
}

export async function updateCartItemQuantity(sessionId: string, itemId: number, quantity: number) {
  const cart = await getOrCreateCart(sessionId);
  if (quantity <= 0) {
    await db.delete(cartItems).where(and(eq(cartItems.id, itemId), eq(cartItems.cartId, cart.id)));
    return;
  }
  await db
    .update(cartItems)
    .set({ quantity })
    .where(and(eq(cartItems.id, itemId), eq(cartItems.cartId, cart.id)));
}

export async function removeCartItem(sessionId: string, itemId: number) {
  const cart = await getOrCreateCart(sessionId);
  await db.delete(cartItems).where(and(eq(cartItems.id, itemId), eq(cartItems.cartId, cart.id)));
}

export async function getCartWithDetails(sessionId: string | undefined) {
  if (!sessionId) return { cart: null, items: [], subtotal: 0 };

  const [cart] = await db.select().from(carts).where(eq(carts.sessionId, sessionId)).limit(1);
  if (!cart) return { cart: null, items: [], subtotal: 0 };

  const rows = await db
    .select({
      itemId: cartItems.id,
      variantId: cartItems.variantId,
      quantity: cartItems.quantity,
      unitPrice: cartItems.unitPrice,
      size: productVariants.size,
      color: productVariants.color,
      productName: products.name,
      productSlug: products.slug,
      imageUrl: productImages.url,
      available: inventoryItems.quantity,
      reserved: inventoryItems.reservedQuantity,
    })
    .from(cartItems)
    .innerJoin(productVariants, eq(productVariants.id, cartItems.variantId))
    .innerJoin(products, eq(products.id, productVariants.productId))
    .leftJoin(
      productImages,
      and(eq(productImages.productId, products.id), eq(productImages.isPrimary, true))
    )
    .leftJoin(inventoryItems, eq(inventoryItems.variantId, productVariants.id))
    .where(eq(cartItems.cartId, cart.id));

  const items = rows.map((r) => ({
    itemId: r.itemId,
    variantId: r.variantId,
    quantity: r.quantity,
    unitPrice: Number(r.unitPrice),
    size: r.size,
    color: r.color,
    productName: r.productName,
    productSlug: r.productSlug,
    imageUrl: r.imageUrl,
    inStock: (r.available ?? 0) - (r.reserved ?? 0) >= r.quantity,
  }));

  const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);

  return { cart, items, subtotal };
}
