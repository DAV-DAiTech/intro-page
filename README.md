# DAiTech product landing page

This is the product landing page for DAiTech, the AI and Technology Club at the Diplomatic Academy of Vietnam (DAV), built with [Astro](https://astro.build). It introduces the club and serves as the directory for tools made by our club members.

## Architecture

This is a static Astro website with zero UI framework overhead. Pages render to static HTML at build time and ship two small vanilla scripts (~1.5 kB total) for reading preferences and category filtering.

### Key points

- Static, all UI components are `.astro` files with scoped styles
- Reading preferences (appearance, font family, text scale, contrast, reduced motion) are applied inline before first paint
- Product category filtering uses a single delegated click listener per collection in [`src/components/products/Collection.astro`](./src/components/products/Collection.astro)
- Controls that require JavaScript are hidden when JS is disabled
- Static hash-based Content Security Policy is enabled in [`astro.config.mjs`](./astro.config.mjs), emitting SHA-256 hashes for all bundled styles and scripts

### Deployment

Build output is static.

[`vercel.json`](./vercel.json) and [`public/_headers`](./public/_headers) ship HTTP security headers (`X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`, `Referrer-Policy`, `Permissions-Policy`, `Cross-Origin-Opener-Policy`, `Cross-Origin-Resource-Policy`, `Strict-Transport-Security`, `Origin-Agent-Cluster`, and HTTP-only CSP directives `frame-ancestors 'none'; upgrade-insecure-requests`) alongside long-lived immutable cache rules for `/_astro/*` assets on Vercel, Cloudflare Pages, and Netlify.

The canonical domain is set via `site` in [`astro.config.mjs`](./astro.config.mjs).

## Features

- Static site generation with Astro 7
- Self-hosted web fonts
- Vietnamese at `/` and English at `/en/`, with a language switcher
- Light, dark, high contrast and system colors
- Persistent accessibility and reading settings modal
- Accessible (WCAG 2.2 AA), verified with automated Playwright, axe-core audits, 200% text reflow and custom text-spacing checks
- Responsive layout tested from 320px to 1440px
- Auto-generated robots.txt, sitemap.xml and schema.org JSON-LD
- Print stylesheet that strips interactive chrome and prints black ink on white paper

## Getting started

### Prerequisites

- Node.js 22.23.4+
- pnpm

### Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Install Chromium for tests if Chrome or Chromium is unavailable
pnpm exec playwright install chromium

# Build and run the browser and accessibility test suite
pnpm test
```

### Commands

| Command        | Action                                                       |
|----------------|--------------------------------------------------------------|
| `pnpm dev`     | Start dev server at `localhost:4321`                         |
| `pnpm build`   | Build production output to `./dist/`                         |
| `pnpm preview` | Preview the production build locally                         |
| `pnpm test`    | Build and run browser, responsive, and accessibility checks  |

## Project structure

```text
public/
├── images/
├── licenses/              # SIL Open Font License texts for bundled fonts
└── _headers               # Security and cache headers for static hosts
src/
├── components/
│   ├── layout/
│   │   ├── AccessibilitySettings.astro # Reading preferences button and modal
│   │   ├── SiteFooter.astro            # Footer identity and navigation
│   │   └── SiteHeader.astro            # Top bar, navigation, and actions
│   ├── pages/             # Shared localized page components
│   ├── products/
│   │   ├── Card.astro                  # Individual product row and modal trigger
│   │   ├── Collection.astro            # Filterable product list and live status
│   │   ├── Dialog.astro                # Modal dialog for product details
│   │   └── Icon.astro                  # Tinted icon badge per product variant
│   ├── sections/
│   │   ├── About.astro                 # Club story section
│   │   ├── ClubNotes.astro             # Context and privacy sidebar
│   │   └── Hero.astro                  # Hero heading, photo window, and club seal
│   ├── ui/
│   │   └── Button.astro                # Reusable pill link button
│   └── Icon.astro                      # Inline SVG icon set and IconName type
├── data/
│   ├── products.ts        # Typed product catalogue
│   ├── members.ts         # Public club roster
│   └── images.ts          # Shared images and localized showcase entries
├── layouts/
│   ├── BaseLayout.astro   # HTML shell, SEO/OG tags, font preloads, inline init
│   └── DefaultPage.astro  # Localized club page heading and content slot
├── pages/
│   ├── 404.astro          # Custom 404 page (noindex)
│   ├── [...clubPage].astro # Localized projects, showcase, and members routes
│   ├── index.astro        # Vietnamese homepage route
│   ├── llms.txt.ts        # Machine-readable summary for AI assistants
│   ├── robots.txt.ts      # Dynamic robots.txt with Sitemap URL
│   ├── sitemap.xml.ts     # XML sitemap with language alternates
│   └── en/               # English pages
├── scripts/
│   └── preferences.js     # Pre-paint preference loader and dialog fallbacks
├── styles/
│   └── global.css         # Design tokens, themes, resets, a11y, and print rules
└── i18n.ts                # Shared site translations and locale helpers
tests/
├── accessibility.mjs      # Axe WCAG 2.2 AA, zoom, spacing, forced-colors checks
├── browser.mjs            # E2E functional, responsive, and multi-collection tests
└── locales.mjs            # Translation parity, locale navigation, Vietnamese UI and a11y
```

## Development

### Configuration

The site is structured so you can fork or update it without digging through component markup:

- **Domain**: Set `site` in [`astro.config.mjs`](./astro.config.mjs).
- **Shared site translations**: Managed in [`src/i18n.ts`](./src/i18n.ts).
- **Product definitions and localized copy**: Managed in [`src/data/products.ts`](./src/data/products.ts).
- **Theme tokens**: Managed in the `:root` block of [`src/styles/global.css`](./src/styles/global.css). The `<meta name="theme-color">` tags in [`BaseLayout.astro`](./src/layouts/BaseLayout.astro) read `--canvas: light-dark(...)` directly from `global.css` at build time.
- **Static assets**: Images and font licenses live in [`public/`](./public).

### Adding a product

Add an entry to the `products` array in [`src/data/products.ts`](./src/data/products.ts). Put the product’s name, summary, description, detail text, and action button label in its `copy.en` and `copy.vi` objects. Set `categoryKey` to a category in [`src/i18n.ts`](./src/i18n.ts), adding the category to both dictionaries if needed.

Category filter buttons, product counts, detail dialogs and the JSON-LD ItemList in [`HomePage.astro`](./src/components/pages/HomePage.astro) all derive from this.

To render multiple independent product lists on the same page or across pages, pass a unique `id` to `<ProductCollection products={myProducts} id="more-products" />`.

### Club pages

Projects, Image showcase, and Member list share [`DefaultPage.astro`](./src/layouts/DefaultPage.astro). It uses the slug to look up the localized title and description and renders content through its default slot. The [club page route](./src/pages/%5B...clubPage%5D.astro) generates both languages from the page list in `src/i18n.ts`.

The Projects page reads the existing product catalogue. Edit the showcase entries in [`images.ts`](./src/data/images.ts) and add roster entries to [`members.ts`](./src/data/members.ts). Each roster entry needs a name and can include a role in both languages.

### Languages

Astro's i18n routing serves Vietnamese by default at `/` and English at `/en/`. Both routes share the templates in [`src/components/pages/`](./src/components/pages/). Translation keys and interpolation placeholders are checked by the test suite.

The header links between the two languages. Reading preferences stay in the same browser storage across both routes. Each homepage includes its canonical URL, localized social metadata, and structured data. The sitemap lists both versions.

Vietnamese headings use the bundled Lexend font because Special Gothic Expanded One does not include Vietnamese glyphs. Inter and Lexend's Vietnamese subsets are preloaded on Vietnamese pages.

### Theming and accessibility

The site supports customisable reading preferences adapted from the accessibility tools on [jarema.me](https://jarema.me):

- Preferences are stored in local storage
- Color scheme, contrast and reduce motion follow system by default
- Continues working when local storage is blocked
- Body copy defaults to 18px and scales proportionally with a ratio of `1`, `1.125` and `1.25` respectively

### Crawl endpoints and SEO

- Robots file: [`src/pages/robots.txt.ts`](./src/pages/robots.txt.ts)
- Sitemap: [`src/pages/sitemap.xml.ts`](./src/pages/sitemap.xml.ts)
- LLM summary: [`src/pages/llms.txt.ts`](./src/pages/llms.txt.ts)
- Structured data: `Organization` and `ItemList` JSON-LD in [`src/pages/index.astro`](./src/pages/index.astro)

## License

All source code in this repository is licensed under the [MIT License](./LICENSE).

### Attribution

Maintainer: [Jarema (@0jar)](https://jarema.me/)

Visual direction is in large part inspired by [Larkin](https://larkin.alderthemes.com/).

Bundled typefaces (Inter, Special Gothic Expanded One, Atkinson Hyperlegible and Lexend) are self-hosted under the SIL Open Font License, their license texts are located in [`public/licenses/`](./public/licenses).

Club photography and artwork in [`public/images/`](./public/images) belong to DAiTech.
