/* Blisk · cinematic infographic sections (v1.3).
   Every section takes 6–12 merchant images. Slots the merchant left empty are filled from the store itself:
   real categories (name, link, image) and real products, with the theme's bundled photo set matched to the detected type.
   Numbers shown are measured from the store (brain.js); demo slots never show invented figures. */
import { VERTICALS, ICONS, vt } from './verticals';
import { brain, money, vname, num } from './brain';
import DATA from './addons-data';

const B = document.body, isAr = (document.documentElement.lang || 'ar').startsWith('ar');
const t = (a, e) => isAr ? a : e;
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const safeUrl = u => /^(https?:\/\/|\/(?!\/)|#)/i.test(String(u || '')) ? String(u) : '#';
const MODES = ['featured', 'bestsellers', 'bundle'];
const asset = name => (B.dataset.ocImg || '').replace(/[^/]*\.webp(\?.*)?$/, `${name}.webp$1`);

/* the bundled photo set, ordered for a store type: its own 3 shots, then its related types, then the rest */
export function pool(v){
  const V = VERTICALS[v] || VERTICALS.beauty, order = [v, ...V.cats.filter(c => c !== v), ...Object.keys(VERTICALS)];
  const out = []; new Set(order).forEach(k => MODES.forEach(m => out.push({ v: k, src: asset(`${k}-${m}`) })));
  return out;
}
const imgFor = (v, i) => asset(`${VERTICALS[v] ? v : 'beauty'}-${MODES[i % 3]}`);

/* ---------- reveal + count-up (infographic motion) ---------- */
let io;
export function reveal(root = document){
  if (!('IntersectionObserver' in window)) { root.querySelectorAll('[data-oc-reveal]').forEach(e => e.classList.add('is-in')); return; }
  io = io || new IntersectionObserver(es => es.forEach(e => { if (!e.isIntersecting) return; e.target.classList.add('is-in'); count(e.target); io.unobserve(e.target); }), { threshold: .18 });
  root.querySelectorAll('[data-oc-reveal]:not(.is-in)').forEach(e => io.observe(e));
}
function count(root){
  root.querySelectorAll('[data-oc-count]').forEach(el => {
    const end = +el.dataset.ocCount, dec = +(el.dataset.dec || 0), fmt = el.dataset.fmt || '', t0 = performance.now();
    if (isNaN(end)) return;
    const step = now => { const k = Math.min(1, (now - t0) / 1400), v = end * (1 - Math.pow(1 - k, 3));
      el.textContent = (dec ? v.toFixed(dec) : Math.round(v).toLocaleString(B.dataset.ocArnum === '1' ? 'ar-SA' : 'en-US')) + fmt; if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  });
}

/* ---------- demo slots → the store's own categories + matched photos ---------- */
function fillDemo(st){
  const cats = (st?.cats || []).filter(c => c.name), v = st?.main || B.dataset.ocV || 'beauty', P = pool(v);
  document.querySelectorAll('[data-oc-sec]').forEach(sec => {
    let ci = 0, pi = 0;
    sec.querySelectorAll('[data-oc-demo]').forEach(slot => {
      const c = slot.dataset.ocDemo === 'cat' ? cats[ci++] : null;
      const im = slot.matches('img') ? slot : slot.querySelector('img[data-oc-fill]');
      if (im) { const pick = c ? (c.img || imgFor(c.v, ci)) : P[pi++ % P.length].src; if (pick && im.getAttribute('src') !== pick) im.src = pick; if (c) im.alt = c.name; }
      if (c) {
        slot.querySelectorAll('[data-oc-fill-t]').forEach(e => e.textContent = c.name);
        slot.querySelectorAll('[data-oc-fill-s]').forEach(e => e.textContent = c.sub.length ? c.sub.slice(0, 3).join(' · ') : vt((VERTICALS[c.v] || VERTICALS.beauty).hero));
        const kn = vname(c.v, isAr); slot.querySelectorAll('[data-oc-fill-k]').forEach(e => e.textContent = kn.replace(/^ال/, '') === c.name.replace(/^ال/, '') ? (st?.sig?.name || '') : kn);
        if (slot.matches('a')) slot.href = safeUrl(c.url); slot.querySelectorAll('a[data-oc-fill-u]').forEach(a => a.href = safeUrl(c.url));
      } else {
        slot.querySelectorAll('[data-oc-fill-s]:empty').forEach(e => e.textContent = vt((VERTICALS[v] || VERTICALS.beauty).hero));
        slot.querySelectorAll('[data-oc-fill-k]:empty').forEach(e => e.textContent = vname(v, isAr));
      }
    });
  });
}

/* ---------- 1. cinema slider ---------- */
function cinema(sec, st){
  const slides = [...sec.querySelectorAll('.oc-cine__slide')], thumbs = [...sec.querySelectorAll('.oc-cine__thumb')];
  if (!slides.length || sec.dataset.ready) return; sec.dataset.ready = 1;
  thumbs.forEach((b, k) => { const a = slides[k]?.querySelector('img'), m = b.querySelector('img'); if (a && m && m.src !== a.src) m.src = a.src; });
  const idx = sec.querySelector('[data-oc-idx]'), bar = sec.querySelector('.oc-cine__bar i');
  let i = 0, timer, paused = false; const dur = (+sec.dataset.speed || 6) * 1000;
  const go = n => { i = (n + slides.length) % slides.length;
    slides.forEach((s, k) => s.classList.toggle('is-on', k === i)); thumbs.forEach((s, k) => s.classList.toggle('is-on', k === i));
    if (idx) idx.textContent = String(i + 1).padStart(2, '0');
    if (bar) { bar.style.animation = 'none'; void bar.offsetWidth; bar.style.animation = `oc-bar ${dur}ms linear forwards`; bar.style.animationPlayState = paused ? 'paused' : 'running'; }
    clearTimeout(timer); timer = setTimeout(() => !paused && go(i + 1), dur); };
  thumbs.forEach((b, k) => b.onclick = () => go(k));
  sec.querySelector('[data-oc-prev]')?.addEventListener('click', () => go(i + (isAr ? 1 : -1)));
  sec.querySelector('[data-oc-next]')?.addEventListener('click', () => go(i + (isAr ? -1 : 1)));
  sec.addEventListener('mouseenter', () => { paused = true; clearTimeout(timer); if (bar) bar.style.animationPlayState = 'paused'; });
  sec.addEventListener('mouseleave', () => { paused = false; go(i); });
  let x0 = null; sec.addEventListener('touchstart', e => x0 = e.touches[0].clientX, { passive: true });
  sec.addEventListener('touchend', e => { if (x0 == null) return; const d = e.changedTouches[0].clientX - x0; if (Math.abs(d) > 40) go(i + ((d < 0) !== isAr ? 1 : -1)); x0 = null; });
  go(0);
  ticker(sec.querySelector('[data-oc-ticker]'), st);
}
/* live store facts — each one only when measured */
function facts(st){
  if (!st) return [];
  const S = st.stats || {}, cur = st.sig?.currency, f = [];
  if (st.cats?.length) f.push([t('الأقسام', 'Departments'), st.cats.length]);
  if (S.min) f.push([t('الأسعار تبدأ من', 'Prices from'), money(S.min, cur)]);
  if (S.inStock != null && S.sampled) f.push([t('متوفر الآن', 'In stock now'), S.inStock + '%']);
  if (S.onSale) f.push([t('منتجات بعروض', 'On offer'), S.onSale + '%']);
  if (S.avgOff) f.push([t('متوسط الخصم', 'Average saving'), S.avgOff + '%']);
  if (S.rating) f.push([t('تقييم العميلات', 'Customer rating'), `${S.rating.toFixed(1)}/5`]);
  if (st.brands?.length) f.push([t('ماركات', 'Brands'), st.brands.slice(0, 4).map(b => b.name).join(' · ')]);
  return f;
}
function ticker(el, st){
  if (!el) return; const f = facts(st); if (!f.length) { el.hidden = true; return; }
  const row = f.map(([k, v]) => `<span><small>${esc(k)}</small><b>${esc(v)}</b></span>`).join('<i aria-hidden="true">◆</i>');
  el.innerHTML = `<div class="oc-tick__track">${row}<i aria-hidden="true">◆</i>${row}<i aria-hidden="true">◆</i></div>`; el.hidden = false;
}

/* ---------- 2. spec infographic (exploded view with hotspots) ---------- */
function spec(sec, st){
  if (sec.dataset.ready) return; sec.dataset.ready = 1;
  const shots = [...sec.querySelectorAll('.oc-spec__shot')], rows = [...sec.querySelectorAll('.oc-spec__row')];
  const go = k => { shots.forEach((s, j) => s.classList.toggle('is-on', j === k)); rows.forEach((r, j) => r.classList.toggle('is-on', j === k)); };
  rows.forEach((r, k) => { r.addEventListener('mouseenter', () => go(k)); r.addEventListener('click', () => go(k)); r.addEventListener('focus', () => go(k)); });
  // demo rows get the detected type's real spec vocabulary (labels only — no figures are invented)
  const v = st?.main || B.dataset.ocV || 'beauty', D = DATA[v] || DATA.beauty, V = VERTICALS[v] || VERTICALS.beauty;
  const words = [...(V.specs || []).map(s => vt(s[0])), ...(D.kit || []).map(k => isAr ? k.ar : k.en), ...(D.compat || []).map(c => isAr ? c.ar : c.en)];
  sec.querySelectorAll('.oc-spec__row[data-oc-demo] [data-oc-fill-t]').forEach((e, k) => { if (words[k]) e.textContent = words[k]; });
  const pid = sec.dataset.product;
  if (pid) salla.product.fetch({ source: 'selected', source_value: [pid], limit: 1 }).then(r => {
    const p = r?.data?.[0]; const box = sec.querySelector('[data-oc-spec-product]'); if (!p || !box) return;
    const price = num(p.is_on_sale ? p.sale_price : p.price);
    box.innerHTML = `<a href="${esc(safeUrl(p.url))}"><b>${esc(p.name)}</b>${price ? `<em>${esc(money(price, st?.sig?.currency))}</em>` : ''}<span class="oc-btn oc-btn--sm">${t('اطلبيه الآن', 'Order now')}</span></a>`;
  }).catch(() => {});
  go(0);
}

/* ---------- 3. compare: merchant models, or the store's real products on real metrics ---------- */
function compare(sec, st){
  if (sec.dataset.ready) return; sec.dataset.ready = 1;
  const host = sec.querySelector('[data-oc-cmp]'), rail = sec.querySelector('.oc-cmp__rail');
  let models = [...rail.querySelectorAll('.oc-cmp__card:not([data-oc-demo])')].map(c => JSON.parse(c.dataset.m || '{}'));
  const labels = JSON.parse(sec.dataset.labels || '[]');
  const real = !models.length;
  if (real) {
    const cur = st?.sig?.currency;
    const list = (st?.top?.length ? st.top : []).concat(st?.deals || []).filter((p, i, a) => a.findIndex(x => x.id === p.id) === i).slice(0, 12);
    if (list.length < 2) { sec.hidden = !B.classList.contains('oc-preview'); host.innerHTML = `<p class="oc-muted">${t('تظهر المقارنة تلقائياً عندما يتوفر منتجان أو أكثر.', 'Comparison appears automatically once the store has two or more products.')}</p>`; return; }
    const maxP = Math.max(...list.map(p => p.price || 0)) || 1;
    models = list.map(p => ({ name: p.name, url: p.url, img: p.img, price: p.price ? money(p.price, cur) : '',
      rows: [[t('السعر', 'Price'), p.price ? money(p.price, cur) : '—', p.price ? Math.round(100 * p.price / maxP) : 0, 'low'],
        [t('تقييم العملاء', 'Rating'), p.stars ? `${p.stars.toFixed(1)}/5` : t('بدون تقييم', 'Unrated'), p.stars ? p.stars * 20 : 0, 'high'],
        [t('عدد التقييمات', 'Reviews'), p.reviews || 0, Math.min(100, (p.reviews || 0) * 2), 'high'],
        [t('التوفر', 'Availability'), p.out ? t('نفد', 'Sold out') : t('متوفر', 'In stock'), p.out ? 0 : 100, 'high'],
        [t('الخصم', 'Discount'), p.was && p.price ? Math.round(100 * (1 - p.price / p.was)) + '%' : '—', p.was && p.price ? Math.round(100 * (1 - p.price / p.was)) : 0, 'high']] }));
    rail.innerHTML = models.map((m, k) => `<button type="button" class="oc-cmp__card" data-k="${k}"><img loading="lazy" src="${esc(m.img || imgFor(st?.main, k))}" alt="${esc(m.name)}"><b>${esc(m.name)}</b><em>${esc(m.price)}</em></button>`).join('');
    sec.querySelector('[data-oc-cmp-mode]')?.replaceChildren(document.createTextNode(t('مقارنة حيّة من منتجات متجرك الحقيقية', 'Live comparison from your real products')));
  } else {
    models = models.map(m => ({ ...m, rows: labels.map((l, j) => [l, m.v?.[j] ?? '—', +m.v?.[j] || 0, 'high']).filter(r => r[0]) }));
    rail.querySelectorAll('[data-oc-demo]').forEach(e => e.remove());
  }
  const cards = [...rail.querySelectorAll('.oc-cmp__card')]; let pick = [0, 1].filter(k => k < cards.length);
  const draw = () => {
    cards.forEach((c, k) => c.classList.toggle('is-on', pick.includes(k)));
    const M = pick.map(k => models[k]).filter(Boolean); if (!M.length) return;
    const R = M[0].rows || [];
    host.innerHTML = `<div class="oc-cmp__table" style="--n:${M.length}"><div class="oc-cmp__hd"><span></span>${M.map(m => `<a href="${esc(safeUrl(m.url))}"><img src="${esc(m.img || '')}" alt=""><b>${esc(m.name)}</b></a>`).join('')}</div>` +
      R.map((r, j) => { const vals = M.map(m => m.rows?.[j]?.[2] || 0), best = r[3] === 'low' ? Math.min(...vals.filter(Boolean)) : Math.max(...vals);
        return `<div class="oc-cmp__tr"><span>${esc(r[0])}</span>${M.map(m => { const c = m.rows?.[j] || []; const win = M.length > 1 && c[2] && c[2] === best;
          return `<div class="${win ? 'is-win' : ''}"><em>${esc(c[1])}</em><i style="--w:${Math.max(0, Math.min(100, c[2] || 0))}%"></i></div>`; }).join('')}</div>`; }).join('') + '</div>';
  };
  cards.forEach((c, k) => c.onclick = () => { pick = pick.includes(k) ? pick.filter(x => x !== k) : [...pick, k].slice(-3); draw(); });
  draw();
}

/* ---------- 4. brands wall: merchant logos, else brands actually found in the store's products ---------- */
function brands(sec, st){
  if (sec.dataset.ready) return; sec.dataset.ready = 1;
  const grid = sec.querySelector('.oc-brands__grid'), demo = [...grid.querySelectorAll('[data-oc-demo]')];
  const found = st?.brands || [];
  if (!found.length) { demo.forEach(d => d.remove()); if (!grid.children.length) sec.hidden = true; return; }
  demo.forEach((d, k) => { const b = found[k]; if (!b) return d.remove();
    d.href = '/search?q=' + encodeURIComponent(b.name); d.querySelector('b').textContent = b.name;
    d.querySelector('small').textContent = t('ضمن منتجات المتجر', 'In this store'); });
  const extra = found.slice(demo.length, 12);
  grid.insertAdjacentHTML('beforeend', extra.map(b => `<a class="oc-brand-tile" href="/search?q=${encodeURIComponent(b.name)}" data-oc-reveal><b>${esc(b.name)}</b><small>${t('ضمن منتجات المتجر', 'In this store')}</small></a>`).join(''));
  reveal(grid);
}

/* ---------- 5. store intelligence board ---------- */
function board(sec, st){
  const host = sec.querySelector('[data-oc-board]'); if (!host || !st) return;
  const S = st.stats || {}, cur = st.sig?.currency, tiles = [];
  const ring = (v, label, sub, fmt = '%') => `<div class="oc-bd__tile oc-glass" data-oc-reveal><div class="oc-gauge oc-gauge--lg" style="--v:${Math.round(v)}"><svg viewBox="0 0 36 36" aria-hidden="true"><circle class="t" cx="18" cy="18" r="15.9"/><circle class="v" cx="18" cy="18" r="15.9" pathLength="100"/></svg><b><span data-oc-count="${v}" data-fmt="${fmt}">0</span></b></div><h3>${esc(label)}</h3><p>${esc(sub)}</p></div>`;
  if (st.cats?.length) tiles.push(`<div class="oc-bd__tile oc-glass oc-bd__big" data-oc-reveal><b class="oc-metal" data-oc-count="${st.cats.length}">0</b><h3>${t('قسم في المتجر', 'store departments')}</h3><p>${esc(st.cats.slice(0, 5).map(c => c.name).join(' · '))}</p></div>`);
  if (S.min && S.max) tiles.push(`<div class="oc-bd__tile oc-glass oc-bd__range" data-oc-reveal><h3>${t('نطاق الأسعار', 'Price range')}</h3><div class="oc-bd__scale"><i style="--a:0%;--b:100%"></i>${S.median ? `<em style="--p:${Math.round(100 * (S.median - S.min) / ((S.max - S.min) || 1))}%">${t('الوسيط', 'Median')} ${esc(money(S.median, cur))}</em>` : ''}</div><p><span>${esc(money(S.min, cur))}</span><span>${esc(money(S.max, cur))}</span></p></div>`);
  if (S.inStock != null && S.sampled) tiles.push(ring(S.inStock, t('جاهز للشحن', 'Ready to ship'), t(`من ${S.sampled} منتج تم فحصها`, `of ${S.sampled} products checked`)));
  if (S.onSale) tiles.push(ring(S.onSale, t('منتجات عليها عروض', 'Products on offer'), S.avgOff ? t(`متوسط التوفير ${S.avgOff}%`, `Average saving ${S.avgOff}%`) : t('عروض سارية الآن', 'Live offers')));
  if (S.rating) tiles.push(ring(S.rating * 20, t('رضا العميلات', 'Customer satisfaction'), t(`${S.rating.toFixed(1)} من 5 · ${S.reviews} تقييم`, `${S.rating.toFixed(1)} of 5 · ${S.reviews} reviews`)));
  if (st.mix?.length > 1) { let a = 0; const cols = ['var(--oc-acc)', '#e8b4b8', '#c9ccd1', '#e0a98f', '#7ae0d0', '#b48cff'];
    const stops = st.mix.map((m, k) => { const s = `${cols[k]} ${a}% ${a + m.pct}%`; a += m.pct; return s; }).join(',');
    tiles.push(`<div class="oc-bd__tile oc-glass oc-bd__mix" data-oc-reveal><div class="oc-donut" style="background:conic-gradient(${stops},var(--oc-track) ${a}% 100%)"><span>${st.mix.length}</span></div><ul>${st.mix.map((m, k) => `<li><i style="background:${cols[k]}"></i>${esc(vname(m.v, isAr))}<b>${m.pct}%</b></li>`).join('')}</ul><h3>${t('تركيبة المعروض', 'Catalogue mix')}</h3></div>`); }
  if (st.brands?.length) { const mx = st.brands[0].n; tiles.push(`<div class="oc-bd__tile oc-glass oc-bd__brands" data-oc-reveal><h3>${t('الماركات الأبرز', 'Leading brands')}</h3>${st.brands.slice(0, 5).map(b => `<div class="oc-bar"><span>${esc(b.name)}</span><i style="--w:${Math.round(100 * b.n / mx)}%"></i><em></em></div>`).join('')}</div>`); }
  if (!tiles.length) { sec.hidden = true; return; }
  host.innerHTML = tiles.join(''); sec.hidden = false; reveal(host);
}

/* ---------- 6. build-your-setup: each item searches the store's real products ---------- */
function setup(sec, st){
  if (sec.dataset.ready) return; sec.dataset.ready = 1;
  const v = st?.main || B.dataset.ocV || 'beauty', D = DATA[v] || DATA.beauty, cur = st?.sig?.currency;
  // demo items: this type's kit, then the store's own departments — no repeats
  const kit = [], seen = new Set(), add = (l, kw) => { if (l && !seen.has(kw)) { seen.add(kw); kit.push({ l, kw }); } };
  (D.kit || []).forEach(k => add(isAr ? k.ar : k.en, k.kw)); (D.bundle || []).forEach(b => b.kw.forEach(w => add(w, w)));
  (st?.cats || []).forEach(c => add(c.name, c.name));
  sec.querySelectorAll('.oc-setup__item[data-oc-demo]').forEach((it, k) => { const x = kit[k]; if (!x) return it.remove(); it.dataset.kw = x.kw; it.querySelector('b').textContent = x.l; });
  const out = sec.querySelector('[data-oc-setup-out]'), sum = sec.querySelector('[data-oc-setup-sum]'), chosen = new Map();
  const total = () => { const s = [...chosen.values()].reduce((n, p) => n + (p.price || 0), 0);
    sum.innerHTML = chosen.size ? `<span>${t('روتينك', 'Your routine')} · ${chosen.size}</span><b class="oc-metal">${esc(money(s, cur))}</b>` : `<span>${t('اختاري خطوة لتبني روتينك من منتجات المتجر', 'Pick a step to build your routine from the store’s products')}</span>`; };
  sec.querySelectorAll('.oc-setup__item').forEach(it => it.onclick = async () => {
    sec.querySelectorAll('.oc-setup__item').forEach(x => x.classList.toggle('is-on', x === it));
    const kw = it.dataset.kw || it.querySelector('b')?.textContent || ''; out.innerHTML = `<p class="oc-muted">${t('نبحث في منتجات المتجر…', 'Searching the store…')}</p>`;
    let r = []; try { r = (await salla.product.fetch({ source: 'search', source_value: kw, limit: 6 }))?.data || []; } catch (e) {}
    if (!r.length) { out.innerHTML = `<a class="oc-muted" href="/search?q=${encodeURIComponent(kw)}">${t('اعرض نتائج البحث عن', 'See search results for')} “${esc(kw)}”</a>`; return; }
    out.innerHTML = r.map(p => { const n = num(p.is_on_sale ? p.sale_price : p.price); return `<div class="oc-setup__p"><a href="${esc(safeUrl(p.url))}"><img loading="lazy" src="${esc(p.image?.url || p.thumbnail || '')}" alt=""><b>${esc(p.name)}</b>${n ? `<em>${esc(money(n, cur))}</em>` : ''}</a><button type="button" data-id="${esc(p.id)}" data-n="${n || 0}" aria-pressed="${chosen.has(String(p.id))}">${chosen.has(String(p.id)) ? '✓' : '+'}</button></div>`; }).join('');
    out.querySelectorAll('button[data-id]').forEach(b => b.onclick = () => { const id = b.dataset.id; chosen.has(id) ? chosen.delete(id) : chosen.set(id, { price: +b.dataset.n }); b.textContent = chosen.has(id) ? '✓' : '+'; b.setAttribute('aria-pressed', chosen.has(id)); total(); });
  });
  total();
}

/* ---------- 7. services: steps link to the merchant's real policy pages ---------- */
function services(sec, st){
  const P = st?.policies || {}; const map = ['shipping', 'warranty', 'returns', 'payment', 'contact', 'about'];
  sec.querySelectorAll('.oc-svc__step[data-oc-demo]').forEach((s, k) => { const p = P[s.dataset.policy || map[k]]; const a = s.querySelector('a[data-oc-pol]');
    if (p && a) { a.href = safeUrl(p.url); a.textContent = p.title; a.hidden = false; } });
}

/* ---------- 8. launch countdown ---------- */
function launch(sec){
  if (sec.dataset.ready) return; sec.dataset.ready = 1;
  const raw = (sec.dataset.date || '').trim(), el = sec.querySelector('[data-oc-cd]'); if (!el) return;
  const d = raw ? new Date(raw.replace(' ', 'T')) : null;
  if (!d || isNaN(d)) { el.innerHTML = `<b class="oc-metal">${t('قريباً', 'Coming soon')}</b>`; return; }
  const U = [[86400, t('يوم', 'days')], [3600, t('ساعة', 'hours')], [60, t('دقيقة', 'min')], [1, t('ثانية', 'sec')]];
  const tick = () => { let s = Math.max(0, Math.floor((d - Date.now()) / 1000));
    if (!s) { el.innerHTML = `<b class="oc-metal">${t('متاح الآن', 'Available now')}</b>`; sec.classList.add('is-live'); return; }
    el.innerHTML = U.map(([u, l]) => { const n = Math.floor(s / u); s -= n * u; return `<span><b>${String(n).padStart(2, '0')}</b><small>${l}</small></span>`; }).join('<i>:</i>');
    setTimeout(tick, 1000); };
  tick();
}

/* ---------- 9. showcase (bento) — pointer parallax ---------- */
function showcase(sec){
  if (sec.dataset.ready || matchMedia('(prefers-reduced-motion:reduce)').matches) return; sec.dataset.ready = 1;
  sec.addEventListener('pointermove', e => { const r = sec.getBoundingClientRect(); sec.style.setProperty('--mx', ((e.clientX - r.left) / r.width - .5).toFixed(3)); sec.style.setProperty('--my', ((e.clientY - r.top) / r.height - .5).toFixed(3)); });
}

/* ---------- hero gauges + trust: live store figures when the merchant didn't type their own ---------- */
function liveGauges(st){
  const S = st?.stats || {};
  const val = { inStock: S.sampled ? S.inStock : null, onSale: S.onSale || null, rating: S.rating ? Math.round(S.rating * 20) : null, cats: null };
  document.querySelectorAll('[data-oc-live]').forEach(g => { const v = val[g.dataset.ocLive];
    if (v == null) { g.hidden = true; return; } g.hidden = false; g.style.setProperty('--v', v); const b = g.querySelector('b'); if (b) b.textContent = v + '%'; });
}
function trustAuto(sec, st){
  const grid = sec.querySelector('[data-oc-trust-auto]'); if (!grid) return;
  const S = st?.stats || {}, P = st?.policies || {}, cards = [];
  const card = (v, title, note, href) => `<${href ? `a href="${esc(safeUrl(href))}"` : 'div'} class="oc-glass oc-trust__card" data-oc-reveal><div class="oc-gauge oc-gauge--lg" style="--v:${v == null ? 100 : v}"><svg viewBox="0 0 36 36" aria-hidden="true"><circle class="t" cx="18" cy="18" r="15.9"/><circle class="v" cx="18" cy="18" r="15.9" pathLength="100"/></svg><b>${v == null ? '✓' : `<span data-oc-count="${v}" data-fmt="%">0</span>`}</b></div><h3>${esc(title)}</h3><p>${esc(note)}</p></${href ? 'a' : 'div'}>`;
  cards.push(card(null, t('دفع آمن عبر سلة', 'Secure Salla checkout'), t('كل المدفوعات تمر عبر بوابة سلة المعتمدة', 'All payments go through Salla’s certified gateway')));
  if (S.rating) cards.push(card(Math.round(S.rating * 20), t('رضا العميلات', 'Customer satisfaction'), t(`${S.rating.toFixed(1)} من 5 من ${S.reviews} تقييم حقيقي`, `${S.rating.toFixed(1)} of 5 from ${S.reviews} real reviews`)));
  if (S.sampled) cards.push(card(S.inStock, t('جاهزية المخزون', 'Stock readiness'), t('نسبة المنتجات المتوفرة الآن', 'Share of products available now')));
  if (B.dataset.ocTax === '1') cards.push(card(null, t('منشأة مسجلة ضريبياً', 'VAT-registered business'), t('الرقم الضريبي ظاهر في الفاتورة', 'VAT number shown on the invoice')));
  if (P.warranty || P.returns) { const p = P.warranty || P.returns; cards.push(card(null, t('سياسة ضمان واسترجاع معلنة', 'Published warranty & returns'), p.title, p.url)); }
  if (P.shipping) cards.push(card(null, t('شحن موضح', 'Clear shipping'), P.shipping.title, P.shipping.url));
  grid.innerHTML = cards.join(''); reveal(grid);
}

/* ---------- vertical copy for kickers (when merchant left them empty) ---------- */
function kickers(st){
  const v = st?.main || B.dataset.ocV || 'beauty';
  document.querySelectorAll('[data-oc-vicon]').forEach(e => e.innerHTML = ICONS[v] || ICONS.beauty);
}

export async function mountSections(){
  const secs = document.querySelectorAll('[data-oc-sec]');
  reveal();
  const needs = secs.length || document.querySelector('[data-oc-live],[data-oc-trust-auto]');
  if (!needs) return null;
  let st = null; try { st = await brain(); } catch (e) {}
  fillDemo(st); kickers(st); liveGauges(st);
  secs.forEach(sec => { const k = sec.dataset.ocSec;
    try { ({ cinema, spec, compare, brands, board, setup, services, launch, showcase }[k] || (() => {}))(sec, st); } catch (e) {} });
  document.querySelectorAll('.oc-trust').forEach(s => trustAuto(s, st));
  reveal();
  return st;
}
