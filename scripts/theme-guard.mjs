/* Lightweight source checks for the preview fixes. No webpack, no network. */
import { readFileSync } from 'node:fs';

const read = p => readFileSync(p, 'utf8');
const moneySrc = read('src/assets/js/obsidian/money.js').replace(/^export /gm, '');
const { formatSar, parseAmount, isSarText, looksForeignMoney } = new Function(`${moneySrc}\nreturn { formatSar, parseAmount, isSarText, looksForeignMoney };`)();

let failed = 0;
const check = (ok, msg) => { if (!ok) { failed++; console.error('FAIL', msg); } else console.log('ok', msg); };

check(formatSar(189, true) === '189 ر.س', 'Arabic preview price is SAR with Western digits');
check(formatSar(189, false) === '189 SAR', 'English preview price is SAR');
check(formatSar(1890, true) === '1,890 ر.س', 'thousands stay Western');
check(parseAmount('٣٤٩ US$') === 349, 'Arabic-Indic digits parse');
check(parseAmount({ amount: 79 }) === 79, 'price objects parse');
check(!isSarText('$349') && isSarText('189 ر.س'), 'foreign vs SAR detection');
check(looksForeignMoney('٣٤٩ ر.س'), 'Indic digits still count as foreign');

const demo = read('src/assets/js/obsidian/demo.js');
const addons = read('src/assets/js/obsidian/addons.js');
const dock = read('src/views/pages/partials/oc/dock.twig');
const card = read('src/assets/js/partials/product-card.js');
const views = [
  'src/views/components/home/latest-products.twig',
  'src/views/pages/partials/oc/vsection.twig',
  'src/views/components/home/oc-products.twig',
  'src/views/pages/product/index.twig',
  'src/views/components/home/fixed-products.twig'
].map(read).join('\n');

check(demo.includes('oc-demo-nav'), 'preview paints a top menu');
check(demo.includes('data-oc-sec="spec"') && demo.includes('data-oc-sec="setup"') && demo.includes('data-oc-sec="brands"'), 'formula, routine and brands sections are injected in preview');
check(demo.includes('data-testid="oc-banner"') && demo.includes('data-testid="oc-offers"'), 'banner and offers sections are injected in preview');
check(demo.includes('oc-plisk'), 'preview can render Plisk cards without waiting on the product API');
check(/Escape/.test(addons), 'addon panel closes on Escape');
check(addons.includes('data-oc-panel-title'), 'addon panel title is explicit');
check(dock.includes('مستشارة الجمال') && dock.includes('أكملي الروتين') && !dock.includes('مستشار الإعداد'), 'dock labels match the skincare panel names');
check(card.includes('formatSar'), 'product card formats preview prices as SAR');
const opens = views.match(/<salla-products-list\b[^>]*>/g) || [];
check(opens.length > 0 && opens.every(t => t.includes('product-card-component')), 'product lists use the Plisk card component');

const twig = read('twilight.json');
check(/"path": "home\.oc-banner"[\s\S]{0,20000}"is_default": true/.test(twig), 'banner is a default home section');
check(/"path": "home\.oc-v-deals"[\s\S]{0,20000}"is_default": true/.test(twig), 'offers section is a default home section');
check(/"path": "home\.oc-spec"[\s\S]{0,20000}"is_default": true/.test(twig), 'formula section is a default home section');
check(/"path": "home\.oc-setup"[\s\S]{0,20000}"is_default": true/.test(twig), 'routine section is a default home section');
check(demo.includes('data-oc-sec="cinema"'), 'preview injects the home slider');
check(demo.includes('BL-'), 'each preview product gets its own model code');

if (failed) { console.error(failed + ' check(s) failed'); process.exit(1); }
console.log('theme-guard passed');
