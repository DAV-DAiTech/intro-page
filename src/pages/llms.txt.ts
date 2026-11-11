import type { APIRoute } from 'astro';
import { getProducts } from '../data/products';
import { homePath, useTranslations } from '../i18n';

export const GET: APIRoute = ({ site, currentLocale }) => {
  const t = useTranslations(currentLocale);
  const products = getProducts(currentLocale);
  const list = products
    .map((p) => `### [${p.name}](${p.url})\n- ${t('llms.category')}: ${p.category}\n- ${t('llms.summary')}: ${p.summary}\n- ${t('llms.details')}: ${p.detail}`)
    .join('\n\n');
  const body = `# ${t('site.name')}\n\n> ${t('llms.description')}\n\n- ${t('llms.website')}: ${new URL(homePath(currentLocale), site)}\n\n## ${t('llms.productsHeading')}\n\n${list}\n`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
