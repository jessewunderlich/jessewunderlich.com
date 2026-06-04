// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build
export default defineConfig({
  site: 'https://www.jesse-wunderlich.com',
  integrations: [sitemap()],
  // Plain static output; no client JS except the giscus guestbook embed.
});
