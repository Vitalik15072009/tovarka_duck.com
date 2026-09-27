/**
 * Generic, factual trust badges only (no invented review counts or sales
 * numbers). Replace icon set/copy through /admin/settings once real delivery
 * and payment details are confirmed.
 */
export function TrustBadges() {
  const badges = [
    { title: "Доставка по Україні", description: "Через Нову Пошту" },
    { title: "Оплата після огляду", description: "Або онлайн-оплата" },
    { title: "Обмін і повернення", description: "За умовами магазину" },
    { title: "Підтримка", description: "Відповідаємо в Telegram" },
  ];

  return (
    <ul className="grid grid-cols-2 gap-6 md:grid-cols-4">
      {badges.map((b) => (
        <li key={b.title} className="rounded-card border border-line p-4 text-center">
          <p className="text-sm font-semibold">{b.title}</p>
          <p className="mt-1 text-xs text-muted">{b.description}</p>
        </li>
      ))}
    </ul>
  );
}
