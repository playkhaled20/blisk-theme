import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { useTwilight } from '@salla.sa/twilight-theme-engine/providers';
import { category } from '@salla.sa/twilight-theme-engine/api/category';
import { VERTICALS } from '../../lib/blisk';
import { field, items, pathOf, text, urlOf, useOc, useProducts, useVertical, type Data } from './common';

/** «عرض سينمائي»: 6–12 photos that change by themselves; empty slots take the store's categories and product photos. */
interface Slide {
  image: string;
  kicker: string;
  title: string;
  subtitle: string;
  cta: string;
  url: string;
}

export function OcCinema({ data }: { data: Data }) {
  const { t, locale, ar } = useOc();
  const { store } = useTwilight();
  const v = useVertical();
  const own: Slide[] = items(data, 'slides')
    .map((s) => ({
      image: String(field(s, 'slides', 'image') ?? ''),
      kicker: text(field(s, 'slides', 'kicker'), locale) || store?.name || '',
      title: text(field(s, 'slides', 'title'), locale),
      subtitle: text(field(s, 'slides', 'subtitle'), locale),
      cta: text(field(s, 'slides', 'cta'), locale),
      url: urlOf(field(s, 'slides', 'url')),
    }))
    .filter((s) => s.image);
  const need = Math.max(0, 6 - own.length);
  const { data: cats } = useQuery({ ...category.queries.list(), enabled: need > 0 });
  const { items: prods } = useProducts({ source: 'latest', perPage: 12 }, need > 0);
  const fromCats: Slide[] = (cats ?? [])
    .filter((c) => c.image)
    .map((c) => ({ image: c.image ?? '', kicker: ar ? VERTICALS[v].ar : VERTICALS[v].en, title: c.name, subtitle: VERTICALS[v].hero, cta: t('explore'), url: c.url }));
  const fromProds: Slide[] = prods.filter((p) => p.image?.url).map((p) => ({ image: p.image?.url ?? '', kicker: store?.name ?? '', title: p.name, subtitle: '', cta: t('explore'), url: p.url }));
  const slides = [...own, ...fromCats, ...fromProds].slice(0, Math.max(6, own.length)).slice(0, 12);
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const speed = Math.max(3, Math.min(20, Number(data.speed) || 6));
  useEffect(() => {
    if (paused || slides.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const iv = window.setTimeout(() => setI((x) => (x + 1) % slides.length), speed * 1000);
    return () => window.clearTimeout(iv);
  }, [paused, slides.length, speed, i]);
  if (!slides.length) return null;
  const cur = i % slides.length;
  const go = (d: number) => setI((x) => (x + d + slides.length) % slides.length);

  return (
    <section className="s-block oc-cine container" aria-roledescription="carousel" aria-label={text(data.title, locale) || t('cine_title')} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="oc-cine__stage">
        {slides.map((s, k) => {
          const inner = (
            <>
              <img src={s.image} alt={s.title || store?.name || ''} width={1600} height={900} loading={k === 0 ? 'eager' : 'lazy'} decoding="async" />
              <span className="oc-cine__copy">
                <small className="oc-cine__k">{s.kicker}</small>
                {s.title && <b className="oc-metal">{s.title}</b>}
                {s.subtitle && <em>{s.subtitle}</em>}
                {s.cta && <i className="oc-btn">{s.cta}</i>}
              </span>
            </>
          );
          return (
            <div key={k} className={`oc-cine__slide${k === cur ? ' is-on' : ''}`} aria-hidden={k !== cur}>
              {s.url && s.url !== '#' ? <Link to={pathOf(s.url)}>{inner}</Link> : inner}
            </div>
          );
        })}
        <div className="oc-cine__hud">
          <span>
            <b>{String(cur + 1).padStart(2, '0')}</b>/{String(slides.length).padStart(2, '0')}
          </span>
          <div className="oc-cine__bar">
            <i style={{ width: `${((cur + 1) / slides.length) * 100}%` }} />
          </div>
          <button type="button" aria-label={t('prev')} onClick={() => go(ar ? 1 : -1)}>
            ‹
          </button>
          <button type="button" aria-label={t('next')} onClick={() => go(ar ? -1 : 1)}>
            ›
          </button>
        </div>
      </div>
      <div className="oc-cine__thumbs" role="tablist">
        {slides.map((s, k) => (
          <button key={k} type="button" role="tab" aria-selected={k === cur} className={`oc-cine__thumb${k === cur ? ' is-on' : ''}`} aria-label={s.title || String(k + 1)} onClick={() => setI(k)}>
            <img src={s.image} alt="" width={96} height={64} loading="lazy" decoding="async" />
          </button>
        ))}
      </div>
    </section>
  );
}
