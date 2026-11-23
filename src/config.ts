import type { AstroUserConfig } from 'astro';

export const baseUrl = 'https://daitech-landing.vercel.app/';
export const locales = ['vi', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'vi';
export const clubPages = ['projects', 'showcase', 'members', 'contact'] as const;

export const astroConfig = {
  site: baseUrl,
  output: 'static',
  i18n: {
    defaultLocale,
    locales: [...locales],
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
      'Permissions-Policy': 'interest-cohort=(), browsing-topics=(), camera=(), geolocation=(), microphone=(), accelerometer=()',
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Resource-Policy': 'same-origin'
    }
  }
} satisfies AstroUserConfig;
