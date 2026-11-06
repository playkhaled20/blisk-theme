import { useQuery } from '@tanstack/react-query';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { category } from '@salla.sa/twilight-theme-engine/api/category';
import { OcHead, field, items, pathOf, text, urlOf, useOc, useProducts, type Data } from './common';

/** «معرض سينمائي»: 6–12 photo tiles with a title and caption; empty slots take the store's categories and products. */
export function OcShowcase({ data }: { data: Data }) {
  const { t, locale } = useOc();
  const own = items(data, 'tiles')
    .map((s) => ({ image: String(field(s, 'tiles', 'image') ?? ''), title: text(field(s, 'tiles', 'title'), locale), caption: text(field(s, 'tiles', 'caption'), locale), url: urlOf(field(s, 'tiles', 'url')) }))
    .filter((s) => s.image);
  const need = Math.max(0, 6 - own.length);
  const { data: cats } = useQuery({ ...category.queries.list(), enabled: need > 0 });
  const { items: prods } = useProducts({ source: 'latest', perPage: 12 }, need > 0);
  const tiles = [
    ...own,
    ...(cats ?? []).filter((c) => c.image).map((c) => ({ image: c.image ?? '', title: c.name, caption: '', url: c.url })),
    ...prods.filter((p) => p.image?.url).map((p) => ({ image: p.image?.url ?? '', title: p.name, caption: '', url: p.url })),
  ].slice(0, Math.max(6, own.length));
  if (!tiles.length) return null;
  return (
    <section className="s-block oc-show container">
      <OcHead k="GALLERY" title={text(data.title, locale) || t('show_title')} subtitle={text(data.subtitle, locale)} />
      <div className="oc-show__grid">
        {tiles.map((s, i) => {
          const inner = (
            <>
              <img src={s.image} alt={s.title} width={600} height={600} loading="lazy" decoding="async" />
              {(s.title || s.caption) && (
                <span>
                  {s.title && <b>{s.title}</b>}
                  {s.caption && <small>{s.caption}</small>}
                </span>
              )}
            </>
          );
          return (
            <figure key={i} className="oc-show__tile">
              {s.url && s.url !== '#' ? <Link to={pathOf(s.url)}>{inner}</Link> : inner}
            </figure>
          );
        })}
      </div>
    </section>
  );
}
