import { useState } from 'react';
import { useQueries } from '@tanstack/react-query';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { product as productApi } from '@salla.sa/twilight-theme-engine/api/product';
import type { Product } from '@salla.sa/twilight-theme-engine/types';
import { adaptFor } from '../panel';
import { OcHead, field, items, pathOf, text, useOc, useVertical, type Data } from './common';

/** «ابني روتينك»: tick the steps you want; each step finds a store product, with the routine's real total. */
interface Step {
  label: string;
  keyword: string;
  image: string;
}
const priceOf = (p?: Product) => (p ? Number((p.is_on_sale ? p.sale_price : p.price) ?? 0) || 0 : 0);

export function OcSetup({ data }: { data: Data }) {
  const { t, locale, ar } = useOc();
  const v = useVertical();
  const D = adaptFor(v);
  const own: Step[] = items(data, 'items')
    .map((s) => ({ label: text(field(s, 'items', 'label'), locale), keyword: text(field(s, 'items', 'keyword'), locale) || text(field(s, 'items', 'label'), locale), image: String(field(s, 'items', 'image') ?? '') }))
    .filter((s) => s.label);
  const steps: Step[] = own.length ? own : D.kit.map((k) => ({ label: ar ? k.ar : k.en, keyword: k.kw, image: '' }));
  const [on, setOn] = useState<boolean[]>(() => steps.map((_, i) => i < 3));
  const found = useQueries({
    queries: steps.map((s, i) => ({ ...productApi.queries.list({ source: 'search', keyword: s.keyword, perPage: 1 }), enabled: !!on[i] })),
  });
  if (!steps.length) return null;
  const pick = (i: number) => (on[i] ? ((found[i]?.data?.items ?? [])[0] as Product | undefined) : undefined);
  const total = steps.reduce((sum, _, i) => sum + priceOf(pick(i)), 0);
  const money = (n: number) => `${n.toLocaleString(ar ? 'ar-SA-u-nu-latn' : 'en')} ${ar ? 'ر.س' : 'SAR'}`;

  return (
    <section className="s-block oc-setup container">
      <OcHead k="SETUP" title={text(data.title, locale) || t('setup_title')} subtitle={text(data.subtitle, locale) || t('setup_sub')} />
      <ol className="oc-setup__list">
        {steps.map((s, i) => {
          const p = pick(i);
          return (
            <li key={i} className={on[i] ? 'is-on' : undefined}>
              <label>
                <input type="checkbox" checked={!!on[i]} onChange={(e) => setOn(on.map((x, j) => (j === i ? e.target.checked : x)))} />
                {s.image && <img src={s.image} alt="" width={40} height={40} loading="lazy" decoding="async" />}
                <b>{s.label}</b>
              </label>
              {on[i] &&
                (p ? (
                  <Link className="oc-setup__pick" to={pathOf(p.url)}>
                    {p.image?.url && <img src={p.image.url} alt="" width={56} height={56} loading="lazy" decoding="async" />}
                    <span>
                      {p.name}
                      <small>{money(priceOf(p))}</small>
                    </span>
                  </Link>
                ) : (
                  !found[i]?.isLoading && <small className="oc-setup__none">{ar ? 'ما لقينا منتج لهالخطوة' : 'No product for this step yet'}</small>
                ))}
            </li>
          );
        })}
      </ol>
      <p className="oc-setup__total" aria-live="polite">
        {ar ? 'إجمالي روتينك' : 'Your routine total'}: <b>{total ? money(total) : '—'}</b>
      </p>
    </section>
  );
}
