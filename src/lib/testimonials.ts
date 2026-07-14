/**
 * Testimonials - the small content source behind the featured client quote at
 * the close of the Commissions section. Keeping the copy here (rather than
 * inline in the component) means proof can grow without a redesign: add another
 * entry and the section can shift from one confident featured quote to a row or
 * a soft rotation. Today there is a single voice, so it renders as one quote.
 *
 * A plain typed array is enough for text-only quotes; if these ever need images
 * or per-quote metadata they can graduate to an astro:content collection like
 * the gallery, without changing how Commissions consumes them.
 */
export interface Testimonial {
  /** The quote, verbatim. */
  quote: string;
  /** Who said it, shown in the attribution line. */
  name: string;
}

export const testimonials: Testimonial[] = [
  {
    quote:
      "I've used Bee Magical several times for both pet portraits, personal portraits and even original artwork. The attention to detail, use of color and texture Bee uses for portraits is fantastic and gives the finished art a very real look! Her original artworks are also spectacular. The site used for shipping assures the product arrives quickly and is packaged perfectly. Pricing is very competitive, I highly recommend.",
    name: 'Shani',
  },
];
