// Obsidian Cinema verticals: each is a distinct skin of the same theme (accent, hero art, section order, copy).
// Art is inline SVG (no image files, keeps zip < 1MB).
const S = (p) => `<svg viewBox="0 0 120 120" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
export const ICONS = {
  beauty: S('<path d="M60 14l8 22 22 8-22 8-8 22-8-22-22-8 22-8z"/><path d="M92 74l4 10 10 4-10 4-4 10-4-10-10-4 10-4z"/>'),
  skincare: S('<rect x="44" y="40" width="32" height="66" rx="8"/><path d="M50 40V28h20v12M54 28v-10h12v10"/><path d="M52 62h16"/>'),
  makeup: S('<rect x="46" y="58" width="28" height="48" rx="4"/><path d="M50 58V40l10-22 10 22v18"/><path d="M46 74h28"/>'),
  perfume: S('<rect x="30" y="44" width="60" height="62" rx="12"/><path d="M50 44V32h20v12M54 32V22h12v10"/><path d="M44 72h32"/>'),
  haircare: S('<path d="M30 22v84M30 30h18M30 44h18M30 58h18M30 72h18"/><path d="M70 22c18 10 22 34 10 52-6 10-6 22 2 32"/>'),
  bodycare: S('<path d="M40 30h40l4 10v58a8 8 0 0 1-8 8H44a8 8 0 0 1-8-8V40z"/><path d="M52 30V18h16v12M44 60h32"/>'),
  gifts: S('<rect x="20" y="46" width="80" height="58" rx="5"/><path d="M14 46h92v-14H14zM60 32v72"/><path d="M60 32c-8-16-26-14-22-2 2 4 12 2 22 2 10 0 20 2 22-2 4-12-14-14-22 2"/>'),
  devices: S('<rect x="44" y="12" width="32" height="64" rx="16"/><path d="M60 76v32M50 108h20"/><circle cx="60" cy="34" r="8"/>'),
  nails: S('<path d="M42 104V54a18 18 0 0 1 36 0v50z"/><path d="M50 54a10 10 0 0 1 20 0v14H50z"/><path d="M60 34V16"/>'),
  kbeauty: S('<circle cx="60" cy="60" r="40"/><path d="M60 20c-16 14-16 26 0 40s16 26 0 40"/><circle cx="60" cy="40" r="5"/><circle cx="60" cy="80" r="5"/>'),
  mens: S('<path d="M34 30h52v18a26 26 0 0 1-52 0z"/><path d="M60 74v32M46 106h28"/><path d="M42 30V18h36v12"/>'),
};
export const VERTICALS = {
  beauty:   { ar:'التجميل والعناية', en:'Beauty & care', acc:'#d9b779', kw:['تجميل','عنايه','مستحضرات','كوزمتك','cosmetic','beauty','بيوتي'], hero:'جمالك، بذكاء فاخر', specs:[["رضا العميلات", 96], ["أصالة المنتجات", 100], ["سرعة التوصيل", 92]], cats:['beauty','skincare','makeup','perfume','haircare','bodycare','gifts'] },
  skincare: { ar:'العناية بالبشرة', en:'Skincare', acc:'#e8c9b5', kw:['سيروم','serum','كريم','cream','مرطب','moisturizer','غسول','منظف','cleanser','تونر','toner','واقي','sunscreen','spf','ريتينول','retinol','نياسيناميد','niacinamide','هيالورونيك','hyaluronic','ماسك','mask','بشره','skincare'], hero:'بشرة تلمع من الداخل', specs:[["الترطيب", 94], ["تجانس اللون", 90], ["لطيف على البشرة", 96]], cats:['skincare','kbeauty','bodycare'] },
  makeup:   { ar:'المكياج', en:'Makeup', acc:'#d99aa0', kw:['مكياج','makeup','فاونديشن','foundation','كونسيلر','concealer','احمر شفاه','روج','lipstick','ماسكارا','mascara','ظلال','eyeshadow','بلاشر','blush','هايلايتر','highlighter','برايمر','primer','بودره','powder','ايلاينر','eyeliner','فرشاه','فرش'], hero:'إطلالة تخطف الأنظار', specs:[["الثبات", 95], ["تغطية متدرجة", 92], ["تنوّع الدرجات", 90]], cats:['makeup','nails','beauty'] },
  perfume:  { ar:'العطور', en:'Perfumes', acc:'#c9a26b', kw:['عطر','عطور','perfume','fragrance','parfum','عود','oud','بخور','مسك','musk','دهن','معطر','بخاخ','mist','او دي بارفان','edp','edt'], hero:'أثرٌ يبقى بعد رحيلك', specs:[["الثبات", 93], ["الفوحان", 90], ["أصالة المكوّنات", 96]], cats:['perfume','gifts','mens'] },
  haircare: { ar:'العناية بالشعر', en:'Haircare', acc:'#c7b08a', kw:['شعر','hair','شامبو','shampoo','بلسم','conditioner','زيت شعر','hair oil','ماسك شعر','سيروم شعر','صبغه','صبغة','كيراتين','keratin','بروتين','فروه'], hero:'شعر صحي يلمع بالحياة', specs:[["التغذية", 93], ["اللمعان", 91], ["تقوية الجذور", 88]], cats:['haircare','devices','bodycare'] },
  bodycare: { ar:'العناية بالجسم', en:'Body care', acc:'#e0b8a0', kw:['جسم','body','لوشن','lotion','زبده','butter','مقشر','scrub','شاور','شاور جل','shower','مزيل عرق','deodorant','زيت جسم','body oil','صابون','soap'], hero:'نعومة تلمسينها كل يوم', specs:[["الترطيب", 95], ["النعومة", 93], ["رائحة تدوم", 88]], cats:['bodycare','skincare','perfume'] },
  gifts:    { ar:'هدايا ومجموعات', en:'Gifts & sets', acc:'#d9b779', kw:['هديه','هدايا','gift','مجموعه','مجموعات','set','بوكس','box','بكج','باكج','طقم'], hero:'هدية تُبهر من أول نظرة', specs:[["تغليف فاخر", 97], ["رسالة مخصصة", 95], ["توصيل في الموعد", 93]], cats:['gifts','perfume','skincare'] },
  devices:  { ar:'أجهزة التجميل', en:'Beauty devices', acc:'#b9c3d1', kw:['جهاز','اجهزه','device','سشوار','مجفف','dryer','مكواه شعر','straightener','مكواة','فير','curler','ليزر','laser','ازاله الشعر','منظف بشره','ديرما','derma','led','ماساج','massager'], hero:'تقنية الصالون في بيتك', specs:[["الأمان", 96], ["الأداء", 93], ["الضمان", 95]], cats:['devices','haircare','skincare'] },
  nails:    { ar:'الأظافر', en:'Nails', acc:'#e3a1b0', kw:['اظافر','مناكير','nail','nails','طلاء','polish','جل','gel','اكريليك','acrylic','مزيل طلاء','remover','مبرد'], hero:'أظافر تحكي أناقتك', specs:[["الثبات", 92], ["لمعان الجل", 94], ["سرعة الجفاف", 89]], cats:['nails','makeup','beauty'] },
  kbeauty:  { ar:'الجمال الكوري', en:'K-beauty', acc:'#f0c8cf', kw:['كوري','كوريه','korean','k-beauty','kbeauty','كوسركس','cosrx','لانيج','laneige','انيسفري','innisfree','بيوتي اوف جوسون','sheet mask','حلزون','snail','سنتيلا','centella'], hero:'سر البشرة الزجاجية', specs:[["الترطيب", 96], ["مكونات لطيفة", 95], ["نتائج ملحوظة", 90]], cats:['kbeauty','skincare','makeup'] },
  mens:     { ar:'العناية الرجالية', en:"Men's grooming", acc:'#b8a78a', kw:['رجالي','رجال','men','for men','لحيه','beard','حلاقه','shave','شيفر','shaver','افترشيف','aftershave','كولونيا','cologne'], hero:'حضور رجولي بلمسة فاخرة', specs:[["العناية باللحية", 93], ["الثبات", 90], ["لطيف على البشرة", 92]], cats:['mens','perfume','devices'] },
};
/* keyword scoring on normalised Arabic/English text; a keyword counts only at the start of a word
   (optionally after ال/وال/بال), so «سوار» no longer matches inside «إكسسوارات». */
export const norm = s => String(s || '').toLowerCase().replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').replace(/[^\p{L}\p{N}]+/gu, ' ');
const RX = {};
const rx = w => RX[w] || (RX[w] = new RegExp('(?:^|\\s)(?:ال|وال|بال)?' + norm(w).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'));
export function scores(texts){
  const t = ' ' + norm(texts.join(' | ')) + ' ', out = {};
  for (const [k, v] of Object.entries(VERTICALS)) out[k] = v.kw.reduce((n, w) => n + (t.match(rx(w)) || []).length, 0);
  return out;
}
/* one type when the store is focused; a broad multi-department store reads as "beauty" (general beauty) */
export function detect(texts, fallback = 'beauty'){
  const sc = scores(texts), list = Object.entries(sc).filter(([, n]) => n).sort((a, b) => b[1] - a[1]);
  if (!list.length) return fallback;
  const tot = list.reduce((n, [, x]) => n + x, 0);
  if (list.length >= 4 && list[0][1] / tot < .34) return 'beauty';
  return list[0][0];
}

export const VT_EN = {"جمالك، بذكاء فاخر": "Your beauty, intelligently luxurious", "بشرة تلمع من الداخل": "Skin that glows from within", "إطلالة تخطف الأنظار": "A look that turns heads", "أثرٌ يبقى بعد رحيلك": "A trail that lingers after you", "شعر صحي يلمع بالحياة": "Healthy hair that shines", "نعومة تلمسينها كل يوم": "Softness you feel every day", "هدية تُبهر من أول نظرة": "A gift that dazzles at first sight", "تقنية الصالون في بيتك": "Salon tech at home", "أظافر تحكي أناقتك": "Nails that speak elegance", "سر البشرة الزجاجية": "The glass-skin secret", "حضور رجولي بلمسة فاخرة": "Refined presence, luxury touch", "رضا العميلات": "Customer satisfaction", "أصالة المنتجات": "Authentic products", "سرعة التوصيل": "Fast delivery", "الترطيب": "Hydration", "تجانس اللون": "Even tone", "لطيف على البشرة": "Gentle on skin", "الثبات": "Long wear", "تغطية متدرجة": "Buildable coverage", "تنوّع الدرجات": "Shade range", "الفوحان": "Projection", "أصالة المكوّنات": "Authentic ingredients", "التغذية": "Nourishment", "اللمعان": "Shine", "تقوية الجذور": "Root strength", "النعومة": "Softness", "رائحة تدوم": "Lasting scent", "تغليف فاخر": "Luxury wrapping", "رسالة مخصصة": "Personal note", "توصيل في الموعد": "On-time delivery", "الأمان": "Safety", "الأداء": "Performance", "الضمان": "Warranty", "لمعان الجل": "Gel shine", "سرعة الجفاف": "Quick dry", "مكونات لطيفة": "Gentle ingredients", "نتائج ملحوظة": "Visible results", "العناية باللحية": "Beard care"};
export const vt = (s) => ((document.documentElement.lang||'ar').startsWith('ar') ? s : (VT_EN[s]||s));
