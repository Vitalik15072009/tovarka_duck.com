"use server";

import { revalidatePath } from "next/cache";
import { updateOrderStatus } from "@/server/services/orderService";
import { getCurrentAdmin } from "@/server/auth/session";
import { db } from "@/server/db";
import { shipments } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export async function updateOrderStatusAction(orderId: number, formData: FormData) {
  const admin = await getCurrentAdmin();
  const newStatus = formData.get("status") as
    | "NEW"
    | "CONFIRMED"
    | "PROCESSING"
    | "SHIPPED"
    | "DELIVERED"
    | "CANCELLED"
    | "RETURNED";
  const comment = String(formData.get("comment") ?? "");

  await updateOrderStatus(orderId, newStatus, admin?.userId, comment || undefined);
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
}

export async function saveTrackingNumberAction(orderId: number, formData: FormData) {
  const trackingNumber = String(formData.get("trackingNumber") ?? "");

  const [existing] = await db.select().from(shipments).where(eq(shipments.orderId, orderId)).limit(1);
  if (existing) {
    await db.update(shipments).set({ trackingNumber, updatedAt: new Date() }).where(eq(shipments.orderId, orderId));
  } else {
    await db.insert(shipments).values({ orderId, trackingNumber });
  }
  revalidatePath(`/admin/orders/${orderId}`);
}
