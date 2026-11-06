import { useState } from 'react';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { adaptFor } from '../panel';
import { OcHead, field, idsOf, items, pathOf, text, useOc, useProducts, useVertical, type Data } from './common';

/** «إنفوجرافيك المكوّنات»: 6–12 shots with a hotspot each and a list of what each shows; optional real product. */
interface Shot {
  image: string;
  label: string;
  note: string;
  value: number;
  x: number;
  y: number;
}
const XS = [38, 62, 50, 30, 70, 55];
const YS = [40, 45, 58, 35, 60, 30];

export function OcSpec({ data }: { data: Data }) {
  const { t, locale, ar } = useOc();
  const v = useVertical();
  const D = adaptFor(v);
  const pid = idsOf(data.product);
  const { items: picked } = useProducts({ source: 'selected', sourceValue: pid, perPage: 1 }, pid.length > 0);
  const own: Shot[] = items(data, 'shots')
    .map((s) => ({
      image: String(field(s, 'shots', 'image') ?? ''),
      label: text(field(s, 'shots', 'label'), locale),
      note: text(field(s, 'shots', 'note'), locale),
      value: Math.max(0, Math.min(100, Number(field(s, 'shots', 'value')) || 0)),
      x: Number(field(s, 'shots', 'x') ?? 50),
      y: Number(field(s, 'shots', 'y') ?? 50),
    }))
    .filter((s) => s.image);
  const { items: prods } = useProducts({ source: 'latest', perPage: 8 }, own.length < 6);
  const words = [...D.kit.map((k) => (ar ? k.ar : k.en)), ...D.compat.map((c) => (ar ? c.ar : c.en))];
  const fill: Shot[] = prods
    .filter((p) => p.image?.url)
    .slice(0, 6 - own.length)
    .map((p, i) => ({ image: p.image?.url ?? '', label: words[i] ?? t('spec_title'), note: '', value: 0, x: XS[i % 6], y: YS[i % 6] }));
  const shots = [...own, ...fill];
  const [cur, setCur] = useState(0);
  if (!shots.length) return null;
  const p = picked[0];

  return (
    <section className="s-block oc-spec container">
      <OcHead k="SPEC" title={text(data.title, locale) || t('spec_title')} subtitle={text(data.subtitle, locale) || text(data.kicker, locale) || t('spec_kicker')} />
      <div className="oc-spec__grid">
        <div className="oc-spec__stage">
          {shots.map((s, k) => (
            <figure key={k} className={`oc-spec__shot${k === cur ? ' is-on' : ''}`}>
              <img src={s.image} alt={s.label} width={600} height={600} loading="lazy" decoding="async" />
              <span className="oc-hot" style={{ ['--x' as string]: `${s.x}%`, ['--y' as string]: `${s.y}%` }}>
                <i />
                {s.label && (
                  <em>
                    <b>{s.label}</b>
                    {s.note && <small>{s.note}</small>}
                  </em>
                )}
              </span>
            </figure>
          ))}
          {p && (
            <Link className="oc-spec__product" to={pathOf(p.url)}>
              <b>{p.name}</b>
              <span className="oc-btn">{ar ? 'اطلبيه الآن' : 'Order now'}</span>
            </Link>
          )}
        </div>
        <ol className="oc-spec__rows">
          {shots.map((s, k) => (
            <li key={k} className={`oc-spec__row${k === cur ? ' is-on' : ''}`}>
              <button type="button" onClick={() => setCur(k)} onMouseEnter={() => setCur(k)} onFocus={() => setCur(k)}>
                <span className="oc-spec__n">{String(k + 1).padStart(2, '0')}</span>
                <span>
                  <b>{s.label}</b>
                  {s.note && <small>{s.note}</small>}
                  {s.value > 0 && (
                    <span className="oc-meter">
                      <i style={{ ['--w' as string]: `${s.value}%` }} />
                    </span>
                  )}
                </span>
                {s.value > 0 && <em>{s.value}</em>}
              </button>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
