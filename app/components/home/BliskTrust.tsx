import { memo } from 'react';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { itemField, localText } from '../../lib/blisk';
import { Gauge } from './BliskHero';

export interface BliskTrustData {
  title?: unknown;
  items?: Record<string, unknown>[];
}

/**
 * «Store trust gauges»: cards with a ring, a title and a note. Only the cards
 * the merchant filled in are shown; with none, the block shows nothing rather
 * than made-up figures.
 */
export const BliskTrust = memo(function BliskTrust({ data }: { data: BliskTrustData }) {
  const { t, locale } = useTranslation();
  const items = (data.items ?? [])
    .map((i) => ({
      title: localText(itemField(i, 'items', 'title'), locale),
      note: localText(itemField(i, 'items', 'note'), locale),
      value: Number(itemField(i, 'items', 'value')),
    }))
    .filter((i) => i.title && Number.isFinite(i.value))
    .map((i) => ({ ...i, value: Math.max(0, Math.min(100, Math.round(i.value))) }))
    .slice(0, 6);

  if (!items.length) return null;
  const title = localText(data.title, locale) || t('blisk.trust.title', 'لماذا نحن');

  return (
    <section className="blisk-trust container">
      <h2 className="blisk-metal blisk-trust__title">{title}</h2>
      <div className="blisk-trust__grid">
        {items.map((i, k) => (
          <div key={k} className="blisk-card blisk-trust__card">
            <Gauge value={i.value} large />
            <h3>{i.title}</h3>
            {i.note && <p>{i.note}</p>}
          </div>
        ))}
      </div>
    </section>
  );
});
