// usage: node build/verify.mjs <url> <outdir>
import { chromium, devices } from '/opt/node-tools/node_modules/playwright/index.mjs';
import fs from 'fs';
const [,, url, out='verify'] = process.argv; fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
const results = []; const ok = (name, pass, info='') => { results.push({ name, pass, info }); console.log((pass ? 'PASS ' : 'FAIL ') + name + (info ? '  ' + info : '')); };
const DIR = 'https://www.google.com/maps/dir/?api=1&destination=Serve+Coffee+%26+Goods%2C+328+Old+Annetta+Rd%2C+Aledo%2C+TX+76008';

for (const [label, ctxOpts] of [['desktop', { viewport: { width: 1440, height: 900 } }], ['mobile', { ...devices['iPhone 13'], defaultBrowserType: undefined }]]) {
  const ctx = await b.newContext(ctxOpts); const p = await ctx.newPage();
  const errors = []; p.on('pageerror', e => errors.push(e.message));
  const t0 = Date.now();
  await p.goto(url, { waitUntil: 'load' });
  const lcp = await p.evaluate(() => new Promise(r => { let v = 0; new PerformanceObserver(l => { for (const e of l.getEntries()) v = e.startTime; }).observe({ type: 'largest-contentful-paint', buffered: true }); setTimeout(() => r(v), 1500); }));
  const nav = await p.evaluate(() => { const n = performance.getEntriesByType('navigation')[0]; return { dcl: Math.round(n.domContentLoadedEventEnd), load: Math.round(n.loadEventEnd), bytes: performance.getEntriesByType('resource').filter(r => !/\.(mp4|webm)/.test(r.name)).reduce((a, r) => a + (r.transferSize || r.encodedBodySize || 0), 0) + (n.transferSize || n.encodedBodySize || 0) }; });
  ok(`${label}: LCP < 2500ms`, lcp > 0 && lcp < 2500, `LCP ${Math.round(lcp)}ms, DCL ${nav.dcl}ms, load ${nav.load}ms, non-video bytes ${Math.round(nav.bytes/1024)}KB`);
  const v = await p.evaluate(async () => { const v = document.getElementById('heroVideo'); const a = v.currentTime; await new Promise(r => setTimeout(r, 2000)); return { muted: v.muted, loop: v.loop, autoplay: v.autoplay, inline: v.playsInline, poster: v.poster, src: v.currentSrc, rs: v.readyState, w: v.videoWidth, h: v.videoHeight, a, b: v.currentTime, paused: v.paused }; });
  ok(`${label}: video plays muted/loop/inline with poster`, v.muted && v.loop && v.autoplay && v.inline && !!v.poster && v.rs >= 2 && v.b > v.a && !v.paused, `${v.src.split('/').pop()} ${v.w}x${v.h} t ${v.a.toFixed(2)}→${v.b.toFixed(2)}`);
  const before = await p.evaluate(() => [...document.querySelectorAll('[data-depth]')].map(e => e.style.transform));
  await p.evaluate(() => window.scrollTo(0, 400)); await p.waitForTimeout(300);
  const mid = await p.evaluate(() => [...document.querySelectorAll('[data-depth]')].slice(0, 2).map(e => e.style.transform));
  await p.evaluate(() => document.getElementById('menu').scrollIntoView()); await p.waitForTimeout(300);
  const after = await p.evaluate(() => [...document.querySelectorAll('[data-depth]')].map(e => ({ d: e.dataset.depth, t: e.style.transform })));
  const depths = new Set(after.map(x => x.d)); 
  ok(`${label}: parallax moves layers at 3+ depths`, mid.some((t, i) => t && t !== before[i]) && depths.has('0.15') && depths.has('0.35') && depths.has('0.6') && after.some(x => x.d === '0.6' && /translate3d/.test(x.t)), `hero ${before[0]} → ${mid[0]}`);
  const sw = await p.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: window.innerWidth }));
  ok(`${label}: no horizontal scroll`, sw.sw <= sw.iw, `${sw.sw} <= ${sw.iw}`);
  const links = await p.evaluate(() => ({ tel: [...document.querySelectorAll('a[href^="tel:"]')].map(a => a.getAttribute('href')), dir: [...document.querySelectorAll('a[href*="google.com/maps/dir"]')].map(a => a.href) }));
  ok(`${label}: tel links exact`, links.tel.length >= 4 && links.tel.every(h => h === 'tel:+18174411400'), `${links.tel.length} links`);
  ok(`${label}: directions links exact`, links.dir.length >= 3 && links.dir.every(h => h === DIR), `${links.dir.length} links`);
  ok(`${label}: no JS errors`, errors.length === 0, errors.join('; '));
  await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(500);
  await p.screenshot({ path: `${out}/${label}-top.png` });
  await p.screenshot({ path: `${out}/${label}-full.png`, fullPage: true });
  await ctx.close();
}
// reduced motion
const ctx = await b.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' }); const p = await ctx.newPage();
await p.goto(url, { waitUntil: 'load' }); await p.waitForTimeout(800);
await p.evaluate(() => window.scrollTo(0, 1200)); await p.waitForTimeout(300);
const rm = await p.evaluate(() => ({ paused: document.getElementById('heroVideo').paused, t: [...document.querySelectorAll('[data-depth]')].map(e => e.style.transform).filter(Boolean) }));
ok('reduced motion: video paused, no parallax transforms', rm.paused && rm.t.length === 0, JSON.stringify(rm));
// SEO
const seo = await p.evaluate(() => ({ title: document.title, desc: document.querySelector('meta[name=description]')?.content, og: document.querySelector('meta[property="og:image"]')?.content, ld: !!document.querySelector('script[type="application/ld+json"]'), h1: document.querySelectorAll('h1').length }));
ok('SEO: title, description, og:image, JSON-LD, single h1', seo.title && seo.desc && seo.og && seo.ld && seo.h1 === 1, JSON.stringify(seo));
await b.close();
fs.writeFileSync(`${out}/results.json`, JSON.stringify(results, null, 2));
process.exit(results.every(r => r.pass) ? 0 : 1);
