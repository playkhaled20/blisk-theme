/* Blisk · preview demo skin.
   Salla previews every theme on its own demo store, which sells fashion. In PREVIEW ONLY (Salla theme preview /
   salla.design / ?oc_preview) this swaps the demo store's product cards, header menu and store read for tech demo
   content of the chosen store type, using the theme's bundled real photos. A live store is never touched. */
import { VERTICALS, vt } from './verticals';
import { formatSar, parseAmount, isSarText } from './money';

const B = document.body, ar = () => (document.documentElement.lang || 'ar').startsWith('ar');
/* Salla's demo hosts (never a merchant's live store): once a preview was opened there, the pages it links to stay in preview */
const demoHost = h => /(^|\.)salla\.design$/.test(h) || h === 'demostore.salla.sa';
export const isPreview = () => { const h = location.hostname, q = new URLSearchParams(location.search);
  const on = q.has('oc_preview') || q.has('oc_p') || B.dataset.ocMode === 'preview' || /(^|\.)salla\.design$/.test(h) || h === 'localhost' || !!window.salla?.config?.get?.('store.preview');
  try { if (on && demoHost(h)) sessionStorage.setItem('oc_preview', '1'); return on || (demoHost(h) && sessionStorage.getItem('oc_preview') === '1'); } catch (e) { return on; } };

/* one product per photo: the same photo is the same product (name, price, old price, description) in every store type */
const CAT = {
  'beauty-featured': 'مجموعة عناية فاخرة: كريم ومقشر وسيروم|Luxury care set: cream, scrub & serum|690|790|مجموعة عناية متكاملة بكريم مرطب بالسيراميد ومقشر لطيف وسيروم بحمض الهيالورونيك.',
  'beauty-bestsellers': 'أحمر شفاه وردي مع بلاشر مضغوط|Pink lipstick with pressed blush|189|229|',
  'beauty-bundle': 'سيروم وكريم مرطب بعبوات الخيزران|Serum & moisturizer in bamboo jars|259|0|ثنائي ترطيب: سيروم بالنياسيناميد وكريم مرطب بالسيراميد. 30 مل و50 مل.',
  'skincare-featured': 'سيروم فيتامين C بقطارة زجاجية 30 مل|Vitamin C serum, glass dropper, 30 ml|149|179|سيروم مضيء بفيتامين C 15% وحمض الهيالورونيك لإشراقة وتجانس اللون. 30 مل.',
  'skincare-bestsellers': 'سيروم ريتينول ليلي 30 مل|Night retinol serum, 30 ml|169|0|سيروم ليلي بريتينول 0.3% مع نياسيناميد وسيراميد لتجديد البشرة. 30 مل.',
  'skincare-spf': 'واقي شمس SPF50 خفيف 50 مل|Light SPF50 sunscreen, 50 ml|119|139|واقي شمس خفيف SPF50 بالنياسيناميد، لا يترك أثراً أبيض. 50 مل.',
  'skincare-cleanser': 'غسول رغوي لطيف للوجه 150 مل|Gentle foaming face cleanser, 150 ml|79|0|غسول رغوي لطيف بالسيراميد ينظّف دون جفاف. 150 مل.',
  'skincare-bundle': 'سيروم نياسيناميد مع ماسك طين|Niacinamide serum with clay mask|119|0|سيروم بالنياسيناميد 10% لتقليل المسام، مع ماسك طين منقٍّ. 30 مل.',
  'kbeauty-featured': 'إسنس كوري بخلاصة الأرز 150 مل|Korean rice essence, 150 ml|129|149|إسنس كوري مرطب بخلاصة الأرز وحمض الهيالورونيك للبشرة الزجاجية. 150 مل.',
  'kbeauty-bestsellers': 'ماسك ورقي مرطب|Hydrating sheet mask|25|0|ماسك ورقي كوري بحمض الهيالورونيك والسنتيلا. استخدام واحد.',
  'kbeauty-bundle': 'كريم حاجز الرطوبة المهدئ 50 مل|Calming moisture barrier cream, 50 ml|99|0|كريم مهدئ بالسيراميد والسنتيلا يقوّي حاجز البشرة. 50 مل.',
  'makeup-featured': 'باليت ظلال عيون نود — 12 لون|Nude eyeshadow palette — 12 shades|189|219|',
  'makeup-bestsellers': 'أحمر شفاه مطفي — 4 درجات|Matte lipstick — 4 shades|79|0|',
  'makeup-bundle': 'طقم مكياج: بودرة وبلاشر وفرش|Makeup set: powder, blush & brushes|349|399|',
  'perfume-featured': 'عطر بعبوة زجاجية كلاسيكية 100 مل|Classic glass-bottle perfume, 100 ml|450|0|عطر بنوتات خشبية ومسكية بثبات طويل. 100 مل.',
  'perfume-bestsellers': 'عطر ذهبي فاخر 50 مل|Luxury golden perfume, 50 ml|690|790|عطر شرقي فاخر بالعود والعنبر. 50 مل.',
  'perfume-bundle': 'مبخرة مع بخور عود|Incense burner with oud bakhoor|220|0|',
  'haircare-featured': 'زيت شعر طبيعي 100 مل|Natural hair oil, 100 ml|89|0|زيت شعر طبيعي يغذي ويقوي الأطراف ويمنح لمعاناً. 100 مل.',
  'haircare-bestsellers': 'طقم تصفيف: موس وسبراي حماية وسيروم|Styling set: mousse, protect spray & serum|199|239|',
  'haircare-bundle': 'منتجات عناية بالشعر بعبوات بيضاء|Haircare essentials in white bottles|159|0|',
  'bodycare-featured': 'زبدة ومقشر جسم طبيعي مع فرشاة|Natural body butter & scrub with brush|139|159|زبدة جسم مرطبة ومقشر طبيعي لنعومة تدوم. 200 جم.',
  'bodycare-bestsellers': 'طقم استحمام: ليفة وفرشاة وملح|Bath set: loofah, brush & salt|99|0|',
  'bodycare-bundle': 'لوشن جسم مرطب 250 مل|Moisturizing body lotion, 250 ml|69|0|لوشن جسم خفيف بالسيراميد للترطيب اليومي. 250 مل.',
  'gifts-featured': 'صندوق هدية مع سيروم وكريم|Gift box with serum & cream|299|349|',
  'gifts-bestsellers': 'هدية مغلّفة بالورد المجفف|Gift wrapped with dried flowers|199|0|',
  'gifts-bundle': 'تغليف هدية فاخر بشريطة سوداء|Luxury gift wrapping, black ribbon|35|0|',
  'devices-featured': 'مجفف شعر احترافي|Professional hair dryer|590|690|',
  'devices-bestsellers': 'رول وحجر قوا شا من الكوارتز الوردي|Rose quartz roller & gua sha|129|0|',
  'devices-bundle': 'مكواة شعر مع مشط وزيوت|Hair straightener with comb & oils|349|399|',
  'nails-featured': 'طلاء أظافر فوشي|Fuchsia nail polish|39|0|',
  'nails-bestsellers': 'مجموعة طلاء أظافر ملوّنة|Colourful nail polish set|149|179|',
  'nails-bundle': 'مجموعة ألوان جل للأظافر|Nail gel colour collection|249|0|',
  'mens-featured': 'طقم حلاقة كلاسيكي: موس وفرشاة|Classic shaving kit: razor & brush|189|229|',
  'mens-bestsellers': 'فرشاة حلاقة مع كريم|Shaving brush with cream|99|0|',
  'mens-bundle': 'زيت لحية بقطارة 30 مل|Beard oil with dropper, 30 ml|79|0|زيت لحية مغذٍّ ينعّم الشعر ويخفف الحكة. 30 مل.'
};
const P = { // each store type lists the photos (products) it shows, each photo once
  beauty: 'beauty-featured;beauty-bestsellers;beauty-bundle;skincare-featured;makeup-featured;perfume-bestsellers;haircare-featured;gifts-featured',
  skincare: 'skincare-featured;skincare-bestsellers;skincare-cleanser;skincare-spf;skincare-bundle;kbeauty-bundle;beauty-bundle;devices-bestsellers',
  makeup: 'makeup-featured;makeup-bestsellers;makeup-bundle;beauty-bestsellers;nails-featured',
  perfume: 'perfume-featured;perfume-bestsellers;perfume-bundle;gifts-bestsellers;bodycare-bundle',
  haircare: 'haircare-featured;haircare-bestsellers;haircare-bundle;devices-bundle;devices-featured',
  bodycare: 'bodycare-featured;bodycare-bestsellers;bodycare-bundle;beauty-featured',
  gifts: 'gifts-featured;gifts-bestsellers;gifts-bundle;perfume-bestsellers;beauty-featured',
  devices: 'devices-featured;devices-bestsellers;devices-bundle',
  nails: 'nails-featured;nails-bestsellers;nails-bundle',
  kbeauty: 'kbeauty-featured;kbeauty-bestsellers;kbeauty-bundle;skincare-bestsellers',
  mens: 'mens-featured;mens-bestsellers;mens-bundle;perfume-featured'
};
const MODES = ['featured', 'bestsellers', 'bundle'];
const esc = x => String(x == null ? '' : x).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const asset = name => (B.dataset.ocImg || '').replace(/[^/]*\.webp(\?.*)?$/, `${name}.webp$1`);

export function demoPack(v) {
  const V = VERTICALS[v] ? v : 'beauty';
  const ps = (P[V] || P.beauty).split(';').map((k, i) => { const [a, e, p, w, d] = CAT[k].split('|'); const price = +p, was = +w || null;
    return { id: 9000 + i, name: ar() ? a : e, slug: e.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''), url: '#', img: asset(k), price, was, sale: !!was, out: false, stars: [4.8, 4.6, 4.7, 4.5, 4.9, 4.4, 4.6, 4.7][i], reviews: [214, 162, 88, 301, 120, 64, 45, 140][i], sold: [320, 180, 90, 260, 140, 60, 40, 150][i], desc: d || '', digital: false }; });
  const cats = (VERTICALS[V].cats || [V]).map((c, i) => ({ id: null, name: ar() ? VERTICALS[c].ar : VERTICALS[c].en, url: '#', img: asset(`${c}-${MODES[i % 3]}`), sub: [], v: c }));
  return { v: V, ps, cats };
}

/* demo prices are always Saudi riyals with Western digits (the demo store may show USD and Arabic-Indic digits) */
const money = n => formatSar(n, ar());
/* the preview's store type: picker choice (?oc_type / session) → merchant setting → beauty. Never the fashion demo store's own words. */
export const demoV = () => { let v = ''; try { v = new URLSearchParams(location.search).get('oc_type') || sessionStorage.getItem('oc_type') || ''; } catch (e) {  }
  const set = B.dataset.ocVertical; return VERTICALS[v] ? v : VERTICALS[set] ? set : 'beauty'; };
const vOf = () => (isPreview() ? demoV() : B.dataset.ocV) || 'beauty';

/* a card's link stays inside the preview: same origin + the preview's own query (preview=true, oc_type…) + which demo product (oc_p) */
function demoHref(href, v, i, slug) {
  const here = new URL(location.href); let u; try { u = new URL(href || here.href, here.href); } catch (e) { u = here; }
  let path = u.pathname; const dev = here.pathname.match(/^\/dev-[^/]+/);
  if (u.origin !== here.origin && dev) path = dev[0] + path.replace(/^\/dev-[^/]+/, ''); // the demostore's link → the same product path inside this preview
  if (slug) path = path.replace(/\/[^/]+(\/p\d+\/?)$/, `/${slug}$1`);
  const out = new URL(path, here.origin); here.searchParams.forEach((val, k) => out.searchParams.set(k, val));
  out.searchParams.set('oc_type', v); out.searchParams.set('oc_p', i); out.hash = ''; return out.href;
}
function skinCards(pack) {
  const cards = [...document.querySelectorAll('custom-salla-product-card, .s-product-card-entry')].filter(c => !c.classList.contains('oc-plisk') && !c.closest('.oc-plisk-fallback, [data-testid="oc-offers"], [data-testid="oc-latest"]') && !c.parentElement?.closest('custom-salla-product-card'));
  const seen = new Map(); // each product list / slider counts its own cards: one demo product each, the rest hidden (never the same photo twice)
  cards.forEach(c => {
    const g = c.closest('salla-products-slider, salla-products-list, .s-products-slider, .s-products-list, section') || B, i = seen.get(g) || 0; seen.set(g, i + 1);
    const box = c.closest('.swiper-slide') || c;
    if (i >= pack.ps.length) { box.classList.add('oc-hide'); // a surplus card keeps none of the demo store's fashion text or photo, even hidden
      if (!c.dataset.ocBlank) { c.dataset.ocBlank = '1'; c.querySelectorAll('.s-product-card-content-title, .s-product-card-content-subtitle, .s-product-card-price, .s-product-card-sale-price').forEach(e => { e.textContent = ''; });
        c.querySelectorAll('img').forEach(im => { im.removeAttribute('srcset'); im.src = 'data:image/gif;base64,R0lGODlhAQABAAAAACw='; im.alt = ''; }); c.querySelectorAll('a').forEach(l => { l.removeAttribute('aria-label'); l.removeAttribute('title'); }); }
      return; }
    box.classList.remove('oc-hide');
    const p = pack.ps[i], url = demoHref(c.querySelector('a[href]')?.getAttribute('href'), pack.v, i, p.slug);
    c.querySelectorAll('a[href]').forEach(a => { if (a.href !== url) a.href = url; ['aria-label', 'title'].forEach(k => { if (a.hasAttribute(k)) a.setAttribute(k, p.name); }); }); // screen readers hear the tech product too
    const sig = pack.v + ':' + i + ':' + p.price;
    const titleEl = c.querySelector('.s-product-card-content-title a') || c.querySelector('.s-product-card-content-title');
    const priceEl = c.querySelector('.s-product-card-sale-price h4, .s-product-card-price, .s-product-card-starting-price h4');
    /* a later salla.money() re-render puts USD / Indic digits back; refresh whenever the card drifts */
    if (c.dataset.ocDemo === sig && titleEl && titleEl.textContent === p.name && priceEl && isSarText(priceEl.textContent)) return;
    const img = c.querySelector('.s-product-card-image img, .s-product-card-image-full img'); if (img) { img.src = p.img; img.alt = p.name; img.removeAttribute('srcset'); img.className = img.className.replace(/s-product-card-image-contain/, 's-product-card-image-cover'); }
    const t = titleEl; if (t && t.textContent !== p.name) t.textContent = p.name; // the title link itself, so it keeps its href
    c.querySelectorAll('.s-product-card-content-subtitle').forEach(e => e.remove());
    const pr = c.querySelector('.s-product-card-sale-price, .s-product-card-price, .s-product-card-starting-price');
    if (pr && !(isSarText(pr.textContent) && pr.textContent.includes(money(p.price)))) { const h = document.createElement('div'); h.innerHTML = p.was ? `<div class="s-product-card-sale-price"><h4>${money(p.price)}</h4><span>${money(p.was)}</span></div>` : `<h4 class="s-product-card-price">${money(p.price)}</h4>`; pr.replaceWith(h.firstElementChild); }
    if (c.product) c.product = { ...c.product, url, name: p.name, price: p.price, sale_price: p.price, regular_price: p.was || p.price, is_on_sale: !!p.was, is_out_of_stock: false, rating: { stars: p.stars, count: p.reviews }, sold_quantity: p.sold, quantity: null };
    c.querySelectorAll('.oc-card-intel, .oc-badge').forEach(e => e.remove()); c.classList.remove('oc-urgent');
    c.dataset.ocDemo = sig;
  });
}
function skinMenu(pack) {
  document.querySelectorAll('.main-menu').forEach(menu => {
    /* each top item is keyed by its ORIGINAL label (or id), so Salla's mobile + desktop twins get the same tech category;
       «تخفيضات»/«المزيد» and any extra item are hidden with !important (the mobile drawer's own CSS would show them again) */
    const orig = li => { if (!li.dataset.ocOrig) li.dataset.ocOrig = li.id || (li.querySelector(':scope > a, :scope > span') || li).textContent.trim(); return li.dataset.ocOrig; };
    const special = li => li.id === 'offers' || li.id === 'more-menu-dropdown' || /^(تخفيضات|العروض|المزيد|offers|more)$/i.test(orig(li));
    const items = [...menu.children].filter(li => li.tagName === 'LI'), keys = [];
    items.forEach(li => { if (!special(li) && orig(li) && !keys.includes(orig(li))) keys.push(orig(li)); });
    items.forEach(li => {
      const c = special(li) ? null : pack.cats[keys.indexOf(orig(li))];
      if (!c) { li.remove(); return; } // «تخفيضات» / «المزيد» / extra fashion items leave the menu entirely
      const label = li.querySelector(':scope > a span') || li.querySelector(':scope > span') || li.querySelector(':scope > a');
      if (label && label.textContent !== c.name) label.textContent = c.name;
      const a = li.querySelector(':scope > a'); if (a) a.setAttribute('aria-label', c.name);
      li.style.removeProperty('display'); /* overflow math must not leave the kept items invisible */
      li.querySelectorAll(':scope > ul, :scope .sub-menu').forEach(u => u.remove()); // fashion sub-categories / products
      li.classList.remove('has-children', 'dropdown'); li.querySelectorAll(':scope > a .sicon-keyboard_arrow_down, :scope > a .sicon-arrow-down').forEach(e => e.remove());
      li.querySelectorAll('img').forEach(i => { if (i.getAttribute('src') !== c.img) { i.src = c.img; i.alt = c.name; } });
    });
  });
}
/* the demo store's fashion logo (a clothes hanger) → a BLISK wordmark with the chosen type */
function skinLogo(pack) {
  const V = VERTICALS[pack.v] || VERTICALS.beauty;
  document.querySelectorAll('.navbar-brand, footer .store-logo, footer a[href] > img[alt*="logo"]').forEach(a => {
    const img = a.tagName === 'IMG' ? a : a.querySelector('img'); if (!img || img.dataset.ocLogo) return; img.dataset.ocLogo = '1';
    img.classList.add('oc-hide');
    const w = document.createElement('span'); w.className = 'oc-demo-logo'; w.innerHTML = `<b>BLISK</b><small>${ar() ? V.ar : V.en}</small>`;
    img.insertAdjacentElement('afterend', w);
  });
}

/* everything else the fashion demo store shows (Salla banners / sliders / category blocks / section titles / product page)
   is swept in preview: fashion words → the type's own wording, store photos → the theme's tech photos. */
const FASHION = /(فستان|فساتين|بلوز|بلايز|عباي|جاكيت|بنطلون|بناطيل|تنور|تنانير|أزياء|ازياء|ملابس|قميص|قمصان|شنط|حقائب|أحذية|احذية|كعب|طرح|شيل|لانجري|dress|blouse|fashion|jacket|abaya|skirt|pants|trouser|shirt|cloth|outfit|heels|handbag)/i;
const OWN = '.main-menu, #mobile-menu, .oc-demo-logo, .oc-pk, .oc-ai, .oc-cc, .oc-dock, [data-oc-sec], .oc-hero, .oc-cats, .oc-smart-host, .oc-vsec, .oc-trust, custom-salla-product-card, .s-product-card-entry, script, style, noscript';
const themeImg = src => !src || /\/images\/oc\/|placeholder|data:image|sicon|\.svg(\?|$)/.test(src);
function sweep(pack) {
  const V = VERTICALS[pack.v] || VERTICALS.beauty, nm = ar() ? V.ar : V.en; let ci = 0, pi = 0;
  const nextCat = () => pack.cats[ci++ % pack.cats.length].name, nextPic = () => { const p = pack.ps[pi++ % pack.ps.length]; return p.img; };
  const root = document.querySelector('#main-content, main') || B;
  /* texts */
  const tw = document.createTreeWalker(B, NodeFilter.SHOW_TEXT); const hits = [];
  while (tw.nextNode()) { const n = tw.currentNode, el = n.parentElement; if (!el || el.closest(OWN) || !FASHION.test(n.textContent)) continue; hits.push(n); }
  hits.forEach(n => { const el = n.parentElement, t = n.textContent.trim();
    n.textContent = el.closest('h1, h2, h3, h4, .banner__title, .s-block__title') ? (t.length < 26 ? nextCat() : `${ar() ? 'مختارات' : 'Featured'} ${nm}`) : t.length < 26 ? nextCat() : vt(V.hero); });
  /* photos and background photos from the demo store */
  root.querySelectorAll('img').forEach(img => { if (img.closest(OWN) || img.dataset.ocSwept) return; const src = img.currentSrc || img.getAttribute('src') || img.dataset.src || '';
    if (themeImg(src) || img.closest('.store-header, header, footer')) return; img.dataset.ocSwept = '1'; const n = nextPic(); img.src = n; img.removeAttribute('srcset'); if (img.dataset.src) img.dataset.src = n; });
  root.querySelectorAll('[data-bg], .banner-entry, .swiper-slide [style*="background-image"]').forEach(e => { if (e.closest(OWN) || e.dataset.ocSwept) return;
    const bg = e.dataset.bg || e.style.backgroundImage || ''; if (!bg || themeImg(bg)) return; e.dataset.ocSwept = '1'; const n = nextPic(); if (e.dataset.bg) e.dataset.bg = n; e.style.backgroundImage = `url("${n}")`; });
}
/* product page in preview: one tech demo product (stable per URL) */
function skinProduct(pack) {
  const h1 = document.querySelector('[data-testid="store-product-title"], .product-single h1, .product-entry__title, main h1'); if (!h1 || !document.querySelector('salla-add-product-button, .product-form, [class*="product-single"]')) return;
  const once = e => !e || e.dataset.ocDemo ? false : (e.dataset.ocDemo = '1', true); // each element is skinned once (late renders still get theirs)
  /* the product the shopper clicked (?oc_p from the card), else stable per URL */
  let h = 0; for (const ch of location.pathname) h = (h * 31 + ch.charCodeAt(0)) >>> 0; const q = parseInt(new URLSearchParams(location.search).get('oc_p'), 10);
  const k = q >= 0 && q < pack.ps.length ? q : h % pack.ps.length, p = pack.ps[k], V = VERTICALS[pack.v] || VERTICALS.beauty;
  if (once(h1)) { h1.textContent = p.name; document.title = p.name; }
  const gal = document.querySelector('salla-slider.details-slider, .details-slider, .product-single__images, .product-single salla-slider, .product__images') || document.querySelector('main');
  /* every slide and thumb shows this very product */
  gal.querySelectorAll('img').forEach(img => { if (themeImg(img.getAttribute('src'))) return; img.src = p.img; img.removeAttribute('srcset'); img.alt = p.name; img.dataset.ocSwept = '1'; });
  /* prices: the title price block, the form / sticky bar prices; old price only when the demo product has an offer */
  document.querySelectorAll('[data-testid="store-product-price"] p, .total-price, .product-entry__price, .sticky-product-bar .total-price').forEach(e => { const next = money(p.price); if (e.textContent !== next) e.textContent = next; });
  document.querySelectorAll('[data-testid="store-product-price"] .line-through, .before-price').forEach(e => { if (p.was) { const next = money(p.was); if (e.textContent !== next) e.textContent = next; e.style.display = ''; } else e.style.display = 'none'; });
  /* the demo store's subtitle is often a bare «—»; hide that line. Each demo product gets its own model code (the fashion SKU AL-03-01 was shared). */
  document.querySelectorAll('.product-entry__sub-title').forEach(e => { const raw = e.textContent.replace(/\s/g, ''); if (!raw || /^[—–\-_.]+$/.test(raw)) { e.hidden = true; e.textContent = ''; } });
  const code = 'BL-' + pack.v.toUpperCase().slice(0, 4) + '-' + String(k + 1).padStart(2, '0');
  document.querySelectorAll('.product-sku').forEach(e => { if (e.textContent.trim() !== code) e.textContent = code; });
  document.querySelectorAll('.product-sku-wrapper').forEach(e => e.classList.remove('hidden'));
  const scope = document.querySelector('.product-single .main-content') || document.querySelector('.main-content');
  if (scope) { const tw = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT); const skuHits = []; while (tw.nextNode()) { if (/^[A-Z]{1,4}-\d{2}-\d{2}$/.test(tw.currentNode.textContent.trim())) skuHits.push(tw.currentNode); } skuHits.forEach(n => { n.textContent = code; }); }
  const desc = document.querySelector('.product__description .article--main, .product__description, .product-single__description');
  /* breadcrumb: home › the type › this product (never the demo store's fashion category) */
  const crumbs = [...document.querySelectorAll('salla-breadcrumb .s-breadcrumb-item')];
  if (crumbs.length > 1 && !crumbs[0].closest('salla-breadcrumb').dataset.ocDemo) { crumbs[0].closest('salla-breadcrumb').dataset.ocDemo = '1';
    const last = crumbs[crumbs.length - 1], mid = crumbs.slice(1, -1);
    mid.slice(1).forEach(li => { const arrow = li.previousElementSibling; if (arrow && arrow.classList.contains('s-breadcrumb-arrow')) arrow.remove(); li.remove(); });
    if (mid[0]) { const a = mid[0].querySelector('a') || mid[0]; a.textContent = ar() ? V.ar : V.en; if (a.href) a.href = demoHref(crumbs[0].querySelector('a')?.getAttribute('href') || '/', pack.v, 0).replace(/[?&]oc_p=\d+/, ''); }
    (last.querySelector('a, span') || last).textContent = p.name; }
  /* the address bar names the tech product too (same /p<id>, so a reload still opens this page) */
  if (/\/[^/]+\/p\d+\/?$/.test(location.pathname) && !location.pathname.includes(`/${p.slug}/`)) try { history.replaceState(history.state, '', location.pathname.replace(/\/[^/]+(\/p\d+\/?)$/, `/${p.slug}$1`) + location.search + location.hash); } catch (e) {  }
  if (once(desc)) desc.innerHTML = `<p>${esc(p.desc || vt(V.hero))}</p><ul>${(V.specs || []).map(([l]) => `<li>${vt(l)}</li>`).join('')}</ul>`; // the demo product's own description (actives + size feed the ingredient checker)
  document.querySelectorAll('salla-product-options, .s-product-options-wrapper, .product-options, [data-size-guide]').forEach(e => { e.style.display = 'none'; });
}

/* the header cart total follows the visitor's currency on the demo store; the demo shows riyals like its prices */
function skinCartTotal() {
  document.querySelectorAll('salla-cart-summary .s-cart-summary-total, .s-cart-summary-total').forEach(e => { const t = e.textContent.trim();
    if (t && !isSarText(t)) { const n = parseAmount(t) || 0; const next = money(n); if (e.textContent !== next) e.textContent = next; } });
}
/* the header menu is fetched from Salla and can stay empty (slow API, or overflow hiding every item).
   A short category row stands in until the real menu is actually visible. */
function menuReady(pack) {
  const lis = [...document.querySelectorAll('.main-menu > li')].filter(li => {
    if (li.id === 'more-menu-dropdown') return false;
    const cs = getComputedStyle(li);
    if (cs.display === 'none' || cs.visibility === 'hidden') return false;
    const label = (li.querySelector(':scope > a span') || li.querySelector(':scope > a') || li.querySelector(':scope > span') || li).textContent.trim();
    return label && !FASHION.test(label) && !/^(تخفيضات|العروض|المزيد|offers|more)$/i.test(label);
  });
  return lis.length >= Math.min(2, pack.cats.length);
}
function paintMenu(pack) {
  let nav = document.querySelector('.oc-demo-nav');
  if (!nav) {
    nav = document.createElement('nav'); nav.className = 'oc-demo-nav'; nav.setAttribute('aria-label', ar() ? 'القائمة' : 'Menu');
    const logo = document.querySelector('.navbar-brand'); (logo || document.querySelector('#mainnav .container') || B).insertAdjacentElement(logo ? 'afterend' : 'afterbegin', nav);
  }
  if (nav.dataset.ocV !== pack.v) {
    nav.dataset.ocV = pack.v;
    const here = new URL(location.href); const dev = here.pathname.match(/^\/dev-[^/]+/);
    const home = new URL((dev ? dev[0] : '') + '/', here.origin); here.searchParams.forEach((val, k) => { if (k !== 'oc_p') home.searchParams.set(k, val); }); home.searchParams.set('oc_type', pack.v);
    nav.innerHTML = pack.cats.map(c => `<a href="${home.href}" data-oc-name="${esc(c.name)}">${esc(c.name)}</a>`).join('');
  }
  nav.hidden = menuReady(pack);
}
function pliskCard(p, i, pack) {
  /* reuse a real /pID from the demo store so the product page opens; oc_p picks the beauty product */
  const base = document.querySelector('salla-products-list a[href*="/p"], custom-salla-product-card a[href*="/p"]')?.getAttribute('href') || '/demo/p1';
  const url = demoHref(base, pack.v, i, p.slug);
  const price = p.was
    ? `<div class="s-product-card-sale-price"><h4 class="oc-plisk__price">${money(p.price)}</h4><span>${money(p.was)}</span></div>`
    : `<h4 class="s-product-card-price oc-plisk__price">${money(p.price)}</h4>`;
  return `<a class="oc-plisk s-product-card-entry" href="${url}" aria-label="${esc(p.name)}"><span class="s-product-card-image"><img src="${esc(p.img)}" alt="${esc(p.name)}" loading="lazy"></span><span class="s-product-card-content"><h3 class="s-product-card-content-title">${esc(p.name)}</h3>${price}</span></a>`;
}
function listReady(list) {
  const cards = [...list.querySelectorAll('custom-salla-product-card, .s-product-card-entry')].filter(c => !c.classList.contains('oc-plisk'));
  if (!cards.length) return false;
  return cards.every(c => isSarText(c.textContent) && !FASHION.test(c.textContent));
}
/* gifts, devices and any slow salla-products-list: show Plisk cards immediately, hide the list until its own cards are SAR */
function ensurePlisk(pack) {
  document.querySelectorAll('salla-products-list, salla-products-slider').forEach(list => {
    if (list.closest('.sub-menu, .mega-menu, .oc-ai')) return;
    if (list.getAttribute('source') === 'related') { list.remove(); return; }
    const ready = listReady(list);
    let fb = list.nextElementSibling && list.nextElementSibling.classList.contains('oc-plisk-fallback') ? list.nextElementSibling : null;
    if (ready) { list.classList.remove('oc-hide'); if (fb) fb.remove(); return; }
    list.classList.add('oc-hide');
    if (!fb) { fb = document.createElement('div'); fb.className = 'oc-plisk-grid oc-plisk-fallback'; list.insertAdjacentElement('afterend', fb); }
    if (fb.dataset.ocV !== pack.v) { fb.dataset.ocV = pack.v; fb.innerHTML = pack.ps.map((p, i) => pliskCard(p, i, pack)).join(''); }
  });
  if (!isHome()) return;
  let box = document.querySelector('[data-testid="oc-latest"]');
  const have = document.querySelector('[data-testid="store-home-latest-products-list"], [data-testid="oc-latest"]');
  if (!have && !box) {
    box = document.createElement('section'); box.className = 's-block container'; box.dataset.testid = 'oc-latest'; box.setAttribute('data-testid', 'oc-latest');
    const main = document.querySelector('#main-content'); if (main) main.prepend(box);
  }
  if (box && box.dataset.ocV !== pack.v) {
    box.dataset.ocV = pack.v;
    box.innerHTML = `<header class="oc-head"><h2 class="oc-metal">${ar() ? 'أحدث المنتجات' : 'Latest products'}</h2></header><div class="oc-plisk-grid">${pack.ps.map((p, i) => pliskCard(p, i, pack)).join('')}</div>`;
  }
}
function isHome() {
  const path = location.pathname.replace(/^\/dev-[^/]+/, '') || '/';
  return path === '/' || path === '';
}
/* editor drafts often keep only one Raed block. In preview, mount the beauty sections the report could not find. */
function ensureHome(pack) {
  if (!isHome() || document.querySelector('[data-oc-fallback-home]')) return;
  const main = document.querySelector('#main-content'); if (!main) return;
  const V = VERTICALS[pack.v] || VERTICALS.beauty, nm = ar() ? V.ar : V.en, hero = vt(V.hero);
  const specShots = pack.ps.slice(0, 6).map((p, i) => `<figure class="oc-spec__shot${i ? '' : ' is-on'}" data-oc-demo="img"><img data-oc-fill src="${esc(p.img)}" alt="" loading="lazy"><span class="oc-hot" style="--x:${[38, 62, 50, 30, 70, 55][i]}%;--y:${[40, 45, 58, 35, 60, 30][i]}%"><i></i></span></figure>`).join('');
  const specRows = pack.ps.slice(0, 6).map((p, i) => `<li class="oc-spec__row${i ? '' : ' is-on'}" tabindex="0" data-oc-demo="img" data-oc-reveal><span class="oc-spec__n">${String(i + 1).padStart(2, '0')}</span><div><b data-oc-fill-t>${esc(p.name)}</b></div></li>`).join('');
  const steps = pack.ps.slice(0, 6).map(p => `<button type="button" class="oc-setup__item" data-oc-demo="img" data-oc-reveal><img data-oc-fill src="${esc(p.img)}" alt="" loading="lazy"><b></b></button>`).join('');
  const deals = (pack.ps.filter(p => p.was).length ? pack.ps.filter(p => p.was) : pack.ps).slice(0, 4);
  const tiles = [0, 1, 2, 3, 4, 5].map(() => `<a class="oc-brand-tile" href="#" data-oc-demo="brand" data-oc-reveal><b></b><small></small></a>`).join('');
  const slides = pack.ps.slice(0, 4);
  const cineSlides = slides.map((p, i) => `<a class="oc-cine__slide${i ? '' : ' is-on'}" href="#" data-oc-demo="cat"><img data-oc-fill src="${esc(p.img)}" alt="${esc(p.name)}" loading="${i ? 'lazy' : 'eager'}"><span class="oc-cine__copy"><small class="oc-cine__k">${esc(nm)}</small><b class="oc-metal">${esc(p.name)}</b><em>${esc(hero)}</em></span></a>`).join('');
  const cineThumbs = slides.map((p, i) => `<button type="button" class="oc-cine__thumb${i ? '' : ' is-on'}" role="tab" aria-label="${esc(p.name)}"><img src="${esc(p.img)}" alt="" loading="lazy"></button>`).join('');
  const html = `<div data-oc-fallback-home>
    ${document.querySelector('[data-testid="oc-cinema"]') ? '' : `<section class="s-block oc-cine container" data-oc-sec="cinema" data-speed="6" data-testid="oc-cinema" aria-roledescription="carousel"><div class="oc-cine__stage">${cineSlides}<div class="oc-cine__hud"><span><b data-oc-idx>01</b>/${String(slides.length).padStart(2, '0')}</span><div class="oc-cine__bar"><i></i></div><button type="button" data-oc-prev aria-label="${ar() ? 'السابق' : 'Previous'}">‹</button><button type="button" data-oc-next aria-label="${ar() ? 'التالي' : 'Next'}">›</button></div></div><div class="oc-cine__thumbs" role="tablist">${cineThumbs}</div><div class="oc-tick" data-oc-ticker hidden></div></section>`}
    ${document.querySelector('[data-testid="oc-banner"]') ? '' : `<section class="s-block oc-banner container oc-banner--md" data-testid="oc-banner"><a class="oc-banner__item" href="#"><img src="${esc(pack.ps[0].img)}" alt="${esc(nm)}" loading="lazy"><span class="oc-banner__copy"><b class="oc-metal">${esc(hero)}</b><em>${esc(nm)}</em></span></a></section>`}
    ${document.querySelector('[data-testid="oc-spec"]') ? '' : `<section class="s-block oc-spec container" data-oc-sec="spec" data-testid="oc-spec"><header class="oc-head"><div><span class="oc-chip">${esc(ar() ? 'إنفوجرافيك المكوّنات' : 'Ingredient infographic')}</span><h2 class="oc-metal">${esc(ar() ? 'سر التركيبة' : 'Inside the formula')}</h2></div></header><div class="oc-spec__grid"><div class="oc-spec__stage" data-oc-reveal>${specShots}<div class="oc-spec__product" data-oc-spec-product></div></div><ol class="oc-spec__rows">${specRows}</ol></div></section>`}
    ${document.querySelector('[data-testid="oc-setup"]') ? '' : `<section class="s-block oc-setup container" data-oc-sec="setup" data-testid="oc-setup"><header class="oc-head"><h2 class="oc-metal">${esc(ar() ? 'ابني روتينك' : 'Build your routine')}</h2><p>${esc(ar() ? 'اختاري خطوات روتينك وشوفي منتجات المتجر المناسبة' : 'Pick your routine steps and see matching products')}</p></header><div class="oc-setup__grid">${steps}</div><div class="oc-setup__out" data-oc-setup-out></div><div class="oc-setup__sum oc-glass" data-oc-setup-sum></div></section>`}
    ${document.querySelector('[data-testid="oc-offers"]') ? '' : `<section class="s-block container" data-testid="oc-offers"><header class="oc-head"><h2 class="oc-metal">${esc(ar() ? 'العروض' : 'Offers')}</h2></header><div class="oc-plisk-grid">${deals.map(p => pliskCard(p, pack.ps.indexOf(p), pack)).join('')}</div></section>`}
    ${document.querySelector('[data-testid="oc-brands-wall"]') ? '' : `<section class="s-block oc-brands container" data-oc-sec="brands" data-testid="oc-brands-wall"><header class="oc-head"><h2 class="oc-metal">${esc(ar() ? 'الماركات في متجرنا' : 'Brands in our store')}</h2></header><div class="oc-brands__grid">${tiles}</div></section>`}
  </div>`;
  main.insertAdjacentHTML('afterbegin', html);
}
/* salla.money follows the visitor currency. In preview every call prints SAR. */
function hookMoney() {
  const s = window.salla; if (!s || typeof s.money !== 'function' || s.money.__blisk) return;
  const orig = s.money.bind(s);
  const wrapped = function (price) {
    if (B.classList.contains('oc-demo') || B.classList.contains('oc-preview')) {
      const n = parseAmount(price); if (n != null) return money(n);
    }
    return orig(price);
  };
  wrapped.__blisk = 1; s.money = wrapped;
}
/* recommendations + free-shipping on the fashion demo store answer 403; don't mount them in preview.
   WebSocket localhost:8001, the OpenAI pixel and PostHog are injected by the Salla editor, not this theme. */
function silencePlatformNoise() {
  document.querySelectorAll('salla-products-slider[source="related"]').forEach(el => el.remove());
  document.querySelectorAll('salla-free-shipping-tag').forEach(el => el.remove());
}
function skinFooter() {
  document.querySelectorAll('footer salla-menu').forEach(m => { if (m.querySelector('a') || m.parentElement.querySelector('.oc-demo-links')) return;
    const L = ar() ? ['الشحن والتوصيل', 'الاستبدال والاسترجاع', 'أصالة المنتجات', 'تواصل معنا'] : ['Shipping & delivery', 'Returns & exchanges', 'Authenticity', 'Contact us'];
    m.insertAdjacentHTML('afterend', `<ul class="oc-demo-links">${L.map(t => `<li><a href="#">${t}</a></li>`).join('')}</ul>`); });
}
export function initDemo() {
  if (!isPreview()) { document.documentElement.classList.remove('oc-pre'); return; }
  B.classList.add('oc-demo');
  if (!document.getElementById('oc-demo-css')) { const st = document.createElement('style'); st.id = 'oc-demo-css';
    st.textContent = '.oc-demo .oc-hide{display:none!important}.oc-demo-logo{display:inline-grid;line-height:1;text-align:center;gap:3px}.oc-demo-logo b{font-weight:900;letter-spacing:.32em;font-size:20px;background:linear-gradient(180deg,#f3e2bd,#d9b779 55%,#8a6a3a);-webkit-background-clip:text;background-clip:text;color:transparent}.oc-demo-logo small{font-size:10px;letter-spacing:.12em;opacity:.75}.oc-demo{padding-bottom:88px}.oc-demo-links{display:grid;gap:.6rem;margin:0;padding:0;list-style:none}.oc-demo.product-single salla-breadcrumb:not([data-oc-demo]){visibility:hidden}.oc-demo .s-breadcrumb-wrapper{flex-wrap:nowrap;min-width:0}.oc-demo .s-breadcrumb-item,.oc-demo .s-breadcrumb-arrow{white-space:nowrap;flex-shrink:0}.oc-demo .s-breadcrumb-item:last-child{flex-shrink:1}.oc-demo .s-breadcrumb-item:last-child{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}';
    document.head.appendChild(st); }
  let t = 0; const run = () => { const pack = demoPack(vOf()); try { hookMoney(); silencePlatformNoise(); ensureHome(pack); paintMenu(pack); skinLogo(pack); skinCards(pack); skinMenu(pack); ensurePlisk(pack); skinFooter(); skinCartTotal(); skinProduct(pack); sweep(pack); paintMenu(pack); } catch (e) {  } document.documentElement.classList.add('oc-priced'); document.documentElement.classList.remove('oc-pre'); };
  run(); setTimeout(run, 600); setTimeout(run, 2000);
  setTimeout(() => document.querySelectorAll('salla-breadcrumb').forEach(b => { b.dataset.ocDemo = b.dataset.ocDemo || '1'; }), 4000); // never keep a breadcrumb hidden
  new MutationObserver(() => { clearTimeout(t); t = setTimeout(run, 60); }).observe(B, { childList: true, subtree: true });
  /* a different type picked in the preview picker: reload so every section reads the new demo store cleanly */
  document.addEventListener('oc:type', () => { document.documentElement.classList.add('oc-pre'); setTimeout(() => location.reload(), 350); });
}
