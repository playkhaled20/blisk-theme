import { useQuery } from '@tanstack/react-query';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { category } from '@salla.sa/twilight-theme-engine/api/category';
import { OcHead, pathOf, text, useOc, type Data } from './common';

/** «فئات حية»: the merchant's picked categories, else the store's own, as tiles. */
export function OcCategories({ data }: { data: Data }) {
  const { t, locale } = useOc();
  const picked = (Array.isArray(data.categories) ? (data.categories as Record<string, unknown>[]) : []).filter((c) => c && c.name);
  const { data: cats } = useQuery({ ...category.queries.list(), enabled: !picked.length });
  const limit = Math.max(1, Math.min(24, Number(data.limit) || 8));
  const list = (picked.length ? picked.map((c) => ({ name: String(c.name), url: String(c.url ?? ''), image: String(c.image ?? '') })) : (cats ?? []).map((c) => ({ name: c.name, url: c.url, image: c.image ?? '' }))).slice(0, limit);
  if (!list.length) return null;
  return (
    <section className="s-block oc-cats container">
      <OcHead k="OBSIDIAN" title={text(data.title, locale) || t('browse')} subtitle={text(data.subtitle, locale)} />
      <div className="oc-cats__grid">
        {list.map((c) => (
          <Link key={c.url || c.name} className="oc-cat" to={pathOf(c.url)}>
            <span className="oc-cat__ic">{c.image ? <img src={c.image} alt="" width={64} height={64} loading="lazy" decoding="async" /> : c.name.trim()[0]}</span>
            <b>{c.name}</b>
          </Link>
        ))}
      </div>
    </section>
  );
}
