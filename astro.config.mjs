// @ts-check
import { defineConfig } from 'astro/config';

// Static output, zero-config Vercel deploy. Pushing to main auto-deploys.
export default defineConfig({
  output: 'static',
  site: 'https://beemagical.art',
  trailingSlash: 'ignore',
});
