import { ProductCard } from '../../components/product';
import { useProductCardLayout } from '../../hooks/useProductCardLayout';
import { settingValue, VERTICAL_IDS, type VerticalId } from '../../lib/blisk';
import { OcHead, idsOf, ofVertical, text, useOc, useProducts, useVertical, type Data } from './common';

/** «منتجات هولوغرام» and the five store-type sections (featured, best sellers, new, deals, routine bundle). */
export type Mode = 'products' | 'featured' | 'bestsellers' | 'new' | 'deals' | 'bundle';

export function OcProducts({ data, mode }: { data: Data; mode: Mode }) {
  const { t, locale } = useOc();
  const layout = useProductCardLayout();
  const auto = useVertical();
  const picked = idsOf(data.products);
  const cats = idsOf(data.category);
  const raw = settingValue(data.vertical);
  const v: VerticalId = (VERTICAL_IDS as readonly string[]).includes(raw) ? (raw as VerticalId) : auto;
  const limit = Math.max(1, Math.min(24, Number(data.limit) || (mode === 'bundle' ? 3 : 8)));
  const source = picked.length ? 'selected' : cats.length ? 'categories' : mode === 'deals' ? 'offers' : mode === 'bestsellers' ? 'best_selling' : 'latest';
  const { items } = useProducts({ source, sourceValue: picked.length ? picked : cats.length ? cats : undefined, perPage: mode === 'products' || picked.length || cats.length ? limit : 24 });
  const list = (mode === 'products' || picked.length || cats.length ? items : ofVertical(items, v)).slice(0, limit);
  if (!list.length) return null;
  const title = text(data.title, locale) || (mode === 'products' ? t('featured') : t(`vt_${mode}`) || t('featured'));
  const total = list.reduce((s, p) => s + (Number((p.is_on_sale ? p.sale_price : p.price) ?? 0) || 0), 0);

  return (
    <section className={`s-block oc-products container${mode !== 'products' ? ` oc-vsec oc-vsec--${mode}` : ''}`}>
      <OcHead k={mode === 'products' ? 'OBSIDIAN' : mode.toUpperCase()} title={title} subtitle={text(data.subtitle, locale)} />
      {mode === 'bundle' && (
        <div className="oc-bundle-bar">
          <span>{t('bundle_hint')}</span>
          <b>
            {total.toLocaleString(locale === 'en' ? 'en' : 'ar-SA-u-nu-latn')} {locale === 'en' ? 'SAR' : 'ر.س'}
          </b>
        </div>
      )}
      <div className="oc-products__grid">
        {list.map((p) => (
          <ProductCard key={p.id} product={p} layout={layout} />
        ))}
      </div>
    </section>
  );
}
