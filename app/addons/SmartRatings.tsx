import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import type { Product } from '@salla.sa/twilight-theme-engine/types';
import { INTEL_TEXT, intel } from './intel';

/** Trust, stock, rating confidence and demand gauges, in place of the stars (oc_smart_ratings). */
export function SmartRatings({ product }: { product: Product }) {
  const { locale } = useTranslation();
  const T = (k: string) => INTEL_TEXT[k]?.[locale === 'en' ? 1 : 0] ?? k;
  const r = intel({
    stars: product.rating?.stars,
    count: product.rating?.count,
    quantity: product.quantity,
    canShowQuantity: product.can_show_remained_quantity,
    outOfStock: product.is_out_of_stock,
    sold: product.sold_quantity,
    onSale: product.is_on_sale,
  });
  const gauge = (v: number, label: string, word: string, shown: string) => (
    <div className="oc-gauge" style={{ ['--v' as string]: v }} aria-label={`${label} ${shown}`}>
      <svg viewBox="0 0 36 36" aria-hidden="true">
        <circle className="t" cx="18" cy="18" r="15.9" />
        <circle className="v" cx="18" cy="18" r="15.9" pathLength={100} />
      </svg>
      <b>{shown}</b>
      <span>{label}</span>
      <small>{T(word)}</small>
    </div>
  );
  return (
    <div className="oc-intel">
      {gauge(r.trust, T('trust'), r.trustWord, r.trust ? `${r.trust}%` : '—')}
      {gauge(r.stock, T('stock'), r.stockWord, `${r.stock}%`)}
      <div className="oc-bars">
        <div className="oc-bar">
          <span>{T('confidence')}</span>
          <i style={{ ['--w' as string]: `${r.confW}%` }} />
          <em>{T(`c_${r.conf}`)}</em>
        </div>
        <div className="oc-bar">
          <span>{T('demand')}</span>
          <i style={{ ['--w' as string]: `${r.demandW}%` }} />
          <em>{T(r.trending ? 'trending' : 'steady')}</em>
        </div>
        {r.onSale && (
          <div className="oc-bar oc-bar--deal">
            <span>{T('deal')}</span>
            <i style={{ ['--w' as string]: '88%' }} />
            <em>{T('deal_live')}</em>
          </div>
        )}
      </div>
    </div>
  );
}
