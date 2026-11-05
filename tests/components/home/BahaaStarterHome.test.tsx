import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { BahaaStarterHome } from '../../../app/components/home/BahaaStarterHome';

vi.mock('../../../app/components/home/BliskHero', () => ({
  BliskHero: ({ data }: { data: { image?: string; title?: string } }) => (
    <section data-testid="hero" data-image={data.image} data-title={data.title ?? ''} />
  ),
}));
vi.mock('@tanstack/react-query', () => ({
  useQuery: () => ({ data: { items: [{ image: { url: 'https://cdn.test/dress.jpg' } }] } }),
}));
vi.mock('@salla.sa/twilight-theme-engine/api/product', () => ({
  product: { queries: { list: (params: object) => ({ queryKey: ['products', params] }) } },
}));
vi.mock('../../../app/components/home/LatestProducts', () => ({
  LatestProducts: ({ data }: { data: { title?: string } }) => (
    <div data-testid="latest">{data.title}</div>
  ),
}));

describe('BahaaStarterHome (home with no blocks yet)', () => {
  it("shows the theme's hero, on the store-type wording, above the newest products", () => {
    const { getByTestId } = render(<BahaaStarterHome data={{ title: 'Latest' }} />);
    const hero = getByTestId('hero');
    const latest = getByTestId('latest');
    // Store-type wording (no texts passed) and the newest product's photo in the arch.
    expect(hero.dataset.title).toBe('');
    expect(hero.dataset.image).toBe('https://cdn.test/dress.jpg');
    expect(latest.textContent).toBe('Latest');
    expect(hero.compareDocumentPosition(latest) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(latest.parentElement?.className).toContain('s-block--latest-products');
  });
});
