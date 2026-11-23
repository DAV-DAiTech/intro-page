import type { Locale } from '../i18n';

interface Member {
  name: string;
  role?: Record<Locale, string>;
}

export const members: readonly Member[] = [];
