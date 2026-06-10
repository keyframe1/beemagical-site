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
      dimensions: z.string(),
      year: z.number(),
      // Display string so it can read "$850" or "Prints only".
      price: z.string(),
      status: z.enum(['available', 'sold', 'prints-only']),
      prints: z.boolean(),
      printsFrom: z.number().optional(),
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
