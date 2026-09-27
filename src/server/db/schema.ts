import {
  pgTable,
  serial,
  text,
  varchar,
  integer,
  numeric,
  boolean,
  timestamp,
  primaryKey,
  pgEnum,
} from "drizzle-orm/pg-core";

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

export const userRoleEnum = pgEnum("user_role", ["ADMIN", "MANAGER", "EDITOR"]);

export const productStatusEnum = pgEnum("product_status", [
  "DRAFT",
  "PUBLISHED",
  "ARCHIVED",
]);

export const orderStatusEnum = pgEnum("order_status", [
  "NEW",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "RETURNED",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "PENDING",
  "PAID",
  "FAILED",
  "REFUNDED",
  "CASH_ON_DELIVERY",
]);

export const reviewStatusEnum = pgEnum("review_status", [
  "PENDING",
  "PUBLISHED",
  "HIDDEN",
]);

// ---------------------------------------------------------------------------
// Users / admin
// ---------------------------------------------------------------------------

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  role: userRoleEnum("role").notNull().default("EDITOR"),
  isActive: boolean("is_active").notNull().default(true),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  parentId: integer("parent_id"),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  imageUrl: text("image_url"),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  seoTitle: varchar("seo_title", { length: 255 }),
  seoDescription: text("seo_description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  sku: varchar("sku", { length: 100 }),
  brand: varchar("brand", { length: 100 }),
  shortDescription: text("short_description"),
  description: text("description"),
  status: productStatusEnum("status").notNull().default("DRAFT"),
  isFeatured: boolean("is_featured").notNull().default(false),
  isNew: boolean("is_new").notNull().default(false),
  isSale: boolean("is_sale").notNull().default(false),
  seoTitle: varchar("seo_title", { length: 255 }),
  seoDescription: text("seo_description"),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const productCategories = pgTable(
  "product_categories",
  {
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    categoryId: integer("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "cascade" }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.productId, table.categoryId] }),
  })
);

export const productVariants = pgTable("product_variants", {
  id: serial("id").primaryKey(),
  productId: integer("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  sku: varchar("sku", { length: 100 }).notNull().unique(),
  size: varchar("size", { length: 50 }),
  color: varchar("color", { length: 100 }),
  colorHex: varchar("color_hex", { length: 7 }),
  // Prices are stored in UAH as numeric (kopecks-safe precision).
  price: numeric("price", { precision: 12, scale: 2 }).notNull(),
  compareAtPrice: numeric("compare_at_price", { precision: 12, scale: 2 }),
  currency: varchar("currency", { length: 3 }).notNull().default("UAH"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const productImages = pgTable("product_images", {
  id: serial("id").primaryKey(),
  productId: integer("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  variantId: integer("variant_id").references(() => productVariants.id, {
    onDelete: "set null",
  }),
  url: text("url").notNull(),
  alt: varchar("alt", { length: 255 }),
  sortOrder: integer("sort_order").notNull().default(0),
  isPrimary: boolean("is_primary").notNull().default(false),
});

export const productAttributes = pgTable("product_attributes", {
  id: serial("id").primaryKey(),
  productId: integer("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  attributeName: varchar("attribute_name", { length: 100 }).notNull(),
  attributeValue: varchar("attribute_value", { length: 255 }).notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

// ---------------------------------------------------------------------------
// Inventory
// ---------------------------------------------------------------------------

export const inventoryItems = pgTable("inventory_items", {
  id: serial("id").primaryKey(),
  variantId: integer("variant_id")
    .notNull()
    .references(() => productVariants.id, { onDelete: "cascade" })
    .unique(),
  quantity: integer("quantity").notNull().default(0),
  reservedQuantity: integer("reserved_quantity").notNull().default(0),
  lowStockThreshold: integer("low_stock_threshold").notNull().default(3),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const inventoryMovementTypeEnum = pgEnum("inventory_movement_type", [
  "RECEIPT",
  "SALE",
  "RESERVATION",
  "RESERVATION_RELEASE",
  "RETURN",
  "ADJUSTMENT",
]);

export const inventoryMovements = pgTable("inventory_movements", {
  id: serial("id").primaryKey(),
  variantId: integer("variant_id")
    .notNull()
    .references(() => productVariants.id, { onDelete: "cascade" }),
  type: inventoryMovementTypeEnum("type").notNull(),
  quantityChange: integer("quantity_change").notNull(),
  orderId: integer("order_id"),
  note: text("note"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// Cart (guest-friendly, session based)
// ---------------------------------------------------------------------------

export const carts = pgTable("carts", {
  id: serial("id").primaryKey(),
  sessionId: varchar("session_id", { length: 64 }).notNull().unique(),
  userId: integer("user_id").references(() => users.id, {
    onDelete: "set null",
  }),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  cartId: integer("cart_id")
    .notNull()
    .references(() => carts.id, { onDelete: "cascade" }),
  variantId: integer("variant_id")
    .notNull()
    .references(() => productVariants.id, { onDelete: "cascade" }),
  quantity: integer("quantity").notNull().default(1),
  unitPrice: numeric("unit_price", { precision: 12, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// Orders
// ---------------------------------------------------------------------------

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderNumber: varchar("order_number", { length: 32 }).notNull().unique(),
  status: orderStatusEnum("status").notNull().default("NEW"),
  paymentStatus: paymentStatusEnum("payment_status")
    .notNull()
    .default("PENDING"),

  customerName: varchar("customer_name", { length: 255 }).notNull(),
  customerPhone: varchar("customer_phone", { length: 32 }).notNull(),
  customerEmail: varchar("customer_email", { length: 255 }),

  city: varchar("city", { length: 255 }).notNull(),
  // Free-text Nova Poshta branch/postomat until the real API lookup is wired in.
  warehouse: varchar("warehouse", { length: 255 }).notNull(),
  shippingMethod: varchar("shipping_method", { length: 100 }).notNull(),
  paymentMethod: varchar("payment_method", { length: 100 }).notNull(),

  subtotal: numeric("subtotal", { precision: 12, scale: 2 }).notNull(),
  discountTotal: numeric("discount_total", { precision: 12, scale: 2 })
    .notNull()
    .default("0"),
  shippingTotal: numeric("shipping_total", { precision: 12, scale: 2 })
    .notNull()
    .default("0"),
  grandTotal: numeric("grand_total", { precision: 12, scale: 2 }).notNull(),

  customerComment: text("customer_comment"),

  // Marketing attribution, captured at first touch and kept through checkout.
  utmSource: varchar("utm_source", { length: 255 }),
  utmMedium: varchar("utm_medium", { length: 255 }),
  utmCampaign: varchar("utm_campaign", { length: 255 }),
  utmContent: varchar("utm_content", { length: 255 }),
  utmTerm: varchar("utm_term", { length: 255 }),
  gclid: varchar("gclid", { length: 255 }),
  landingPage: text("landing_page"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  productId: integer("product_id").references(() => products.id, {
    onDelete: "set null",
  }),
  variantId: integer("variant_id").references(() => productVariants.id, {
    onDelete: "set null",
  }),
  // Snapshot fields: the product may change or be deleted after the order is placed.
  productName: varchar("product_name", { length: 255 }).notNull(),
  sku: varchar("sku", { length: 100 }).notNull(),
  size: varchar("size", { length: 50 }),
  color: varchar("color", { length: 100 }),
  imageUrl: text("image_url"),
  unitPrice: numeric("unit_price", { precision: 12, scale: 2 }).notNull(),
  quantity: integer("quantity").notNull(),
  totalPrice: numeric("total_price", { precision: 12, scale: 2 }).notNull(),
});

export const orderStatusHistory = pgTable("order_status_history", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  oldStatus: orderStatusEnum("old_status"),
  newStatus: orderStatusEnum("new_status").notNull(),
  changedBy: integer("changed_by").references(() => users.id, {
    onDelete: "set null",
  }),
  comment: text("comment"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// Payments & shipments (adapters live in src/server/adapters)
// ---------------------------------------------------------------------------

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  provider: varchar("provider", { length: 50 }).notNull(),
  providerPaymentId: varchar("provider_payment_id", { length: 255 }),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  status: paymentStatusEnum("status").notNull().default("PENDING"),
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const shipments = pgTable("shipments", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" })
    .unique(),
  provider: varchar("provider", { length: 50 }).notNull().default("NOVA_POSHTA"),
  trackingNumber: varchar("tracking_number", { length: 100 }),
  status: varchar("status", { length: 50 }).notNull().default("PENDING"),
  labelUrl: text("label_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// Reviews
// ---------------------------------------------------------------------------

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  productId: integer("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  orderId: integer("order_id").references(() => orders.id, {
    onDelete: "set null",
  }),
  authorName: varchar("author_name", { length: 255 }).notNull(),
  rating: integer("rating").notNull(),
  text: text("text").notNull(),
  status: reviewStatusEnum("status").notNull().default("PENDING"),
  isVerifiedPurchase: boolean("is_verified_purchase").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// Store settings (singleton row, id = 1)
// ---------------------------------------------------------------------------

export const storeSettings = pgTable("store_settings", {
  id: serial("id").primaryKey(),
  storeName: varchar("store_name", { length: 255 }).notNull().default("TovarkaDuck"),
  logoUrl: text("logo_url"),
  contactPhone: varchar("contact_phone", { length: 32 }),
  contactEmail: varchar("contact_email", { length: 255 }),
  telegramUrl: text("telegram_url"),
  instagramUrl: text("instagram_url"),
  deliveryText: text("delivery_text"),
  returnsText: text("returns_text"),
  currency: varchar("currency", { length: 3 }).notNull().default("UAH"),
  gtmId: varchar("gtm_id", { length: 50 }),
  ga4Id: varchar("ga4_id", { length: 50 }),
  googleAdsId: varchar("google_ads_id", { length: 50 }),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
