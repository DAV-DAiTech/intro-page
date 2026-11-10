export const en = {
  'site.lang': 'en',
  'site.name': 'DAiTech',
  'site.orgDescription': 'AI and Technology Club at the Diplomatic Academy of Vietnam.',
  'meta.title': 'DAiTech - Ideas into everyday possibilities',
  'meta.description': 'Explore DAV Club Match and DAV Chatbot, products from DAiTech, the AI and Technology Club at the Diplomatic Academy of Vietnam.',
  'meta.socialTitle': 'DAiTech - A little curiosity. A world of possibility.',
  'meta.socialDescription': 'Student-built tools for connection, discovery, and everyday possibilities at DAV.',
  'nav.skipToContent': 'Skip to content',
  'header.homeLabel': 'DAiTech home',
  'header.brand': 'DAiTech.',
  'header.navLabel': 'Main navigation',
  'header.products': 'Our products',
  'header.story': 'Our story',
  'header.cta': 'Find your next tool',
  'hero.titleLine1': 'Made at DAV,',
  'hero.titleLine2': 'made for you.',
  'hero.imageAlt': 'DAiTech members together at the club’s first meeting',
  'hero.description': 'Tools from the AI & Technology Club at the Diplomatic Academy of Vietnam. Find your people, ask a question, and try something new.',
  'hero.cta': 'Explore our products',
  'notes.titleLine1': 'A little',
  'notes.titleLine2': 'club context.',
  'notes.intro': 'These tools come from DAiTech, the AI & Technology Club at the Diplomatic Academy of Vietnam.',
  'notes.item1.title': 'Learning by building',
  'notes.item1.body': 'Student projects, made to help with everyday life at DAV.',
  'notes.item2.title': 'Before you ask',
  'notes.item2.body': 'DAV Chatbot is experimental. Check important answers with official DAV sources.',
  'notes.item3.title': 'A little privacy',
  'notes.item3.body': 'Avoid sharing personal information in your conversation with the chatbot.',
  'about.titleLine1': 'The club',
  'about.titleLine2': 'behind the tools.',
  'about.description': 'We’re DAiTech, the AI and Technology Club at the Diplomatic Academy of Vietnam. We explore ideas, learn together, and build things for student life.',
  'about.cta': 'See what we’re building',
  'about.imageAlt': 'DAiTech’s fox emblem above a futuristic city in orange and gold',
  'footer.club': 'AI & Technology Club',
  'footer.academy': 'Diplomatic Academy of Vietnam',
  'footer.navLabel': 'Footer navigation',
  'footer.products': 'Products',
  'footer.about': 'About us',
  'footer.backToTop': 'Back to top ↑',
  'footer.copyright': '© {year} DAiTech',
} as const;

export type TranslationKey = keyof typeof en;
export type Translations = Record<TranslationKey, string>;

export const locales = ['en'] as const;
export type Locale = (typeof locales)[number];
export const getLocale = (_locale?: string): Locale => 'en';
export const homePath = (_locale?: string): string => '/';
export const useTranslations = (_locale?: string) => t;

export const t = (
  key: TranslationKey,
  params?: Record<string, string | number>,
  dict: Translations = en
): string =>
  params
    ? dict[key].replace(/\{(\w+)\}/g, (_, k: string) => String(params[k] ?? ''))
    : dict[key];
