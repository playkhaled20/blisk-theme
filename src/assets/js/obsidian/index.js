import { vt, VERTICALS, ICONS, detect, norm, scores } from './verticals';
import { customerColor, PALETTES } from './colors';
import { bindBrand } from './brand';
import { buildSmart } from './smart';
import { mountAddons } from './addons';
import { mountSections } from './sections';
import { initDemo, demoV, demoPack } from './demo';
import { money, brain } from './brain';
import { initBeauty } from './beauty';
const B = document.body, isAr = (document.documentElement.lang || 'ar').startsWith('ar');
const tr = (ar,en) => isAr ? ar : en;

/* ---------- vertical: setting > preview choice > auto-detect from real menu/category/product names ---------- */
/* merchant permanent squares: skin mode from luminance; ink base follows effective mode */
export function applySquares(){
  const lum=h=>{h=(h||'').replace('#','');if(h.length<6)return .1;const [r,g,b]=[0,2,4].map(i=>parseInt(h.substr(i,2),16)/255);return .2126*r+.7152*g+.0722*b;};
  const skin=B.style.getPropertyValue('--oc-skin').trim();
  if(B.dataset.ocSkin==='1') B.dataset.ocSkinmode=lum(skin)>.55?'l':'d'; else delete B.dataset.ocSkinmode;
  const pal=PALETTES[B.dataset.ocCc==='1'&&B.dataset.ocUbg||'']||(B.dataset.ocSkinmode?null:PALETTES[B.dataset.ocBg]);
  const light=pal?pal[5]==='l':B.dataset.ocSkinmode==='l';
  B.style.setProperty('--oc-inkbase',light?'#000':'#fff');
  if(B.dataset.ocV&&VERTICALS[B.dataset.ocV]) B.style.setProperty('--oc-v-acc',B.dataset.ocInk==='1'?'var(--oc-ink)':VERTICALS[B.dataset.ocV].acc);
}
function applyVertical(v){
  const V = VERTICALS[v] || VERTICALS.beauty;
  B.dataset.ocV = v; B.style.setProperty('--oc-v-acc', B.dataset.ocInk==='1'?'var(--oc-ink)':V.acc);
  document.querySelectorAll('[data-oc-hero-art]').forEach(el => el.innerHTML = ICONS[v] || ICONS.beauty);
  document.querySelectorAll('[data-oc-hero-sub]').forEach(el => { if(!el.dataset.custom) el.textContent = vt(V.hero); });
  document.querySelectorAll('[data-oc-hud]').forEach(el => el.innerHTML = (V.specs||[]).map(([l,n],i)=>`<div class="oc-hud__row" style="--w:${n}%;--d:${i*.15}s"><span>${vt(l)}</span><i></i></div>`).join(''));
  document.querySelectorAll('[data-oc-vname]').forEach(el => el.textContent = isAr ? V.ar : V.en);
  const ML = {featured:tr('مختارات','Featured'),bestsellers:tr('الأكثر مبيعاً في','Bestsellers ·'),new:tr('وصل حديثاً في','New in'),deals:tr('عروض','Deals ·'),bundle:tr('أكمل طقم','Complete the kit ·')};
  document.querySelectorAll('[data-oc-vtitle]').forEach(el => { if(!el.dataset.custom) el.textContent = `${ML[el.dataset.ocVtitle]||''} ${isAr?V.ar:V.en}`; });
  document.querySelectorAll('[data-oc-vfilter]').forEach(sec => { const f = sec.dataset.ocVfilter; sec.hidden = f !== 'auto' && f !== v && isPreview(); filterCards(sec); });
}
function currentTexts(){ return [...document.querySelectorAll('.main-menu a, .oc-cat b, .s-product-card-content-title, h1')].map(e=>e.textContent); }
function resolveVertical(){
  const set = B.dataset.ocVertical;
  if (isPreview()) return demoV(); // preview runs on Salla's fashion demo store: never detect from its words
  return set && set !== 'auto' ? set : detect(currentTexts());
}

/* ---------- preview picker (white system) — only on demo/preview hosts or ?oc_preview=1 ---------- */
function isPreview(){
  const h = location.hostname, q = new URLSearchParams(location.search);
  // merchant-facing picker: Salla's own preview (theme.mode / salla.design) or an explicit ?oc_preview — never a live store
  // just because its domain happens to contain "demo" or "preview"
  return q.has('oc_preview') || B.dataset.ocMode === 'preview' || /(^|\.)salla\.design$/.test(h) || h === 'localhost' || !!window.salla?.config?.get?.('store.preview');
}
function buildPicker(){
  if (!isPreview() || document.querySelector('.oc-pk')) return;
  const counts = scores(currentTexts());
  const el = document.createElement('div'); el.className='oc-pk'; el.setAttribute('dir', isAr?'rtl':'ltr');
  el.innerHTML = `<button class="oc-pk__fab" aria-expanded="false"><span>${ICONS[B.dataset.ocV]||''}</span>${tr('نوع المتجر','Store type')}</button>
  <div class="oc-pk__sheet" role="dialog" aria-label="${tr('معاينة نوع المتجر','Preview store type')}">
    <header><b>${tr('معاينة حسب نوع المتجر','Preview by store type')}</b><small>${tr('اختر النوع ليتحول الثيم بالكامل — للمعاينة فقط','Pick a type to transform the whole theme — preview only')}</small></header>
    <div class="oc-pk__bar"><span>${tr('الكشف التلقائي','Auto-detect')}: <b>${isAr?VERTICALS[detect(currentTexts())].ar:VERTICALS[detect(currentTexts())].en}</b></span><button data-k="__auto">${tr('إعادة للتلقائي','Reset')}</button></div><div class="oc-pk__grid">${Object.entries(VERTICALS).map(([k,v])=>`<button data-k="${k}" class="${k===B.dataset.ocV?'is-on':''}" style="--a:${v.acc}"><i>${ICONS[k]}</i><b>${isAr?v.ar:v.en}</b><small>${counts[k]?counts[k]+' '+tr('مطابقة','matches'):tr('عرض النمط','skin only')}</small></button>`).join('')}</div>
  </div>`;
  const list=document.createElement('div'); list.className='oc-pk__list';
  list.innerHTML=`<label>${tr('النوع المختار','Selected type')}</label><select>${Object.entries(VERTICALS).map(([k,v])=>`<option value="${k}"${k===B.dataset.ocV?' selected':''}>${isAr?v.ar:v.en}</option>`).join('')}</select><label>${tr('لون التاجر (معاينة)','Merchant colour (preview)')}</label><div class="oc-pk__bg">${Object.entries(PALETTES).sort((a,b)=>a[1][5]<b[1][5]?-1:1).map(([k,p])=>`<button data-bg="${k}" style="--c:${p[2]}" title="${isAr?p[3]:p[4]}"></button>`).join('')}</div><label>${tr('مربعات التاجر الدائمة (معاينة)','Merchant colour squares (preview)')}</label><div class="oc-pk__sq"><label><input type="color" data-sq="skin" value="${B.style.getPropertyValue('--oc-skin').trim()||'#16161a'}"><span>${tr('لون الثيم','Theme colour')}</span></label><label><input type="color" data-sq="ink" value="${B.style.getPropertyValue('--oc-ink').trim()||'#d9b779'}"><span>${tr('الخطوط والنصوص والإضافات','Text, lines & extras')}</span></label><button data-sq-reset>${tr('إلغاء المربعات','Clear squares')}</button></div>`;
  (el.querySelector('.oc-pk__sheet')||el).appendChild(list);
  document.body.appendChild(el);
  list.querySelector('select').onchange=e=>el.querySelector(`.oc-pk__grid [data-k="${e.target.value}"]`)?.click();
  list.querySelectorAll('[data-bg]').forEach(b=>b.onclick=()=>{B.dataset.ocBg=b.dataset.bg;sessionStorage.setItem('oc_pbg',b.dataset.bg);});
  list.querySelectorAll('[data-sq]').forEach(i=>i.oninput=()=>{const k=i.dataset.sq;B.style.setProperty('--oc-'+k,i.value);B.dataset['oc'+(k==='skin'?'Skin':'Ink')]='1';sessionStorage.setItem('oc_p'+k,i.value);applySquares();});
  list.querySelector('[data-sq-reset]').onclick=()=>{['skin','ink'].forEach(k=>{B.dataset['oc'+(k==='skin'?'Skin':'Ink')]='0';sessionStorage.removeItem('oc_p'+k);});applySquares();};
  ['skin','ink'].forEach(k=>{const v=sessionStorage.getItem('oc_p'+k);if(v){B.style.setProperty('--oc-'+k,v);B.dataset['oc'+(k==='skin'?'Skin':'Ink')]='1';}});applySquares();
  if(sessionStorage.getItem('oc_pbg')) B.dataset.ocBg=sessionStorage.getItem('oc_pbg');
  const fab = el.querySelector('.oc-pk__fab');
  fab.onclick = () => { const o = el.classList.toggle('is-open'); fab.setAttribute('aria-expanded', o); };
  el.querySelectorAll('[data-k]').forEach(b => b.onclick = () => {
    const k = b.dataset.k==='__auto' ? detect(currentTexts()) : b.dataset.k; b.dataset.k==='__auto' ? sessionStorage.removeItem('oc_type') : sessionStorage.setItem('oc_type', k); applyVertical(k); B.classList.add('oc-swap'); setTimeout(()=>B.classList.remove('oc-swap'),600);
    el.querySelectorAll('[data-k]').forEach(x=>x.classList.toggle('is-on', x.dataset.k===k)); fab.querySelector('span').innerHTML = ICONS[k]; list.querySelector('select').value=k;
    document.documentElement.classList.add('oc-pre'); /* hide the fashion demo frame before the reload paints the new type */
    document.dispatchEvent(new CustomEvent('oc:type',{detail:k}));
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') el.classList.remove('is-open'); });
}

/* ---------- vertical-only sections: hide cards that don't match this vertical (fallback: show all) ---------- */
function filterCards(sec){
  /* preview already shows this type's own catalogue; hiding cards by keyword drops makeup / body / K-beauty / men's cards */
  if (B.classList.contains('oc-preview') || B.classList.contains('oc-demo')) return;
  const V = VERTICALS[sec.dataset.ocVfilter === 'auto' ? B.dataset.ocV : sec.dataset.ocVfilter]; if(!V) return;
  const cards = [...sec.querySelectorAll('custom-salla-product-card')];
  const hit = cards.filter(c => { const tx = norm(c.textContent); return V.kw.some(w => tx.includes(norm(w).trim())); });
  cards.forEach(c => c.style.display = hit.length && !hit.includes(c) ? 'none' : '');
  const tot = sec.querySelector('[data-oc-bundle-total]');
  // real sum of the shown products in the store currency — no invented discount
  if (tot) { const sum = (hit.length?hit:cards).reduce((n,c)=>n+(+(c.product?.price?.amount ?? c.product?.price ?? 0)||0),0); tot.textContent = sum ? `${tr('إجمالي الطقم','Kit total')} ${money(sum, window.ocStore?.sig?.currency || B.dataset.ocCur || 'SAR')}` : ''; }
}

/* ---------- smart product cards: trust ring + stock meter instead of stars/raw qty ---------- */
function decorate(card){
  if (!B.classList.contains('oc-smart') || card.querySelector('.oc-card-intel')) return;
  const p = card.product; const body = card.querySelector('.s-product-card-content'); if(!p || !body) return;
  card.querySelectorAll('salla-rating-stars, .s-product-card-rating').forEach(e=>e.remove());
  const stars = p.rating?.stars || 0, cnt = p.rating?.count || 0;
  // Bayesian trust: few reviews are pulled toward a neutral prior, so 5★ from 1 review < 4.8★ from 300.
  const trust = stars ? Math.round(((stars*cnt + 4.2*8)/(cnt+8))*20) : 0;
  const sold = p.sold_quantity || 0, demand = sold>200?96:sold>50?78:sold>10?52:sold?28:12;
  const out = p.is_out_of_stock, q = p.quantity;
  const stock = out ? 0 : (q == null ? 100 : q >= 50 ? 95 : q >= 20 ? 75 : q >= 6 ? 45 : 18);
  const verdict = out ? tr('نفد','Sold out') : stock>=90 ? tr('متوفر بثقة','In stock') : stock>=70 ? tr('توفر جيد','Good') : stock>=40 ? tr('الكمية تقل','Running low') : tr('آخر القطع','Last units');
  const div = document.createElement('div'); div.className='oc-card-intel';
  div.innerHTML = `<div class="oc-gauge" style="--v:${trust}"><svg viewBox="0 0 36 36"><circle class="t" cx="18" cy="18" r="15.9"/><circle class="v" cx="18" cy="18" r="15.9" pathLength="100"/></svg><b>${trust?trust+'%':'—'}</b></div>
  <div class="oc-meters"><div class="oc-meter ${stock<40&&stock>0?'is-low':''}"><span>${tr('المخزون','Stock')}<em>${verdict}</em></span><i style="--w:${stock}%"></i></div>
  <div class="oc-meter oc-meter--d"><span>${tr('الطلب','Demand')}<em>${demand>70?tr('رائج','Hot'):demand>40?tr('نشط','Active'):tr('هادئ','Calm')}</em></span><i style="--w:${demand}%"></i></div></div>`;
  if (stock>0 && stock<40) card.classList.add('oc-urgent');
  body.insertBefore(div, body.querySelector('.s-product-card-content-sub, .s-product-card-content-footer') || null);
  const badge = p.is_on_sale ? tr('عرض خاص','Deal') : (p.is_new || p.promotion?.title) ? (p.promotion?.title || tr('جديد','New')) : null;
  if (badge && !card.querySelector('.oc-badge')) { const s=document.createElement('span'); s.className='oc-badge'; s.textContent=badge; card.prepend(s); }
}

/* ---------- live category auto-bind from the merchant's real categories ---------- */
async function autoCats(){
  for (const grid of document.querySelectorAll('[data-oc-autocats="1"]')) {
    if (isPreview()) { // preview only: the fashion demo store's categories are swapped for the tech demo categories of the chosen type
      const D = demoPack(demoV()).cats.slice(0, +grid.dataset.limit || 8);
      grid.innerHTML = D.map(c => `<a class="oc-cat" href="#"><span class="oc-cat__ic">${ICONS[c.v] || ICONS.beauty}</span><b>${c.name}</b></a>`).join(''); continue;
    }
    try {
      const r = await salla.api.request('categories', {}, 'get'); const list = (r?.data || []).slice(0, +grid.dataset.limit || 8);
      grid.innerHTML = list.map(c => `<a class="oc-cat" href="${c.url}"><span class="oc-cat__ic" data-oc-icon="${c.name}"></span><b>${c.name}</b></a>`).join('');
    } catch(e) {
      const links = [...document.querySelectorAll('.main-menu > li > a')].slice(0, 8);
      grid.innerHTML = links.map(a => `<a class="oc-cat" href="${a.href}"><span class="oc-cat__ic" data-oc-icon="${a.textContent.trim()}"></span><b>${a.textContent.trim()}</b></a>`).join('');
    }
    iconize(grid);
  }
}
function iconize(root=document){ root.querySelectorAll('[data-oc-icon]').forEach(el => { if(!el.innerHTML) el.innerHTML = ICONS[detect([el.dataset.ocIcon])] || ICONS.beauty; }); }

/* ---------- smart quantity: pack-size chips drive the native salla-quantity-input ---------- */
function packs(){
  const qi = document.querySelector('.product-form salla-quantity-input, salla-quantity-input'); if(!qi || document.querySelector('.oc-packs')) return;
  const sizes = (B.dataset.ocPacks || '1,2,3,5').split(',').map(Number).filter(Boolean);
  const w = document.createElement('div'); w.className='oc-packs';
  w.innerHTML = sizes.map(n=>`<button type="button" data-n="${n}">${n===1?tr('قطعة','1 unit'):n+' '+tr('قطع','units')}</button>`).join('');
  qi.parentElement.insertBefore(w, qi);
  w.onclick = e => { const b = e.target.closest('button'); if(!b) return; const inp = qi.querySelector('input') || qi; inp.value = b.dataset.n; inp.dispatchEvent(new Event('change',{bubbles:true})); w.querySelectorAll('button').forEach(x=>x.classList.toggle('is-on',x===b)); };
}

/* mobile product page: the sticky cart bar takes the bottom edge, so every floating button (store-type picker, assistant,
   command centre) rides just above it (--oc-lift) and never covers quantity, add to cart or buy now */
function liftFloaters(){
  /* measured from the bar's own height (not its sliding position), so the buttons sit in their final place from the first frame */
  const lift = () => { const bar = document.querySelector('.is-sticky-product-bar .sticky-product-bar'), cs = bar && getComputedStyle(bar), h = cs && cs.position === 'fixed' && cs.display !== 'none' ? bar.offsetHeight : 0;
    B.style.setProperty('--oc-lift', h ? `${h + 8}px` : '0px'); B.classList.toggle('oc-lifted', !!h);
    B.classList.toggle('oc-bar-wait', !!h && !bar.querySelector('salla-add-product-button button')); }; // docked buttons wait for the bar's own buttons
  const bar0 = document.querySelector('.sticky-product-bar'); if (bar0) new MutationObserver(lift).observe(bar0, { childList: true, subtree: true });
  ['scroll', 'resize'].forEach(e => addEventListener(e, lift, { passive: true })); document.addEventListener('transitionend', lift); lift(); setTimeout(lift, 900); setTimeout(lift, 2500);
}
async function boot(){
  if(B.dataset.ocBg) B.dataset.ocBg=B.dataset.ocBg.replace(/^bg-/,'');
  customerColor(isAr); applySquares(); window.ocApplySquares=applySquares; B.classList.toggle('oc-preview', !!isPreview());
  try{ initDemo(); }catch(e){}
  try{ liftFloaters(); }catch(e){}
  try{ initBeauty(); }catch(e){} // independent of the store read below, so it never waits on it
  applyVertical(resolveVertical());
  try{ mountAddons(window.ocStore || null, isAr); }catch(e){} // panel exists before the store read, so tab clicks are not lost to a slow API
  let st=null; try{ st=await buildSmart(isAr); }catch(e){}
  try{ st=(await mountSections())||st; }catch(e){}
  try{ st=st||await brain(); }catch(e){}
  // live: if merchant left vertical on auto, the dominant type comes from the real store read
  applyVertical(isPreview()||B.dataset.ocVertical!=='auto'||!st ? resolveVertical() : st.main); buildPicker(); autoCats(); iconize(); packs();
  try{ mountAddons(st, isAr); }catch(e){}
  bindBrand(); document.addEventListener('oc:brand', bindBrand);
  document.querySelectorAll('custom-salla-product-card').forEach(decorate);
  let busy=false; const mo=new MutationObserver(() => { if(busy) return; busy=true; setTimeout(()=>{ mo.disconnect(); document.querySelectorAll('custom-salla-product-card').forEach(decorate); document.querySelectorAll('[data-oc-vfilter]').forEach(filterCards); bindBrand(); mo.takeRecords(); mo.observe(document.body,{childList:true,subtree:true}); busy=false; },120); });
  mo.observe(document.body, {childList:true, subtree:true});
}
document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', boot) : boot();
document.addEventListener('theme::ready', () => { document.querySelectorAll('custom-salla-product-card').forEach(decorate); });
