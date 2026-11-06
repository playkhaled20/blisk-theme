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
  'oc-cinema': wrap(lazy(() => import('./OcCinema').then((m) => ({ default: m.OcCinema })))),
  'oc-spec': wrap(lazy(() => import('./OcSpec').then((m) => ({ default: m.OcSpec })))),
  'oc-compare': wrap(lazy(() => import('./OcCompare').then((m) => ({ default: m.OcCompare })))),
  'oc-showcase': wrap(lazy(() => import('./OcShowcase').then((m) => ({ default: m.OcShowcase })))),
  'oc-setup': wrap(lazy(() => import('./OcSetup').then((m) => ({ default: m.OcSetup })))),
  'oc-brands-wall': wrap(lazy(() => import('./OcBrands').then((m) => ({ default: m.OcBrands })))),
  'oc-services': wrap(lazy(() => import('./OcServices').then((m) => ({ default: m.OcServices })))),
  'oc-launch': wrap(lazy(() => import('./OcLaunch').then((m) => ({ default: m.OcLaunch })))),
  'oc-intel-board': wrap(lazy(() => import('./OcBoard').then((m) => ({ default: m.OcBoard })))),
};
