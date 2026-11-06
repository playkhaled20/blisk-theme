import { useQuery } from '@tanstack/react-query';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { brand } from '@salla.sa/twilight-theme-engine/api/brands';
import { OcHead, field, items, pathOf, text, urlOf, useOc, type Data } from './common';

/** «جدار الماركات»: 6–12 logos; the store's own brands when the merchant adds none. */
export function OcBrands({ data }: { data: Data }) {
  const { t, locale } = useOc();
  const own = items(data, 'brands')
    .map((b) => ({ logo: String(field(b, 'brands', 'logo') ?? ''), name: text(field(b, 'brands', 'name'), locale), url: urlOf(field(b, 'brands', 'url')) }))
    .filter((b) => b.logo || b.name);
  const { data: list } = useQuery({ ...brand.queries.list(), enabled: !own.length });
  const brands = (own.length ? own : (list?.items ?? []).map((b) => ({ logo: b.logo, name: b.name, url: b.url }))).slice(0, 12);
  if (!brands.length) return null;
  return (
    <section className="s-block oc-brands container">
      <OcHead k="BRANDS" title={text(data.title, locale) || t('brands_title')} subtitle={text(data.subtitle, locale)} />
      <div className="oc-brands__wall">
        {brands.map((b, i) => {
          const inner = b.logo ? <img src={b.logo} alt={b.name} width={140} height={70} loading="lazy" decoding="async" /> : <b>{b.name}</b>;
          return b.url && b.url !== '#' ? (
            <Link key={i} className="oc-brands__logo" to={pathOf(b.url)}>
              {inner}
            </Link>
          ) : (
            <span key={i} className="oc-brands__logo">
              {inner}
            </span>
          );
        })}
      </div>
    </section>
  );
}
