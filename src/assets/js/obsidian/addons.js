/* Hangul / Obsidian Cinema — smart add-ons for TECH stores.
   Beauty rewrite of the 12 «إضافاتنا» (Idhafatina) feature ids. The fashion originals stay untouched in /idhafatina-original.
   All logic runs in the visitor's browser: product search uses Salla's own storefront SDK; no external services, no tracking.
   Merchant can switch every add-on off (oc_addon_<id>) and the whole panel off (oc_addons). Data lives in addons-data.js
   (generated from addons/idhafatina-beauty/beauty-data.json). */
import { VERTICALS } from './verticals';
import DATA from './addons-data';
import { money, policies } from './brain';

export const IDS = ['stylist','voice','listen','tryon','recolour','photocoach','colorbook','look','quiz','undertone','giftfinder','presets'];
const A = {
  stylist:   ['مستشارة الجمال','Beauty advisor'],
  voice:     ['البحث الصوتي','Voice search'],
  listen:    ['اسمعي طريقة الاستخدام','Listen to how-to'],
  tryon:     ['حجم العبوة الحقيقي','True bottle size'],
  recolour:  ['اختاري الدرجة','Pick a shade'],
  photocoach:['نصائح الاستخدام والحفظ','Use & care tips'],
  colorbook: ['دليل الدرجات','Shade guide'],
  look:      ['أكملي الروتين','Complete the routine'],
  quiz:      ['اختبار بشرتك واحتياجك','Skin & needs quiz'],
  undertone: ['يناسب بشرتك؟','Right for your skin?'],
  giftfinder:['مكتشف الهدايا','Gift finder'],
  presets:   ['روتينات جاهزة','Ready routines']
};
/* store-policy answers: wording only points to the store's own pages / Salla checkout — it never invents terms */
/* f[4] = keys into brain.policies(): when the merchant published that page, the answer links to it */
const FAQ = [
  ['الاستبدال والاسترجاع','Exchange & returns','الاستبدال والاسترجاع حسب سياسة المتجر المكتوبة في صفحات المتجر أسفل الموقع. منتجات العناية المفتوحة قد لا تُسترجع لأسباب صحية؛ احتفظي بالفاتورة وتأكدي من ختم العبوة عند الاستلام.','Exchanges and returns follow the store policy pages in the footer. Opened care products may not be returnable for hygiene reasons; keep your invoice and check the seal on arrival.',['warranty','returns']],
  ['الشحن والتوصيل','Shipping','مدة وتكلفة التوصيل تظهر في السلة حسب مدينتك قبل الدفع، وتتابع طلبك من «طلباتي».','Delivery time and cost appear in your cart for your city before payment; track the order from “My orders”.',['shipping']],
  ['الدفع','Payment','طرق الدفع المتاحة تظهر عند إتمام الطلب، وكل المدفوعات تمر عبر بوابة سلة الآمنة.','Available payment methods show at checkout; all payments go through Salla’s secure gateway.',['payment']]
];
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const num = x => { const n = parseFloat(String(x == null ? '' : x).replace(/[^\d.]/g, '')); return isNaN(n) ? null : n; };
const safeColor = h => /^#[0-9a-f]{3,8}$/i.test(h || '') ? h : '#888';

/* per-type adapted content (kept as a function for backward compatibility with older callers) */
export const adaptFor = v => {
  const D = DATA[v] || DATA.beauty;
  const skip = [];
  if (!D.mm) skip.push('tryon');
  if (!D.finish.length) skip.push('recolour', 'colorbook');
  if (!D.photo.length) skip.push('photocoach');
  return { ...D, skip };
};

async function search(kw, limit = 8) {
  try { const r = await salla.product.fetch({ source: 'search', source_value: kw, limit }); return r?.data || []; }
  catch (e) { return []; }
}

/* gift budgets from the store's own price distribution (rounded to friendly steps); data defaults when unknown */
const nice = n => { const p = Math.pow(10, Math.floor(Math.log10(n))); return Math.ceil(n / (p / 2)) * (p / 2); };
const budgets = (st, D) => { const q = st?.stats?.q || []; const b = [...new Set(q.map(nice))]; return b.length >= 3 ? b : D.gift; };

export function mountAddons(st, isAr) {
  const B = document.body;
  if (B.dataset.ocAddons !== '1') return;
  const existing = document.querySelector('.oc-ai');
  if (existing) { existing._ocRefresh?.(st); return; }
  const off = (B.dataset.ocAddonOff || '').split(',');
  let store = st;
  const t = (a, e) => isAr ? a : e;
  const L = o => isAr ? o.ar : o.en;
  const el = document.createElement('div'); el.className = 'oc-ai'; el.dir = isAr ? 'rtl' : 'ltr'; B.appendChild(el);
  const api = {};
  const titled = (label, html) => `<h3 data-oc-panel-title>${esc(label)}</h3>${html}`;

  const render = () => {
    const types = store?.present?.length ? store.present : [B.dataset.ocV || 'beauty'];
    let v = B.dataset.ocV && types.includes(B.dataset.ocV) ? B.dataset.ocV : types[0];
    if (!DATA[v]) v = 'beauty';
    const cur = store?.sig?.currency || 'SAR';
    const D = adaptFor(v), V = VERTICALS[v] || VERTICALS.beauty;
    /* wording follows the store type: men's grooming speaks to a man; the «shade» tools name what the type really offers.
       The tab label, the dock chip and the panel title are the same string, so a click by that name hits the tool. */
    const male = v === 'mens', g = (f, m) => male ? m : f;
    const W = ({ perfume: ['الرائحة', 'الروائح', 'scent'], mens: ['الرائحة', 'الروائح', 'scent'], bodycare: ['الرائحة', 'الروائح', 'scent'], gifts: ['الرائحة', 'الروائح', 'scent'],
      haircare: ['اللون', 'الألوان', 'colour'], devices: ['اللون', 'الألوان', 'colour'], nails: ['اللون', 'الألوان', 'colour'] })[v] || ['الدرجة', 'الدرجات', 'shade'];
    const NAME = { ...A, stylist: [g('مستشارة الجمال', 'مستشار العناية'), A.stylist[1]], listen: [g('اسمعي طريقة الاستخدام', 'اسمع طريقة الاستخدام'), A.listen[1]],
      recolour: [`${g('اختاري', 'اختر')} ${W[0]}`, `Pick a ${W[2]}`], colorbook: [`دليل ${W[1]}`, `${W[2][0].toUpperCase() + W[2].slice(1)} guide`], look: [g('أكملي الروتين', 'أكمل الروتين'), A.look[1]] };
    const ids = IDS.filter(k => !off.includes(k));
    el.innerHTML = `<button type="button" class="oc-ai__fab" aria-label="${t('إضافاتي الذكية', 'Smart add-ons')}">✦ ${t('إضافاتي الذكية', 'Smart add-ons')}</button><div class="oc-ai__p" role="dialog" aria-modal="true" aria-label="${t('الإضافات الذكية', 'Smart add-ons')}"><header><b>${t('مساعد', 'Assistant')} ${esc(L(V))}${store?.cats?.length ? `<small>${t(`قرأ متجرك: ${store.cats.length} قسم${store.brands?.length ? ` · ${store.brands.length} ماركة` : ''}`, `Read your store: ${store.cats.length} departments${store.brands?.length ? ` · ${store.brands.length} brands` : ''}`)}</small>` : ''}</b><span>${types.length > 1 ? `<select aria-label="${t('نوع المنتجات', 'Product type')}">${types.map(x => `<option value="${esc(x)}"${x === v ? ' selected' : ''}>${esc(L(VERTICALS[x] || VERTICALS.beauty))}</option>`).join('')}</select>` : ''}<button type="button" class="oc-ai__x" data-oc-close aria-label="${t('إغلاق', 'Close')}">×</button></span></header>
    <nav>${ids.map(k => { const name = t(...NAME[k]); return `<button type="button" data-a="${k}" data-oc-name="${esc(name)}" aria-label="${esc(name)}">${name}</button>`; }).join('')}</nav><div class="oc-ai__body" aria-live="polite">${titled(t('الإضافات الذكية', 'Smart add-ons'), `<p>${t(g('اختاري أداة — المحتوى مخصص لقسم', 'اختر أداة — المحتوى مخصص لقسم'), 'Pick a tool — tailored to')} ${esc(L(V))}</p>`)}</div></div>`;
    const body = el.querySelector('.oc-ai__body');
    el.querySelector('.oc-ai__fab').onclick = () => el.classList.toggle('is-open');
    el.querySelector('select')?.addEventListener('change', e => { v = e.target.value; B.dataset.ocV = v; render(); el.classList.add('is-open'); });

    const results = (r, kw, budget) => {
      let list = r;
      if (budget) { const f = r.filter(p => { const n = num(p.is_on_sale ? p.sale_price : p.price); return n == null || n <= budget; }); if (f.length) list = f; }
      body.innerHTML = list.length
        ? list.slice(0, 6).map(p => { const n = num(p.is_on_sale ? p.sale_price : p.price); const im = p.image?.url || p.thumbnail; return `<a class="oc-ai__res" href="${esc(p.url)}">${im ? `<img src="${esc(im)}" alt="" loading="lazy">` : ''}<span>${esc(p.name)}${n != null ? `<small>${esc(money(n, cur))}</small>` : ''}</span></a>`; }).join('')
        : `<a href="/search?q=${encodeURIComponent(kw)}">${t('اعرض النتائج لـ', 'See results for')} “${esc(kw)}”</a>`;
    };
    const show = async (kw, budget) => { body.innerHTML = `<p>${t('نبحث في متجرك…', 'Searching your store…')}</p>`; results(await search(kw), kw, budget); };
    const chips = (label, items, fn) => {
      body.innerHTML = titled(label, items.map((x, i) => `<button type="button" data-i="${i}">${esc(x.label)}</button>`).join(''));
      body.querySelectorAll('[data-i]').forEach(b => b.onclick = () => fn(items[+b.dataset.i]));
    };

    const openTool = (id, tab) => {
      const label = (tab && tab.textContent.trim()) || t(...(NAME[id] || A[id] || ['', '']));
      el.classList.add('is-open');
      el.querySelectorAll('nav [data-a]').forEach(x => { const on = x.dataset.a === id; x.classList.toggle('is-on', on); x.setAttribute('aria-pressed', on ? 'true' : 'false'); });
      const fn = F[id];
      try { if (fn) fn(label); else body.innerHTML = titled(label, ''); }
      catch (err) { body.innerHTML = titled(label, `<p>${t('تعذّر فتح الأداة', 'Could not open this tool')}</p>`); }
    };
    const F = {
      stylist: (label) => {
        body.innerHTML = titled(label, `<p>${t(g('اسألي عن منتج أو نوع بشرة أو ميزانية أو سياسة', 'اسأل عن منتج أو نوع بشرة أو ميزانية أو سياسة'), 'Ask about a product, skin type, budget or policy')}</p><input type="search" class="oc-ai__q" maxlength="80" placeholder="${t('مثال: سيروم للبشرة الجافة', 'e.g. serum for dry skin')}" aria-label="${esc(label)}"><button type="button" data-go>${t('ابحث', 'Search')}</button>` +
          FAQ.map((f, i) => `<button type="button" data-f="${i}">${t(f[0], f[1])}</button>`).join(''));
        const go = () => { const q = body.querySelector('.oc-ai__q').value.trim(); if (q) show(q); };
        body.querySelector('[data-go]').onclick = go;
        body.querySelector('.oc-ai__q').addEventListener('keydown', e => { if (e.key === 'Enter') { e.stopPropagation(); go(); } });
        body.querySelectorAll('[data-f]').forEach(b => b.onclick = () => { const f = FAQ[+b.dataset.f], P = policies(), pg = (f[4] || []).map(k => P[k]).filter(Boolean);
          body.innerHTML = titled(label, `<p>${t(f[2], f[3])}</p>` + pg.map(x => `<a href="${esc(x.url)}">↗ ${esc(x.title)}</a>`).join('')); });
      },
      quiz: (label) => {
        const ans = [];
        const step = i => {
          if (!D.quiz || i >= D.quiz.length) return show(ans.join(' '));
          const Q = D.quiz[i];
          body.innerHTML = titled(label, `<small>${i + 1}/${D.quiz.length}</small><b>${esc(L(Q.q))}</b>` + Q.opts.map((o, j) => `<button type="button" data-k="${j}">${esc(L(o))}</button>`).join(''));
          body.querySelectorAll('[data-k]').forEach(b => b.onclick = () => { ans.push(Q.opts[+b.dataset.k].kw); step(i + 1); });
        };
        step(0);
      },
      voice: (label) => {
        const R = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!R) { body.innerHTML = titled(label, `<p>${t('المتصفح لا يدعم البحث الصوتي', 'Voice search is not supported in this browser')}</p>`); return; }
        const r = new R(); r.lang = isAr ? 'ar-SA' : 'en-US';
        body.innerHTML = titled(label, `<p>${t(g('تكلّمي الحين…', 'تكلّم الحين…'), 'Speak now…')}</p>`);
        r.onresult = e => show(e.results[0][0].transcript);
        r.onerror = () => { body.innerHTML = titled(label, `<p>${t(g('ما قدرنا نسمعك — جرّبي الكتابة', 'ما قدرنا نسمعك — جرّب الكتابة'), 'Could not hear you — try typing')}</p>`); };
        try { r.start(); } catch (e) { body.innerHTML = titled(label, `<p>${t('تعذّر تشغيل الميكروفون', 'Microphone unavailable')}</p>`); }
      },
      listen: (label) => {
        if (!('speechSynthesis' in window)) { body.innerHTML = titled(label, `<p>${t('المتصفح لا يدعم القراءة الصوتية', 'Read-aloud is not supported')}</p>`); return; }
        const s = document.querySelector('.product-single__description, .product__description, .product-details, main h1');
        const u = new SpeechSynthesisUtterance((s?.textContent || document.title).trim().slice(0, 600)); u.lang = isAr ? 'ar-SA' : 'en-US';
        speechSynthesis.cancel(); speechSynthesis.speak(u);
        body.innerHTML = titled(label, `<p>${t('يتم قراءة الوصف وطريقة الاستخدام…', 'Reading the description…')}</p><button type="button" data-stop>${t('إيقاف', 'Stop')}</button>`);
        body.querySelector('[data-stop]').onclick = () => speechSynthesis.cancel();
      },
      tryon: (label) => {
        if (!D.mm) { body.innerHTML = titled(label, `<p>${t('حجم العبوة يظهر على صفحة المنتج.', 'Bottle size shows on the product page.')}</p>`); return; }
        const [w, h] = D.mm;
        body.innerHTML = titled(label, `<p>${esc(L(D.sizeLabel || { ar: label, en: label }))}</p><div class="oc-ai__ruler" style="width:${w}mm;height:${h}mm;max-width:100%" aria-hidden="true"></div><small>${t(`حجم العبوة التقريبي ≈ ${w}×${h} ملم. قارنيها بيدك — تقريبي ويختلف حسب الشاشة.`, `Bottle ≈ ${w}×${h} mm. Compare with your hand — approximate, varies by screen.`)}</small>`);
      },
      recolour: (label) => (D.finish || []).length ? chips(label, D.finish.map(f => ({ label: L(f), kw: L(f) })), x => show(x.kw + ' ' + L(V))) : (body.innerHTML = titled(label, `<p>${t('لا درجات محفوظة لهذا القسم.', 'No shades saved for this department.')}</p>`)),
      colorbook: (label) => {
        const all = []; types.forEach(k => (DATA[k]?.finish || []).forEach(f => { if (f && !all.find(a => a.ar === f.ar)) all.push(f); }));
        body.innerHTML = titled(label, all.map((f, i) => `<button type="button" data-i="${i}"><i style="display:inline-block;width:.8em;height:.8em;border-radius:50%;margin-inline-end:.35em;border:1px solid rgba(255,255,255,.4);background:${safeColor(f.hex)}"></i>${esc(L(f))}</button>`).join('') || `<p>${t('لا درجات محفوظة.', 'No shades saved.')}</p>`);
        body.querySelectorAll('[data-i]').forEach(b => b.onclick = () => show(L(all[+b.dataset.i])));
      },
      photocoach: (label) => { const tips = D.photo && D.photo.length ? D.photo : [{ ar: 'اتبع تعليمات العبوة.', en: 'Follow the pack instructions.' }]; body.innerHTML = titled(label, tips.map(x => `<p>• ${esc(L(x))}</p>`).join('')); },
      look: (label) => chips(label, (D.kit || []).map(k => ({ label: '+ ' + L(k), kw: k.kw })), x => show(x.kw)),
      presets: (label) => chips(label, (D.bundle || []).map(b => ({ label: L(b), kw: (b.kw && b.kw[0]) || L(b) })), x => show(x.kw)),
      undertone: (label) => chips(label, (D.compat || []).map(c => ({ label: L(c), kw: c.kw || L(c) })), x => show((x.kw || '') + ' ' + L(V))),
      giftfinder: (label) => { const nums = budgets(store, D) || D.gift || [100, 250, 500]; chips(label, nums.map(n => ({ label: '≤ ' + money(n, cur), n })), x => show(L(V), x.n)); }
    };
    el._ocOpen = openTool;
    document.querySelectorAll('.oc-dock__chip[data-oc-dock]').forEach(chip => {
      const tab = el.querySelector(`nav [data-a="${chip.getAttribute('data-oc-dock')}"]`);
      if (!tab) return;
      const name = tab.getAttribute('data-oc-name') || tab.textContent.trim();
      chip.textContent = name; chip.setAttribute('data-oc-name', name); chip.setAttribute('aria-label', name);
    });
  };
  el.addEventListener('click', e => {
    if (e.target.closest('[data-oc-close]')) { el.classList.remove('is-open'); return; }
    const tab = e.target.closest('nav [data-a]');
    if (tab && el._ocOpen) el._ocOpen(tab.dataset.a, tab);
  });
  /* Escape closes this one panel (the dock used to leave it open) */
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && el.classList.contains('is-open')) { el.classList.remove('is-open'); e.stopPropagation(); } });
  el._ocRefresh = next => { if (next) store = next; const was = el.classList.contains('is-open'), on = el.querySelector('nav button.is-on')?.dataset.a; render(); if (was) el.classList.add('is-open'); if (on && el._ocOpen) el._ocOpen(on, el.querySelector(`nav [data-a="${on}"]`)); };
  render();
}
