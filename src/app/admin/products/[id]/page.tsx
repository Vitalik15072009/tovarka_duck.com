import { notFound } from "next/navigation";
import { getProductForAdmin, listAllCategoriesForAdmin } from "@/server/services/adminProductService";
import { ProductStatusFields } from "@/components/admin/ProductStatusFields";
import {
  updateProductAction,
  deleteProductAction,
  addVariantAction,
  updateStockAction,
  addImageAction,
} from "../actions";

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const productId = Number(params.id);
  const data = await getProductForAdmin(productId);
  if (!data) notFound();

  const { product, variants, images } = data;
  const categories = await listAllCategoriesForAdmin();

  const updateAction = updateProductAction.bind(null, productId);
  const deleteAction = deleteProductAction.bind(null, productId);
  const addVariantBound = addVariantAction.bind(null, productId);
  const addImageBound = addImageAction.bind(null, productId);

  return (
    <div className="max-w-3xl space-y-10">
      <div>
        <h1 className="text-2xl font-semibold">{product.name}</h1>
        <p className="text-sm text-muted">/product/{product.slug}</p>
      </div>

      <form action={updateAction} className="space-y-4 rounded-card border border-line bg-white p-6">
        <h2 className="text-lg font-semibold">Основна інформація</h2>
        <TextField label="Назва" name="name" defaultValue={product.name} required />
        <TextField label="URL (slug)" name="slug" defaultValue={product.slug} required />
        <TextArea label="Короткий опис" name="shortDescription" defaultValue={product.shortDescription ?? ""} />
        <TextArea label="Повний опис" name="description" defaultValue={product.description ?? ""} rows={6} />

        <ProductStatusFields
          defaultStatus={product.status}
          defaultFeatured={product.isFeatured}
          defaultNew={product.isNew}
          defaultSale={product.isSale}
        />

        {categories.length > 0 && (
          <div>
            <p className="mb-2 text-sm font-medium">Категорії</p>
            <div className="flex flex-wrap gap-3">
              {categories.map((c) => (
                <label key={c.id} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name="categoryIds" value={c.id} /> {c.name}
                </label>
              ))}
            </div>
          </div>
        )}

        <TextField label="SEO title" name="seoTitle" defaultValue={product.seoTitle ?? ""} />
        <TextArea label="SEO description" name="seoDescription" defaultValue={product.seoDescription ?? ""} />

        <button type="submit" className="rounded-card bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground">
          Зберегти зміни
        </button>
      </form>

      <section className="rounded-card border border-line bg-white p-6">
        <h2 className="text-lg font-semibold">Варіанти (розмір / колір / ціна / залишок)</h2>

        <table className="mt-4 w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-muted">
              <th className="py-2">SKU</th>
              <th className="py-2">Розмір</th>
              <th className="py-2">Колір</th>
              <th className="py-2">Ціна</th>
              <th className="py-2">Стара ціна</th>
              <th className="py-2">Залишок</th>
            </tr>
          </thead>
          <tbody>
            {variants.map((v) => (
              <tr key={v.id} className="border-b border-line">
                <td className="py-2">{v.sku}</td>
                <td className="py-2">{v.size}</td>
                <td className="py-2">{v.color}</td>
                <td className="py-2">{v.price} ₴</td>
                <td className="py-2">{v.compareAtPrice ?? "—"}</td>
                <td className="py-2">
                  <form action={updateStockAction.bind(null, productId, v.id)} className="flex items-center gap-2">
                    <input
                      type="number"
                      name="quantity"
                      defaultValue={v.quantity ?? 0}
                      min={0}
                      className="h-9 w-20 rounded border border-line px-2"
                    />
                    <button type="submit" className="text-xs underline">Оновити</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <form action={addVariantBound} className="mt-6 grid grid-cols-2 gap-3 border-t border-line pt-4 md:grid-cols-3">
          <MiniField label="SKU" name="sku" required />
          <MiniField label="Розмір" name="size" />
          <MiniField label="Колір" name="color" />
          <MiniField label="Колір (HEX)" name="colorHex" placeholder="#111111" />
          <MiniField label="Ціна, ₴" name="price" type="number" required />
          <MiniField label="Стара ціна, ₴" name="compareAtPrice" type="number" />
          <MiniField label="Залишок" name="quantity" type="number" />
          <div className="col-span-full">
            <button type="submit" className="rounded-card border border-ink px-4 py-2 text-sm font-semibold">
              + Додати варіант
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-card border border-line bg-white p-6">
        <h2 className="text-lg font-semibold">Фотографії</h2>
        <ul className="mt-3 flex flex-wrap gap-3">
          {images.map((img) => (
            <li key={img.id} className="w-24 truncate rounded border border-line p-2 text-xs">
              {img.url} {img.isPrimary && <span className="font-semibold">(головне)</span>}
            </li>
          ))}
        </ul>

        <form action={addImageBound} className="mt-4 grid gap-3 border-t border-line pt-4 md:grid-cols-3">
          <MiniField label="URL фото" name="url" required />
          <MiniField label="Alt-текст" name="alt" />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="isPrimary" /> Головне фото
          </label>
          <div className="col-span-full">
            <button type="submit" className="rounded-card border border-ink px-4 py-2 text-sm font-semibold">
              + Додати фото
            </button>
          </div>
        </form>
        <p className="mt-2 text-xs text-muted">
          MVP: вставте URL фото (наприклад, після завантаження у сховище). Пряме завантаження файлів підключається окремо
          через object storage.
        </p>
      </section>

      <form action={deleteAction}>
        <button type="submit" className="text-sm text-sale underline">Видалити товар</button>
      </form>
    </div>
  );
}

function TextField({ label, name, defaultValue, required }: { label: string; name: string; defaultValue?: string; required?: boolean }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium" htmlFor={name}>{label}</label>
      <input id={name} name={name} defaultValue={defaultValue} required={required} className="h-12 w-full rounded-card border border-line px-3" />
    </div>
  );
}

function TextArea({ label, name, defaultValue, rows = 3 }: { label: string; name: string; defaultValue?: string; rows?: number }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium" htmlFor={name}>{label}</label>
      <textarea id={name} name={name} defaultValue={defaultValue} rows={rows} className="w-full rounded-card border border-line p-3" />
    </div>
  );
}

function MiniField({ label, name, type = "text", required, placeholder }: { label: string; name: string; type?: string; required?: boolean; placeholder?: string }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium" htmlFor={name}>{label}</label>
      <input id={name} name={name} type={type} required={required} placeholder={placeholder} className="h-10 w-full rounded border border-line px-2 text-sm" />
    </div>
  );
}
