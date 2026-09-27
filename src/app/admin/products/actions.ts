"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  addVariant,
  updateVariantStock,
  addProductImage,
  setProductCategories,
} from "@/server/services/adminProductService";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}

export async function createProductAction(formData: FormData) {
  const name = String(formData.get("name") ?? "");
  const slugInput = String(formData.get("slug") ?? "");

  const product = await createProduct({
    name,
    slug: slugInput ? slugify(slugInput) : slugify(name),
    shortDescription: String(formData.get("shortDescription") ?? ""),
    description: String(formData.get("description") ?? ""),
    status: (formData.get("status") as "DRAFT" | "PUBLISHED" | "ARCHIVED") ?? "DRAFT",
    isFeatured: formData.get("isFeatured") === "on",
    isNew: formData.get("isNew") === "on",
    isSale: formData.get("isSale") === "on",
    seoTitle: String(formData.get("seoTitle") ?? ""),
    seoDescription: String(formData.get("seoDescription") ?? ""),
  });

  revalidatePath("/admin/products");
  redirect(`/admin/products/${product.id}`);
}

export async function updateProductAction(productId: number, formData: FormData) {
  await updateProduct(productId, {
    name: String(formData.get("name") ?? ""),
    slug: slugify(String(formData.get("slug") ?? "")),
    shortDescription: String(formData.get("shortDescription") ?? ""),
    description: String(formData.get("description") ?? ""),
    status: (formData.get("status") as "DRAFT" | "PUBLISHED" | "ARCHIVED") ?? "DRAFT",
    isFeatured: formData.get("isFeatured") === "on",
    isNew: formData.get("isNew") === "on",
    isSale: formData.get("isSale") === "on",
    seoTitle: String(formData.get("seoTitle") ?? ""),
    seoDescription: String(formData.get("seoDescription") ?? ""),
  });

  const categoryIds = formData.getAll("categoryIds").map((v) => Number(v));
  await setProductCategories(productId, categoryIds);

  revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/admin/products");
}

export async function deleteProductAction(productId: number) {
  await deleteProduct(productId);
  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function addVariantAction(productId: number, formData: FormData) {
  await addVariant(productId, {
    sku: String(formData.get("sku") ?? ""),
    size: String(formData.get("size") ?? ""),
    color: String(formData.get("color") ?? ""),
    colorHex: String(formData.get("colorHex") ?? ""),
    price: String(formData.get("price") ?? "0"),
    compareAtPrice: String(formData.get("compareAtPrice") ?? ""),
    quantity: Number(formData.get("quantity") ?? 0),
  });
  revalidatePath(`/admin/products/${productId}`);
}

export async function updateStockAction(productId: number, variantId: number, formData: FormData) {
  await updateVariantStock(variantId, Number(formData.get("quantity") ?? 0));
  revalidatePath(`/admin/products/${productId}`);
}

export async function addImageAction(productId: number, formData: FormData) {
  // MVP note: this stores a URL you paste in (e.g. after uploading elsewhere).
  // Wire this to real object storage (see BLOB_READ_WRITE_TOKEN in .env.example)
  // to support direct file upload from this form.
  await addProductImage(
    productId,
    String(formData.get("url") ?? ""),
    String(formData.get("alt") ?? ""),
    formData.get("isPrimary") === "on"
  );
  revalidatePath(`/admin/products/${productId}`);
}
