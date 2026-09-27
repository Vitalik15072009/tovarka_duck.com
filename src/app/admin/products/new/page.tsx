import { createProductAction } from "../actions";
import { ProductStatusFields } from "@/components/admin/ProductStatusFields";

export default function NewProductPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold">Новий товар</h1>
      <form action={createProductAction} className="mt-6 space-y-4">
        <TextField label="Назва" name="name" required />
        <TextField label="URL (slug), необов'язково - згенерується з назви" name="slug" />
        <TextArea label="Короткий опис" name="shortDescription" />
        <TextArea label="Повний опис" name="description" rows={6} />
        <ProductStatusFields />
        <TextField label="SEO title" name="seoTitle" />
        <TextArea label="SEO description" name="seoDescription" />
        <button type="submit" className="rounded-card bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground">
          Створити товар
        </button>
      </form>
    </div>
  );
}

function TextField({ label, name, required }: { label: string; name: string; required?: boolean }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium" htmlFor={name}>{label}</label>
      <input id={name} name={name} required={required} className="h-12 w-full rounded-card border border-line px-3" />
    </div>
  );
}

function TextArea({ label, name, rows = 3 }: { label: string; name: string; rows?: number }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium" htmlFor={name}>{label}</label>
      <textarea id={name} name={name} rows={rows} className="w-full rounded-card border border-line p-3" />
    </div>
  );
}
