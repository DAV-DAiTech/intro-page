import type { APIRoute } from 'astro';
import { homePath, locales } from '../i18n';

export const GET: APIRoute = ({ site }) => {
  const alternates = [...locales, 'x-default']
    .map((locale) => `    <xhtml:link rel="alternate" hreflang="${locale}" href="${new URL(homePath(locale), site)}" />`)
    .join('\n');
  const urls = locales
    .map((locale) => `  <url>\n    <loc>${new URL(homePath(locale), site)}</loc>\n${alternates}\n    <priority>1.0</priority>\n  </url>`)
    .join('\n');
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls}\n</urlset>\n`,
    { headers: { 'Content-Type': 'application/xml; charset=utf-8' } }
  );
};
