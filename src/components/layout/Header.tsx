import Link from "next/link";

/**
 * Server-rendered header. Search/cart/wishlist counts that need client state
 * live in small client islands (kept out of this file on purpose so the
 * header itself ships almost no JavaScript).
 */
export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link href="/" className="text-xl font-semibold tracking-tight">
          TovarkaDuck
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium md:flex" aria-label="Основна навігація">
          <Link href="/catalog">Каталог</Link>
          <Link href="/catalog?filter=new">Новинки</Link>
          <Link href="/catalog?filter=sale">Акції</Link>
        </nav>

        <div className="flex items-center gap-4">
          <Link href="/search" aria-label="Пошук" className="p-2">
            <SearchIcon />
          </Link>
          <Link href="/favorites" aria-label="Обране" className="hidden p-2 sm:block">
            <HeartIcon />
          </Link>
          <Link href="/cart" aria-label="Кошик" className="p-2">
            <CartIcon />
          </Link>
          <button
            type="button"
            aria-label="Відкрити меню"
            className="p-2 md:hidden"
          >
            <MenuIcon />
          </button>
        </div>
      </div>
    </header>
  );
}

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
      <path d="M21 21l-3.6-3.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 20s-7-4.35-9.3-8.6C1.2 8.1 2.9 5 6 5c1.9 0 3.3 1 4 2.3C10.7 6 12.1 5 14 5c3.1 0 4.8 3.1 3.3 6.4C19 15.65 12 20 12 20z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 4h2l1.6 10.6a2 2 0 002 1.7h7.9a2 2 0 002-1.6L20 8H6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="9" cy="20" r="1.4" fill="currentColor" />
      <circle cx="17" cy="20" r="1.4" fill="currentColor" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
