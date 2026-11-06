import type { AddonId } from './panel';

/**
 * The smart panel's wording for this theme (beauty). Hangul has its own copy.ts
 * with the tech wording; the panel code is the same in both themes.
 * `g(feminine, masculine)` follows the store type (men's grooming speaks to a man);
 * `W` is the «shade / scent / colour» word set of the store type.
 */
export function panelCopy(ar: boolean, g: (f: string, m: string) => string, W: [string, string, string]) {
  const t = (a: string, e: string) => (ar ? a : e);
  const names: Record<AddonId, string> = {
    stylist: t(g('مستشارة الجمال', 'مستشار العناية'), 'Beauty advisor'),
    voice: t('البحث الصوتي', 'Voice search'),
    listen: t(g('اسمعي طريقة الاستخدام', 'اسمع طريقة الاستخدام'), 'Listen to how-to'),
    tryon: t('حجم العبوة الحقيقي', 'True bottle size'),
    recolour: t(`${g('اختاري', 'اختر')} ${W[0]}`, `Pick a ${W[2]}`),
    photocoach: t('نصائح الاستخدام والحفظ', 'Use & care tips'),
    colorbook: t(`دليل ${W[1]}`, `${W[2][0].toUpperCase()}${W[2].slice(1)} guide`),
    look: t(g('أكملي الروتين', 'أكمل الروتين'), 'Complete the routine'),
    quiz: t('اختبار بشرتك واحتياجك', 'Skin & needs quiz'),
    undertone: t('يناسب بشرتك؟', 'Right for your skin?'),
    giftfinder: t('مكتشف الهدايا', 'Gift finder'),
    presets: t('روتينات جاهزة', 'Ready routines'),
  };
  return {
    names,
    idle: t(g('اختاري أداة — المحتوى مخصص لقسم', 'اختر أداة — المحتوى مخصص لقسم'), 'Pick a tool — tailored to'),
    recolour: t(`${g('اختاري', 'اختر')} ${W[0]}`, `Pick a ${W[2]}`),
    colorbook: t(`دليل ${W[1]} المتوفرة`, `${W[2]} guide`),
    photocoach: t(g('استخدميه صح واحفظيه صح', 'استخدمه صح واحفظه صح'), 'Use it right, store it right'),
    look: t(g('أكملي روتينك', 'أكمل روتينك'), 'Complete your routine'),
    presets: t('روتينات جاهزة', 'Ready routines'),
    undertone: t('وش نوع بشرتك؟', 'Your skin type?'),
    speak: t(g('تكلّمي الحين…', 'تكلّم الحين…'), 'Speak now…'),
    unheard: t(g('ما قدرنا نسمعك — جرّبي الكتابة', 'ما قدرنا نسمعك — جرّب الكتابة'), 'Could not hear you — try typing'),
    ask: t(g('اسألي عن منتج أو نوع بشرة أو ميزانية أو سياسة', 'اسأل عن منتج أو نوع بشرة أو ميزانية أو سياسة'), 'Ask about a product, skin type, budget or policy'),
    askHint: t('مثال: سيروم للبشرة الجافة', 'e.g. serum for dry skin'),
    askLabel: t(g('اسألي المستشارة', 'اسأل المستشار'), 'Ask the advisor'),
    ruler: (w: number, h: number) => t(`حجم العبوة التقريبي ≈ ${w}×${h} ملم. قارنها بيدك — تقريبي ويختلف حسب الشاشة.`, `About ${w}×${h} mm. Compare with your hand — approximate, varies by screen.`),
    listenTitle: t('طريقة الاستخدام', 'How to use'),
    faq: [
      [
        t('الاستبدال والاسترجاع', 'Exchange & returns'),
        t(
          'الاستبدال والاسترجاع حسب سياسة المتجر المكتوبة في صفحات المتجر أسفل الموقع. منتجات العناية المفتوحة قد لا تُسترجع لأسباب صحية؛ احتفظي بالفاتورة وتأكدي من ختم العبوة عند الاستلام.',
          'Exchanges and returns follow the store policy pages in the footer. Opened care products may not be returnable for hygiene reasons; keep the invoice and check the seal on delivery.'
        ),
      ],
      [t('الشحن والتوصيل', 'Shipping'), t('مدة وتكلفة التوصيل تظهر في السلة حسب مدينتك قبل الدفع، وتتابع طلبك من «طلباتي».', 'Delivery time and cost appear in your cart for your city before payment; track the order from “My orders”.')],
      [t('الدفع', 'Payment'), t('طرق الدفع المتاحة تظهر عند إتمام الطلب، وكل المدفوعات تمر عبر بوابة سلة الآمنة.', 'Available payment methods show at checkout; all payments go through Salla’s secure gateway.')],
    ] as [string, string][],
  };
}
