import { getCollection, type CollectionEntry } from 'astro:content';
import { KOFI_COMMISSIONS } from './links';

export type Art = CollectionEntry<'art'>;
export type ArtData = Art['data'];

/** One call to action: where it goes, what it says, what a screen reader hears. */
export type Cta = { href: string; label: string; aria: string };

/**
 * One canonical, stable ordering for the whole gallery so the Constellation
 * nodes, the Lightbox prev/next, and Featured all agree on indices.
 */
export async function getArt(): Promise<Art[]> {
  const all = await getCollection('art');
  return all.sort((a, b) => a.id.localeCompare(b.id));
}

export const FEATURED_SLUG = 'luna';

/**
 * The calls to action a piece carries, shared by the Featured spotlight and the
 * Lightbox so both always offer the same thing for the same piece.
 *
 * `buy` links straight to this piece's own Ko-fi listing, and only exists when
 * there is something real to sell:
 *   - an acrylic original still available, with its own listing (kofiUrl)
 *   - a print of a digital piece that has a print listing (kofiPrintUrl)
 * The two never overlap: an acrylic sells the painting itself, a digital piece
 * only ever sells a print. The label says which, so nobody follows a print link
 * expecting to receive the original. A piece with no listing has no buy button,
 * never an empty one, and a sold original is never offered for sale even if a
 * listing URL is on file.
 *
 * `commission` always points at Ko-fi commissions, since asking about any piece
 * means asking for something made. It leads alone on a piece with nothing
 * listed, and steps back to the secondary option when `buy` is present: beside
 * a print it invites the same thing made new, beside an original it stays the
 * plain Inquire the acrylics have always had.
 *
 * No price appears in either label. The Ko-fi listing quotes the number.
 */
export function ctasFor(d: ArtData): { buy: Cta | null; commission: Cta } {
  const isAcrylic = /^acrylic/i.test(d.medium);
  let buy: Cta | null = null;

  if (isAcrylic) {
    if (d.kofiUrl && d.status === 'available') {
      buy = { href: d.kofiUrl, label: 'Buy on Ko-fi', aria: `Buy ${d.title} on Ko-fi` };
    }
  } else if (d.kofiPrintUrl) {
    buy = {
      href: d.kofiPrintUrl,
      label: 'Buy a print on Ko-fi',
      aria: `Buy a print of ${d.title} on Ko-fi`,
    };
  }

  const commission: Cta =
    buy && !isAcrylic
      ? {
          href: KOFI_COMMISSIONS,
          label: 'Commission your own',
          aria: `Commission your own piece like ${d.title}`,
        }
      : { href: KOFI_COMMISSIONS, label: 'Inquire', aria: `Inquire about ${d.title}` };

  return { buy, commission };
}
