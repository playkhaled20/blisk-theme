/* Live smart binding: reads the merchant's real store (categories API → menus → product names → store info)
   and builds ONE section per real beauty category (2→2, 5→5, 15→15). Never needs a pre-picked vertical. */
import { VERTICALS } from './verticals';
import { brain } from './brain';
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const MODES=['featured','bestsellers','bundle'];
export function img(v,i){ const b=document.body.dataset.ocImg||''; return b.replace(/[^/]*\.webp(\?.*)?$/, `${VERTICALS[v]?v:'beauty'}-${MODES[i%3]}.webp$1`); }
/* the store read lives in brain.js (one cached read shared by every section and add-on) */
export const readStore = brain;
export async function buildSmart(isAr){
  const hosts=document.querySelectorAll('[data-oc-smart]'); if(!hosts.length) return null;
  const st=await readStore();
  hosts.forEach(h=>{
    const max=+h.dataset.max||15, lim=+h.dataset.limit||8; const list=st.cats.slice(0,max);
    if(!list.length){ h.hidden=true; return; }
    const seen={};
    h.innerHTML=list.map(c=>{ const i=seen[c.v]=(seen[c.v]??-1)+1; const V=VERTICALS[c.v];
      return `<section class="s-block oc-products oc-vsec oc-smart-sec container" data-oc-v="${c.v}" style="--oc-v-acc:${document.body.dataset.ocInk==='1'?'var(--oc-ink)':V.acc}">
      <a class="oc-sbanner" href="${esc(c.url||'#')}"><img loading="lazy" src="${esc(c.img||img(c.v,i))}" alt="${esc(c.name)}" width="480" height="360"><span><small>${isAr?V.ar:V.en}</small><b>${esc(c.name)}</b>${c.sub.length?`<em>${esc(c.sub.slice(0,4).join(' · '))}</em>`:''}</span></a>
      ${c.id?`<salla-products-list source="categories" source-value="[${+c.id}]" limit="${lim}" product-card-component="custom-salla-product-card"></salla-products-list>`:''}</section>`; }).join('');
    h.dataset.count=list.length;
  });
  return st;
}
