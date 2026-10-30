const { chromium } = require('playwright');
(async () => { const b = await chromium.launch({ args: ['--allow-file-access-from-files'] });
  for (const t of ['software', 'cameras', 'phones']) { const p = await b.newPage({ viewport: { width: 390, height: 844 } }); const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.goto(`file://${process.argv[2]}menu.html?oc_preview=1&oc_type=${t}`); await p.waitForTimeout(3500);
    const r = await p.evaluate(() => { const vis = e => !!e.getClientRects().length && getComputedStyle(e).display !== 'none';
      return { menu: [...document.querySelectorAll('.main-menu > li')].filter(vis).map(l => l.querySelector(':scope > a').textContent.trim()), logoImgVisible: vis(document.querySelector('.navbar-brand img')), wordmark: document.querySelector('.oc-demo-logo')?.textContent,
        cards: [...document.querySelectorAll('.s-product-card-entry')].slice(0, 8).map(c => c.querySelector('.s-product-card-content-title').textContent.trim() + ' => ' + c.querySelector('img').src.split('/').pop()) }; });
    console.log(t, JSON.stringify(r, null, 0), 'errs=' + errs.length); await p.screenshot({ path: `menu-${t}.png` }); await p.close(); }
  await b.close(); })();
