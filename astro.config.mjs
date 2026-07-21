import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  output: 'static',
  adapter: cloudflare(),
  vite: {
    plugins: [tailwindcss()],
  },
  site: 'https://class9hub.com',
  integrations: [sitemap()],
});
