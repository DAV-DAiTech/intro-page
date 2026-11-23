# Trang giới thiệu sản phẩm DAiTech

[English](./README.md) | **Tiếng Việt**

Đây là trang web của DAiTech, Câu lạc bộ AI và Công nghệ Học viện Ngoại giao (DAV). Trang được xây dựng bằng [Astro](https://astro.build) với mục đích giới thiệu câu lạc bộ và tập hợp các công cụ do các thành viên CLB phát triển.

## Kiến trúc

Astro tạo HTML tĩnh khi build, JavaScript xử lý tùy chọn đọc, điều hướng và bộ lọc sản phẩm.

- Các thành phần giao diện dùng tệp `.astro` với CSS giới hạn trong từng thành phần.
- Trang áp dụng giao diện, phông chữ, cỡ chữ, độ tương phản và tùy chọn giảm chuyển động ngay trước lần hiển thị đầu tiên.
- Mỗi danh sách sản phẩm dùng một trình xử lý sự kiện chung cho các nút lọc trong [`Collection.astro`](./src/components/products/Collection.astro).
- Các điều khiển cần JavaScript được ẩn khi trình duyệt tắt JavaScript.
- Chính sách bảo mật nội dung (CSP) dùng mã băm SHA-256 cho các đoạn script và CSS được đóng gói. Cấu hình nằm trong [`astro.config.mjs`](./astro.config.mjs).

### Triển khai

Astro nhúng CSP vào HTML được tạo ra. Hai tệp [`vercel.json`](./vercel.json) và [`public/_headers`](./public/_headers) bổ sung HTTP header và quy tắc bộ nhớ đệm trên Vercel và Netlify. Nếu host ở nền tảng khác, thiết lập các header đó tại nơi host trang.

Đặt tên miền của trang bằng thuộc tính `site` trong [`astro.config.mjs`](./astro.config.mjs).

## Tính năng

- Tạo trang tĩnh bằng Astro 7 và tự lưu trữ phông chữ web
- Tiếng Việt ở trang chính `/` và tiếng Anh ở `/en/`, có nút chuyển ngôn ngữ
- Giao diện sáng, tối, tương phản cao hoặc theo hệ thống
- Hộp thoại cài đặt trợ năng và tùy chọn đọc được lưu trong trình duyệt
- Kiểm thử điều hướng bằng bàn phím, các quy tắc WCAG 2.2 AA trong axe-core, khả năng dàn lại nội dung ở cỡ chữ 200% và khoảng cách văn bản tùy chỉnh
- Kiểm thử bố cục ở chiều rộng từ 320 đến 1440 px
- Tự tạo `robots.txt`, `sitemap.xml` và dữ liệu có cấu trúc schema.org dạng JSON-LD
- CSS dành cho bản in, ẩn các điều khiển tương tác và in chữ đen trên nền trắng

## Bắt đầu

### Yêu cầu

- Node.js 22.23.4 trở lên
- pnpm

### Cài đặt

```bash
# Cài các gói phụ thuộc
pnpm install

# Khởi động máy chủ phát triển
pnpm dev

# Cài Chromium để kiểm thử nếu máy chưa có Chrome hoặc Chromium
pnpm exec playwright install chromium

# Build và chạy bộ kiểm thử trình duyệt và trợ năng
pnpm test
```

### Lệnh thường dùng

| Lệnh | Công dụng |
| --- | --- |
| `pnpm dev` | Khởi động máy chủ phát triển tại `localhost:4321` |
| `pnpm build` | Tạo bản triển khai trong `./dist/` |
| `pnpm preview` | Xem trước bản đã build trên máy cục bộ |
| `pnpm test` | Build và chạy kiểm thử trình duyệt, bố cục và trợ năng |

## Cấu trúc dự án

```text
public/
├── images/                # Logo và tài nguyên ảnh được phục vụ trực tiếp
├── licenses/              # Giấy phép SIL Open Font License của các phông chữ
└── _headers               # Tiêu đề bảo mật và quy tắc bộ nhớ đệm
src/
├── assets/club/           # Ảnh WebP gốc của câu lạc bộ
├── components/
│   ├── layout/            # Đầu trang, chân trang, điều hướng và cài đặt trợ năng
│   ├── pages/             # Thành phần trang dùng chung cho hai ngôn ngữ
│   ├── products/          # Thẻ, bộ lọc và hộp thoại chi tiết sản phẩm
│   ├── sections/          # Các phần nội dung trên trang chủ
│   ├── ui/                # Thành phần giao diện dùng lại
│   └── Icon.astro         # Bộ biểu tượng SVG
├── data/
│   ├── products.ts        # Danh mục sản phẩm và nội dung song ngữ
│   ├── members.ts         # Danh sách thành viên công khai
│   ├── images.ts          # Danh mục ảnh, chú thích và văn bản thay thế
│   └── contact.ts         # Email, mạng xã hội và biểu tượng
├── layouts/              # Khung HTML, siêu dữ liệu và bố cục trang
├── lib/                  # Truy xuất ảnh nguồn của câu lạc bộ
├── pages/                # Tuyến trang và điểm cuối cho trình thu thập dữ liệu
│   └── en/               # Các tuyến tiếng Anh riêng
├── scripts/              # Khởi tạo tùy chọn đọc và hỗ trợ hộp thoại
├── styles/global.css     # Chủ đề, kiểu toàn trang và kiểu in
└── i18n.ts               # Bản dịch dùng chung và hàm xử lý ngôn ngữ
tests/
├── accessibility.mjs     # Kiểm thử axe-core, cỡ chữ, khoảng cách và màu bắt buộc
├── browser.mjs           # Kiểm thử chức năng, bố cục và nhiều danh sách sản phẩm
└── locales.mjs           # Kiểm thử bản dịch, chuyển ngôn ngữ và các trang song ngữ
```

## Phát triển

### Cấu hình

- Đặt tên miền bằng thuộc tính `site` trong [`astro.config.mjs`](./astro.config.mjs).
- Chỉnh bản dịch dùng chung trong [`src/i18n.ts`](./src/i18n.ts).
- Quản lý thông tin sản phẩm và nội dung song ngữ trong [`src/data/products.ts`](./src/data/products.ts).
- Các biến chủ đề nằm trong khối `:root` của [`src/styles/global.css`](./src/styles/global.css). Khi build, [`BaseLayout.astro`](./src/layouts/BaseLayout.astro) đọc giá trị `--canvas: light-dark(...)` để đặt màu chủ đề của trình duyệt.
- Ảnh câu lạc bộ dùng cho quá trình build nằm trong [`src/assets/club/`](./src/assets/club). Logo và giấy phép phông chữ được phục vụ từ [`public/`](./public).

### Thêm sản phẩm

Thêm một mục vào mảng `products` trong [`src/data/products.ts`](./src/data/products.ts). Điền tên, tóm tắt, mô tả, thông tin chi tiết và nhãn nút trong `copy.en` và `copy.vi`. Chọn danh mục bằng `categoryKey` và bổ sung bản dịch trong cả hai từ điển của [`src/i18n.ts`](./src/i18n.ts) nếu cần. Thêm `sourceUrl` để hiện liên kết mã nguồn trong hộp thoại Tìm hiểu thêm.

Bộ lọc, số lượng sản phẩm, hộp thoại chi tiết và dữ liệu `ItemList` của [`HomePage.astro`](./src/components/pages/HomePage.astro) đều đọc từ danh mục này.

Khi dùng nhiều danh sách sản phẩm độc lập, truyền một `id` riêng cho từng danh sách, chẳng hạn `<ProductCollection products={myProducts} id="more-products" />`.

### Các trang của câu lạc bộ

Các trang Dự án, Thư viện ảnh, Danh sách thành viên và Liên hệ dùng chung [`DefaultPage.astro`](./src/layouts/DefaultPage.astro). Bố cục dùng tên tuyến để tra tiêu đề và mô tả theo ngôn ngữ, sau đó chèn nội dung qua slot mặc định. [Tuyến trang câu lạc bộ](./src/pages/%5B...clubPage%5D.astro) tạo cả hai phiên bản ngôn ngữ từ danh sách trong [`src/i18n.ts`](./src/i18n.ts).

Trang Dự án liệt kê các sản phẩm và trang web DAiTech. Chỉnh thư viện ảnh trong [`images.ts`](./src/data/images.ts) và thêm thành viên trong [`members.ts`](./src/data/members.ts). Mỗi mục thành viên cần có tên và có thể kèm vai trò bằng cả hai ngôn ngữ.

Mỗi ảnh trong thư viện có một tệp WebP gốc trong `src/assets/club/`. Astro tạo các phiên bản phù hợp với kích thước màn hình khi build. Chú thích ảnh dẫn đến tệp gốc ở kích thước đầy đủ.

Trang Liên hệ và chân trang dùng chung các liên kết trong [`contact.ts`](./src/data/contact.ts).

### Ngôn ngữ

Astro phục vụ tiếng Việt mặc định ở `/` và tiếng Anh ở `/en/`. Hai phiên bản dùng chung thành phần trang trong [`src/components/pages/`](./src/components/pages/). Bộ kiểm thử kiểm tra các khóa bản dịch và biến nội suy.

Người đọc có thể chuyển ngôn ngữ ở đầu trang. Trình duyệt dùng chung các tùy chọn đọc giữa hai phiên bản. Trang chủ của mỗi ngôn ngữ có URL chính tắc, siêu dữ liệu chia sẻ và dữ liệu có cấu trúc. Sitemap liệt kê cả hai phiên bản.

Tiêu đề tiếng Việt dùng Lexend vì Special Gothic Expanded One thiếu ký tự tiếng Việt. Trang tiếng Việt tải trước các bộ ký tự tiếng Việt của Inter và Lexend.

### Chủ đề và trợ năng

Các tùy chọn đọc được phát triển dựa trên công cụ trợ năng của [jarema.me](https://jarema.me/).

- Trình duyệt lưu tùy chọn trong `localStorage`.
- Giao diện, độ tương phản và giảm chuyển động mặc định theo hệ thống.
- Người dùng vẫn có thể áp dụng tùy chọn khi trình duyệt chặn bộ nhớ cục bộ.
- Cỡ chữ nội dung mặc định là 18 px. Các mức cỡ chữ có hệ số lần lượt là `1`, `1.125` và `1.25`.

### Điểm cuối và SEO

- Quy tắc cho trình thu thập dữ liệu nằm trong [`robots.txt.ts`](./src/pages/robots.txt.ts).
- Sitemap kèm liên kết ngôn ngữ nằm trong [`sitemap.xml.ts`](./src/pages/sitemap.xml.ts).
- Bản tóm tắt cho trợ lý AI nằm trong [`llms.txt.ts`](./src/pages/llms.txt.ts).
- Dữ liệu JSON-LD dạng `Organization` và `ItemList` nằm trong [`HomePage.astro`](./src/components/pages/HomePage.astro).

## Giấy phép

Mã nguồn trong kho này được phát hành theo [giấy phép MIT](./LICENSE).

### Ghi công

[Jarema (@0jar)](https://jarema.me/) duy trì dự án.

Thiết kế lấy cảm hứng từ [Larkin](https://larkin.alderthemes.com/).

Biểu tượng GitHub và Facebook lấy từ [Simple Icons](https://simpleicons.org/) theo [CC0 1.0](https://github.com/simple-icons/simple-icons/blob/develop/LICENSE.md).

Inter, Lexend, Atkinson Hyperlegible và Special Gothic Expanded One được tự lưu trữ theo SIL Open Font License. Các bản giấy phép nằm trong [`public/licenses/`](./public/licenses).

Ảnh, tranh minh họa và nhận diện của câu lạc bộ trong [`src/assets/club/`](./src/assets/club) và [`public/images/`](./public/images) thuộc về DAiTech. Hãy liên hệ DAiTech để xin phép sử dụng lại các tài nguyên này.
