import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, screen, act, cleanup } from '@testing-library/react';
import { MobileBottomBar } from '../../../app/components/layout/MobileBottomBar';

/** The header's search modal, like `<salla-modal>`: `visible` flips fire the
 * documented `modalVisibilityChanged` event (bubbling), and `close()` hides it. */
function mountSearchModal() {
  const modal = document.createElement('salla-modal') as HTMLElement & {
    close: () => Promise<HTMLElement>;
  };
  modal.className = 's-search-modal';
  const setVisible = (on: boolean) => {
    modal.toggleAttribute('visible', on);
    modal.dispatchEvent(new CustomEvent('modalVisibilityChanged', { detail: on, bubbles: true }));
  };
  modal.close = async () => {
    setVisible(false);
    return modal;
  };
  document.body.appendChild(modal);
  return { modal, open: () => setVisible(true) };
}

async function openModal(search: ReturnType<typeof mountSearchModal>) {
  await act(async () => {
    search.open();
  });
}

const route = { pathname: '/', locale: 'en' };

vi.mock('@tanstack/react-router', () => ({
  useRouterState: ({ select }: { select: (s: { location: { pathname: string } }) => unknown }) =>
    select({ location: { pathname: route.pathname } }),
}));

const nav = { hasContent: true };
vi.mock('../../../app/hooks/useNavHasContent', () => ({
  useNavHasContent: () => nav.hasContent,
}));

vi.mock('@salla.sa/twilight-theme-engine/common', () => ({
  Link: ({ to, children, className, ...rest }: Record<string, unknown>) => (
    <a href={String(to)} className={className as string} {...(rest as Record<string, unknown>)}>
      {children as React.ReactNode}
    </a>
  ),
}));

vi.mock('@salla.sa/twilight-theme-engine/i18n', () => ({
  useTranslation: () => ({
    locale: route.locale,
    t: (key: string, fallback: string) => {
      const en: Record<string, string> = {
        'common.titles.home': 'Home',
        'common.titles.categories': 'Categories',
        'common.titles.my_account': 'My Account',
        'blocks.header.cart': 'Cart',
        'blocks.header.search': 'Search',
        'blocks.header.main_menu': 'Menu',
      };
      return en[key] ?? fallback;
    },
  }),
}));

beforeEach(() => {
  route.pathname = '/';
  route.locale = 'en';
  nav.hasContent = true;
  delete (window as unknown as { salla?: unknown }).salla;
});

afterEach(() => {
  // Unmount first: the bar's `<body>` MutationObserver would otherwise fire on
  // the node removal below and call setState outside act().
  cleanup();
  document.querySelectorAll('salla-user-menu, salla-modal').forEach((el) => el.remove());
});

describe('MobileBottomBar', () => {
  const noop = () => {};

  it('renders all five tabs with their labels', () => {
    render(<MobileBottomBar navOpen={false} onOpenNav={noop} />);

    expect(screen.getByText('Home')).toBeTruthy();
    expect(screen.getByText('Search')).toBeTruthy();
    expect(screen.getByText('Menu')).toBeTruthy();
    expect(screen.getByText('Cart')).toBeTruthy();
    expect(screen.getByText('My Account')).toBeTruthy();
  });

  it('drops the Menu tab when the menu would open empty', () => {
    nav.hasContent = false;
    render(<MobileBottomBar navOpen={false} onOpenNav={noop} />);

    expect(screen.queryByTestId('mobile-bottom-bar-categories')).toBeNull();
    expect(screen.getByText('Home')).toBeTruthy();
  });

  it('uses the user line icon for the My Account tab', () => {
    render(<MobileBottomBar navOpen={false} onOpenNav={noop} />);

    const account = screen.getByTestId('mobile-bottom-bar-account');
    expect(account.querySelector('svg')).toBeTruthy();
    expect(account.querySelector('i.sicon-ellipsis')).toBeNull();
  });

  it('opens the Salla search modal when the Search tab is tapped', () => {
    const dispatch = vi.fn();
    (window as unknown as { salla: unknown }).salla = { event: { dispatch } };

    render(<MobileBottomBar navOpen={false} onOpenNav={noop} />);
    fireEvent.click(screen.getByTestId('mobile-bottom-bar-search'));

    expect(dispatch).toHaveBeenCalledWith('search::open');
  });

  it('points the route tabs at their in-app paths', () => {
    render(<MobileBottomBar navOpen={false} onOpenNav={noop} />);

    expect(screen.getByTestId('mobile-bottom-bar-home').getAttribute('href')).toBe('/');
    expect(screen.getByTestId('mobile-bottom-bar-cart').getAttribute('href')).toBe('/cart');
    // account is a button (opens the account sheet), not a link
    expect(screen.getByTestId('mobile-bottom-bar-account').tagName).toBe('BUTTON');
  });

  it('opens the account sheet when the Account tab is tapped', () => {
    const onAccountOpenChange = vi.fn();

    render(
      <MobileBottomBar navOpen={false} onOpenNav={noop} onAccountOpenChange={onAccountOpenChange} />
    );
    fireEvent.click(screen.getByTestId('mobile-bottom-bar-account'));

    expect(onAccountOpenChange).toHaveBeenCalledWith(true);
  });

  it('closes the account sheet when the Account tab is tapped again', () => {
    const onAccountOpenChange = vi.fn();

    render(
      <MobileBottomBar
        navOpen={false}
        onOpenNav={noop}
        accountOpen
        onAccountOpenChange={onAccountOpenChange}
      />
    );
    fireEvent.click(screen.getByTestId('mobile-bottom-bar-account'));

    expect(onAccountOpenChange).toHaveBeenCalledWith(false);
  });

  it('also closes important links when the Account tab is tapped while it is open', () => {
    const onAccountOpenChange = vi.fn();
    const onCloseSecondSheet = vi.fn();

    render(
      <MobileBottomBar
        navOpen={false}
        onOpenNav={noop}
        secondSheetOpen
        onAccountOpenChange={onAccountOpenChange}
        onCloseSecondSheet={onCloseSecondSheet}
      />
    );
    fireEvent.click(screen.getByTestId('mobile-bottom-bar-account'));

    expect(onAccountOpenChange).toHaveBeenCalledWith(false);
    expect(onCloseSecondSheet).toHaveBeenCalledTimes(1);
  });

  it('opens the account sheet for guests too, not the login modal directly', () => {
    const dispatch = vi.fn();
    (window as unknown as { salla: unknown }).salla = { event: { dispatch } };
    const onAccountOpenChange = vi.fn();

    render(
      <MobileBottomBar navOpen={false} onOpenNav={noop} onAccountOpenChange={onAccountOpenChange} />
    );
    fireEvent.click(screen.getByTestId('mobile-bottom-bar-account'));

    expect(onAccountOpenChange).toHaveBeenCalledWith(true);
    expect(dispatch).not.toHaveBeenCalledWith('login::open');
  });

  it('dismisses the drawer when the Account tab is tapped', async () => {
    const onCloseNav = vi.fn();

    render(
      <MobileBottomBar
        navOpen
        onOpenNav={noop}
        onCloseNav={onCloseNav}
        onAccountOpenChange={noop}
      />
    );
    await act(async () => {
      fireEvent.click(screen.getByTestId('mobile-bottom-bar-account'));
    });

    expect(onCloseNav).toHaveBeenCalledTimes(1);
  });

  it('lights the Account tab while the account sheet is open', () => {
    render(<MobileBottomBar navOpen={false} onOpenNav={noop} accountOpen />);

    const account = screen.getByTestId('mobile-bottom-bar-account');
    expect(account.className).toContain('is-active');
    expect(account.getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByTestId('mobile-bottom-bar-home').className).not.toContain('is-active');
  });

  it('lights the My Account tab while important links — a child of it — is open, even though accountOpen is false', () => {
    render(<MobileBottomBar navOpen={false} onOpenNav={noop} secondSheetOpen />);

    const account = screen.getByTestId('mobile-bottom-bar-account');
    expect(account.className).toContain('is-active');
    expect(account.getAttribute('aria-expanded')).toBe('true');
  });

  it('lights the Search tab while the search modal is open', async () => {
    const search = mountSearchModal();
    render(<MobileBottomBar navOpen={false} onOpenNav={noop} />);
    expect(screen.getByTestId('mobile-bottom-bar-search').className).not.toContain('is-active');

    await openModal(search);

    expect(screen.getByTestId('mobile-bottom-bar-search').className).toContain('is-active');
    expect(screen.getByTestId('mobile-bottom-bar-search').getAttribute('aria-pressed')).toBe(
      'true'
    );
    expect(screen.getByTestId('mobile-bottom-bar-home').className).not.toContain('is-active');
  });

  it('ignores other modals opening', async () => {
    render(<MobileBottomBar navOpen={false} onOpenNav={noop} />);
    const other = document.createElement('salla-modal');
    document.body.appendChild(other);
    await act(async () => {
      other.dispatchEvent(new CustomEvent('modalVisibilityChanged', { detail: true, bubbles: true }));
    });

    expect(screen.getByTestId('mobile-bottom-bar-search').className).not.toContain('is-active');
  });

  it('does not observe for search/account overlays on desktop (matchMedia not matching)', async () => {
    const originalMatchMedia = window.matchMedia;
    window.matchMedia = ((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    })) as typeof window.matchMedia;

    try {
      render(<MobileBottomBar navOpen={false} onOpenNav={noop} />);
      expect(screen.getByTestId('mobile-bottom-bar-search').className).not.toContain('is-active');

      // On desktop the listener is never started, so this must NOT light the tab.
      await openModal(mountSearchModal());

      expect(screen.getByTestId('mobile-bottom-bar-search').className).not.toContain('is-active');
    } finally {
      window.matchMedia = originalMatchMedia;
    }
  });

  it('dismisses the drawer and the account sheet when Search is tapped', async () => {
    const dispatch = vi.fn();
    (window as unknown as { salla: unknown }).salla = { event: { dispatch } };
    const onCloseNav = vi.fn();
    const onAccountOpenChange = vi.fn();

    render(
      <MobileBottomBar
        navOpen
        onOpenNav={noop}
        onCloseNav={onCloseNav}
        accountOpen
        onAccountOpenChange={onAccountOpenChange}
      />
    );
    // `await act` so the DOM-observing hooks' state updates flush inside act.
    await act(async () => {
      fireEvent.click(screen.getByTestId('mobile-bottom-bar-search'));
    });

    expect(onCloseNav).toHaveBeenCalledTimes(1);
    expect(onAccountOpenChange).toHaveBeenCalledWith(false);
    expect(dispatch).toHaveBeenCalledWith('search::open');
  });

  it('closes important links, same as the account sheet, when another tab is tapped', async () => {
    const onCloseSecondSheet = vi.fn();

    render(
      <MobileBottomBar
        navOpen={false}
        onOpenNav={noop}
        secondSheetOpen
        onCloseSecondSheet={onCloseSecondSheet}
      />
    );
    await act(async () => {
      fireEvent.click(screen.getByTestId('mobile-bottom-bar-home'));
    });

    expect(onCloseSecondSheet).toHaveBeenCalledTimes(1);
  });

  it('closes the search modal when a route tab is tapped', async () => {
    const search = mountSearchModal();

    render(<MobileBottomBar navOpen={false} onOpenNav={noop} onCloseNav={noop} />);
    await openModal(search);
    await act(async () => {
      fireEvent.click(screen.getByTestId('mobile-bottom-bar-home'));
    });

    expect(search.modal.hasAttribute('visible')).toBe(false);
    expect(screen.getByTestId('mobile-bottom-bar-search').className).not.toContain('is-active');
  });

  it('renders on the product detail page with no tab lit (no tab owns it)', () => {
    route.pathname = '/ar/blue-hoodie/p4821';
    const { container } = render(<MobileBottomBar navOpen={false} onOpenNav={noop} />);

    expect(container.querySelector('.mobile-bottom-bar')).not.toBeNull();
    for (const id of ['home', 'categories', 'search', 'cart', 'account']) {
      expect(screen.getByTestId(`mobile-bottom-bar-${id}`).className).not.toContain('is-active');
    }
  });

  // Regression guard (removed product_bottom_nav_rounded): the bar
  // used to switch to a flush, square-cornered variant on the product page --
  // now it's the plain rounded pill everywhere, with no product-page branch at
  // all. This pins that down on the one route that used to get special treatment.
  it('still renders the plain rounded bar on the product page, not a flush variant', () => {
    route.pathname = '/ar/blue-hoodie/p4821';
    const { container } = render(<MobileBottomBar navOpen={false} onOpenNav={noop} />);

    const nav = container.querySelector('nav.mobile-bottom-bar');
    expect(nav).not.toBeNull();
    expect(nav?.className).toBe('mobile-bottom-bar');
  });

  it('still renders on a category / listing page', () => {
    route.pathname = '/ar/mens/c17';
    render(<MobileBottomBar navOpen={false} onOpenNav={noop} />);

    expect(screen.getByTestId('mobile-bottom-bar-home')).toBeTruthy();
  });

  it('lights the home tab only on the home page, nothing on pages no tab owns', () => {
    const { rerender } = render(<MobileBottomBar navOpen={false} onOpenNav={noop} />);

    const home = screen.getByTestId('mobile-bottom-bar-home');
    expect(home.getAttribute('aria-current')).toBe('page');
    expect(home.className).toContain('is-active');

    // A listing / blog page — no tab owns it, so the bar shows nothing lit.
    route.pathname = '/ar/blog/my-post/a-99';
    rerender(<MobileBottomBar navOpen={false} onOpenNav={noop} />);

    expect(screen.getByTestId('mobile-bottom-bar-home').className).not.toContain('is-active');
    expect(screen.getByTestId('mobile-bottom-bar-home').getAttribute('aria-current')).toBeNull();
    for (const id of ['categories', 'search', 'cart', 'account']) {
      expect(screen.getByTestId(`mobile-bottom-bar-${id}`).className).not.toContain('is-active');
    }
  });

  it('lights the cart tab on the cart route, locale prefix and all', () => {
    route.pathname = '/ar/cart';

    render(<MobileBottomBar navOpen={false} onOpenNav={noop} />);

    expect(screen.getByTestId('mobile-bottom-bar-cart').getAttribute('aria-current')).toBe('page');
    expect(screen.getByTestId('mobile-bottom-bar-home').getAttribute('aria-current')).toBeNull();
    expect(screen.getByTestId('mobile-bottom-bar-home').className).not.toContain('is-active');
  });

  it('lights the account tab anywhere under /account (e.g. /ar/account/profile)', () => {
    route.pathname = '/ar/account/profile';

    render(<MobileBottomBar navOpen={false} onOpenNav={noop} />);

    const account = screen.getByTestId('mobile-bottom-bar-account');
    expect(account.className).toContain('is-active');
    expect(screen.getByTestId('mobile-bottom-bar-home').className).not.toContain('is-active');
  });

  it('opens the shared nav drawer when the Categories tab is tapped', () => {
    const onOpenNav = vi.fn();
    render(<MobileBottomBar navOpen={false} onOpenNav={onOpenNav} />);

    fireEvent.click(screen.getByTestId('mobile-bottom-bar-categories'));

    expect(onOpenNav).toHaveBeenCalledTimes(1);
  });

  it('moves the pill onto Categories while the drawer is open, dropping the route tab', () => {
    render(<MobileBottomBar navOpen onOpenNav={noop} />);

    const categories = screen.getByTestId('mobile-bottom-bar-categories');
    expect(categories.className).toContain('is-active');
    expect(categories.getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByTestId('mobile-bottom-bar-home').className).not.toContain('is-active');
  });

  it('hides the cart badge with an empty cart and shows the stored count', () => {
    render(<MobileBottomBar navOpen={false} onOpenNav={noop} />);
    expect(screen.queryByTestId('mobile-bottom-bar-cart-count')).toBeNull();

    (window as unknown as { salla: unknown }).salla = {
      storage: { get: (key: string, fb: unknown) => (key === 'cart.summary.count' ? 3 : fb) },
      event: { on: vi.fn(), off: vi.fn() },
    };
    // The bar re-reads storage when the SDK signals it is ready.
    act(() => {
      document.dispatchEvent(new Event('theme::ready'));
    });

    expect(screen.getByTestId('mobile-bottom-bar-cart-count').textContent).toBe('3');
  });

  it('updates the badge from cart::updated events', () => {
    let onUpdated: ((summary?: { count?: number }) => void) | undefined;
    (window as unknown as { salla: unknown }).salla = {
      storage: { get: (_k: string, fb: unknown) => fb },
      event: {
        on: (event: string, cb: (summary?: { count?: number }) => void) => {
          if (event === 'cart::updated') onUpdated = cb;
        },
        off: vi.fn(),
      },
    };

    render(<MobileBottomBar navOpen={false} onOpenNav={noop} />);
    expect(screen.queryByTestId('mobile-bottom-bar-cart-count')).toBeNull();

    act(() => {
      onUpdated?.({ count: 5 });
    });

    expect(screen.getByTestId('mobile-bottom-bar-cart-count').textContent).toBe('5');
  });
});
