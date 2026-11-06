import { useQuery } from '@tanstack/react-query';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { useTwilight } from '@salla.sa/twilight-theme-engine/providers';
import { product as productApi } from '@salla.sa/twilight-theme-engine/api/product';
import type { Product } from '@salla.sa/twilight-theme-engine/types';
import dict from '../oc.json';
import { VERTICALS, itemField, localText, resolveVertical, type VerticalId } from '../../lib/blisk';

/** Shared pieces of the Blisk smart home sections (Twig `obsidian/sections.js`). */

export type Data = Record<string, unknown>;
const EMPTY: Product[] = [];

/** `t('key')` from the Twig theme's `oc.*` texts. */
export function useOc() {
  const { locale } = useTranslation();
  const ar = locale !== 'en';
  const D = dict as { ar: Record<string, string>; en: Record<string, string> };
  return { ar, locale, t: (k: string) => (ar ? D.ar[k] : D.en[k]) ?? D.ar[k] ?? '' };
}

/** The store type the theme follows (setting, else read from the store's name). */
export function useVertical(): VerticalId {
  const { theme, store } = useTwilight();
  return resolveVertical(theme?.settings as Record<string, unknown> | undefined, `${store?.name ?? ''} ${store?.description ?? ''}`);
}

export function OcHead({ k, title, subtitle }: { k?: string; title: string; subtitle?: string }) {
  return (
    <header className="oc-head" data-k={k}>
      <h2 className="oc-metal">{title}</h2>
      {subtitle && <p>{subtitle}</p>}
    </header>
  );
}

/** Text and collection items from a block's fields. */
export const text = (v: unknown, locale: string) => localText(v, locale);
export const items = (data: Data, key: string) => (Array.isArray(data[key]) ? (data[key] as Record<string, unknown>[]) : []);
export const field = (item: Record<string, unknown>, list: string, key: string) => itemField(item, list, key);
export const urlOf = (v: unknown) => (typeof v === 'string' ? v : v && typeof v === 'object' ? String((v as { url?: unknown }).url ?? '') : '');
export const idsOf = (v: unknown): number[] =>
  Array.isArray(v)
    ? v
        .map((x) => Number(typeof x === 'object' && x ? ((x as { id?: unknown }).id ?? (x as { value?: unknown }).value) : x))
        .filter((n) => Number.isFinite(n) && n > 0)
    : [];
/**
 * The link target for a store URL. The engine's `Link` takes the full URL the
 * API gives (as the built-in blocks pass it) and keeps the store's own path
 * prefix right; cutting it to a pathname kept the prefix too and doubled it
 * in the preview («/dev-…/dev-…/…» → 404).
 */
export const pathOf = (url: string) => (url || '').trim() || '/';

export function useProducts(params: Parameters<typeof productApi.queries.list>[0], enabled = true) {
  const { data, isLoading } = useQuery({ ...productApi.queries.list(params), enabled });
  return { items: (data?.items ?? EMPTY) as Product[], loading: enabled && isLoading };
}

/** Products that belong to a store type, by its words in the name or category (all of them when none match). */
export function ofVertical(list: Product[], v: VerticalId): Product[] {
  const kw = VERTICALS[v]?.kw ?? [];
  if (!kw.length) return list;
  const hit = list.filter((p) => {
    const s = `${p.name ?? ''} ${p.category?.name ?? ''}`.toLowerCase();
    return kw.some((w) => s.includes(w.toLowerCase()));
  });
  return hit.length ? hit : list;
}
