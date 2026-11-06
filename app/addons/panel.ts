import DATA from './data.json';

/** Data and wording for the smart panel (Twig `obsidian/addons.js`), per store type. */
export const ADDON_IDS = ['stylist', 'voice', 'listen', 'tryon', 'recolour', 'photocoach', 'colorbook', 'look', 'quiz', 'undertone', 'giftfinder', 'presets'] as const;
export type AddonId = (typeof ADDON_IDS)[number];

export interface Bi {
  ar: string;
  en: string;
}
export interface PanelData {
  words: string[];
  quiz: { q: Bi; opts: (Bi & { kw: string })[] }[];
  kit: (Bi & { kw: string })[];
  compat: (Bi & { kw: string })[];
  finish: (Bi & { hex: string })[];
  mm: [number, number] | null;
  sizeLabel: Bi;
  gift: number[];
  photo: Bi[];
  bundle: (Bi & { kw: string[] })[];
  /** What the read-aloud helper is about («طريقة الاستخدام»). */
  listen: string;
}

const ALL = DATA as unknown as Record<string, PanelData>;
const FIRST = Object.keys(ALL)[0];

/** This store type's data, and the helpers it has nothing for. */
export function adaptFor(v: string): PanelData & { skip: AddonId[] } {
  const D = ALL[v] ?? ALL[FIRST];
  const skip: AddonId[] = [];
  if (!D.mm) skip.push('tryon');
  if (!D.finish?.length) skip.push('recolour', 'colorbook');
  if (!D.photo?.length) skip.push('photocoach');
  return { ...D, skip };
}

/** «shade / scent / colour» wording by store type: [singular, plural, English]. */
export function shadeWords(v: string): [string, string, string] {
  const scent: [string, string, string] = ['الرائحة', 'الروائح', 'scent'];
  const colour: [string, string, string] = ['اللون', 'الألوان', 'colour'];
  const M: Record<string, [string, string, string]> = { perfume: scent, mens: scent, bodycare: scent, gifts: scent, haircare: colour, devices: colour, nails: colour };
  return M[v] ?? ['الدرجة', 'الدرجات', 'shade'];
}

/** Each helper's name, [Arabic, English]; `g` picks the feminine or masculine Arabic. */
export function NAMES(g: (f: string, m: string) => string, W: [string, string, string]): Record<AddonId, [string, string]> {
  return {
    stylist: [g('مستشارة الجمال', 'مستشار العناية'), 'Beauty advisor'],
    voice: ['البحث الصوتي', 'Voice search'],
    listen: [g('اسمعي طريقة الاستخدام', 'اسمع طريقة الاستخدام'), 'Listen to how-to'],
    tryon: ['حجم العبوة الحقيقي', 'True bottle size'],
    recolour: [`${g('اختاري', 'اختر')} ${W[0]}`, `Pick a ${W[2]}`],
    photocoach: ['نصائح الاستخدام والحفظ', 'Use & care tips'],
    colorbook: [`دليل ${W[1]}`, `${W[2][0].toUpperCase()}${W[2].slice(1)} guide`],
    look: [g('أكملي الروتين', 'أكمل الروتين'), 'Complete the routine'],
    quiz: ['اختبار بشرتك واحتياجك', 'Skin & needs quiz'],
    undertone: ['يناسب بشرتك؟', 'Right for your skin?'],
    giftfinder: ['مكتشف الهدايا', 'Gift finder'],
    presets: ['روتينات جاهزة', 'Ready routines'],
  };
}

/** Store-policy answers: they only point to the store's own pages and Salla checkout; they never invent terms. */
export const FAQ: [string, string, string, string][] = [
  [
    'الاستبدال والاسترجاع',
    'Exchange & returns',
    'الاستبدال والاسترجاع حسب سياسة المتجر المكتوبة في صفحات المتجر أسفل الموقع. منتجات العناية المفتوحة قد لا تُسترجع لأسباب صحية؛ احتفظي بالفاتورة وتأكدي من ختم العبوة عند الاستلام.',
    'Exchanges and returns follow the store policy pages in the footer. Opened care products may not be returnable for hygiene reasons; keep the invoice and check the seal on delivery.',
  ],
  ['الشحن والتوصيل', 'Shipping', 'مدة وتكلفة التوصيل تظهر في السلة حسب مدينتك قبل الدفع، وتتابع طلبك من «طلباتي».', 'Delivery time and cost appear in your cart for your city before payment; track the order from “My orders”.'],
  ['الدفع', 'Payment', 'طرق الدفع المتاحة تظهر عند إتمام الطلب، وكل المدفوعات تمر عبر بوابة سلة الآمنة.', 'Available payment methods show at checkout; all payments go through Salla’s secure gateway.'],
];
