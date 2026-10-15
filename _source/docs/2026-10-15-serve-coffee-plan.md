# Serve Coffee & Goods Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. (Execution: native, chosen by default because tawan asked for no stops.)

**Goal:** Static one-page site for Serve Coffee & Goods with a seamless 1080p hero film, 3-depth parallax, and verified deploy.

**Architecture:** Plain `index.html` + `styles.css` + `main.js` + `media/`. Hero film rendered offline from a GLSL shader in headless Chromium, encoded with ffmpeg. Verification by Playwright scripts against a local server and the live URL.

**Tech Stack:** HTML/CSS/vanilla JS, Google Fonts (Fraunces, Inter), Playwright 1.56 (global), ffmpeg.

**Spec:** /mnt/project-files/serve-coffee/docs/2026-10-15-serve-coffee-design.md

## Global Constraints
- Facts only from spec "Facts allowed"; no prices, awards, history.
- Phone link `tel:+18174411400`; directions link `https://www.google.com/maps/dir/?api=1&destination=Serve+Coffee+%26+Goods,+328+Old+Annetta+Rd,+Aledo,+TX+76008`.
- Video: autoplay muted loop playsinline, poster, ≥1920×1080 master.
- Parallax: transform-only, 3 depths, off under prefers-reduced-motion.
- Total first-load weight excluding video < 300 KB.

## Review Focus
1. Reduced-motion user → no parallax transforms, video paused on poster. Test: Playwright with `reducedMotion: 'reduce'` asserts layer transform is none and `video.paused`.
2. iOS-style autoplay → `muted` + `playsinline` attributes present. Test: DOM attribute check.
3. Loop seam → first and last frames visually match. Test: ffmpeg SSIM between frame 0 and frame N ≥ 0.98.
4. 360px-wide phone → no horizontal scroll. Test: `scrollWidth <= innerWidth` at 360×740.
5. Links → every `tel:` and Maps link has exact values above. Test: DOM query asserts hrefs.

---

### Task 1: Hero film
**Files:** Create `build/film.html`, `build/render-film.mjs`, outputs `site/media/hero-1080.mp4`, `hero-1080.webm`, `hero-720.mp4`, `hero-poster.jpg`.
- [ ] Shader: domain-warped fbm in espresso/crema/milk colors, slow pour swirl, steam layer; time `t` maps to angle `2π·frame/N` and noise is sampled at `(cos,sin)` offsets so frame N == frame 0. N = 300 (10 s @ 30 fps).
- [ ] `render-film.mjs`: Playwright loads film.html at 1920×1080, calls `window.renderFrame(i)` and screenshots canvas for i in 0..N-1 to PNGs.
- [ ] Encode: x264 crf 20 preset slow `-movflags +faststart`, VP9 crf 34, 720p variant, poster = frame 0 JPEG q85.
- [ ] Verify loop seam SSIM (Review Focus 3) and inspect 3 frames visually; regenerate if banding or artefacts.

### Task 2: Brand assets
**Files:** `site/media/logo.svg`, `site/favicon.svg`, `site/apple-touch-icon.png`, illustration SVGs inline in HTML.
- [ ] Saucer-ring mark + "Serve" wordmark; favicon = mark on slate.

### Task 3: Page
**Files:** `site/index.html`, `site/styles.css`, `site/main.js`.
- [ ] Sections per spec Layout; copy per spec; reviews verbatim with `lang="th"`.
- [ ] `main.js`: `initParallax()` (rAF, `data-depth` 0.15/0.35/0.6, viewport-gated), `initReveal()`, `initVideo()` (pause on reduced motion / offscreen).
- [ ] Meta, OG, JSON-LD.

### Task 4: OG image + verification
**Files:** `build/verify.mjs`, `site/og.jpg`.
- [ ] Render og.jpg 1200×630 from a dedicated OG layout.
- [ ] `verify.mjs <url>` runs Review Focus 1, 2, 4, 5 plus: video `readyState>=2` and `currentTime` advancing, parallax layer transform changes after scroll, Lighthouse-style timing (LCP via PerformanceObserver), screenshots desktop + mobile.

### Task 5: Deploy
- [ ] Publish via Artifact with `site/` files; run `verify.mjs` against what's reachable; copy source to /mnt/project-files/serve-coffee/.
