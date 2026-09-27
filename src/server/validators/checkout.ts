import { z } from "zod";

// Server-side validation is the source of truth - the client form re-uses this
// schema, but a request that skips the UI must still be rejected here.
export const checkoutSchema = z.object({
  customerName: z.string().trim().min(2, "Вкажіть ім'я").max(255),
  customerPhone: z
    .string()
    .trim()
    .regex(/^\+?[0-9\s-]{9,15}$/, "Перевірте номер телефону"),
  customerEmail: z.string().trim().email("Некоректний email").optional().or(z.literal("")),
  city: z.string().trim().min(2, "Вкажіть місто").max(255),
  warehouse: z.string().trim().min(2, "Вкажіть відділення або поштомат").max(255),
  shippingMethod: z.enum(["NOVA_POSHTA_BRANCH", "NOVA_POSHTA_POSTOMAT", "COURIER"]),
  paymentMethod: z.enum(["CASH_ON_DELIVERY", "ONLINE"]),
  comment: z.string().trim().max(1000).optional().or(z.literal("")),
  cart: z
    .array(
      z.object({
        variantId: z.number().int().positive(),
        quantity: z.number().int().positive().max(20),
      })
    )
    .min(1, "Кошик порожній"),
});

export type CheckoutFormValues = z.infer<typeof checkoutSchema>;
