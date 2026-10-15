import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import fs from 'fs'; import path from 'path';
const [,, out, n='360', only] = process.argv;
fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch({ args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] });
const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
p.on('console', m => console.log('console:', m.text())); p.on('pageerror', e => console.log('err:', e.message));
await p.goto('file://' + path.resolve('build/film.html') + '?n=' + n);
await p.waitForFunction('window.ready');
const frames = only ? only.split(',').map(Number) : [...Array(+n).keys()];
const t0 = Date.now();
for (const i of frames) {
  const d = await p.evaluate(i => window.renderFrame(i), i);
  fs.writeFileSync(path.join(out, `f${String(i).padStart(4,'0')}.png`), Buffer.from(d.split(',')[1], 'base64'));
  if (i % 30 === 0) console.log('frame', i, ((Date.now()-t0)/1000).toFixed(1)+'s');
}
await b.close();
