import { Suspense, lazy, type ComponentType } from 'react';
import type { Data } from './common';

/**
 * Blisk's smart home sections (twilight.json `home.oc-*`), each loaded only when
 * the merchant adds it. Bound in router.tsx next to the theme's other blocks.
 */
type C = ComponentType<{ data: Data }>;
const wrap = (L: C) =>
  function OcSection({ data }: { data: Data }) {
    return (
      <Suspense fallback={<div className="oc-loading" aria-busy="true" />}>
        <L data={data ?? {}} />
      </Suspense>
    );
  };
const products = (mode: 'products' | 'featured' | 'bestsellers' | 'new' | 'deals' | 'bundle') =>
  wrap(lazy(() => import('./OcProducts').then((m) => ({ default: ({ data }: { data: Data }) => <m.OcProducts data={data} mode={mode} /> }))));

export const OC_SECTIONS: Record<string, C> = {
  'oc-products': products('products'),
  'oc-v-featured': products('featured'),
  'oc-v-bestsellers': products('bestsellers'),
  'oc-v-new': products('new'),
  'oc-v-deals': products('deals'),
  'oc-v-bundle': products('bundle'),
  'oc-categories': wrap(lazy(() => import('./OcCategories').then((m) => ({ default: m.OcCategories })))),
  'oc-smart': wrap(lazy(() => import('./OcSmart').then((m) => ({ default: m.OcSmart })))),
};
