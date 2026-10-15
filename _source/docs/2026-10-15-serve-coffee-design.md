# Serve Coffee & Goods — one-page site design

Path: architectural (new project). tawan asked to proceed without questions, so approval gates were waived and defaults are recorded here.

## Intent
A standalone one-page site for a small-town coffee shop in Aledo, TX, aimed at locals and people passing through: find it, see what they serve, call, get directions. Success = fast on phones, accurate (only facts from the Maps listing), distinctive.

## Facts allowed (source: Maps screenshot + pasted text)
Name; 4.6 rating from 154 reviews; $1–10 per person; coffee shop; dine-in, takeout (no delivery — screenshot shows ✗); wheelchair-accessible icon; 328 Old Annetta Rd, Aledo, TX 76008; closes 5:00 PM (other days/opening time unknown → shown as "Open today until 5 PM · call for full hours"); +1 817-441-1400; popular items list. No prices, history, awards, owner names.

## Reviews
English originals could not be found, so quotes are the provided text verbatim (Google's Thai translation), lang="th", credited to reviewer + "Local Guide", with a note that the original is English on Google. Ximena's is truncated in the source and kept with its ellipsis.

## Visual identity
Taken from the interior photo: slate-teal walls, honey wood, cream, espresso. Accent: rust (Texas clay).
- Colors: --slate #24393C, --slate-2 #2F4A4E, --cream #F4ECDF, --paper #FBF7F0, --espresso #2A1D17, --rust #B8562F, --honey #C99A5B.
- Type: Fraunces (display, soft optical serif, variable) + Inter (body). Google Fonts.
- Logo: "Serve" wordmark with a saucer-ring mark (cup seen from above, handle forming a tick). SVG; favicon from the mark.
- Imagery: custom SVG illustrations (cup, beans, cinnamon roll, avocado toast, chai leaf) in line style, plus grain texture. No stock, no placeholders.

## Hero video
Goal: bespoke cinematic 1080p loop, autoplay muted, poster frame. No AI video model is reachable from this session (no API keys; Vercel/Replicate/fal/Runway/Luma/OpenAI blocked by network policy). Fallback that is real, not a placeholder: an original procedurally rendered film — top-down macro of milk folding into espresso with drifting steam, rendered in a GLSL shader whose time runs on a circle so frame N = frame 0 (seamless). Rendered at 1920×1080 30fps, H.264 MP4 + VP9 WebM, poster from frame 0. Disclosed to tawan as not model-generated; swap-in path documented.

## Layout (single page)
1. Header: logo, anchor nav, Call button.
2. Hero: video bg, slate overlay, headline "Good coffee, served on Old Annetta Road.", rating chip, Directions + Call CTAs.
3. About: neutral copy from category + review themes (cozy, indoor + outdoor seating, kid-friendly yard, quick friendly service).
4. Menu: popular items grouped Coffee / Tea & lattes / Kitchen / Bakery, no prices; dine-in & takeout tags.
5. Reviews: 3 cards.
6. Visit: hours, address (Maps directions link), phone, accessibility, plus code; static map illustration linking to Maps.
7. Footer: contact, tel link, directions.

## Motion
Parallax with 3 depths (back texture/illustrations 0.15, mid 0.35, fore 0.6) via one rAF loop writing translate3d; only when in viewport; disabled under prefers-reduced-motion (video also paused, poster shown). Reveal-on-scroll with IntersectionObserver.

## Performance/SEO
Single HTML + CSS + small JS, no framework. Video preload metadata, poster, mobile gets 720p source via media query sources. Title, description, canonical, OG/Twitter image (1200×630 rendered from the page), JSON-LD CafeOrCoffeeShop with address, phone, geo-less, aggregateRating omitted (Google disallows self-serving rating markup).

## Deploy
Target: memorable URL like serve-coffee-aledo. Hosts reachable: none of Vercel/Netlify/Cloudflare/Surge; GitHub repo creation is out of this session's scope. Live deploy via the Artifact host (private claude.ai link, shareable) and a ready-to-upload folder; memorable domain needs tawan's hosting account.
