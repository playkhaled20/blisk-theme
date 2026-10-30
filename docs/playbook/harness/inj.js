// usage: node inj.js <url> <width> <out.png> [evalfile]
const { chromium } = require('playwright'); const fs = require('fs'); const PUB = '/home/user/hangul-theme/public';
(async () => { const [url, w, out] = process.argv.slice(2); const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: +w, height: 844 } }); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.route('https://oc.local/**', r => { const f = PUB + new URL(r.request().url()).pathname; r.fulfill({ body: fs.readFileSync(f), contentType: f.endsWith('.css') ? 'text/css' : f.endsWith('.js') ? 'application/javascript' : 'image/webp' }); });
  await p.addInitScript(() => addEventListener('DOMContentLoaded', () => { const B = document.body; B.classList.add('oc', 'is-sticky-product-bar'); B.dataset.ocImg = 'https://oc.local/images/oc/electronics-featured.webp'; B.dataset.ocMode = 'preview';
    const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'https://oc.local/obsidian.css'; document.head.appendChild(l); const s = document.createElement('script'); s.src = 'https://oc.local/obsidian.js'; document.head.appendChild(s);
    const ai = document.createElement('div'); ai.className = 'oc-ai'; ai.innerHTML = '<button type="button" class="oc-ai__fab">✦ إضافاتي الذكية</button>'; B.appendChild(ai); const cc = document.createElement('div'); cc.className = 'oc-cc'; cc.innerHTML = '<button class="oc-cc__fab"><i></i></button>'; B.appendChild(cc); }));
  await p.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 }); await p.waitForTimeout(9000);
  if (process.argv[5]) console.log(JSON.stringify(await p.evaluate(fs.readFileSync(process.argv[5], 'utf8')), null, 1));
  if (out) await p.screenshot({ path: out }); console.log('errs', errs.slice(0, 3)); await b.close(); })();
