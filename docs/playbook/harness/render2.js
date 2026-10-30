// Renders the theme's Twig home components with twig.js + a simulated Salla store, for screenshots.
const Twig = require('twig'), fs = require('fs'), path = require('path');
const T = process.argv[2], lang = process.argv[3] || 'ar', out = process.argv[4];
const L = JSON.parse(fs.readFileSync(path.join(T, `src/locales/${lang}.json`)));
Twig.extendFilter('asset', v => 'file://' + path.join(T, 'public', v));
Twig.extendFilter('cdn', v => v);
Twig.extendFunction('trans', k => k.split('.').reduce((o, p) => o && o[p], L) || k);
Twig.extendFunction('link', v => v);
Twig.cache(false);
const comps = (process.argv[5] || 'oc-cinema,oc-hero,oc-spec,oc-intel-board,oc-showcase,oc-compare,oc-setup,oc-brands-wall,oc-services,oc-launch,oc-trust').split(',');
const store = { name: lang === 'ar' ? 'نخبة التقنية' : 'Elite Tech', description: '' };
const component = { 'oc-launch': { date: '2026-12-01 20:00', url: '#', title: null } };
let html = '';
for (const c of comps) {
  const tpl = Twig.twig({ data: fs.readFileSync(path.join(T, `src/views/components/home/${c}.twig`), 'utf8'), rethrow: true });
  html += tpl.render({ component: Object.assign({}, component[c] || {}), componentId: c, store, language: { code: lang }, theme: { settings: { get: (k, d) => d } } });
}
const imgs = ['phones-featured','phones-bestsellers','computers-featured','audio-featured','gaming-featured','watches-featured','cameras-featured','smarthome-featured','accessories-featured','audio-bestsellers','computers-bestsellers','accessories-bestsellers','gaming-bestsellers','watches-bestsellers'].map(n => 'file://' + path.join(T, 'public/images/oc', n + '.webp'));
const REALP = JSON.parse(fs.readFileSync('/home/user/aneeq-theme/tests-local/real-prods.json'));
const P0 = [['آيفون 17 برو ماكس 256GB', 5399, 5899, 4.8, 214], ['جالكسي S26 ألترا', 4899, null, 4.7, 162], ['ماك بوك برو M5 14 بوصة', 8499, null, 4.9, 88], ['سماعة سوني WH-1000XM6', 1499, 1699, 4.6, 301], ['بلايستيشن 5 برو', 2999, null, 4.8, 120], ['ساعة أبل ألترا 3', 3499, null, 4.7, 64], ['كاميرا كانون R6 Mark III', 9999, 10999, 4.9, 22], ['كاميرا مراقبة TP-Link Tapo', 249, 299, 4.3, 410], ['شاحن انكر 65W', 179, null, 4.5, 520], ['ايربودز برو 3', 999, 1099, 4.7, 640], ['لابتوب أسوس ROG', 6999, null, 4.4, 45], ['باور بانك بيسوس 20000', 149, 199, 4.2, 280], ['يد تحكم DualSense', 299, null, 4.6, 190], ['سوار شاومي باند 9', 199, null, 4.1, 95]]
  .map((p, i) => ({ id: i + 1, name: lang === 'ar' ? p[0] : p[0], url: '#p' + (i + 1), image: { url: imgs[i] }, price: p[1], sale_price: p[1], regular_price: p[2] || p[1], is_on_sale: !!p[2], is_out_of_stock: i === 10, rating: { stars: p[3], count: p[4] }, sold_quantity: p[4] }));
const P1 = P0;
const cats0 = ['الجوالات','الكمبيوتر واللابتوب','الصوتيات','الألعاب','الساعات الذكية','الكاميرات','المنزل الذكي','الإكسسوارات'].map((n, i) => ({ id: i + 1, name: n, url: '#c' + (i + 1), sub_categories: [] }));
const FASH = process.env.FASH === '1';
const P2 = FASH ? REALP.slice(0, 12).map((p, i) => ({ id: i + 1, name: p.name, url: '#p' + i, image: { url: p.image.url }, price: p.price, sale_price: p.price, regular_price: p.price, is_on_sale: false, rating: { stars: 0, count: 0 } })) : P1;
const cats2 = FASH ? ['الفساتين','البلايز','العبايات','الجاكيتات','البناطيل'].map((n, i) => ({ id: i + 1, name: n, url: '#c' + i, sub_categories: [] })) : cats0;
const MENU = '<header class="store-header"><ul class="main-menu">' + cats2.map(c => `<li><a href="${c.url}"><span>${c.name}</span></a></li>`).join('') + '</ul></header>';
const CARDS = '<section class="container s-block" id="cards" style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px">' + P2.slice(0, 8).map(p => `<div class="s-product-card-entry"><div class="s-product-card-image"><img src="${p.image.url}" alt="" style="width:100%;aspect-ratio:1;object-fit:cover"></div><div class="s-product-card-content"><h3 class="s-product-card-content-title"><a href="#">${p.name}</a></h3><h4 class="s-product-card-price">${p.price} ر.س</h4></div></div>`).join('') + '</section>';
const page = `<!doctype html><html lang="${lang}" dir="${lang === 'ar' ? 'rtl' : 'ltr'}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<link rel="stylesheet" href="file://${T}/public/app.css"><link rel="stylesheet" href="file://${T}/public/obsidian.css">
<style>body{font-family:system-ui,"Noto Sans Arabic",sans-serif}.container{max-width:1280px;margin-inline:auto;padding-inline:16px}</style>
<script>window.salla={config:{get:k=>({'store.name':${JSON.stringify(store.name)},'store.id':7,'user.currency_code':'SAR'})[k]},
api:{request:async e=>e==='categories'?{data:${JSON.stringify(cats2)}}:{data:[]},component:{}},
product:{fetch:async o=>{const P=${JSON.stringify(P2)};let d=P;if(o.source==='offers')d=P.filter(p=>p.is_on_sale);if(o.source==='search'){const q=String(o.source_value).toLowerCase();d=P.filter(p=>p.name.toLowerCase().includes(q.split(' ')[0]));if(!d.length)d=P.slice(0,4)}if(o.source==='selected')d=P.filter(p=>o.source_value.includes(p.id));return{data:d.slice(0,o.limit||8)}}}};</script>
</head><body id="app" class="theme-raed overflow-x-hidden oc oc-smart" data-oc-store="${store.name}" data-oc-bg="graphite" data-oc-cc="1" data-oc-addons="1" data-oc-addon-off="" data-oc-img="file://${T}/public/images/oc/electronics-featured.webp" data-oc-accent="champagne" data-oc-vertical="auto" data-oc-tax="1" data-oc-skin="0" data-oc-ink="0">
${MENU}<main>${html}${CARDS}</main>
<footer class="store-footer container" style="padding:2rem 16px"><a href="#ship">سياسة الشحن والتوصيل</a> · <a href="#ret">سياسة الاستبدال والاسترجاع</a> · <a href="#war">الضمان</a> · <a href="#contact">تواصل معنا</a></footer>
<script src="file://${T}/public/obsidian.js"></script></body></html>`;
fs.writeFileSync(out, page);
console.log('ok', html.length);
