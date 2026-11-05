import { memo } from 'react';
import { useTwilight } from '@salla.sa/twilight-theme-engine/providers';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { itemField, localText, resolveVertical, VERTICALS } from '../../lib/blisk';

export interface BliskHeroData {
  kicker?: unknown;
  title?: unknown;
  subtitle?: unknown;
  description?: unknown;
  image?: string;
  cta?: unknown;
  url?: string;
  stats?: Record<string, unknown>[];
}

/**
 * «Cinematic gauge hero». The store name in metallic type, a short line for
 * the store's vertical, a button, and up to six gauges. Gauges show only the
 * figures the merchant typed: the theme never invents numbers.
 */
export const BliskHero = memo(function BliskHero({ data }: { data: BliskHeroData }) {
  const { theme, store } = useTwilight();
  const { t, locale } = useTranslation();
  const vertical = resolveVertical(
    theme?.settings as Record<string, unknown> | undefined,
    `${store?.name ?? ''} ${store?.description ?? ''}`
  );
  const v = VERTICALS[vertical];
  const lt = (raw: unknown) => localText(raw, locale);

  const kicker = lt(data.kicker) || t('blisk.hero.kicker', 'متجر تجميل فاخر');
  const title = lt(data.title) || store?.name || '';
  const subtitle =
    lt(data.subtitle) || t(`blisk.vertical.${vertical}.hero`, locale === 'ar' ? v.hero : '');
  const description = lt(data.description);
  const cta = lt(data.cta) || t('blisk.hero.explore', 'اكتشفي المجموعة');
  const url = data.url && data.url !== '#' ? data.url : '';

  const stats = (data.stats ?? [])
    .map((s) => ({
      label: lt(itemField(s, 'stats', 'label')),
      note: lt(itemField(s, 'stats', 'note')),
      value: Number(itemField(s, 'stats', 'value')),
    }))
    .filter((s) => s.label && Number.isFinite(s.value))
    .map((s) => ({ ...s, value: Math.max(0, Math.min(100, Math.round(s.value))) }))
    .slice(0, 6);

  return (
    <section className="blisk-hero container">
      <div className="blisk-hero__stage">
        <div className="blisk-hero__media">
          {data.image ? (
            <img src={data.image} alt={title} width={800} height={800} fetchPriority="high" decoding="async" />
          ) : (
            <div className="blisk-hero__orb" aria-hidden="true">
              <i />
              <i />
              <span>{locale === 'ar' ? v.ar : v.en}</span>
            </div>
          )}
        </div>
        <div className="blisk-hero__copy">
          {kicker && <span className="blisk-chip">{kicker}</span>}
          {title && <h1 className="blisk-metal">{title}</h1>}
          {subtitle && <p className="blisk-hero__sub">{subtitle}</p>}
          {description && <p className="blisk-hero__desc">{description}</p>}
          {url ? (
            <Link to={url} className="blisk-btn">
              {cta}
            </Link>
          ) : (
            <Link to="/products" className="blisk-btn">
              {cta}
            </Link>
          )}
        </div>
      </div>

      {stats.length > 0 && (
        <ul className="blisk-gauges">
          {stats.map((s, i) => (
            <li key={i} className="blisk-gauge">
              <Gauge value={s.value} />
              <span>{s.label}</span>
              {s.note && <small>{s.note}</small>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
});

/** A ring filled to `value` percent, with the figure in the middle. */
export function Gauge({ value, large = false }: { value: number; large?: boolean }) {
  return (
    <span className={`blisk-ring${large ? ' blisk-ring--lg' : ''}`}>
      <svg viewBox="0 0 36 36" aria-hidden="true">
        <circle className="t" cx="18" cy="18" r="15.9" />
        <circle
          className="v"
          cx="18"
          cy="18"
          r="15.9"
          pathLength={100}
          strokeDasharray={`${value} 100`}
        />
      </svg>
      <b>{value}%</b>
    </span>
  );
}
