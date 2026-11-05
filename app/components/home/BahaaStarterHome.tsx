import { BliskHero } from './BliskHero';
import { LatestProducts, type LatestProductsProps } from './LatestProducts';

/**
 * The home page before the merchant places any block. The engine renders the
 * `latest-products` key only in that case (`HomePage`: no blocks → latest
 * products), and `is_default` in twilight.json does not seed a store's home.
 * So a fresh store — and the review preview — opens on the theme's own
 * hero, worded for the store type, with the newest products under it, instead
 * of a bare product grid. Once the merchant adds blocks, this is not shown.
 *
 * Registered in `app/router.tsx` with a wrapper class that does not box the
 * hero; the product grid keeps the engine's own container and spacing.
 */
export function BahaaStarterHome({ data }: LatestProductsProps) {
  return (
    <>
      <div className="s-block">
        <BliskHero data={{}} />
      </div>
      <div className="s-block s-block--latest-products container mt-6 sm:mt-8">
        <LatestProducts data={data} />
      </div>
    </>
  );
}
