import Link from "next/link";

/**
 * All contact details, social links and policy text are placeholders until
 * they are filled in through /admin/settings (store_settings table) - do not
 * invent phone numbers, addresses or social handles here.
 */
export function Footer() {
  return (
    <footer className="border-t border-line bg-white">
      <div className="container-page grid gap-10 py-14 md:grid-cols-4">
        <div>
          <p className="text-lg font-semibold">TovarkaDuck</p>
          <p className="mt-3 text-sm text-muted">
            {/* TODO: замінити на реальний короткий опис бренду через адмінку */}
            Опис бренду буде додано в адмін-панелі.
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold">Каталог</p>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li><Link href="/catalog">Всі товари</Link></li>
            <li><Link href="/catalog?filter=new">Новинки</Link></li>
            <li><Link href="/catalog?filter=sale">Акції</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold">Інформація</p>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li><Link href="/delivery-payment">Доставка та оплата</Link></li>
            <li><Link href="/returns">Обмін і повернення</Link></li>
            <li><Link href="/contacts">Контакти</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold">Контакти</p>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            {/* TODO: реальні контакти й соцмережі додаються через /admin/settings */}
            <li>Telegram: додати в адмінці</li>
            <li>Instagram: додати в адмінці</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-line py-6 text-center text-xs text-muted">
        © {new Date().getFullYear()} TovarkaDuck. Усі права захищені.
      </div>
    </footer>
  );
}
