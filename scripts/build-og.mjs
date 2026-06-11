/*
 * build-og.mjs - one-off generator for the Open Graph share image.
 *
 * Produces public/og.jpg (1200 x 630), the card shown when the site is shared.
 * The painting "Ultraviolet" is the hero: placed uncropped at the full safe
 * height of the card, lit from within by a soft bloom sampled from its own
 * colours and set in the site's celestial starfield. The "Bee Magical"
 * wordmark (Macondo Swash Caps) and tagline (Tsukimi Rounded) sit quietly on
 * the left so the art dominates.
 *
 * Everything is composited with sharp (librsvg + pango are bundled, so SVG
 * gradients, real Gaussian blur, screen/lighten blends, and brand-font text
 * all render natively, no browser needed). The whole card is built at 2x and
 * downscaled to 1200 x 630 for crisp edges and to avoid gradient banding.
 *
 * Run:  node scripts/build-og.mjs
 *
 * The brand fonts are not part of the repo; this script downloads them once
 * into .ogbuild/fonts (gitignored) and points fontconfig at them. Network is
 * only needed the first time.
 */
import { promises as fs } from 'node:fs';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BUILD = path.join(ROOT, '.ogbuild');
const FONTDIR = path.join(BUILD, 'fonts');
const SRC_UV = path.join(ROOT, 'src/assets/art/ultraviolet-hr.png');
const BEE = path.join(ROOT, 'public/logo/bee-magical-bee.png');
const OUT = path.join(ROOT, 'public/og.jpg');

// Brand fonts, fetched from the Google Fonts repo (OFL licensed).
const FONTS = {
  'MacondoSwashCaps-Regular.ttf':
    'https://github.com/google/fonts/raw/main/ofl/macondoswashcaps/MacondoSwashCaps-Regular.ttf',
  'TsukimiRounded-Regular.ttf':
    'https://github.com/google/fonts/raw/main/ofl/tsukimirounded/TsukimiRounded-Regular.ttf',
  'TsukimiRounded-Medium.ttf':
    'https://github.com/google/fonts/raw/main/ofl/tsukimirounded/TsukimiRounded-Medium.ttf',
};

async function ensureFonts() {
  await fs.mkdir(FONTDIR, { recursive: true });
  await fs.mkdir(path.join(BUILD, 'fc-cache'), { recursive: true });
  for (const [name, url] of Object.entries(FONTS)) {
    const dest = path.join(FONTDIR, name);
    if (existsSync(dest)) continue;
    process.stdout.write(`fetching font ${name}... `);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`failed to download ${name}: ${res.status}`);
    await fs.writeFile(dest, Buffer.from(await res.arrayBuffer()));
    console.log('done');
  }
  // fontconfig file so librsvg/pango can resolve the families by name
  const conf = `<?xml version="1.0"?>
<!DOCTYPE fontconfig SYSTEM "fonts.dtd">
<fontconfig>
  <dir>${FONTDIR.replace(/\\/g, '/')}</dir>
  <cachedir>${path.join(BUILD, 'fc-cache').replace(/\\/g, '/')}</cachedir>
</fontconfig>`;
  await fs.writeFile(path.join(BUILD, 'fonts.conf'), conf);
  // must be set before sharp (and thus fontconfig) initialises
  process.env.FONTCONFIG_FILE = path.join(BUILD, 'fonts.conf');
}

await ensureFonts();
const { default: sharp } = await import('sharp');

// Place a (possibly oversized or off-canvas) layer onto a full PW x PH
// transparent canvas, clipping any overflow. sharp's composite needs every
// layer to fit the base, so blooms that bleed past the edges are flattened
// here first, then screen-blended whole.
async function onCanvas(buf, left, top) {
  const m = await sharp(buf).metadata();
  const cropL = Math.max(0, -left);
  const cropT = Math.max(0, -top);
  const destL = Math.max(0, left);
  const destT = Math.max(0, top);
  const visW = Math.min(m.width - cropL, PW - destL);
  const visH = Math.min(m.height - cropT, PH - destT);
  const canvas = sharp({
    create: { width: PW, height: PH, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  });
  if (visW <= 0 || visH <= 0) return canvas.png().toBuffer();
  const region = await sharp(buf)
    .extract({ left: cropL, top: cropT, width: visW, height: visH })
    .toBuffer();
  return canvas.composite([{ input: region, left: destL, top: destT }]).png().toBuffer();
}

// ---------------------------------------------------------------------------
// geometry. Authored in final 1x coordinates, rendered at 2x then downscaled.
// ---------------------------------------------------------------------------
const S = 2;
const W = 1200;
const H = 630;
const PW = W * S;
const PH = H * S;

// painting: full safe height on the right, uncropped, native aspect preserved
const UV_W = 2100;
const UV_H = 2700;
const ASPECT = UV_W / UV_H;
const artH = 556; // 1x; ~37px breathing room top and bottom
const artW = Math.round(artH * ASPECT);
const artRight = 74; // margin from the right edge
const artX = W - artRight - artW; // left edge of the painting
const artY = Math.round((H - artH) / 2);
const artCx = artX + artW / 2;
const artCy = artY + artH / 2;

const px = (v) => Math.round(v * S);

// ---------------------------------------------------------------------------
// 1. base sky: deep field near #0A1A1F with a faint violet/teal nebula wash
//    and a built-in vignette, so the card reads as the night-sky brand.
// ---------------------------------------------------------------------------
const baseSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${PW}" height="${PH}">
  <defs>
    <radialGradient id="sky" cx="62%" cy="42%" r="85%">
      <stop offset="0%" stop-color="#0c2329"/>
      <stop offset="45%" stop-color="#081a20"/>
      <stop offset="100%" stop-color="#040d12"/>
    </radialGradient>
    <radialGradient id="violet" cx="30%" cy="74%" r="55%">
      <stop offset="0%" stop-color="#3a1a66" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="#3a1a66" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="teal" cx="18%" cy="20%" r="50%">
      <stop offset="0%" stop-color="#0e5563" stop-opacity="0.42"/>
      <stop offset="100%" stop-color="#0e5563" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="vig" cx="58%" cy="46%" r="75%">
      <stop offset="55%" stop-color="#03050e" stop-opacity="0"/>
      <stop offset="100%" stop-color="#03050e" stop-opacity="0.62"/>
    </radialGradient>
  </defs>
  <rect width="${PW}" height="${PH}" fill="url(#sky)"/>
  <rect width="${PW}" height="${PH}" fill="url(#violet)"/>
  <rect width="${PW}" height="${PH}" fill="url(#teal)"/>
</svg>`;

// vignette is a separate top layer so it darkens stars and bloom too
const vignetteSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${PW}" height="${PH}">
  <defs>
    <radialGradient id="vig" cx="${(artCx / W) * 100}%" cy="48%" r="78%">
      <stop offset="50%" stop-color="#03050e" stop-opacity="0"/>
      <stop offset="100%" stop-color="#03050e" stop-opacity="0.6"/>
    </radialGradient>
  </defs>
  <rect width="${PW}" height="${PH}" fill="url(#vig)"/>
</svg>`;

// ---------------------------------------------------------------------------
// 2. bloom sampled from the painting's own colours, bleeding outward into the
//    dark field with a real large-radius blur and a screen blend. Two layers:
//    a tight inner halo hugging the piece, and a wide diffuse wash pulled
//    toward the centre so the light spills left across the card.
// ---------------------------------------------------------------------------
const uvBuf = await fs.readFile(SRC_UV);

async function bloom(sampleW, finalW, sigma, sat) {
  const finalH = Math.round((finalW / ASPECT) * (UV_H / UV_W) * ASPECT); // = finalW/ASPECT
  const h = Math.round(finalW / ASPECT);
  return sharp(uvBuf)
    .resize({ width: sampleW }) // collapse detail to colour
    .modulate({ saturation: sat })
    .resize({ width: px(finalW), height: px(h), fit: 'fill' })
    .blur(px(sigma))
    .png()
    .toBuffer();
}

const innerW = artW * 1.6;
const innerBuf = await bloom(170, innerW, 30, 1.5);
const innerH = Math.round(innerW / ASPECT);
const innerX = px(artCx - innerW / 2);
const innerY = px(artCy - innerH / 2);

const wideW = artW * 2.3;
const wideBuf = await bloom(64, wideW, 60, 1.65);
const wideH = Math.round(wideW / ASPECT);
const wideX = px(artCx - artW * 0.26 - wideW / 2); // nudged left so light spills into the field
const wideY = px(artCy - wideH / 2);

// ---------------------------------------------------------------------------
// 3. starfield: varied stars (size, brightness, cool-white/cream/cyan/violet)
//    with soft radial glow on the bright ones, plus a few short constellation
//    lines and dots linking the piece like a star on a map. Drawn in 1x
//    coords inside a viewBox so it scales crisply to 2x.
// ---------------------------------------------------------------------------
function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rnd = mulberry32(20260610); // fixed seed: deterministic card

const TINTS = [
  '#ffffff', '#eaf3ff', '#fdf6e3', '#cfe9ff', '#bcd4ff', '#d9c2ff', '#a9ecff',
];
const stars = [];
function star(x, y, r, op, tint, glow) {
  stars.push({ x, y, r, op, tint, glow });
}
// dense faint background layer
for (let i = 0; i < 150; i++) {
  star(rnd() * W, rnd() * H, 0.35 + rnd() * 0.7, 0.18 + rnd() * 0.4,
    rnd() > 0.85 ? TINTS[3 + ((rnd() * 4) | 0)] : TINTS[(rnd() * 3) | 0], false);
}
// fewer brighter foreground stars, some glowing and tinted
for (let i = 0; i < 26; i++) {
  const bright = rnd() > 0.45;
  star(rnd() * W, rnd() * H, 1.0 + rnd() * 1.7, 0.6 + rnd() * 0.4,
    TINTS[(rnd() * TINTS.length) | 0], bright);
}

// a small map of nearby stars near the painting, joined by short faint lines
const mapPts = [
  { x: artX - 38, y: artY + 70 },
  { x: artX - 96, y: artY + 150 },
  { x: artX - 150, y: artY + 96 },
  { x: artX - 210, y: artY + 196 },
  { x: artX + 30, y: artY + 250 },
  { x: artCx, y: artY - 14 },
];
const mapLines = [
  [5, 0], [0, 1], [1, 2], [1, 4], [2, 3],
];

const starEls = stars
  .map((s) => {
    const x = +s.x.toFixed(1), y = +s.y.toFixed(1), r = +s.r.toFixed(2);
    const core = `<circle cx="${x}" cy="${y}" r="${r}" fill="${s.tint}" opacity="${s.op.toFixed(2)}"/>`;
    if (!s.glow) return core;
    const gr = (r * 4.5).toFixed(2);
    return `<circle cx="${x}" cy="${y}" r="${gr}" fill="${s.tint}" opacity="${(s.op * 0.18).toFixed(2)}" filter="url(#soft)"/>${core}`;
  })
  .join('');

const mapDotEls = mapPts
  .map((p) => `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="1.7" fill="#d7f4ff" opacity="0.9" filter="url(#soft)"/><circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="1.1" fill="#ffffff" opacity="0.95"/>`)
  .join('');

const mapLineEls = mapLines
  .map(([a, b]) => {
    const p = mapPts[a], q = mapPts[b];
    const id = `lg${a}${b}`;
    return `<defs><linearGradient id="${id}" x1="${p.x.toFixed(1)}" y1="${p.y.toFixed(1)}" x2="${q.x.toFixed(1)}" y2="${q.y.toFixed(1)}" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#aee9ff" stop-opacity="0.55"/>
      <stop offset="50%" stop-color="#aee9ff" stop-opacity="0.12"/>
      <stop offset="100%" stop-color="#aee9ff" stop-opacity="0.55"/>
    </linearGradient></defs>
    <line x1="${p.x.toFixed(1)}" y1="${p.y.toFixed(1)}" x2="${q.x.toFixed(1)}" y2="${q.y.toFixed(1)}" stroke="url(#${id})" stroke-width="0.7"/>`;
  })
  .join('');

const starSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${PW}" height="${PH}" viewBox="0 0 ${W} ${H}">
  <defs>
    <filter id="soft" x="-200%" y="-200%" width="500%" height="500%">
      <feGaussianBlur stdDeviation="1.4"/>
    </filter>
  </defs>
  ${mapLineEls}
  ${starEls}
  ${mapDotEls}
</svg>`;

// ---------------------------------------------------------------------------
// 4. the painting itself, sharp-resized to the safe height, uncropped.
// ---------------------------------------------------------------------------
// The painting is itself a cosmic portrait on a black starfield, so rather
// than sit it on the card as a hard rectangle we feather its outer edge to
// transparent. The black margins melt into the field, the colour bloom shows
// through the soft border, and the piece reads as lit from within. The feather
// is a thin band on pure-black edge pixels, so the art and signature stay
// complete and uncropped.
const feather = 26; // 1x px
const maskSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${px(artW)}" height="${px(artH)}">
  <rect x="${px(feather)}" y="${px(feather)}" width="${px(artW - feather * 2)}" height="${px(artH - feather * 2)}" rx="${px(8)}" fill="#ffffff"/>
</svg>`;
const maskBuf = await sharp(Buffer.from(maskSvg)).blur(px(feather * 0.72)).png().toBuffer();
const artBuf = await sharp(uvBuf)
  .resize({ width: px(artW), height: px(artH), fit: 'fill' })
  .ensureAlpha()
  .composite([{ input: maskBuf, blend: 'dest-in' }])
  .png()
  .toBuffer();

// ---------------------------------------------------------------------------
// 5. wordmark + tagline on the left, understated, within the safe area.
// ---------------------------------------------------------------------------
const textX = 92;
const wordSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${PW}" height="${PH}" viewBox="0 0 ${W} ${H}">
  <defs>
    <filter id="tglow" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="6" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <linearGradient id="ink" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fdfaf0"/>
      <stop offset="100%" stop-color="#e7dcc0"/>
    </linearGradient>
  </defs>
  <text x="${textX}" y="316" font-family="Macondo Swash Caps" font-size="92"
        fill="url(#ink)" filter="url(#tglow)" opacity="0.97">Bee Magical</text>
  <text x="${textX + 4}" y="372" font-family="Tsukimi Rounded" font-weight="500"
        font-size="25" letter-spacing="0.4" fill="#bcd9e6" opacity="0.92">Space and aurora paintings,</text>
  <text x="${textX + 4}" y="406" font-family="Tsukimi Rounded" font-weight="500"
        font-size="25" letter-spacing="0.4" fill="#bcd9e6" opacity="0.92">plus portrait and pet commissions.</text>
</svg>`;

// small bee mascot tucked just above the wordmark's first letter
const beeSize = 58;
const beeResized = await sharp(BEE).resize({ width: px(beeSize) }).png().toBuffer();
const beeMeta = await sharp(beeResized).metadata();
const beeX = px(textX - 6);
const beeY = px(196);

// ---------------------------------------------------------------------------
// composite, downscale, encode.
// ---------------------------------------------------------------------------
const base = sharp(Buffer.from(baseSvg));

const layers = [
  { input: await onCanvas(wideBuf, wideX, wideY), blend: 'screen', left: 0, top: 0 },
  { input: await onCanvas(innerBuf, innerX, innerY), blend: 'screen', left: 0, top: 0 },
  { input: await sharp(Buffer.from(starSvg)).png().toBuffer(), blend: 'screen', left: 0, top: 0 },
  { input: artBuf, blend: 'over', left: px(artX), top: px(artY) },
  { input: await sharp(Buffer.from(vignetteSvg)).png().toBuffer(), blend: 'over', left: 0, top: 0 },
  { input: beeResized, blend: 'over', left: beeX, top: beeY },
  { input: await sharp(Buffer.from(wordSvg)).png().toBuffer(), blend: 'over', left: 0, top: 0 },
];

const composed = await base.composite(layers).png().toBuffer();

await sharp(composed)
  .resize(W, H, { kernel: 'lanczos3' })
  .jpeg({ quality: 85, mozjpeg: true, chromaSubsampling: '4:4:4' })
  .toFile(OUT);

const { size } = await fs.stat(OUT);
console.log(`wrote ${path.relative(ROOT, OUT)}  ${(size / 1024).toFixed(0)} KB`);
