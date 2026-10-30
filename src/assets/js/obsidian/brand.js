/* Store-name binding: every name shown on/over theme imagery follows the live store name.
   Source order: salla.config store.name → body[data-oc-store] (Twig store.name) → header logo alt/text. Never a fixed brand. */
const B=document.body;
export function storeName(){
  let n=''; try{ n=window.salla?.config?.get?.('store.name')||''; }catch(e){}
  n=n||B.dataset.ocStore||document.querySelector('.navbar-brand img,.logo img')?.alt||'';
  const ar=(document.documentElement.lang||'ar').startsWith('ar');
  return String(n).trim() || (ar?'هانغول':'Hangul'); // default brand only when the store has no name
}
export function bindBrand(){
  const n=storeName();
  B.style.setProperty('--oc-store',JSON.stringify(n));
  document.querySelectorAll('[data-oc-store-name]').forEach(e=>{ if(e.textContent!==n) e.textContent=n; });
  document.querySelectorAll('.oc-head[data-k="OBSIDIAN"],.oc-head[data-k-brand]').forEach(h=>{ h.dataset.kBrand=1; h.dataset.k=n.toUpperCase(); });
  const wm=sel=>document.querySelectorAll(sel).forEach(w=>{ if(!w.querySelector(':scope>.oc-brand')){ const s=document.createElement('span'); s.className='oc-brand'; s.setAttribute('aria-hidden','true'); s.dataset.ocStoreName=''; s.textContent=n; w.appendChild(s);} });
  wm('.oc-sbanner'); wm('custom-salla-product-card .s-product-card-image'); wm('.oc-hero__media');
}
