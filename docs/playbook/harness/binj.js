const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path'); const PUB = '/home/user/aneeq-theme/public';
(async () => { const [url, w, out] = process.argv.slice(2); const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: +w, height: 844 }, isMobile: +w < 500, hasTouch: +w < 500, userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1' });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.route(/cdn\.assets\.salla\.network\/themes\/1247874246\//, r => { const f = path.join(PUB, path.basename(new URL(r.request().url()).pathname)); if (fs.existsSync(f)) r.fulfill({ body: fs.readFileSync(f), contentType: f.endsWith('.css') ? 'text/css' : 'application/javascript' }); else r.continue(); });
  await p.addInitScript(() => addEventListener('DOMContentLoaded', () => { document.body.classList.add('is-sticky-product-bar', 'aneeq-maison'); const m = document.querySelector('.container--product-details') || document.querySelector('main'); if (m && /\/p\d+/.test(location.pathname)) m.setAttribute('data-aneeq-pdp', '');
    window.DeviceOrientationEvent = window.DeviceOrientationEvent || function () {}; DeviceOrientationEvent.requestPermission = () => Promise.resolve('granted'); }));
  const t0 = Date.now(); await p.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  for (const ms of [700, 1900, 5000]) { await p.waitForTimeout(ms - (Date.now() - t0) > 0 ? ms - (Date.now() - t0) : 0);
    const r = await p.evaluate(() => { const R = s => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(), cs = getComputedStyle(e); return r.width ? { t: Math.round(r.top), b: Math.round(r.bottom), l: Math.round(r.left), r: Math.round(r.right), op: cs.opacity } : null; };
      const bar = R('.sticky-product-bar'), fab = R('.aneeq-sty-fab'), btn = R('.sticky-product-bar salla-add-product-button'), q = R('.sticky-product-bar salla-quantity-input'), pill = R('.aneeq-glint-pill.show');
      const ov = (a, b) => a && b && !(a.r <= b.l || b.r <= a.l || a.b <= b.t || b.b <= a.t);
      return { bar, btnOp: btn && btn.op, fab, fabHitsBtn: ov(fab, btn), fabHitsQty: ov(fab, q), fabAboveBar: fab && bar ? fab.b <= bar.t : null, pill, lift: getComputedStyle(document.body).getPropertyValue('--aneeq-fab-lift') }; });
    console.log(ms, JSON.stringify(r)); await p.screenshot({ path: `${out}-${ms}.png` }); }
  console.log('errs', errs.slice(0, 3)); await b.close(); })();
