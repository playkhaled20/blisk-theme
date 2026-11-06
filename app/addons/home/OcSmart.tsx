import { useQuery } from '@tanstack/react-query';
import { useTwilight } from '@salla.sa/twilight-theme-engine/providers';
import { category } from '@salla.sa/twilight-theme-engine/api/category';
import { ProductCard } from '../../components/product';
import { useProductCardLayout } from '../../hooks/useProductCardLayout';
import { settingOn } from '../../lib/blisk';
import { OcHead, useProducts, type Data } from './common';

/** «أقسام ذكية من تصنيفات متجرك» (oc_smart_sections): one product row per top category of the store. */
function Row({ id, name, limit }: { id: number | string; name: string; limit: number }) {
  const layout = useProductCardLayout();
  const { items } = useProducts({ source: 'categories', sourceValue: [Number(id)], perPage: limit });
  if (!items.length) return null;
  return (
    <section className="s-block oc-products container">
      <OcHead k="SMART" title={name} />
      <div className="oc-products__grid">
        {items.map((p) => (
          <ProductCard key={p.id} product={p} layout={layout} />
        ))}
      </div>
    </section>
  );
}

export function OcSmart({ data }: { data: Data }) {
  const { theme } = useTwilight();
  const on = settingOn((theme?.settings as Record<string, unknown> | undefined)?.oc_smart_sections, true);
  const { data: cats } = useQuery({ ...category.queries.list(), enabled: on });
  if (!on) return null;
  const max = Math.max(1, Math.min(8, Number(data.max) || 3));
  const limit = Math.max(1, Math.min(12, Number(data.limit) || 4));
  const list = (cats ?? []).filter((c) => (c.products_count ?? 1) > 0).slice(0, max);
  return (
    <>
      {list.map((c) => (
        <Row key={c.id} id={c.id_ ?? c.id} name={c.name} limit={limit} />
      ))}
    </>
  );
}
