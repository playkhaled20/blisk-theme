/** «التقييم الذكي» (oc_smart_ratings): gauges from Salla's own product data only (Twig `oc-intel.twig`). */
export interface IntelInput {
  stars?: number;
  count?: number;
  quantity?: number | null;
  canShowQuantity?: boolean;
  outOfStock?: boolean;
  sold?: number;
  onSale?: boolean;
}

export function intel(p: IntelInput) {
  const stars = p.stars ?? 0;
  const count = p.count ?? 0;
  const trust = stars ? Math.round(stars * 20) : 0;
  const conf = count >= 50 ? 'high' : count >= 10 ? 'mid' : 'early';
  const q = p.quantity ?? null;
  const unlimited = q == null || !p.canShowQuantity;
  const stock = p.outOfStock ? 0 : unlimited ? 100 : q >= 50 ? 95 : q >= 20 ? 75 : q >= 6 ? 45 : 18;
  const trustWord = trust >= 90 ? 'v_exceptional' : trust >= 80 ? 'v_high' : trust >= 60 ? 'v_good' : trust ? 'v_mixed' : 'v_new';
  const stockWord = stock === 0 ? 's_out' : stock >= 90 ? 's_confident' : stock >= 70 ? 's_good' : stock >= 40 ? 's_low' : 's_last';
  const sold = p.sold ?? 0;
  return { trust, stock, conf, trustWord, stockWord, confW: conf === 'high' ? 96 : conf === 'mid' ? 64 : 30, demandW: sold ? (sold > 100 ? 95 : sold > 20 ? 70 : 40) : 15, trending: sold > 20, onSale: !!p.onSale };
}

export const INTEL_TEXT: Record<string, [string, string]> = {
  trust: ['ثقة العملاء', 'Customer trust'],
  stock: ['المخزون المتاح', 'Stock'],
  confidence: ['موثوقية التقييم', 'Rating confidence'],
  demand: ['الطلب', 'Demand'],
  deal: ['العرض', 'Deal'],
  deal_live: ['عرض ساري', 'Live deal'],
  trending: ['رائج الآن', 'Trending'],
  steady: ['طلب مستقر', 'Steady'],
  v_exceptional: ['استثنائي', 'Exceptional'],
  v_high: ['عالٍ', 'High'],
  v_good: ['جيد', 'Good'],
  v_mixed: ['متباين', 'Mixed'],
  v_new: ['منتج جديد', 'New product'],
  s_out: ['نفد · نبّهني', 'Out · notify me'],
  s_confident: ['متوفر بثقة', 'In stock'],
  s_good: ['توفر جيد', 'Good stock'],
  s_low: ['الكمية تقل', 'Running low'],
  s_last: ['آخر القطع', 'Last pieces'],
  c_high: ['عالية', 'High'],
  c_mid: ['متوسطة', 'Medium'],
  c_early: ['أولية', 'Early'],
};
