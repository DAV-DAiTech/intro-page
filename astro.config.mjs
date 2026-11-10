import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://dav-daitech.github.io',
  output: 'static',
  devToolbar: { enabled: false },
  markdown: { syntaxHighlight: false }
});
