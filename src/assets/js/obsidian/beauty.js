/* Blisk · smart beauty tools built only from what the store itself publishes:
   1. ingredient checker (product page): reads the product's own name + description, lists the actives it finds, what they pair
      with, what not to mix them with, and morning / evening use. Shows nothing when no active is named.
   2. «قبل ما يخلص» refill estimate: size (ml / g) read from the product's name or description × typical daily use for its
      kind → an estimated number of days. Remembered in this browser when the shopper adds it to the cart; on the home page a
      card reminds her a few days before it runs out. Always labelled as an estimate. */
const B = document.body, isAr = (document.documentElement.lang || 'ar').startsWith('ar');
const t = (a, e) => isAr ? a : e;
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const lc = s => String(s || '').toLowerCase().replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي');

/* actives: when = am / pm / any */
const ACT = {
  retinol: { ar: 'ريتينول', en: 'Retinol', rx: /ريتينول|ريتنول|retinol|retinal|retinoid/, when: 'pm' },
  vitc:    { ar: 'فيتامين C', en: 'Vitamin C', rx: /فيتامين ?(سي|c)(?![\p{L}])|vitamin ?c\b|ascorbic|اسكوربيك/u, when: 'am' },
  acids:   { ar: 'أحماض AHA/BHA', en: 'AHA/BHA acids', rx: /\baha\b|\bbha\b|جلايكوليك|جليكوليك|glycolic|ساليسيليك|salicylic|لاكتيك|lactic|مانديليك|mandelic/, when: 'pm' },
  bpo:     { ar: 'بنزويل بيروكسايد', en: 'Benzoyl peroxide', rx: /benzoyl|بنزويل/, when: 'any' },
  nia:     { ar: 'نياسيناميد', en: 'Niacinamide', rx: /نياسيناميد|نياسينامايد|niacinamide/, when: 'any' },
  ha:      { ar: 'هيالورونيك', en: 'Hyaluronic acid', rx: /هيالورونيك|هيالورونك|hyaluronic|hyaluronate/, when: 'any' },
  cer:     { ar: 'سيراميد', en: 'Ceramides', rx: /سيراميد|ceramide/, when: 'any' },
  pep:     { ar: 'ببتيدات', en: 'Peptides', rx: /ببتيد|peptide/, when: 'any' },
  spf:     { ar: 'حماية من الشمس', en: 'Sun protection', rx: /\bspf\b|واقي شمس|واقي الشمس|sunscreen/, when: 'am' },
  cica:    { ar: 'سنتيلا (سيكا)', en: 'Centella (cica)', rx: /سنتيلا|سيكا|centella|\bcica\b/, when: 'any' }
};
const NO = [['retinol', 'vitc'], ['retinol', 'acids'], ['retinol', 'bpo'], ['vitc', 'bpo']];
const CARE = [['vitc', 'acids']];
const GOOD = { retinol: ['ha', 'cer', 'nia', 'pep'], vitc: ['spf', 'ha', 'nia'], acids: ['ha', 'cer'], bpo: ['ha', 'cer', 'nia'], nia: ['ha', 'retinol', 'cer'],
  ha: ['nia', 'retinol', 'vitc', 'cer'], cer: ['retinol', 'acids', 'ha'], pep: ['ha', 'nia'], spf: ['vitc', 'nia'], cica: ['ha', 'nia', 'cer'] };
const N = k => isAr ? ACT[k].ar : ACT[k].en;

/* typical daily use per kind (ml or g a day) — the first kind found in the name wins */
const USE = [
  [/سيروم|serum|امبول|ampoule|اسنس|essence/, 0.6], [/عطر|perfume|parfum|او دي|edp|edt|cologne|كولونيا/, 0.4], [/واقي|spf|sunscreen/, 1.5],
  [/كريم عين|eye cream/, 0.2], [/كريم|cream|مرطب|moisturi|جل مرطب/, 1], [/غسول|منظف|cleanser|wash|فوم|foam/, 2], [/تونر|toner/, 1.5],
  [/شامبو|shampoo/, 8], [/بلسم|conditioner/, 6], [/زيت شعر|hair oil|سيروم شعر/, 0.6], [/لوشن|lotion|زبده|butter|body/, 4], [/شاور|shower/, 8],
  [/مزيل عرق|deodorant/, 0.6], [/ماسك|mask/, 1.5], [/فاونديشن|foundation/, 0.4], [/زيت لحيه|beard oil/, 0.4]
];
export function sizeOf(text) {
  const m = lc(text).match(/(\d+(?:[.,]\d+)?)\s*(ملل|مل|ml|غرام|جرام|جم|g)(?![\p{L}])/u); if (!m) return null; // \b ignores Arabic letters
  const n = parseFloat(m[1].replace(',', '.')); return n >= 3 && n <= 2000 ? n : null;
}
export function daysOf(name, text) {
  const size = sizeOf(name) || sizeOf(text); if (!size) return null;
  const k = USE.find(([rx]) => rx.test(lc(name))) || USE.find(([rx]) => rx.test(lc(text))); if (!k) return null;
  const d = Math.round(size / k[1]); return d >= 7 && d <= 400 ? d : null;
}
export function activesOf(text) { const s = lc(text); return Object.keys(ACT).filter(k => ACT[k].rx.test(s)); }

/* ---------- product page ---------- */
function productCard() {
  const h1 = document.querySelector('[data-testid="store-product-title"], .product-single h1, main h1');
  const desc = document.querySelector('[data-testid="store-product-description"], .product__description');
  if (!h1 || !desc || document.querySelector('.bk-ing')) return;
  const text = h1.textContent + ' ' + desc.textContent, acts = activesOf(text), days = daysOf(h1.textContent, desc.textContent);
  if (!acts.length && !days) return;
  const no = [...new Set(NO.flatMap(([a, b]) => acts.includes(a) ? [b] : acts.includes(b) ? [a] : []))].filter(k => !acts.includes(k));
  const care = [...new Set(CARE.flatMap(([a, b]) => acts.includes(a) ? [b] : acts.includes(b) ? [a] : []))].filter(k => !acts.includes(k) && !no.includes(k));
  const pairs = [...new Set(acts.flatMap(a => GOOD[a] || []))].filter(k => !acts.includes(k) && !no.includes(k) && !care.includes(k)).slice(0, 4); // never «pairs well» and «don't mix» at once
  const whens = new Set(acts.map(a => ACT[a].when)); const when = whens.has('pm') && !whens.has('am') ? t('مساءً', 'Evening') : whens.has('am') && !whens.has('pm') ? t('صباحاً', 'Morning') : acts.length ? t('صباحاً أو مساءً', 'Morning or evening') : '';
  const chips = (list, cls) => list.map(k => `<span class="bk-chip ${cls}">${esc(N(k))}</span>`).join('');
  const el = document.createElement('section'); el.className = 'bk-ing oc-glass'; el.setAttribute('aria-label', t('مدقق المكوّنات', 'Ingredient checker'));
  el.innerHTML = (acts.length ? `<header><b>${t('مدقق المكوّنات', 'Ingredient checker')}</b><small>${t('من وصف المنتج نفسه', 'from this product’s own description')}</small></header>
    <div class="bk-row"><span>${t('المكوّنات الفعّالة', 'Actives')}</span><div>${chips(acts, 'is-act')}</div></div>
    ${when ? `<div class="bk-row"><span>${t('الوقت المناسب', 'Best time')}</span><div><span class="bk-chip">${when}</span></div></div>` : ''}
    ${pairs.length ? `<div class="bk-row"><span>${t('يتوافق مع', 'Pairs well with')}</span><div>${chips(pairs, 'is-ok')}</div></div>` : ''}
    ${no.length ? `<div class="bk-row"><span>${t('لا تخلطيه مع', 'Don’t layer with')}</span><div>${chips(no, 'is-no')}</div></div>` : ''}
    ${care.length ? `<div class="bk-row"><span>${t('بحذر مع', 'Careful with')}</span><div>${chips(care, 'is-care')}</div></div>` : ''}` : '')
    + (days ? `<div class="bk-refill"><i aria-hidden="true"></i><span>${t('يكفيك تقريباً', 'Lasts about')} <b>${days}</b> ${t('يوماً', 'days')}</span><small>${t('تقدير من حجم العبوة والاستخدام المعتاد', 'estimate from size and typical use')}</small></div>` : '');
  desc.insertAdjacentElement('afterend', el);
  if (days) document.addEventListener('click', e => { if (!e.target.closest('salla-add-product-button, .s-add-product-button-main')) return; remember(h1.textContent.trim(), days); }, true);
}

/* ---------- refill memory (this browser only) ---------- */
const KEY = 'bk_refill';
const load = () => { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { return []; } };
const save = a => { try { localStorage.setItem(KEY, JSON.stringify(a.slice(-12))); } catch (e) { } };
function remember(name, days) {
  const url = location.origin + location.pathname, img = document.querySelector('.details-slider img, main img')?.src || '';
  const list = load().filter(x => x.url !== url); list.push({ url, name, img, days, at: Date.now() }); save(list);
}
function homeReminder() {
  if (!document.querySelector('#main-content') || /\/p\d+/.test(location.pathname) || document.querySelector('.bk-remind')) return;
  const now = Date.now(), due = load().map(x => ({ ...x, left: Math.round(x.days - (now - x.at) / 864e5) })).filter(x => x.left <= 10 && x.left > -20 && !x.off).sort((a, b) => a.left - b.left)[0];
  if (!due) return;
  const el = document.createElement('aside'); el.className = 'bk-remind oc-glass'; el.setAttribute('role', 'status');
  el.innerHTML = `${due.img ? `<img src="${esc(due.img)}" alt="" loading="lazy">` : ''}<div><b>${due.left > 0 ? t(`${esc(due.name)} يخلص بعد ${due.left} أيام تقريباً`, `${esc(due.name)} runs out in about ${due.left} days`) : t(`غالباً خلص ${esc(due.name)}`, `${esc(due.name)} has probably run out`)}</b>
    <small>${t('تقدير من تاريخ إضافته للسلة وحجم العبوة', 'estimate from when you added it and its size')}</small></div>
    <a class="bk-btn" href="${esc(due.url)}">${t('اطلبيه مرة ثانية', 'Reorder')}</a><button type="button" class="bk-x" aria-label="${t('إخفاء', 'Dismiss')}">×</button>`;
  el.querySelector('.bk-x').onclick = () => { save(load().map(x => x.url === due.url ? { ...x, off: 1 } : x)); el.remove(); };
  (document.querySelector('#main-content') || B).prepend(el);
}

export function initBeauty() {
  const run = () => { try { productCard(); } catch (e) { } try { homeReminder(); } catch (e) { } };
  run(); setTimeout(run, 1500); setTimeout(run, 4000);
}
