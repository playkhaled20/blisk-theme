import { describe, expect, it } from 'vitest';
import { ADDON_IDS, adaptFor, shadeWords } from '../../app/addons/panel';
import { panelCopy } from '../../app/addons/copy';
import data from '../../app/addons/data.json';

describe('smart panel', () => {
  it('has data for every store type and skips helpers with nothing to show', () => {
    for (const v of Object.keys(data)) {
      const D = adaptFor(v);
      expect(D.quiz.length).toBeGreaterThan(0);
      if (!D.mm) expect(D.skip).toContain('tryon');
    }
  });
  it('names all twelve helpers, by gender and type', () => {
    const n = panelCopy(true, (f, m) => m, shadeWords('perfume')).names;
    expect(Object.keys(n)).toEqual([...ADDON_IDS]);
    expect(n.recolour).toBe('اختر الرائحة');
    expect(shadeWords('makeup')[0]).toBe('الدرجة');
  });
});

import { intel } from '../../app/addons/intel';

describe('smart ratings', () => {
  it('reads trust, stock and demand from Salla data only', () => {
    const r = intel({ stars: 4.6, count: 60, quantity: 10, canShowQuantity: true, sold: 30, onSale: true });
    expect(r).toMatchObject({ trust: 92, trustWord: 'v_exceptional', stock: 45, stockWord: 's_low', conf: 'high', trending: true, onSale: true });
    expect(intel({ outOfStock: true }).stock).toBe(0);
    expect(intel({ quantity: 3, canShowQuantity: false }).stock).toBe(100);
  });
});

import type { Product } from '@salla.sa/twilight-theme-engine/types';
import { idsOf, ofVertical } from '../../app/addons/home/common';

describe('smart sections', () => {
  it('reads ids and keeps the store type products', () => {
    expect(idsOf([{ id: 5 }, '7', { value: 9 }, 'x'])).toEqual([5, 7, 9]);
    const P = (id: number, name: string) => ({ id, name }) as unknown as Product;
    expect(ofVertical([P(1, 'عطر فاخر'), P(2, 'سيروم')], 'perfume').map((p) => p.id)).toEqual([1]);
  });
});

import { realRows } from '../../app/addons/home/OcCompare';
import { left, parseLaunch } from '../../app/addons/home/OcLaunch';
import { storeFacts } from '../../app/addons/home/OcBoard';

describe('visual sections', () => {
  const P = (o: Partial<Product>) => ({ id: 1, name: 'x', price: 100, ...o }) as unknown as Product;
  it('compares on real data', () => {
    expect(realRows(P({ price: 80, regular_price: 100, rating: { stars: 4.5, count: 12 } } as Partial<Product>))).toEqual([80, 4.5, 12, 1, 20]);
  });
  it('counts down to the launch', () => {
    expect(parseLaunch('2026-12-01')).toBe(new Date(2026, 11, 1).getTime());
    expect(parseLaunch('soon')).toBeNull();
    expect(left(90_061_000)).toEqual([1, 1, 1, 1]);
  });
  it('measures the store', () => {
    const f = storeFacts([P({ price: 50 }), P({ price: 200, is_out_of_stock: true } as Partial<Product>)], 4);
    expect(f).toMatchObject({ cats: 4, min: 50, inStock: 50 });
  });
});
