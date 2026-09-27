export function ProductStatusFields({
  defaultStatus = "DRAFT",
  defaultFeatured = false,
  defaultNew = false,
  defaultSale = false,
}: {
  defaultStatus?: string;
  defaultFeatured?: boolean;
  defaultNew?: boolean;
  defaultSale?: boolean;
}) {
  return (
    <div className="space-y-3 rounded-card border border-line p-4">
      <div>
        <label className="mb-1 block text-sm font-medium" htmlFor="status">Статус</label>
        <select id="status" name="status" defaultValue={defaultStatus} className="h-11 rounded-card border border-line px-3">
          <option value="DRAFT">Чернетка</option>
          <option value="PUBLISHED">Опубліковано</option>
          <option value="ARCHIVED">Архів</option>
        </select>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="isFeatured" defaultChecked={defaultFeatured} /> Популярне
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="isNew" defaultChecked={defaultNew} /> Новинка
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="isSale" defaultChecked={defaultSale} /> Акція
      </label>
    </div>
  );
}
