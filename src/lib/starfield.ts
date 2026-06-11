/**
 * starfield.ts - a deterministic, static premium star field as inline SVG.
 *
 * Built once at render time (no client cost) and shared by the gallery
 * constellations and the lightbox backdrop so both read as the same night sky:
 *   - a very subtle nebula wash in deep violet and teal, so the field is never
 *     flat black;
 *   - a dense layer of tiny faint background stars for depth;
 *   - fewer, brighter foreground stars, some with a soft radial glow, tinted
 *     cool white, cream, and the occasional cyan or violet;
 *   - short connecting lines between genuinely nearby stars, forming little
 *     clusters that fade along their length (brightest at the star points,
 *     faint in the middle), never spanning the whole field.
 *
 * A handful of stars carry the `sf-tw` class for an occasional, gentle twinkle;
 * that animation pauses with the tab and freezes under reduced motion (see
 * global.css). Everything is seeded, so a given field is stable build to build.
 */

export interface StarfieldOpts {
  /** viewBox width; larger gives finer subpixel placement. */
  w?: number;
  /** viewBox height. */
  h?: number;
  /** seed so each field is distinct but stable. */
  seed?: number;
  /** tiny background stars. */
  bg?: number;
  /** brighter foreground stars. */
  fg?: number;
  /** unique id prefix to keep gradient ids from colliding on a page. */
  id?: string;
  /** how strongly to connect nearby stars into clusters (0 disables). */
  link?: boolean;
  /** class applied to the root <svg>. */
  class?: string;
  /** opacity multiplier for the whole field. */
  opacity?: number;
}

function mulberry32(a: number) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const TINTS = ['#ffffff', '#eaf3ff', '#fdf6e3', '#cfe9ff', '#bcd4ff', '#d9c2ff', '#a9ecff'];

export function starfield(opts: StarfieldOpts = {}): string {
  const {
    w = 1200,
    h = 675,
    seed = 7,
    bg = 150,
    fg = 26,
    id = 'sf',
    link = true,
    class: klass = 'starfield',
    opacity = 1,
  } = opts;

  const rnd = mulberry32(seed);
  const r2 = (n: number) => +n.toFixed(2);
  const r1 = (n: number) => +n.toFixed(1);

  // ---- nebula wash: a couple of soft clouds so the field is not flat ----
  const nebula = `
    <radialGradient id="${id}-nv" cx="28%" cy="72%" r="55%">
      <stop offset="0%" stop-color="#3a1f6b" stop-opacity="${0.5 * opacity}"/>
      <stop offset="100%" stop-color="#3a1f6b" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="${id}-nt" cx="76%" cy="22%" r="52%">
      <stop offset="0%" stop-color="#0f5564" stop-opacity="${0.4 * opacity}"/>
      <stop offset="100%" stop-color="#0f5564" stop-opacity="0"/>
    </radialGradient>`;
  const nebRects = `
    <rect width="${w}" height="${h}" fill="url(#${id}-nv)"/>
    <rect width="${w}" height="${h}" fill="url(#${id}-nt)"/>`;

  // ---- foreground stars first, so we can cluster-link the bright ones ----
  type S = { x: number; y: number; r: number; o: number; t: string; glow: boolean; tw: boolean };
  const fgStars: S[] = [];
  for (let i = 0; i < fg; i++) {
    fgStars.push({
      x: rnd() * w,
      y: rnd() * h,
      r: 1.0 + rnd() * 1.7, // small points, in viewBox units
      o: (0.6 + rnd() * 0.4) * opacity,
      t: TINTS[(rnd() * TINTS.length) | 0],
      glow: rnd() > 0.45,
      tw: rnd() > 0.82,
    });
  }

  // ---- short cluster links: join each star to a near neighbour only ----
  const lines: string[] = [];
  if (link) {
    const maxLen = Math.min(w, h) * 0.2; // short: never spans the field
    const used = new Set<string>();
    for (let i = 0; i < fgStars.length; i++) {
      // nearest neighbour
      let best = -1;
      let bestD = Infinity;
      for (let j = 0; j < fgStars.length; j++) {
        if (j === i) continue;
        const d = Math.hypot(fgStars[i].x - fgStars[j].x, fgStars[i].y - fgStars[j].y);
        if (d < bestD) {
          bestD = d;
          best = j;
        }
      }
      if (best < 0 || bestD > maxLen) continue;
      const key = i < best ? `${i}-${best}` : `${best}-${i}`;
      if (used.has(key)) continue;
      used.add(key);
      const p = fgStars[i];
      const q = fgStars[best];
      const gid = `${id}-l${key}`;
      lines.push(
        `<linearGradient id="${gid}" x1="${r1(p.x)}" y1="${r1(p.y)}" x2="${r1(q.x)}" y2="${r1(q.y)}" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#aee9ff" stop-opacity="${0.5 * opacity}"/>
          <stop offset="50%" stop-color="#aee9ff" stop-opacity="${0.08 * opacity}"/>
          <stop offset="100%" stop-color="#aee9ff" stop-opacity="${0.5 * opacity}"/>
        </linearGradient>`
      );
      lines.push(
        `<line x1="${r1(p.x)}" y1="${r1(p.y)}" x2="${r1(q.x)}" y2="${r1(q.y)}" stroke="url(#${gid})" stroke-width="0.6"/>`
      );
    }
  }
  const lineDefs = lines.filter((_, i) => i % 2 === 0).join('');
  const lineEls = lines.filter((_, i) => i % 2 === 1).join('');

  // ---- dense faint background stars ----
  let bgEls = '';
  for (let i = 0; i < bg; i++) {
    const x = r1(rnd() * w);
    const y = r1(rnd() * h);
    const r = r2(0.35 + rnd() * 0.7);
    const o = r2((0.18 + rnd() * 0.4) * opacity);
    const t = rnd() > 0.85 ? TINTS[3 + ((rnd() * 4) | 0)] : TINTS[(rnd() * 3) | 0];
    bgEls += `<circle cx="${x}" cy="${y}" r="${r}" fill="${t}" opacity="${o}"/>`;
  }

  // ---- foreground stars: core plus a soft glow on the bright ones ----
  let fgEls = '';
  for (const s of fgStars) {
    const x = r1(s.x);
    const y = r1(s.y);
    const cls = s.tw ? ' class="sf-tw"' : '';
    if (s.glow) {
      fgEls += `<circle cx="${x}" cy="${y}" r="${r2(s.r * 3.4)}" fill="${s.t}" opacity="${r2(s.o * 0.14)}" filter="url(#${id}-soft)"/>`;
    }
    fgEls += `<circle cx="${x}" cy="${y}" r="${r2(s.r)}" fill="${s.t}" opacity="${r2(s.o)}"${cls}/>`;
  }

  return `<svg class="${klass}" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
  <defs>
    ${nebula}
    <filter id="${id}-soft" x="-300%" y="-300%" width="700%" height="700%"><feGaussianBlur stdDeviation="1.6"/></filter>
    ${lineDefs}
  </defs>
  ${nebRects}
  ${lineEls}
  ${bgEls}
  ${fgEls}
</svg>`;
}
