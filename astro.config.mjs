// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// NOTE: update `site` to the real custom domain once chosen (Porkbun .app, per plan).
export default defineConfig({
  site: 'https://tools-hub.vercel.app',
  integrations: [sitemap()],
  // Pure static output — every page pre-rendered, zero JS by default (islands hydrate per-page).
  output: 'static',
  // Self-hosted brand fonts (Vercel's Geist + Geist Mono) via Astro's Fonts API —
  // auto preload links, optimized fallbacks, no third-party requests. See DESIGN.md typography.
  // NOTE: Fonts API is still experimental in Astro 5.18 — must live under `experimental`.
  experimental: {
    fonts: [
      {
        provider: fontProviders.fontsource(),
        name: 'Geist',
        cssVariable: '--font-geist',
        weights: [400, 500, 600],
        styles: ['normal'],
        subsets: ['latin'],
        fallbacks: ['Inter', 'system-ui', 'sans-serif'],
      },
      {
        provider: fontProviders.fontsource(),
        name: 'Geist Mono',
        cssVariable: '--font-geist-mono',
        weights: [400],
        styles: ['normal'],
        subsets: ['latin'],
        fallbacks: ['ui-monospace', 'monospace'],
      },
    ],
  },
});
