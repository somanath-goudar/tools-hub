// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// NOTE: update `site` to the real custom domain once chosen (Porkbun .app, per plan).
export default defineConfig({
  site: 'https://tools-hub.vercel.app',
  integrations: [sitemap()],
  // Pure static output — every page pre-rendered, zero JS by default (islands hydrate per-page).
  output: 'static',
});
