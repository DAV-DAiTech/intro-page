import type { IconName } from '../components/Icon.astro';
import { getLocale, homePath, useTranslations, type Locale, type TranslationKey } from '../i18n.ts';

export interface Product {
  id: string;
  preview: 'match' | 'chat';
  name: string;
  category: string;
  icon: IconName;
  summary: string;
  description: string;
  url: string;
  sourceUrl?: string;
  detail: string;
  link: string;
}

type ProductCopy = Pick<Product, 'name' | 'summary' | 'description' | 'detail' | 'link'>;
type ProductDefinition = Pick<Product, 'id' | 'preview' | 'icon' | 'url' | 'sourceUrl'> & {
  categoryKey: TranslationKey;
  copy: Record<Locale, ProductCopy>;
};

const products = [
  {
    id: 'match',
    preview: 'match',
    icon: 'heart',
    url: 'https://dav-club-match.vercel.app/',
    categoryKey: 'products.match.category',
    copy: {
      en: {
        name: 'DAV Club Match',
        summary: 'Your interests. Your people. Your place at DAV.',
        description: 'Discover where you belong. Find a club that connects your interests with a community at the Diplomatic Academy of Vietnam.',
        detail: 'A starting point for finding your community at DAV. Visit DAV Club Match to explore the experience and discover which club could be your next connection.',
        link: 'Find your match',
      },
      vi: {
        name: 'DAV Club Match',
        summary: 'Tìm câu lạc bộ phù hợp, gặp những người cùng sở thích.',
        description: 'Khám phá các câu lạc bộ ở Học viện Ngoại giao và tìm nơi bạn có thể gặp gỡ những người cùng sở thích.',
        detail: 'DAV Club Match giúp bạn bắt đầu tìm hiểu các câu lạc bộ ở Học viện Ngoại giao và tìm cộng đồng phù hợp với sở thích của mình.',
        link: 'Tìm câu lạc bộ phù hợp',
      },
    },
  },
  {
    id: 'chat',
    preview: 'chat',
    icon: 'sparkle',
    url: 'https://dav-daitech.github.io/dav-assistant/',
    sourceUrl: 'https://github.com/DAV-DAiTech/dav-assistant',
    categoryKey: 'products.chat.category',
    copy: {
      en: {
        name: 'DAV Chatbot',
        summary: 'A conversation is a great place to start.',
        description: 'Questions about admissions, scholarships, or student life? Ask DAV’s AI assistant in Vietnamese or English and find a place to start.',
        detail: 'An experimental, bilingual AI assistant for questions about admissions, programs, tuition, scholarships, and life at DAV. Built by DAiTech using public Academy information. This is not an official information channel; verify important answers with DAV and avoid sharing personal information.',
        link: 'Start a conversation',
      },
      vi: {
        name: 'DAV Chatbot',
        summary: 'Cùng DAV Chatbot tìm lời giải đáp.',
        description: 'Từ tuyển sinh, học bổng đến đời sống sinh viên, bạn có thể hỏi DAV Chatbot bằng tiếng Việt hoặc tiếng Anh.',
        detail: 'DAV Chatbot là trợ lý AI song ngữ do DAiTech phát triển, hiện đang được thử nghiệm. Công cụ sử dụng thông tin công khai của Học viện để hỗ trợ giải đáp các câu hỏi về tuyển sinh, chương trình đào tạo, học phí, học bổng và đời sống sinh viên. Đây không phải kênh thông tin chính thức của DAV. Với những thông tin quan trọng, bạn nên đối chiếu với các nguồn chính thức của Học viện và tránh chia sẻ thông tin cá nhân khi trò chuyện.',
        link: 'Bắt đầu trò chuyện',
      },
    },
  },
  {
    id: 'receptionist',
    preview: 'chat',
    icon: 'sparkle',
    url: 'https://dav-daitech.github.io/avatar-kiosk/',
    sourceUrl: 'https://github.com/DAV-DAiTech/avatar-kiosk',
    categoryKey: 'products.chat.category',
    copy: {
      en: {
        name: 'DAV AI Receptionist',
        summary: 'Speak with DAV’s virtual receptionist.',
        description: 'Ask questions about the Diplomatic Academy of Vietnam out loud and hear answers from a virtual receptionist.',
        detail: 'DAV AI Receptionist is a voice-enabled kiosk with an interactive avatar. Tap the talk button, speak your question, then tap again to send it and hear the avatar’s reply.',
        link: 'Open the kiosk',
      },
      vi: {
        name: 'DAV AI Receptionist',
        summary: 'Trò chuyện với lễ tân ảo của Học viện Ngoại giao.',
        description: 'Đặt câu hỏi về Học viện Ngoại giao bằng giọng nói và nghe lễ tân ảo trả lời.',
        detail: 'DAV AI Receptionist là ki-ốt lễ tân ảo tương tác bằng giọng nói. Nhấn nút nói, đặt câu hỏi, rồi nhấn lại để gửi câu hỏi và nghe câu trả lời.',
        link: 'Mở ki-ốt',
      },
    },
  },
] satisfies readonly ProductDefinition[];

const website = {
  id: 'website',
  preview: 'match',
  icon: 'code',
  sourceUrl: 'https://github.com/DAV-DAiTech/intro-page',
  categoryKey: 'products.website.category',
  copy: {
    en: {
      name: 'DAiTech website',
      summary: 'The home of DAiTech and its projects.',
      description: 'A bilingual website for the club’s projects, photos, members, and contact information.',
      detail: 'The site is built with Astro and includes reading preferences for appearance, text size, font, contrast, and motion.',
      link: 'Visit the homepage',
    },
    vi: {
      name: 'Website DAiTech',
      summary: 'Nơi giới thiệu DAiTech và các dự án của câu lạc bộ.',
      description: 'Trang web song ngữ giới thiệu dự án, hình ảnh, thành viên và thông tin liên hệ của câu lạc bộ.',
      detail: 'Trang web được xây dựng bằng Astro, với các tùy chọn về giao diện, cỡ chữ, phông chữ, độ tương phản và hiệu ứng chuyển động.',
      link: 'Về trang chủ',
    },
  },
} satisfies Omit<ProductDefinition, 'url'>;

function localizeProducts(definitions: readonly ProductDefinition[], locale?: string): readonly Product[] {
  const language = getLocale(locale);
  const t = useTranslations(language);
  return definitions.map(({ categoryKey, copy, ...product }) => ({
    ...product,
    category: t(categoryKey),
    ...copy[language],
  }));
}

export const getProducts = (locale?: string) => localizeProducts(products, locale);

export const getProjects = (locale?: string) =>
  localizeProducts([...products, { ...website, url: homePath(locale) }], locale);
