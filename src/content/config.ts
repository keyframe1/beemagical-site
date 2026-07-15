import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * The "art" collection is the single source of truth for the gallery.
 * The Constellation, Featured, and Lightbox components map over this, so
 * adding a painting never touches component code: drop an image in
 * src/assets/art, add a JSON entry here, done.
 *
 * To swap a placeholder for a real photo, point `image` at the new file.
 * It renders through astro:assets <Image> with width, height, and alt.
 */
const art = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/art' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      medium: z.string(),
      // Optional: footage-extracted pieces do not always carry these.
      dimensions: z.string().optional(),
      year: z.number().optional(),
      status: z.enum(['available', 'sold', 'prints-only']).default('available'),
      // Direct link to this piece's own Ko-fi shop listing, selling the
      // original painting. Only set it from a verified per-listing URL; these
      // are opaque ids and cannot be derived from the title. Omit it and the
      // piece keeps the plain Inquire flow.
      kofiUrl: z.string().url().optional(),
      // The same pattern, for the listing that sells a print of a digital
      // piece rather than an original. Set it only on digital work, only from
      // a verified per-listing URL, and add more of them here as Hannah lists
      // them. Omit it and the piece keeps the plain Inquire flow.
      // No price lives in this file: the Ko-fi listing is the one place a
      // number is quoted, so it can never go stale here.
      kofiPrintUrl: z.string().url().optional(),
      image: image(),
      note: z.string(),
      // Constellation position, as a percent of the map (0-100).
      x: z.number().min(0).max(100),
      y: z.number().min(0).max(100),
      // Slugs of other works this one is joined to in the constellation.
      links: z.array(z.string()).default([]),
    }),
});

export const collections = { art };
