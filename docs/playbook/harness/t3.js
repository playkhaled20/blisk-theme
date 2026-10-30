const { chromium } = require('playwright');
const TYPES = ['electronics','phones','watches','computers','gaming','audio','digital_cards','smarthome','cameras','accessories','software'];
const F = /(فستان|فساتين|بلوز|بلايز|عباي|جاكيت|بنطلون|بناطيل|تنور|تنانير|أزياء|ملابس|المقاس|تخفيضات)/;
(async () => { const b = await chromium.launch(); let bad = 0;
  for (const t of TYPES) for (const w of [390, 1440]) {
    const p = await b.newPage({ viewport: { width: w, height: 844 } }); const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.goto(`http://localhost:8765/dev-abc/home.html?preview=true&oc_type=${t}`); await p.waitForTimeout(2500);
    const r = await p.evaluate(F => { const vis = e => !!e.getClientRects().length && getComputedStyle(e).display !== 'none';
      const cards = [...document.querySelectorAll('.s-product-card-entry')].filter(vis);
      const names = cards.map(c => c.querySelector('.s-product-card-content-title').textContent.trim()), imgs = cards.map(c => c.querySelector('img').src.split('/').pop());
      const perSec = [...document.querySelectorAll('section')].map(s => [...s.querySelectorAll('.s-product-card-entry')].filter(vis).map(c => c.querySelector('img').src.split('/').pop()));
      const dupImg = perSec.some(a => new Set(a).size !== a.length);
      const pairs = new Map(); let mismatch = 0; cards.forEach((c, i) => { const k = imgs[i]; if (pairs.has(k) && pairs.get(k) !== names[i]) mismatch++; pairs.set(k, names[i]); });
      const links = [...new Set(cards.map(c => c.querySelector('a').href.replace(/oc_p=\d+/, 'oc_p=N')))];
      return { menu: [...document.querySelectorAll('.main-menu > li')].filter(vis).map(l => l.textContent.trim()).join('·'), domMenuFashion: [...document.querySelectorAll('.main-menu li')].filter(l => /تخفيضات|الجاكيتات|فستان/.test(l.textContent)).length,
        logo: document.querySelector('.oc-demo-logo')?.textContent, logoImg: vis(document.querySelector('.navbar-brand img')), n: cards.length, dupImg, mismatch, links,
        fashion: (document.body.innerText.match(new RegExp('.{0,12}' + F + '.{0,12}', 'g')) || []).slice(0, 3) }; }, F.source);
    const ok = !r.domMenuFashion && r.logo && !r.logoImg && !r.dupImg && !r.mismatch && !r.fashion.length && r.links.length === 1 && r.links[0].startsWith('http://localhost:8765/dev-abc/p/dress.html?preview=true&oc_type=' + t) && !errs.length;
    if (!ok) bad++; console.log(ok ? 'OK ' : 'BAD', t, w, JSON.stringify(r), errs.join(';'));
    await p.screenshot({ path: `out3/home-${t}-${w}.png`, fullPage: true });
    if (w === 390 || ['software', 'cameras', 'phones'].includes(t)) {
      const want = await p.evaluate(() => { const c = [...document.querySelectorAll('.s-product-card-entry')][2]; return { n: c.querySelector('.s-product-card-content-title').textContent.trim(), i: c.querySelector('img').src.split('/').pop() }; });
      await p.click('.s-product-card-entry >> nth=2 >> a.__never', { timeout: 1 }).catch(() => {});
      await Promise.all([p.waitForNavigation(), p.evaluate(() => [...document.querySelectorAll('.s-product-card-entry')][2].querySelector('h3 a').click())]); await p.waitForTimeout(2500);
      const q = await p.evaluate(F => { const vis = e => !!e && !!e.getClientRects().length && getComputedStyle(e).display !== 'none'; const bar = document.querySelector('.sticky-product-bar');
        return { url: location.href.replace(location.origin, ''), h1: document.querySelector('h1').textContent, img: [...new Set([...document.querySelectorAll('.details-slider img')].map(i => i.src.split('/').pop()))].join(','), crumb: document.querySelector('salla-breadcrumb').textContent.replace(/\s+/g, ' ').trim(),
          opts: vis(document.querySelector('salla-product-options')), price: document.querySelector('[data-testid=store-product-price] p').textContent, logo: document.querySelector('.oc-demo-logo')?.textContent, barBg: getComputedStyle(bar).backgroundColor, barPos: getComputedStyle(bar).position,
          fashion: (document.body.innerText.match(new RegExp('.{0,12}' + F + '.{0,12}', 'g')) || []).slice(0, 3) }; }, F.source);
      const ok2 = q.h1 === want.n && q.img === want.i && !q.opts && q.logo && !q.fashion.length && q.crumb.endsWith(want.n);
      if (!ok2) bad++; console.log(ok2 ? '  PDP OK ' : '  PDP BAD', t, w, JSON.stringify(q));
      if (w === 390) { await p.evaluate(() => { const g = document.querySelector('.oc-intel'); window.scrollTo(0, g.getBoundingClientRect().top + scrollY - 844 + 200); }); await p.waitForTimeout(400); await p.screenshot({ path: `out3/pdp-${t}-390.png` }); }
    }
    await p.close(); }
  console.log('BAD total', bad); await b.close(); })();
