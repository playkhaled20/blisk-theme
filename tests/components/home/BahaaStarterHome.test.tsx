import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { BahaaStarterHome } from '../../../app/components/home/BahaaStarterHome';

vi.mock('../../../app/components/home/BliskHero', () => ({
  BliskHero: ({ data }: { data: object }) => (
    <section data-testid="hero" data-fields={Object.keys(data).length} />
  ),
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
    expect(hero.dataset.fields).toBe('0');
    expect(latest.textContent).toBe('Latest');
    expect(hero.compareDocumentPosition(latest) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(latest.parentElement?.className).toContain('s-block--latest-products');
  });
});
