import { describe, expect, it } from 'vitest';
import { ADDON_IDS, NAMES, adaptFor, shadeWords } from '../../app/addons/panel';
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
    const n = NAMES((f, m) => m, shadeWords('perfume'));
    expect(Object.keys(n)).toEqual([...ADDON_IDS]);
    expect(n.recolour[0]).toBe('اختر الرائحة');
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
