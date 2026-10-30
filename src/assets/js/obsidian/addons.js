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
  if (B.dataset.ocAddons !== '1' || document.querySelector('.oc-ai')) return;
  const off = (B.dataset.ocAddonOff || '').split(',');
  const types = st?.present?.length ? st.present : [B.dataset.ocV || 'beauty'];
  let v = B.dataset.ocV && types.includes(B.dataset.ocV) ? B.dataset.ocV : types[0];
  if (!DATA[v]) v = 'beauty';
  const t = (a, e) => isAr ? a : e;
  const L = o => isAr ? o.ar : o.en;
  const cur = st?.sig?.currency || 'SAR';
  const el = document.createElement('div'); el.className = 'oc-ai'; el.dir = isAr ? 'rtl' : 'ltr'; B.appendChild(el);

  const render = () => {
    const D = adaptFor(v), V = VERTICALS[v] || VERTICALS.beauty;
    const ids = IDS.filter(k => !off.includes(k) && !D.skip.includes(k));
    el.innerHTML = `<button type="button" class="oc-ai__fab">✦ ${t('إضافاتي الذكية', 'Smart add-ons')}</button><div class="oc-ai__p" role="dialog" aria-label="${t('الإضافات الذكية', 'Smart add-ons')}"><header><b>${t('مساعد', 'Assistant')} ${esc(L(V))}${st?.cats?.length ? `<small>${t(`قرأ متجرك: ${st.cats.length} قسم${st.brands?.length ? ` · ${st.brands.length} ماركة` : ''}`, `Read your store: ${st.cats.length} departments${st.brands?.length ? ` · ${st.brands.length} brands` : ''}`)}</small>` : ''}</b>${types.length > 1 ? `<select aria-label="${t('نوع المنتجات', 'Product type')}">${types.map(x => `<option value="${esc(x)}"${x === v ? ' selected' : ''}>${esc(L(VERTICALS[x] || VERTICALS.beauty))}</option>`).join('')}</select>` : ''}</header>
    <nav>${ids.map(k => `<button type="button" data-a="${k}">${t(...A[k])}</button>`).join('')}</nav><div class="oc-ai__body" aria-live="polite">${t('اختاري أداة — المحتوى مخصص لقسم', 'Pick a tool — tailored to')} ${esc(L(V))}</div></div>`;
    const body = el.querySelector('.oc-ai__body');
    el.querySelector('.oc-ai__fab').onclick = () => el.classList.toggle('is-open');
    el.querySelector('select')?.addEventListener('change', e => { v = e.target.value; render(); el.classList.add('is-open'); });

    const results = (r, kw, budget) => {
      let list = r;
      if (budget) { const f = r.filter(p => { const n = num(p.is_on_sale ? p.sale_price : p.price); return n == null || n <= budget; }); if (f.length) list = f; }
      body.innerHTML = list.length
        ? list.slice(0, 6).map(p => { const n = num(p.is_on_sale ? p.sale_price : p.price); const im = p.image?.url || p.thumbnail; return `<a class="oc-ai__res" href="${esc(p.url)}">${im ? `<img src="${esc(im)}" alt="" loading="lazy">` : ''}<span>${esc(p.name)}${n != null ? `<small>${esc(money(n, cur))}</small>` : ''}</span></a>`; }).join('')
        : `<a href="/search?q=${encodeURIComponent(kw)}">${t('اعرض النتائج لـ', 'See results for')} “${esc(kw)}”</a>`;
    };
    const show = async (kw, budget) => { body.innerHTML = `<p>${t('نبحث في متجرك…', 'Searching your store…')}</p>`; results(await search(kw), kw, budget); };
    const chips = (title, items, fn) => {
      body.innerHTML = `<b>${esc(title)}</b>` + items.map((x, i) => `<button type="button" data-i="${i}">${esc(x.label)}</button>`).join('');
      body.querySelectorAll('[data-i]').forEach(b => b.onclick = () => fn(items[+b.dataset.i]));
    };

    const F = {
      stylist: () => {
        body.innerHTML = `<b>${t('اسألي عن منتج أو نوع بشرة أو ميزانية أو سياسة', 'Ask about a product, skin type, budget or policy')}</b><input type="search" class="oc-ai__q" maxlength="80" placeholder="${t('مثال: سيروم للبشرة الجافة', 'e.g. serum for dry skin')}" aria-label="${t('اسألي المستشارة', 'Ask the advisor')}"><button type="button" data-go>${t('ابحث', 'Search')}</button>` +
          FAQ.map((f, i) => `<button type="button" data-f="${i}">${t(f[0], f[1])}</button>`).join('');
        const go = () => { const q = body.querySelector('.oc-ai__q').value.trim(); if (q) show(q); };
        body.querySelector('[data-go]').onclick = go;
        body.querySelector('.oc-ai__q').addEventListener('keydown', e => { if (e.key === 'Enter') go(); });
        body.querySelectorAll('[data-f]').forEach(b => b.onclick = () => { const f = FAQ[+b.dataset.f], P = policies(), pg = f[4].map(k => P[k]).filter(Boolean);
          body.innerHTML = `<b>${t(f[0], f[1])}</b><p>${t(f[2], f[3])}</p>` + pg.map(x => `<a href="${esc(x.url)}">↗ ${esc(x.title)}</a>`).join(''); });
      },
      quiz: () => {
        const ans = [];
        const step = i => {
          if (i >= D.quiz.length) return show(ans.join(' '));
          const Q = D.quiz[i];
          body.innerHTML = `<small>${i + 1}/${D.quiz.length}</small><b>${esc(L(Q.q))}</b>` + Q.opts.map((o, j) => `<button type="button" data-k="${j}">${esc(L(o))}</button>`).join('');
          body.querySelectorAll('[data-k]').forEach(b => b.onclick = () => { ans.push(Q.opts[+b.dataset.k].kw); step(i + 1); });
        };
        step(0);
      },
      voice: () => {
        const R = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!R) { body.textContent = t('المتصفح لا يدعم البحث الصوتي', 'Voice search is not supported in this browser'); return; }
        const r = new R(); r.lang = isAr ? 'ar-SA' : 'en-US';
        body.textContent = t('تكلّمي الحين…', 'Speak now…');
        r.onresult = e => show(e.results[0][0].transcript);
        r.onerror = () => { body.textContent = t('ما قدرنا نسمعك — جرّبي الكتابة', 'Could not hear you — try typing'); };
        try { r.start(); } catch (e) { body.textContent = t('تعذّر تشغيل الميكروفون', 'Microphone unavailable'); }
      },
      listen: () => {
        if (!('speechSynthesis' in window)) { body.textContent = t('المتصفح لا يدعم القراءة الصوتية', 'Read-aloud is not supported'); return; }
        const s = document.querySelector('.product-single__description, .product__description, .product-details, main h1');
        const u = new SpeechSynthesisUtterance((s?.textContent || document.title).trim().slice(0, 600)); u.lang = isAr ? 'ar-SA' : 'en-US';
        speechSynthesis.cancel(); speechSynthesis.speak(u);
        body.innerHTML = `<p>${t('يتم قراءة الوصف وطريقة الاستخدام…', 'Reading the description…')}</p><button type="button" data-stop>${t('إيقاف', 'Stop')}</button>`;
        body.querySelector('[data-stop]').onclick = () => speechSynthesis.cancel();
      },
      tryon: () => {
        const [w, h] = D.mm;
        body.innerHTML = `<b>${esc(L(D.sizeLabel))}</b><div class="oc-ai__ruler" style="width:${w}mm;height:${h}mm;max-width:100%" aria-hidden="true"></div><small>${t(`حجم العبوة التقريبي ≈ ${w}×${h} ملم. قارنيها بيدك — تقريبي ويختلف حسب الشاشة.`, `Bottle ≈ ${w}×${h} mm. Compare with your hand — approximate, varies by screen.`)}</small>`;
      },
      recolour: () => chips(t('اختاري الدرجة', 'Pick a shade'), D.finish.map(f => ({ label: L(f), kw: L(f) })), x => show(x.kw + ' ' + L(V))),
      colorbook: () => {
        const all = []; types.forEach(k => (DATA[k]?.finish || []).forEach(f => { if (!all.find(a => a.ar === f.ar)) all.push(f); }));
        body.innerHTML = `<b>${t('دليل الدرجات المتوفرة', 'Shade guide')}</b>` + all.map((f, i) => `<button type="button" data-i="${i}"><i style="display:inline-block;width:.8em;height:.8em;border-radius:50%;margin-inline-end:.35em;border:1px solid rgba(255,255,255,.4);background:${safeColor(f.hex)}"></i>${esc(L(f))}</button>`).join('');
        body.querySelectorAll('[data-i]').forEach(b => b.onclick = () => show(L(all[+b.dataset.i])));
      },
      photocoach: () => { body.innerHTML = `<b>${t('استخدميه صح واحفظيه صح', 'Use it right, store it right')}</b>` + D.photo.map(x => `<p>• ${esc(L(x))}</p>`).join(''); },
      look: () => chips(t('أكملي روتينك', 'Complete your routine'), D.kit.map(k => ({ label: '+ ' + L(k), kw: k.kw })), x => show(x.kw)),
      presets: () => chips(t('روتينات جاهزة', 'Ready routines'), D.bundle.map(b => ({ label: L(b), kw: b.kw[0] })), x => show(x.kw)),
      undertone: () => chips(t('وش نوع بشرتك؟', 'Your skin type?'), D.compat.map(c => ({ label: L(c), kw: c.kw })), x => show(x.kw + ' ' + L(V))),
      giftfinder: () => chips(t('ميزانية الهدية', 'Gift budget'), budgets(st, D).map(n => ({ label: '≤ ' + money(n, cur), n })), x => show(L(V), x.n))
    };
    el.querySelectorAll('[data-a]').forEach(b => b.onclick = () => { el.querySelectorAll('[data-a]').forEach(x => x.classList.toggle('is-on', x === b)); F[b.dataset.a](); });
  };
  render();
}
