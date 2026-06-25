import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://functionpedia.com',
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/downloads/'),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  output: 'static',
  trailingSlash: 'always',
  build: {
    inlineStylesheets: 'auto',
  },
});
