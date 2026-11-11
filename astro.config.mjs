import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://dav-daitech.github.io',
  output: 'static',
  i18n: {
    defaultLocale: 'vi',
    locales: ['vi', 'en'],
    routing: { prefixDefaultLocale: false }
  },
  logger: { entrypoint: './tooling/logger.mjs' },
  devToolbar: { enabled: false },
  markdown: { syntaxHighlight: false },
  security: {
    csp: {
      directives: [
        "default-src 'self'",
        "base-uri 'none'",
        "object-src 'none'",
        "form-action 'self'"
      ]
    }
  },
  vite: {
    build: {
      assetsInlineLimit: (filePath) => (filePath.endsWith('.woff2') ? false : undefined)
    }
  },
  server: {
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), geolocation=(), microphone=(), payment=()',
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Resource-Policy': 'same-origin'
    }
  }
});
