const { chromium } = require('playwright'); const fs = require('fs'), path = require('path'); const PUB = '/home/user/aneeq-theme/public';
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 390, height: 844 } }); const errs = []; p.on('pageerror', e => errs.push(e.message));
  const serve = (r, f) => fs.existsSync(f) ? r.fulfill({ body: fs.readFileSync(f), contentType: f.endsWith('.css') ? 'text/css' : 'application/javascript' }) : r.continue();
  await p.route(/cdn\.assets\.salla\.network\/themes\/1247874246\//, r => serve(r, path.join(PUB, path.basename(new URL(r.request().url()).pathname))));
  await p.route('https://bh.local/**', r => serve(r, path.join(PUB, new URL(r.request().url()).pathname)));
  await p.addInitScript(() => addEventListener('DOMContentLoaded', () => { document.body.classList.add('is-sticky-product-bar'); (document.querySelector('.container--product-details') || document.body).setAttribute('data-aneeq-pdp', '');
    const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'https://bh.local/features.css'; document.head.appendChild(l);
    const f = document.createElement('button'); f.className = 'aneeq-sty-fab'; f.innerHTML = '<span class=av></span><span class=l>المساعد</span>'; document.body.appendChild(f); }));
  const t0 = Date.now(); await p.goto('https://salla.design/dev-mzjydsfu2leo9nzt/x/p1615885378?preview=true', { waitUntil: 'domcontentloaded', timeout: 60000 });
  for (const ms of [700, 1900, 6000]) { const wait = ms - (Date.now() - t0); if (wait > 0) await p.waitForTimeout(wait);
    console.log(ms, JSON.stringify(await p.evaluate(() => { const R = s => document.querySelector(s)?.getBoundingClientRect(); const f = R('.aneeq-sty-fab'), bar = R('.sticky-product-bar'); const ctr = [...document.querySelectorAll('.sticky-product-bar salla-quantity-input, .sticky-product-bar .s-button-btn, .sticky-product-bar salla-mini-checkout-widget')].map(e => e.getBoundingClientRect());
      const ov = (a, b) => !(a.right <= b.left || b.right <= a.left || a.bottom <= b.top || b.bottom <= a.top); const btn = document.querySelector('.sticky-product-bar salla-add-product-button');
      return { fab: f && [Math.round(f.left), Math.round(f.top), Math.round(f.width)], barTop: Math.round(bar.top), barH: Math.round(bar.height), btnOp: btn && getComputedStyle(btn).opacity, insideBar: f && f.top >= bar.top, hitsControls: f && ctr.some(c => ov(f, c)), cut: [...document.querySelectorAll('.sticky-product-bar .s-button-text, .s-add-product-button-mini-checkout-content')].filter(e => e.scrollWidth > e.clientWidth + 1).length, padB: getComputedStyle(document.body).paddingBottom }; })));
    await p.screenshot({ path: `out4/bdock-${ms}.png` }); }
  console.log('errs', errs.slice(0, 2)); await b.close(); })();
