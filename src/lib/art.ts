import { getCollection, type CollectionEntry } from 'astro:content';

export type Art = CollectionEntry<'art'>;

/**
 * One canonical, stable ordering for the whole gallery so the Constellation
 * nodes, the Lightbox prev/next, and Featured all agree on indices.
 */
export async function getArt(): Promise<Art[]> {
  const all = await getCollection('art');
  return all.sort((a, b) => a.id.localeCompare(b.id));
}

export const FEATURED_SLUG = 'hummingbird-trumpet-vine';
