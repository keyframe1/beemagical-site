/**
 * videos.ts - build-time fetch of Hannah's YouTube channel feed.
 *
 * Pulls the public RSS feed (no API key, no quota) at build, parses the
 * Atom entries with small regexes, and returns the most recent few videos
 * as plain data: id, title, published date. The Watch section turns each
 * into a lightweight facade card.
 *
 * Resilience: any network or parse failure returns an empty list rather
 * than throwing, so the build never breaks. Watch.astro renders a single
 * "Watch on YouTube" fallback card when the list comes back empty.
 */

export const YT_CHANNEL = 'https://www.youtube.com/@beemagicalart';
export const YT_CHANNEL_ID = 'UCdAGJ0QWEKO9jjbfouTLdUQ';
const FEED_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${YT_CHANNEL_ID}`;

export type Video = {
  id: string;
  title: string;
  published: string; // ISO date string
};

// minimal entity decode for the handful that show up in video titles
function decode(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .trim();
}

function parseFeed(xml: string): Video[] {
  const videos: Video[] = [];
  // each <entry> holds one video; pull the fields we care about
  const entries = xml.match(/<entry>[\s\S]*?<\/entry>/g) ?? [];
  for (const entry of entries) {
    const id = entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1];
    const title = entry.match(/<title>([\s\S]*?)<\/title>/)?.[1];
    const published = entry.match(/<published>([^<]+)<\/published>/)?.[1];
    if (!id || !title) continue;
    videos.push({ id: id.trim(), title: decode(title), published: published?.trim() ?? '' });
  }
  return videos;
}

/**
 * Fetch and parse the feed, newest first, capped to `limit`. Returns []
 * on any failure so callers can render a graceful fallback.
 */
export async function getVideos(limit = 6): Promise<Video[]> {
  try {
    const res = await fetch(FEED_URL, { headers: { 'user-agent': 'beemagical-site build' } });
    if (!res.ok) return [];
    const xml = await res.text();
    const videos = parseFeed(xml);
    // the feed is already newest-first, but sort defensively on the date
    videos.sort((a, b) => (a.published < b.published ? 1 : -1));
    return videos.slice(0, limit);
  } catch {
    return [];
  }
}
