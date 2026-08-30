// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.hokkai2005.online',
  integrations: [react()],
  markdown: {
    shikiConfig: {
      // Dual themes: light colours are inlined, dark ones ride on --shiki-dark
      // custom properties that global.css swaps in under `.dark`.
      themes: {
        light: 'min-light',
        dark: 'vitesse-dark',
      },
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
