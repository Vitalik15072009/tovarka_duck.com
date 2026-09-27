"use server";

import { revalidatePath } from "next/cache";
import { createCategory } from "@/server/services/adminProductService";

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-");
}

export async function createCategoryAction(formData: FormData) {
  const name = String(formData.get("name") ?? "");
  await createCategory({
    name,
    slug: slugify(name),
    description: String(formData.get("description") ?? ""),
    isActive: true,
  });
  revalidatePath("/admin/categories");
}
