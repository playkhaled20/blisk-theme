const { chromium } = require('playwright');
const HDR = `<header class="store-header aneeq-hdr" id="aneeq-hdr"><div class="aneeq-hdr-in"><nav class="aneeq-hdr-nav"></nav><a class="aneeq-hdr-logo navbar-brand">BAHAA</a><div class="aneeq-hdr-tools"><a class="aneeq-hdr-btn aneeq-hdr-menu mburger" href="#mobile-menu"><svg viewBox="0 0 24 24" width="24"><path d="M4 8h16M8 14h12" stroke="#000"/></svg></a></div></div></header>`;
(async () => { const b = await chromium.launch();
  for (const [w, h] of [[390, 844], [1440, 900]]) for (const banner of ['none', 'fixed', 'flow']) {
    const p = await b.newPage({ viewport: { width: w, height: h } }); const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.addInitScript(([HDR, banner]) => addEventListener('DOMContentLoaded', () => { document.body.insertAdjacentHTML('afterbegin', HDR);
      if (banner === 'fixed') { document.body.insertAdjacentHTML('afterbegin', '<div id="mnt" style="position:fixed;top:0;inset-inline:0;height:44px;background:#c00;color:#fff;z-index:99999">المتجر تحت الصيانة</div>'); document.getElementById('aneeq-hdr').style.top = '44px'; }
      if (banner === 'flow') { document.body.insertAdjacentHTML('afterbegin', '<div id="mnt" style="position:sticky;top:0;height:44px;background:#c00;color:#fff;z-index:99999">المتجر تحت الصيانة</div>'); document.getElementById('aneeq-hdr').style.top = '44px'; } }), [HDR, banner]);
    await p.goto('http://localhost:8766/index.html?preview=true'); await p.waitForTimeout(3500);
    const at = async y => { await p.evaluate(y => scrollTo(0, y), y); await p.waitForTimeout(900); return p.evaluate(() => { const f = document.querySelector('.bahaa-demo-fab'); if (!f) return 'absent';
      const r = f.getBoundingClientRect(), m = document.querySelector('.mburger').getBoundingClientRect(), hd = document.getElementById('aneeq-hdr').getBoundingClientRect(), bn = document.getElementById('mnt')?.getBoundingClientRect();
      const ov = (a, c) => !!c && !(a.right <= c.left || c.right <= a.left || a.bottom <= c.top || c.bottom <= a.top);
      const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      return { fab: [Math.round(r.top), Math.round(r.bottom)], hdrBottom: Math.round(hd.bottom), gap: Math.round(r.top - Math.max(hd.bottom, bn ? bn.bottom : 0)), overBurger: ov(r, m), overBanner: ov(r, bn), clickable: !!top && f.contains(top) || top === f }; }); };
    const res = { y0: await at(0), y2500: await at(2500), up: await at(1200) };
    await p.click('.bahaa-demo-fab'); await p.waitForTimeout(500);
    res.panel = await p.evaluate(() => { const c = document.querySelector('.bahaa-demo-card').getBoundingClientRect(), f = document.querySelector('.bahaa-demo-fab').getBoundingClientRect(); return { down: c.top >= f.bottom - 1, inView: c.bottom <= innerHeight && c.top >= 0 }; });
    if (banner === 'fixed') await p.screenshot({ path: `bh-${w}.png` });
    console.log(w, banner, JSON.stringify(res), 'errs=' + errs.length); await p.close(); }
  await b.close(); })();
