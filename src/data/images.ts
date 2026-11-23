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

const showcaseImages: readonly ShowcaseImage[] = [
  {
    image: { src: '/images/club/receptionist-launch.webp', width: 1440, height: 960 },
    copy: {
      en: {
        caption: 'Launch of DAV AI Receptionist, an AI-powered virtual receptionist',
        alt: 'Attendees watch a large screen showing the virtual receptionist and its interface'
      },
      vi: {
        caption: 'Ra mắt DAV AI Receptionist - Lễ tân ảo ứng dụng trí tuệ nhân tạo',
        alt: 'Khách tham dự xem màn hình lớn hiển thị nhân vật ảo và giao diện DAV AI Receptionist'
      }
    }
  },
  launchImage,
  {
    image: { src: '/images/club/launch-speakers.webp', width: 1440, height: 960 },
    copy: {
      en: {
        caption: 'Dr. Nguyễn Hùng Sơn and Hoàng Mai Hương speak at the DAiTech launch ceremony',
        alt: 'Nguyễn Hùng Sơn speaks into a microphone beside Hoàng Mai Hương in front of a DAV backdrop'
      },
      vi: {
        caption: 'TS. Nguyễn Hùng Sơn và ThS. Hoàng Mai Hương phát biểu tại buổi lễ ra mắt DAiTech',
        alt: 'Nguyễn Hùng Sơn đứng phát biểu bên cạnh Hoàng Mai Hương trước phông nền của Học viện Ngoại giao'
      }
    }
  },
  {
    image: { src: '/images/club/club-fest-2026.webp', width: 1440, height: 1080 },
    copy: {
      en: {
        caption: 'DAiTech’s booth at DAV Club Fest 2026',
        alt: 'Club members pose under an outdoor canopy behind a colorful DAiTech sign'
      },
      vi: {
        caption: 'Booth của DAiTech tại DAV Club Fest 2026',
        alt: 'Các thành viên đứng dưới mái che tại gian hàng ngoài trời có bảng tên DAiTech'
      }
    }
  },
  {
    image: { src: '/images/club/research-lab-year-0.webp', width: 1440, height: 960 },
    copy: {
      en: {
        caption: 'Research Lab, Technical Council (DAiTech year 0)',
        alt: 'Research Lab members pose in a line against a white backdrop'
      },
      vi: {
        caption: 'Lab Nghiên cứu thuộc Hội đồng Chuyên môn của DAiTech năm thứ 0',
        alt: 'Các thành viên Lab Nghiên cứu đứng thành hàng trước phông trắng'
      }
    }
  },
  {
    image: { src: '/images/club/applied-lab-year-0.webp', width: 1440, height: 960 },
    copy: {
      en: {
        caption: 'Applied Lab, Technical Council (DAiTech year 0)',
        alt: 'Applied Lab members pose in two rows against a white backdrop'
      },
      vi: {
        caption: 'Lab Ứng dụng thuộc Hội đồng Chuyên môn của DAiTech năm thứ 0',
        alt: 'Các thành viên Lab Ứng dụng ngồi và đứng thành hai hàng trước phông trắng'
      }
    }
  },
  {
    image: { src: '/images/club/events-team-year-0.webp', width: 1440, height: 960 },
    copy: {
      en: {
        caption: 'Events Team (DAiTech year 0)',
        alt: 'Events Team members smile and raise their fists for a group portrait'
      },
      vi: {
        caption: 'Ban Sự kiện của DAiTech năm thứ 0',
        alt: 'Các thành viên Ban Sự kiện mỉm cười và giơ nắm tay khi chụp ảnh tập thể'
      }
    }
  },
  {
    image: { src: '/images/club/communications-team-year-0.webp', width: 1330, height: 714 },
    copy: {
      en: {
        caption: 'Communications Team (DAiTech year 0)',
        alt: 'Four Communications Team members pose with cameras and a tablet'
      },
      vi: {
        caption: 'Ban Truyền thông của DAiTech năm thứ 0',
        alt: 'Bốn thành viên Ban Truyền thông tạo dáng với máy ảnh và máy tính bảng'
      }
    }
  },
  {
    image: { src: '/images/club/administration-hr-year-0.webp', width: 1440, height: 960 },
    copy: {
      en: {
        caption: 'Administration and Human Resources Team (DAiTech year 0)',
        alt: 'Three team members stand with their arms crossed against a white backdrop'
      },
      vi: {
        caption: 'Ban Hành chính - Nhân sự của DAiTech năm thứ 0',
        alt: 'Ba thành viên Ban Hành chính - Nhân sự đứng khoanh tay trước phông trắng'
      }
    }
  },
  meetingImage,
  artworkImage
];

export function getShowcaseImages(locale?: string) {
  const language = getLocale(locale);
  return showcaseImages.map(({ copy, ...entry }) => ({ ...entry, ...copy[language] }));
}
