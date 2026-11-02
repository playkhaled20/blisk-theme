/* UX pass (lessons from Salla's review of Bahaa): display-only fixes that read the store's own data.
   1. discount badge on cards and next to the product price, computed from the two prices (Arabic digits and «٫» understood)
   2. specs / subtitle lines glued together («المقاس36الطول130») get spaces and «·» between pairs
   3. size charts the store saved as one glued line become a table; other glued text only gets spaces (nothing dropped) */
const d = document, $$ = (s, r = d) => [...r.querySelectorAll(s)];
const AR = 'ء-ي', DG = '0-9٠-٩';
const latin = t => (t || '').replace(/٫/g, '.').replace(/٬/g, ',').replace(/[٠-٩]/g, k => '٠١٢٣٤٥٦٧٨٩'.indexOf(k));
export const nums = t => (latin(t).match(/\d[\d,.]*/g) || []).map(x => parseFloat(x.replace(/,/g, ''))).filter(n => n > 0);
export const pct = (now, was) => { if (!(now > 0 && was > now)) return 0; const p = Math.round(100 * (1 - now / was)); return p >= 3 && p <= 90 ? p : 0; };

const offBadge = root => $$('.s-product-card-entry', root).forEach(c => {
  const sp = c.querySelector('.s-product-card-sale-price'), key = sp ? sp.textContent : '';
  if (c.dataset.uxOff === key) return; c.dataset.uxOff = key; c.querySelectorAll('.ux-off').forEach(e => e.remove());
  if (!sp || c.querySelector('.s-product-card-promotion-title')) return;
  const n = nums(key); if (n.length < 2) return; const p = pct(Math.min(...n), Math.max(...n)); if (!p) return;
  (c.querySelector('.s-product-card-image') || c).insertAdjacentHTML('beforeend', `<span class="ux-off">−${p}%</span>`); });

const pdpOff = root => $$('[data-testid="store-product-price"] .line-through, .price_is_on_sale .before-price', root).forEach(o => {
  const box = o.parentElement; if (!box) return; const nowEl = box.querySelector('.total-price, .text-red-800');
  const key = o.textContent + '|' + (nowEl ? nowEl.textContent : ''); if (box.dataset.uxOff === key) return; box.dataset.uxOff = key;
  box.querySelectorAll('.ux-pdp-off').forEach(e => e.remove());
  const p = pct(nums(nowEl && nowEl.textContent)[0], nums(o.textContent)[0]); if (p) o.insertAdjacentHTML('afterend', `<span class="ux-pdp-off">−${p}%</span>`); });

/* «المقاس36الطول130الكم28.5» → «المقاس 36 · الطول 130 · الكم 28.5»; a run of 7+ digits is several values glued by the store data:
   the line stops there with «…» and the full text stays in the title attribute */
export const specFmt = t => { const raw = t.replace(/\s+/g, ' ').trim(), g = raw.search(/[0-9٠-٩.]{7,}/);
  let v = g > 0 ? raw.slice(0, g) + raw.slice(g).match(/^[0-9٠-٩]{1,3}(?:\.[0-9٠-٩])?/)[0] : raw;
  v = v.replace(new RegExp(`([${AR}])(?=[${DG}])`, 'g'), '$1 ').replace(new RegExp(`([${DG}])(?=[${AR}])`, 'g'), '$1 · ');
  return { v: g > 0 ? v + ' …' : v, cut: g > 0, raw }; };
const specs = root => $$('.product-entry__sub-title, .s-product-card-content-subtitle', root).forEach(e => {
  if (e.children.length || e.dataset.uxSpec === e.textContent) return; const f = specFmt(e.textContent);
  if (f.v !== e.textContent) e.textContent = f.v; if (f.cut) e.title = f.raw; e.dataset.uxSpec = e.textContent; });

/* a size chart flattened into one line: the first «label value» pairs give the columns and each value's digit width,
   the rest splits into rows of the same widths. If it does not split exactly, only spaces are added. */
export const glueTable = t => { const m = t.trim().match(new RegExp(`^((?:[${AR}][${AR} ]*?\\s*[${DG}]{1,3}(?:\\.[${DG}])?\\s*){2,6})([${DG}. ]{5,})$`)); if (!m) return null;
  const pairs = [...m[1].matchAll(new RegExp(`([${AR}][${AR} ]*?)\\s*([${DG}]{1,3})(\\.[${DG}])?`, 'g'))]; if (pairs.length < 2) return null;
  const re = new RegExp('^' + pairs.map(p => `([${DG}]{${p[2].length}}(?:\\.[${DG}])?)`).join('')), rows = [pairs.map(p => p[2] + (p[3] || ''))];
  let rest = m[2].replace(/\s+/g, ''); while (rest.length) { const r = rest.match(re); if (!r) return null; rows.push(r.slice(1)); rest = rest.slice(r[0].length); }
  const tb = d.createElement('table'); tb.className = 'ux-glued-table';
  tb.innerHTML = '<tr>' + pairs.map(p => `<th>${p[1].trim()}</th>`).join('') + '</tr>' + rows.map(r => '<tr>' + r.map(v => `<td>${v}</td>`).join('') + '</tr>').join(''); return tb; };
const desc = root => $$('.product__description', root).forEach(a => { if (a.dataset.uxGlue) return; a.dataset.uxGlue = '1';
  const w = d.createTreeWalker(a, 4), list = []; let n; while ((n = w.nextNode())) list.push(n);
  list.forEach(n => { const t = n.nodeValue; if (!/[0-9٠-٩]/.test(t) || n.parentElement.closest('table')) return; const tb = glueTable(t);
    if (tb) { n.parentNode.replaceChild(tb, n); return; }
    const v = t.replace(new RegExp(`([${AR}])(?=[${DG}])`, 'g'), '$1 ').replace(new RegExp(`([${DG}])(?=[${AR}])`, 'g'), '$1 '); if (v !== t) n.nodeValue = v; }); });

export function initUx() {
  const run = () => { specs(d); offBadge(d); pdpOff(d); desc(d); }; let q = 0;
  run(); new MutationObserver(() => { if (!q) q = requestAnimationFrame(() => { q = 0; run(); }); }).observe(d.body, { childList: true, subtree: true, characterData: true });
}
