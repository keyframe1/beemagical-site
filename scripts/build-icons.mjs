/*
 * build-icons.mjs - one-off generator for the favicon / app-icon set.
 *
 * Source: src/assets/brand/bee-moon.png, Hannah's high-resolution bee-and-moon
 * logo mark. The art is bright glow work (a magenta bee cradled by a glowing
 * crescent moon with cyan sparkles) painted on a solid BLACK field rather than
 * true transparency, so dropped onto a light browser tab or bookmark bar it
 * would read as a dark box. This script knocks that field out cleanly: each
 * pixel's alpha is derived from its brightness (value = max(R,G,B)) with a soft
 * ramp, so the field goes fully transparent, the glow feathers out, and the lit
 * mark keeps its colour. The knocked-out mark is trimmed to its content,
 * centred on a square with a little breathing room, and written at every size
 * the site needs.
 *
 * Outputs (public/):
 *   favicon-16.png, favicon-32.png, favicon-48.png   tab + bookmark icons
 *   apple-touch-icon.png (180)                        iOS home screen
 *   icon-192.png, icon-512.png                        web app manifest
 *   logo/bee-magical-bee-moon.png (512)               in-page mark (footer)
 *
 * Every output keeps its transparency, so the mark floats free of any dark box.
 *
 * Run:  node scripts/build-icons.mjs
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'src/assets/brand/bee-moon.png');
const PUB = path.join(ROOT, 'public');

// ---------------------------------------------------------------------------
// 1. knock the black field out to transparency.
//    alpha ramps from 0 at or below `LO` brightness to full at or above `HI`,
//    so the solid field (near 0) vanishes while the lit mark and a soft rim of
//    its glow survive. value = max(R,G,B) keeps the cool cyan moon and wings
//    from being under-weighted the way a luma mix would.
// ---------------------------------------------------------------------------
const LO = 16; // value <= this is pure field -> transparent
const HI = 56; // value >= this is solid mark  -> opaque

const { data, info } = await sharp(SRC).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width, height, channels } = info;

let minX = width, minY = height, maxX = -1, maxY = -1;
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const i = (y * width + x) * channels;
    const v = Math.max(data[i], data[i + 1], data[i + 2]);
    let a = (v - LO) / (HI - LO);
    a = a < 0 ? 0 : a > 1 ? 1 : a;
    const alpha = Math.round(a * data[i + 3]); // honour any existing alpha
    data[i + 3] = alpha;
    // bound on clearly-visible pixels so the trim hugs the lit mark, not the
    // faint outermost glow
    if (alpha > 32) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
}
if (maxX < 0) throw new Error('knockout removed the whole image; check LO/HI');

const knocked = await sharp(data, { raw: { width, height, channels } }).png().toBuffer();

// ---------------------------------------------------------------------------
// 2. trim to content, then centre on a square canvas with a small margin so
//    the mark never touches the icon edge.
// ---------------------------------------------------------------------------
const bw = maxX - minX + 1;
const bh = maxY - minY + 1;
const cropped = await sharp(knocked)
  .extract({ left: minX, top: minY, width: bw, height: bh })
  .toBuffer();

const side = Math.round(Math.max(bw, bh) * 1.14); // ~6% margin on the long side
const master = await sharp({
  create: { width: side, height: side, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
})
  .composite([{ input: cropped, gravity: 'center' }])
  .png()
  .toBuffer();

// ---------------------------------------------------------------------------
// 3. emit every size. Transparent throughout, lanczos downscale, max zlib.
// ---------------------------------------------------------------------------
const transparent = { r: 0, g: 0, b: 0, alpha: 0 };
const sizes = [
  ['favicon-16.png', 16],
  ['favicon-32.png', 32],
  ['favicon-48.png', 48],
  ['apple-touch-icon.png', 180],
  ['icon-192.png', 192],
  ['icon-512.png', 512],
  ['logo/bee-magical-bee-moon.png', 512],
];

for (const [name, px] of sizes) {
  const dest = path.join(PUB, name);
  await sharp(master)
    .resize(px, px, { fit: 'contain', background: transparent, kernel: 'lanczos3' })
    .png({ compressionLevel: 9 })
    .toFile(dest);
  const { size } = await fs.stat(dest);
  console.log(`wrote public/${name}  ${px}x${px}  ${(size / 1024).toFixed(1)} KB`);
}
