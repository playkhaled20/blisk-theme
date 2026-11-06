import { useQuery } from '@tanstack/react-query';
import { category } from '@salla.sa/twilight-theme-engine/api/category';
import type { Product } from '@salla.sa/twilight-theme-engine/types';
import { OcHead, field, items, text, useOc, useProducts, type Data } from './common';

/** «متجرنا بالأرقام»: live figures read from the store itself at visit time; a figure shows only when it was measured. */
export function storeFacts(prods: Product[], cats: number) {
  const prices = prods.map((p) => Number((p.is_on_sale ? p.sale_price : p.price) ?? 0)).filter((n) => n > 0);
  const n = prods.length;
  const sale = prods.filter((p) => p.is_on_sale);
  const offs = sale
    .map((p) => {
      const full = Number(p.regular_price ?? p.price ?? 0);
      const now = Number(p.sale_price ?? 0);
      return full > now && full ? (1 - now / full) * 100 : 0;
    })
    .filter((x) => x > 0);
  const rated = prods.filter((p) => (p.rating?.stars ?? 0) > 0);
  return {
    cats,
    min: prices.length ? Math.min(...prices) : 0,
    inStock: n ? Math.round((prods.filter((p) => !p.is_out_of_stock).length / n) * 100) : null,
    onSale: n ? Math.round((sale.length / n) * 100) : 0,
    avgOff: offs.length ? Math.round(offs.reduce((a, b) => a + b, 0) / offs.length) : 0,
    rating: rated.length ? rated.reduce((a, p) => a + (p.rating?.stars ?? 0), 0) / rated.length : 0,
  };
}

export function OcBoard({ data }: { data: Data }) {
  const { t, locale, ar } = useOc();
  const { items: prods } = useProducts({ source: 'latest', perPage: 30 });
  const { data: cats } = useQuery(category.queries.list());
  const f = storeFacts(prods, cats?.length ?? 0);
  const bg = items(data, 'backdrops')
    .map((x) => String(field(x, 'backdrops', 'image') ?? ''))
    .filter(Boolean)[0];
  const money = (n: number) => `${n.toLocaleString(ar ? 'ar-SA-u-nu-latn' : 'en')} ${ar ? 'ر.س' : 'SAR'}`;
  const cards: [string, string][] = [];
  if (f.cats) cards.push([ar ? 'الأقسام' : 'Departments', String(f.cats)]);
  if (f.min) cards.push([ar ? 'الأسعار تبدأ من' : 'Prices from', money(f.min)]);
  if (f.inStock != null && prods.length) cards.push([ar ? 'متوفر الآن' : 'In stock now', `${f.inStock}%`]);
  if (f.onSale) cards.push([ar ? 'منتجات بعروض' : 'On offer', `${f.onSale}%`]);
  if (f.avgOff) cards.push([ar ? 'متوسط الخصم' : 'Average saving', `${f.avgOff}%`]);
  if (f.rating) cards.push([ar ? 'تقييم العملاء' : 'Customer rating', `${f.rating.toFixed(1)}/5`]);
  if (!cards.length) return null;
  return (
    <section className="s-block oc-board container" style={bg ? { backgroundImage: `linear-gradient(rgb(0 0 0 / .55), rgb(0 0 0 / .55)), url("${bg}")` } : undefined}>
      <OcHead k="LIVE" title={text(data.title, locale) || t('board_title')} subtitle={text(data.subtitle, locale) || t('board_sub')} />
      <div className="oc-board__grid">
        {cards.map(([k, v]) => (
          <div key={k} className="oc-board__card">
            <b>{v}</b>
            <small>{k}</small>
          </div>
        ))}
      </div>
    </section>
  );
}
