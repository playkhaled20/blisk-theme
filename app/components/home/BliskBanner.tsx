import { memo } from 'react';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { itemField, localText, settingValue } from '../../lib/blisk';

export interface BliskBannerData {
  height?: unknown;
  banners?: Record<string, unknown>[];
}

const HEIGHTS = ['sm', 'md', 'lg'];

/** «Promo banner»: up to 12 images, each with an optional title, line, button and link. */
export const BliskBanner = memo(function BliskBanner({ data }: { data: BliskBannerData }) {
  const { locale } = useTranslation();
  const h = settingValue(data.height);
  const height = HEIGHTS.includes(h) ? h : 'md';

  const banners = (data.banners ?? [])
    .map((b) => ({
      image: String(itemField(b, 'banners', 'image') ?? ''),
      mobile: String(itemField(b, 'banners', 'image_mobile') ?? ''),
      title: localText(itemField(b, 'banners', 'title'), locale),
      subtitle: localText(itemField(b, 'banners', 'subtitle'), locale),
      cta: localText(itemField(b, 'banners', 'cta'), locale),
      url: String(itemField(b, 'banners', 'url') ?? ''),
    }))
    .filter((b) => b.image);

  if (!banners.length) return null;

  return (
    <section className={`blisk-banner container blisk-banner--${height}`}>
      {banners.map((b, i) => {
        const body = (
          <>
            <picture>
              {b.mobile && <source media="(max-width: 640px)" srcSet={b.mobile} />}
              <img src={b.image} alt={b.title} width={1600} height={480} loading="lazy" decoding="async" />
            </picture>
            {(b.title || b.subtitle || b.cta) && (
              <span className="blisk-banner__copy">
                {b.title && <b className="blisk-metal">{b.title}</b>}
                {b.subtitle && <em>{b.subtitle}</em>}
                {b.cta && <i className="blisk-btn">{b.cta}</i>}
              </span>
            )}
          </>
        );
        return b.url && b.url !== '#' ? (
          <Link key={i} to={b.url} className="blisk-banner__item">
            {body}
          </Link>
        ) : (
          <div key={i} className="blisk-banner__item">
            {body}
          </div>
        );
      })}
    </section>
  );
});
