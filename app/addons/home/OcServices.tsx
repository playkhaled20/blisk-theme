import { Link } from '@salla.sa/twilight-theme-engine/common';
import { OcHead, field, items, pathOf, text, urlOf, useOc, type Data } from './common';

/** «رحلتك بعد الشراء»: the steps after ordering (shipping, unboxing, returns, payment, help, use). */
const DEFAULTS = ['ship', 'unbox', 'ret', 'pay', 'help', 'setup'];

export function OcServices({ data }: { data: Data }) {
  const { t, locale } = useOc();
  const own = items(data, 'steps')
    .map((s) => ({ image: String(field(s, 'steps', 'image') ?? ''), title: text(field(s, 'steps', 'title'), locale), body: text(field(s, 'steps', 'text'), locale), url: urlOf(field(s, 'steps', 'url')) }))
    .filter((s) => s.title);
  const steps = own.length ? own : DEFAULTS.map((k) => ({ image: '', title: t(`svc_${k}`), body: t(`svc_${k}_n`), url: '' }));
  return (
    <section className="s-block oc-svc container">
      <OcHead k="AFTER" title={text(data.title, locale) || t('svc_title')} subtitle={text(data.subtitle, locale)} />
      <ol className="oc-svc__steps">
        {steps.map((s, i) => (
          <li key={i} className="oc-svc__step">
            <span className="oc-svc__n">{s.image ? <img src={s.image} alt="" width={56} height={56} loading="lazy" decoding="async" /> : String(i + 1).padStart(2, '0')}</span>
            <b>{s.title}</b>
            {s.body && <p>{s.body}</p>}
            {s.url && s.url !== '#' && <Link to={pathOf(s.url)}>{t('more')} ↗</Link>}
          </li>
        ))}
      </ol>
    </section>
  );
}
