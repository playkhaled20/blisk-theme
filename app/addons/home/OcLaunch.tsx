import { useEffect, useState } from 'react';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { OcHead, field, items, pathOf, text, urlOf, useOc, type Data } from './common';

/** «إطلاق بعدّاد تنازلي»: a coming collection with a countdown to its date and 6–12 teaser photos. */
export function parseLaunch(s: string): number | null {
  const m = s.trim().match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2}))?/);
  if (!m) return null;
  return new Date(+m[1], +m[2] - 1, +m[3], m[4] ? +m[4] : 0, m[5] ? +m[5] : 0).getTime();
}
export function left(ms: number): [number, number, number, number] {
  const s = Math.max(0, Math.floor(ms / 1000));
  return [Math.floor(s / 86400), Math.floor((s % 86400) / 3600), Math.floor((s % 3600) / 60), s % 60];
}

export function OcLaunch({ data }: { data: Data }) {
  const { t, locale, ar } = useOc();
  const at = parseLaunch(text(data.date, locale));
  const [now, setNow] = useState(0);
  useEffect(() => {
    setNow(Date.now());
    const iv = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(iv);
  }, []);
  const teasers = items(data, 'teasers')
    .map((x) => String(field(x, 'teasers', 'image') ?? ''))
    .filter(Boolean);
  const url = urlOf(data.url);
  const parts = at && now ? left(at - now) : null;
  const names = ar ? ['يوم', 'ساعة', 'دقيقة', 'ثانية'] : ['days', 'hours', 'min', 'sec'];
  return (
    <section className="s-block oc-launch container">
      <OcHead k="SOON" title={text(data.title, locale) || t('launch_title')} subtitle={text(data.subtitle, locale) || text(data.kicker, locale) || t('launch_kicker')} />
      {parts && (
        <div className="oc-launch__clock" aria-live="off">
          {parts.map((n, i) => (
            <span key={i}>
              <b>{String(n).padStart(2, '0')}</b>
              <small>{names[i]}</small>
            </span>
          ))}
        </div>
      )}
      {teasers.length > 0 && (
        <div className="oc-launch__teasers">
          {teasers.slice(0, 12).map((src, i) => (
            <img key={i} src={src} alt="" width={300} height={300} loading="lazy" decoding="async" />
          ))}
        </div>
      )}
      {url && url !== '#' && (
        <Link className="oc-btn" to={pathOf(url)}>
          {text(data.cta, locale) || t('notify')}
        </Link>
      )}
    </section>
  );
}
