/* Background palettes. Merchant pick = twilight setting oc_bg (permanent, live, body[data-oc-bg]).
   Customer layer = page-only override in localStorage, ONLY when merchant enables oc_customer_color. Never writes theme settings. */
export const PALETTES = {
  graphite:['#0b0b0d','#141417','#25211a','جرافيت','Graphite','d'],
  midnight:['#070a14','#0f1424','#1a2240','منتصف الليل','Midnight','d'],
  onyx:['#000000','#0c0c0c','#1c1c1c','أونيكس','Onyx','d'],
  titanium:['#16181b','#202328','#3a3e45','تيتانيوم','Titanium','d'],
  espresso:['#120b07','#1c130d','#3a2617','إسبريسو','Espresso','d'],
  navy:['#06101f','#0d1a30','#16325a','كحلي','Navy','d'],
  emerald:['#04110c','#0a1d16','#123b2c','زمردي ليلي','Emerald night','d'],
  plum:['#12081a','#1d1028','#3a1d4f','برقوقي','Plum','d'],
  wine:['#16070b','#240d13','#4a1726','عنابي','Wine','d'],
  ocean:['#03141a','#082430','#0e4456','محيطي','Ocean','d'],
  ivory:['#fbf8f1','#ffffff','#efe3c8','عاجي','Ivory','l'],
  sand:['#f4ede1','#fbf7ef','#e3cfa8','رملي','Sand','l'],
  pearl:['#f5f5f3','#ffffff','#e2e2de','لؤلؤي','Pearl','l'],
  softblue:['#eef3f9','#ffffff','#cfdcee','أزرق ناعم','Soft blue','l'],
  mint:['#eef6f1','#ffffff','#cfe6d8','نعناعي','Mint','l'],
  blush:['#faf0ee','#ffffff','#efd2cb','وردي فاتح','Blush','l'],
  lavender:['#f3f0f9','#ffffff','#ddd3ee','لافندر','Lavender','l'],
  cloud:['#f2f4f6','#ffffff','#d9dee4','سحابي','Cloud','l']
};
const KEY='oc_ubg';
export function customerColor(isAr){
  const B=document.body; if(B.dataset.ocCc!=='1'){ localStorage.removeItem(KEY); delete B.dataset.ocUbg; return; }
  const saved=localStorage.getItem(KEY); if(saved && PALETTES[saved]) B.dataset.ocUbg=saved;
  if(document.querySelector('.oc-cc')) return;
  const el=document.createElement('div'); el.className='oc-cc'; el.dir=isAr?'rtl':'ltr';
  el.innerHTML=`<button class="oc-cc__fab" aria-expanded="false" title="${isAr?'لون الصفحة':'Page colour'}"><i></i></button><div class="oc-cc__pop" role="dialog"><b>${isAr?'اختر لون صفحتك':'Pick your page colour'}</b><small>${isAr?'يُحفظ في متصفحك فقط':'Saved in your browser only'}</small>${['d','l'].map(m=>`<em class="oc-cc__g">${m==='d'?(isAr?'داكن':'Dark'):(isAr?'فاتح':'Light')}</em><div class="oc-cc__sw">${Object.entries(PALETTES).filter(([,p])=>p[5]===m).map(([k,p])=>`<button data-c="${k}" style="--c:${p[2]};--c2:${p[0]}" title="${isAr?p[3]:p[4]}"></button>`).join('')}</div>`).join('')}<button class="oc-cc__reset" data-c="">${isAr?'لون المتجر الأصلي':'Store default'}</button></div>`;
  B.appendChild(el); const fab=el.querySelector('.oc-cc__fab');
  const mark=()=>el.querySelectorAll('[data-c]').forEach(b=>b.classList.toggle('is-on',b.dataset.c===(B.dataset.ocUbg||'')));
  fab.onclick=()=>fab.setAttribute('aria-expanded',el.classList.toggle('is-open'));
  el.querySelectorAll('[data-c]').forEach(b=>b.onclick=()=>{const c=b.dataset.c; if(c){B.dataset.ocUbg=c;localStorage.setItem(KEY,c);}else{delete B.dataset.ocUbg;localStorage.removeItem(KEY);} mark(); window.ocApplySquares&&window.ocApplySquares();});
  mark();
}
