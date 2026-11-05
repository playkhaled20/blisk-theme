import { useCallback, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useRouterState } from '@tanstack/react-router';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { useMobileViewport } from '../../hooks/useMobileViewport';
import { useNavHasContent } from '../../hooks/useNavHasContent';
import {
  DashboardSquare01Icon,
  HomeIcon,
  SearchIcon,
  ShoppingBagIcon,
  UserIcon,
} from '../icons';

interface MobileBottomBarProps {
  /** Whether the shared nav drawer (opened from the header) is currently open. */
  navOpen: boolean;
  /** Open that same nav drawer — the Categories tab is just another trigger for it. */
  onOpenNav: () => void;
  /** Close it — the Account tab dismisses it before opening the account sheet. */
  onCloseNav?: () => void;
  /** Whether the {@link MobileAccountSheet} (shared with {@link ThemeLayout}) is open. */
  accountOpen?: boolean;
  /** Open / close that account sheet. */
  onAccountOpenChange?: (open: boolean) => void;
  /** Whether a "child" sheet opened from a row *inside* the account sheet --
   *  {@link ImportantLinksSheet} -- is open. Lives under the same
   *  My Account tab: it lights the tab the same way accountOpen does, and closes
   *  the same way every other overlay does when a different tab opens its
   *  own. */
  secondSheetOpen?: boolean;
  /** Close whichever one of those is open. */
  onCloseSecondSheet?: () => void;
}

type CartSummary = { count?: number | string | null };
type CartSdk = {
  storage?: { get?: <T>(key: string, fallback?: T) => T };
  helpers?: { number?: (value: number) => string };
  // Root on/off: onUpdated registers a wrapper that only offUpdated can remove.
  event?: {
    on?: (event: string, cb: (summary?: CartSummary) => void) => void;
    off?: (event: string, cb: (summary?: CartSummary) => void) => void;
  };
};

function getCartSdk(): CartSdk | undefined {
  if (typeof window === 'undefined') return undefined;
  return window.salla as unknown as CartSdk | undefined;
}

/* ─── Overlay coordination ─────────────────────────────────────────────────
   The tabs fall into two groups: Home / Cart navigate to a route, while
   Categories, Search and Account each open an overlay — the shared nav drawer,
   the Salla search modal and the account sheet (`MobileAccountSheet`). Whichever
   tab is tapped, every *other* overlay is dismissed first (so nothing is left
   stacked behind a backdrop) and the tapped tab's icon lights while its own
   overlay is open.

   The search modal belongs to `<salla-search>` in the header, so the bar learns
   about it from the modal's documented `modalVisibilityChanged` event (it
   bubbles to `document`) and closes it with the modal's own `close()` method.
   The header's `<salla-user-menu>` dropdown needs nothing: it closes itself on
   any click outside it, and a tap on the bar is one. No DOM queries. */

type Tab = 'home' | 'categories' | 'search' | 'cart' | 'account';

type SallaModalElement = HTMLElement & { close?: () => Promise<HTMLElement> };

/** Open the Salla search modal — the same event the header's search button fires. */
function openSearch() {
  window.salla?.event?.dispatch('search::open');
}

/** Dismiss every overlay the bar owns except the one `keep` is about to open. */
function closeOverlays(
  keep: Tab,
  closeSearch: () => void,
  closeNav?: () => void,
  closeAccount?: () => void,
  closeSecondSheet?: () => void
) {
  if (keep !== 'categories') closeNav?.();
  if (keep !== 'search') closeSearch();
  // The second-level sheets (important links, user menu) live under the same
  // More tab as the account sheet, so they go whenever the account sheet
  // would -- any tab other than its own.
  if (keep !== 'account') {
    closeAccount?.();
    closeSecondSheet?.();
  }
}

/**
 * Which single tab is lit, or `null` when the current route / state belongs to
 * no tab (a product, blog, listing page…) — in that case nothing in the bar is
 * highlighted. Home lights only on the home page itself.
 */
function activeTab(
  state: { searchOpen: boolean; menuOpen: boolean; navOpen: boolean },
  path: string
): Tab | null {
  if (state.searchOpen) return 'search';
  if (state.menuOpen) return 'account';
  if (state.navOpen) return 'categories';
  if (path === '/') return 'home';
  if (path === '/cart') return 'cart';
  if (path === '/account' || path.startsWith('/account/')) return 'account';
  return null;
}

/**
 * Whether the header's search modal is open, plus a way to close it. Driven by
 * the modal's `modalVisibilityChanged` event (`detail` is `true` on open). Only
 * listens while the bar can be seen: it stays mounted (CSS-hidden) on desktop,
 * so `enabled` (from `useMobileViewport`) turns the listener off there.
 */
function useSearchModal(enabled: boolean): [boolean, () => void] {
  const [open, setOpen] = useState(false);
  const modal = useRef<SallaModalElement | null>(null);

  useEffect(() => {
    if (!enabled) {
      setOpen(false);
      return;
    }
    const onVisibility = (event: Event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement) || !target.classList.contains('s-search-modal')) return;
      modal.current = target as SallaModalElement;
      setOpen((event as CustomEvent<boolean>).detail === true);
    };
    document.addEventListener('modalVisibilityChanged', onVisibility);
    return () => document.removeEventListener('modalVisibilityChanged', onVisibility);
  }, [enabled]);

  const close = useCallback(() => {
    if (open) void modal.current?.close?.();
  }, [open]);

  return [open, close];
}

/**
 * Drop a leading `/ar` / `/en-US` locale segment and any trailing slash so the
 * tab match is a plain `'/cart'` / `'/account/…'` comparison. Path-based (not
 * `routeId`-based) because the twilight route id lags SPA navigation into engine
 * routes — the account pages would otherwise never light their tab.
 */
function normalizePath(pathname: string): string {
  const withoutLocale = pathname.replace(/^\/[a-z]{2}(?:-[A-Z]{2})?(?=\/|$)/, '') || '/';
  return withoutLocale.length > 1 ? withoutLocale.replace(/\/$/, '') : withoutLocale;
}

function normalizeCount(value: unknown): number {
  const n = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : 0;
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
}

function formatCount(count: number): string {
  const formatted = getCartSdk()?.helpers?.number?.(count);
  return typeof formatted === 'string' ? formatted : String(count);
}

/**
 * Live cart count for the bar's badge. Seeds `0` and reads `salla.storage` only
 * inside the effect: touching it during render makes the client hydrate a
 * non-zero count over the server's `0` (React hydration mismatch).
 */
function useCartCount(): number {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let subscribed: CartSdk | undefined;

    const readStorage = () => {
      if (!cancelled)
        setCount(normalizeCount(getCartSdk()?.storage?.get?.('cart.summary.count', 0)));
    };

    const onUpdated = (summary?: CartSummary) => {
      if (cancelled) return;
      if (summary && Object.prototype.hasOwnProperty.call(summary, 'count')) {
        setCount(normalizeCount(summary.count));
        return;
      }
      readStorage();
    };

    const sync = () => {
      const sdk = getCartSdk();
      if (sdk && sdk !== subscribed) {
        subscribed?.event?.off?.('cart::updated', onUpdated);
        subscribed = sdk;
        subscribed.event?.on?.('cart::updated', onUpdated);
      }
      readStorage();
    };

    sync();
    document.addEventListener('theme::ready', sync);

    return () => {
      cancelled = true;
      subscribed?.event?.off?.('cart::updated', onUpdated);
      document.removeEventListener('theme::ready', sync);
    };
  }, []);

  return count;
}

interface BarItemProps {
  label: string;
  active: boolean;
  icon: ReactNode;
  testId: string;
}

/** A route tab — a real link so it SPA-navigates and works before hydration. */
function BarLink({
  to,
  label,
  active,
  icon,
  testId,
  onClick,
}: BarItemProps & { to: string; onClick?: () => void }) {
  return (
    <Link
      to={to}
      className={`mobile-bottom-bar__item${active ? ' is-active' : ''}`}
      aria-current={active ? 'page' : undefined}
      data-testid={testId}
      onClick={onClick}
    >
      <span className="mobile-bottom-bar__icon">{icon}</span>
      <span className="mobile-bottom-bar__label">{label}</span>
    </Link>
  );
}

/**
 * Fixed bottom navigation for small screens (`md:hidden`). Five tabs — Home,
 * Search, Categories, Cart, Account — rendered in document order so RTL puts
 * Home on the trailing (right) edge. At most one tab is lit at a time and the
 * lit tab expands into a filled primary pill that reveals its label; the rest
 * stay icon-only. On a page no tab owns (product, blog, listing…) nothing is
 * lit.
 *
 * Tapping any tab first dismisses every overlay the other tabs own — the nav
 * drawer, the search modal and the account sheet — so nothing is ever left
 * stacked behind another's backdrop (see {@link closeOverlays}). A tab then
 * lights while its own overlay is open (Search modal, Account sheet,
 * Categories drawer); with none open the route decides — Home on `/`, Cart on
 * `/cart`, Account under `/account` (see {@link activeTab}).
 *
 * The Account tab toggles {@link MobileAccountSheet} — for guests too, since
 * it also carries the footer widgets the page footer no longer shows on mobile
 * (a guest gets a login button in place of the account links).
 *
 * Mounted once in {@link ThemeLayout}, which also owns the drawer and account
 * sheet `open` state (the drawer is shared with the header). Styling: `04-components/mobile-bottom-bar.scss`.
 *
 * Shown on every route, including the product page — its sticky add-to-cart bar
 * is lifted to sit above this one (see `04-components/product.scss`).
 */
export function MobileBottomBar({
  navOpen,
  onOpenNav,
  onCloseNav,
  accountOpen = false,
  onAccountOpenChange,
  secondSheetOpen = false,
  onCloseSecondSheet,
}: MobileBottomBarProps) {
  const { t } = useTranslation();
  const cartCount = useCartCount();
  const isMobile = useMobileViewport();
  const navHasContent = useNavHasContent();
  const [searchOpen, closeSearch] = useSearchModal(isMobile);
  // The second-level sheets live under the More tab too -- light it the same way.
  const moreOpen = accountOpen || secondSheetOpen;
  const menuOpen = moreOpen;
  const path = normalizePath(useRouterState({ select: (s) => s.location.pathname }));
  const active = activeTab({ searchOpen, menuOpen, navOpen }, path);

  const openTab = (tab: Tab) =>
    closeOverlays(tab, closeSearch, onCloseNav, () => onAccountOpenChange?.(false), onCloseSecondSheet);
  const handleCategories = () => {
    openTab('categories');
    onOpenNav();
  };
  const handleSearch = () => {
    openTab('search');
    openSearch();
  };
  // Toggles: the bar sits above the sheet, so its own tab is how you close it.
  // The second-level sheets count as part of the open state here too --
  // tapping More while one is up closes the whole thing, not just the
  // (already-closed) account sheet underneath it.
  const handleAccount = () => {
    openTab('account');
    if (moreOpen) {
      onAccountOpenChange?.(false);
      onCloseSecondSheet?.();
    } else {
      onAccountOpenChange?.(true);
    }
  };

  const labels = {
    home: t('common.titles.home', 'Home'),
    search: t('blocks.header.search', 'Search'),
    // opens the main menu drawer, so it's labelled "menu", not "categories"
    categories: t('blocks.header.main_menu', 'Menu'),
    cart: t('blocks.header.cart', 'Cart'),
    // The sheet opens with the customer's own links (orders, wishlist, …).
    account: t('common.titles.my_account', 'My Account'),
  };

  return (
    <>
      {/* Glass fade behind the bar — its own fixed layer, one z-index below the
          bar. Styling: `04-components/mobile-bottom-bar.scss`. */}
      <div className="mobile-bottom-bar-scrim" aria-hidden="true" />

      <nav className="mobile-bottom-bar" aria-label={t('blocks.header.main_menu', 'Menu')}>
        <div className="mobile-bottom-bar__inner">
          <BarLink
            to="/"
            label={labels.home}
            active={active === 'home'}
            icon={<HomeIcon aria-hidden="true" />}
            testId="mobile-bottom-bar-home"
            onClick={() => openTab('home')}
          />

          {navHasContent && (
            <button
              type="button"
              className={`mobile-bottom-bar__item${active === 'categories' ? ' is-active' : ''}`}
              aria-expanded={active === 'categories'}
              data-testid="mobile-bottom-bar-categories"
              onClick={handleCategories}
            >
              <span className="mobile-bottom-bar__icon">
                <DashboardSquare01Icon aria-hidden="true" />
              </span>
              <span className="mobile-bottom-bar__label">{labels.categories}</span>
            </button>
          )}

          <button
            type="button"
            className={`mobile-bottom-bar__item${active === 'search' ? ' is-active' : ''}`}
            aria-pressed={active === 'search'}
            data-testid="mobile-bottom-bar-search"
            onClick={handleSearch}
          >
            <span className="mobile-bottom-bar__icon">
              <SearchIcon aria-hidden="true" />
            </span>
            <span className="mobile-bottom-bar__label">{labels.search}</span>
          </button>

          <Link
            to="/cart"
            className={`mobile-bottom-bar__item mobile-bottom-bar__item--cart${
              active === 'cart' ? ' is-active' : ''
            }`}
            aria-current={active === 'cart' ? 'page' : undefined}
            data-testid="mobile-bottom-bar-cart"
            onClick={() => openTab('cart')}
          >
            <span className="mobile-bottom-bar__icon">
              <ShoppingBagIcon aria-hidden="true" />
              {cartCount > 0 && (
                <span
                  key={cartCount}
                  className="mobile-bottom-bar__badge"
                  data-testid="mobile-bottom-bar-cart-count"
                >
                  {formatCount(cartCount)}
                </span>
              )}
            </span>
            <span className="mobile-bottom-bar__label">{labels.cart}</span>
          </Link>

          <button
            type="button"
            className={`mobile-bottom-bar__item${active === 'account' ? ' is-active' : ''}`}
            aria-haspopup="dialog"
            aria-expanded={moreOpen}
            data-testid="mobile-bottom-bar-account"
            onClick={handleAccount}
          >
            <span className="mobile-bottom-bar__icon">
              <UserIcon aria-hidden="true" />
            </span>
            <span className="mobile-bottom-bar__label">{labels.account}</span>
          </button>
        </div>
      </nav>
    </>
  );
}
