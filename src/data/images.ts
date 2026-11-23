import { getLocale, type Locale } from '../i18n.ts';

interface ShowcaseImage {
  image: { src: string; srcset?: string; width: number; height: number };
  href?: string;
  copy: Record<Locale, { caption: string; alt: string }>;
}

export const launchImage = {
  image: {
    src: '/images/club/orientationday-768.webp',
    srcset: '/images/club/orientationday-768.webp 768w, /images/club/orientationday-1600.webp 1600w',
    width: 768,
    height: 512
  },
  href: '/images/club/orientationday.webp',
  copy: {
    en: {
      caption: 'DAiTech launch',
      alt: 'Club members and guests pose in front of a red backdrop at the DAiTech launch'
    },
    vi: {
      caption: 'Lễ ra mắt DAiTech',
      alt: 'Thành viên câu lạc bộ và khách mời chụp ảnh trước phông nền đỏ tại lễ ra mắt DAiTech'
    }
  }
} satisfies ShowcaseImage;

export const meetingImage = {
  image: { src: '/images/club/meeting.webp', width: 1554, height: 1077 },
  copy: {
    en: {
      caption: 'First club meeting',
      alt: 'Club members pose together in front of a screen that reads “First Meeting”'
    },
    vi: {
      caption: 'Buổi gặp mặt đầu tiên',
      alt: 'Các thành viên chụp ảnh cùng nhau trước màn hình có dòng chữ “First Meeting”'
    }
  }
} satisfies ShowcaseImage;

export const artworkImage = {
  image: { src: '/images/club/artwork.webp', width: 1400, height: 788 },
  copy: {
    en: {
      caption: 'DAiTech club artwork',
      alt: 'DAiTech’s fox emblem above a futuristic city in orange and gold'
    },
    vi: {
      caption: 'Tranh minh họa của DAiTech',
      alt: 'Biểu tượng cáo của DAiTech phía trên thành phố tương lai với tông màu cam và vàng'
    }
  }
} satisfies ShowcaseImage;

const showcaseImages: readonly ShowcaseImage[] = [launchImage, meetingImage, artworkImage];

export function getShowcaseImages(locale?: string) {
  const language = getLocale(locale);
  return showcaseImages.map(({ copy, ...entry }) => ({ ...entry, ...copy[language] }));
}
