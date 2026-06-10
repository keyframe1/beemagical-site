/**
 * video-client.ts - one tiny policy for every decorative video on the page.
 *
 * Rules, in order:
 * - prefers-reduced-motion: never autoplay; the poster stays.
 * - A video plays only while it is on screen (IntersectionObserver) and the
 *   tab is visible (visibilitychange pauses everything).
 * - Videos in the 'cards' group are exclusive: starting one pauses the rest
 *   of the group, so at most one process clip runs at a time. The 'ambient'
 *   group (hero, about) is background texture and is left alone.
 */

const reduce =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

type Managed = {
  el: HTMLVideoElement;
  group: string;
  inView: boolean;
};

const managed: Managed[] = [];
let wired = false;

function tryPlay(m: Managed) {
  if (reduce || document.hidden || !m.inView) return;
  if (m.group === 'cards') {
    for (const other of managed) {
      if (other !== m && other.group === 'cards' && !other.el.paused) other.el.pause();
    }
  }
  m.el.play().catch(() => {
    /* autoplay can be blocked; the poster is already showing */
  });
}

function wireDocument() {
  if (wired) return;
  wired = true;
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      for (const m of managed) m.el.pause();
    } else {
      for (const m of managed) if (m.inView) tryPlay(m);
    }
  });
}

export function manageVideo(el: HTMLVideoElement, opts: { group?: string } = {}) {
  if (reduce) return; // posters only, never play
  const m: Managed = { el, group: opts.group ?? 'ambient', inView: false };
  managed.push(m);
  wireDocument();

  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        m.inView = e.isIntersecting;
        if (e.isIntersecting) tryPlay(m);
        else el.pause();
      }
    },
    { threshold: 0.2 }
  );
  io.observe(el);

  // hover gives a card its turn immediately (and steals it from siblings)
  if (m.group === 'cards') {
    el.closest('.com-card')?.addEventListener('mouseenter', () => tryPlay(m));
  }
}
