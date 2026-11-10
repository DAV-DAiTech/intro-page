import type { IconName } from '../components/Icon.astro';
import { useTranslations } from '../i18n';

export interface Product {
  id: string;
  preview: 'match' | 'chat';
  name: string;
  category: string;
  icon: IconName;
  summary: string;
  description: string;
  url: string;
  detail: string;
  link: string;
}

export const getProducts = (locale?: string): readonly Product[] => {
  const t = useTranslations(locale);
  return [
    {
      id: 'match', preview: 'match', name: t('products.match.name'), category: t('products.match.category'), icon: 'heart',
      summary: t('products.match.summary'),
      description: t('products.match.description'),
      url: 'https://dav-club-match.vercel.app/',
      detail: t('products.match.detail'),
      link: t('products.match.link')
    },
    {
      id: 'chat', preview: 'chat', name: t('products.chat.name'), category: t('products.chat.category'), icon: 'sparkle',
      summary: t('products.chat.summary'),
      description: t('products.chat.description'),
      url: 'https://dav-daitech.github.io/dav-assistant/',
      detail: t('products.chat.detail'),
      link: t('products.chat.link')
    }
  ];
};
