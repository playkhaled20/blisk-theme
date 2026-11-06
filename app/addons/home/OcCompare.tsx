import { useState } from 'react';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import type { Product } from '@salla.sa/twilight-theme-engine/types';
import { OcHead, field, items, pathOf, text, urlOf, useOc, useProducts, type Data } from './common';

/** «مقارنة المنتجات»: pick up to 3 to compare side by side; the best in each row is marked. Merchant models, else the store's real products on real data. */
interface Model {
  name: string;
  image: string;
  price: string;
  url: string;
  v: (string | number)[];
}

export function realRows(p: Product): number[] {
  const price = Number((p.is_on_sale ? p.sale_price : p.price) ?? 0) || 0;
  const full = Number(p.regular_price ?? p.price ?? 0) || 0;
  return [price, p.rating?.stars ?? 0, p.rating?.count ?? 0, p.is_out_of_stock ? 0 : 1, full > price && full ? Math.round((1 - price / full) * 100) : 0];
}

export function OcCompare({ data }: { data: Data }) {
  const { t, locale, ar } = useOc();
  const own: Model[] = items(data, 'models')
    .map((m) => ({
      name: text(field(m, 'models', 'name'), locale),
      image: String(field(m, 'models', 'image') ?? ''),
      price: text(field(m, 'models', 'price'), locale),
      url: urlOf(field(m, 'models', 'url')),
      v: ['s1', 's2', 's3', 's4'].map((k) => text(field(m, 'models', k), locale)),
    }))
    .filter((m) => m.name);
  const { items: prods } = useProducts({ source: 'latest', perPage: 12 }, !own.length);
  const real = !own.length;
  const labels = real
    ? ar
      ? ['السعر', 'التقييم', 'عدد التقييمات', 'التوفر', 'الخصم']
      : ['Price', 'Rating', 'Reviews', 'In stock', 'Saving']
    : [1, 2, 3, 4].map((n) => text(data[`label${n}`], locale)).filter(Boolean);
  const models: Model[] = real
    ? prods.slice(0, 12).map((p) => ({ name: p.name, image: p.image?.url ?? '', price: '', url: p.url, v: realRows(p) }))
    : own;
  const [sel, setSel] = useState<number[]>([0, 1]);
  if (models.length < 2) return null;
  const picked = sel.filter((i) => i < models.length).map((i) => models[i]);
  const best = (row: number) => {
    const vals = picked.map((m) => Number(m.v[row]));
    if (vals.some((x) => Number.isNaN(x))) return -1;
    const pick = real && row === 0 ? Math.min(...vals) : Math.max(...vals);
    return vals.indexOf(pick);
  };
  const shown = (m: Model, row: number) => {
    if (!real) return String(m.v[row] ?? '—');
    const x = Number(m.v[row]);
    if (row === 0) return `${x.toLocaleString(ar ? 'ar-SA-u-nu-latn' : 'en')} ${ar ? 'ر.س' : 'SAR'}`;
    if (row === 1) return x ? `${x.toFixed(1)}/5` : '—';
    if (row === 3) return x ? (ar ? 'متوفر' : 'Yes') : ar ? 'نفد' : 'No';
    if (row === 4) return x ? `${x}%` : '—';
    return String(x);
  };

  return (
    <section className="s-block oc-cmp container">
      <OcHead k="VS" title={text(data.title, locale) || t('cmp_title')} subtitle={text(data.subtitle, locale) || t('cmp_sub')} />
      <div className="oc-cmp__rail">
        {models.map((m, i) => (
          <button
            key={i}
            type="button"
            className={`oc-cmp__card${sel.includes(i) ? ' is-on' : ''}`}
            aria-pressed={sel.includes(i)}
            onClick={() => setSel((s) => (s.includes(i) ? s.filter((x) => x !== i) : [...s, i].slice(-3)))}
          >
            {m.image && <img src={m.image} alt="" width={120} height={120} loading="lazy" decoding="async" />}
            <b>{m.name}</b>
            {m.price && <em>{m.price}</em>}
          </button>
        ))}
      </div>
      <p className="oc-cmp__hint">{t('cmp_hint')}</p>
      {picked.length >= 2 && (
        <div className="oc-cmp__out" aria-live="polite">
          <table>
            <thead>
              <tr>
                <th />
                {picked.map((m, i) => (
                  <th key={i}>{m.url ? <Link to={pathOf(m.url)}>{m.name}</Link> : m.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {labels.map((l, r) => {
                const b = best(r);
                return (
                  <tr key={l}>
                    <th>{l}</th>
                    {picked.map((m, i) => (
                      <td key={i} className={i === b ? 'is-best' : undefined}>
                        {shown(m, r)}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
