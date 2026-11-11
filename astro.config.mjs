import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://dav-daitech.github.io',
  output: 'static',
  i18n: {
    defaultLocale: 'vi',
    locales: ['vi', 'en'],
    routing: { prefixDefaultLocale: false }
  },
  devToolbar: { enabled: false },
  markdown: { syntaxHighlight: false },
  vite: {
    build: {
      assetsInlineLimit: (filePath) => (filePath.endsWith('.woff2') ? false : undefined)
    }
  }
});
