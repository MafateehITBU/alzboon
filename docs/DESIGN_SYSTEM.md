# Design system

Implemented in `src/styles/globals.css` with Tailwind CSS 4 `@theme`. Component styles use Tailwind utilities. The global stylesheet also holds the Tailwind import, base resets, and the body font. `next/font` registers the font files, so the global file does not repeat `@font-face` rules.

## Colors

| Token | Value | Role |
| --- | --- | --- |
| `cream` | `#F8F6F1` | Primary background |
| `cream-deep` | `#F4F2EA` | Secondary background |
| `white` | `#FFFFFF` | White surfaces |
| `ivory` | `#F2F0E8` | Hero light text |
| `card` | `#F7F9FB` | Practice cards |
| `paper` | `#FBFAF7` | Secondary information card |
| `teal` | `#3F8377` | Primary teal |
| `teal-deep` | `#3E8377` | Secondary teal and active navigation |
| `gold` | `#BBA97A` | Gold |
| `gold-deep` | `#BAA87A` | Deep gold used by the homepage frame |
| `ink` / `navy` | `#011320` | Primary text and footer |
| `ink-soft` | `#1B1C1C` | Body default |
| `heading` | `#171717` | Approach heading |
| `body` | `#555555` | Secondary text |
| `body-strong` | `#43474C` | Practice and testimonial copy |
| `copy` | `#333333` | Approach copy |
| `quote` | `#191C1E` | Testimonial quotes |
| `muted` | `#6C8793` | Muted text |
| `line` | `#E2E8F0` | Borders |
| `field` | `#1A3243` | Footer fields |
| `offwhite` | `#FAFAFA` | Light button text |
| `warning` | amber `#D97706` | Admin warnings and NEW enquiry status |
| `info` | blue `#2563EB` | READ enquiry status |
| `success` | green `#15803D` | Reserved for published states |
| `danger` | red `#DC2626` | Reserved for destructive actions |

## Fonts

Approved website-wide typography:

- English public UI uses **Abu Dhabi Pro** Regular (`font-abu` → `AbuDhabiPro-Regular.ttf`).
- Arabic public UI uses **GE Dinar Two** (`--font-dinar` / remapped under `lang="ar"` → `ArbFONTS-GE-Dinar-Two-Medium.otf`).
- Do not replace GE Dinar Two with IBM Plex, Tajawal, or other Arabic substitutes.
- Preserve the self-hosted font files in `src/assets/fonts` (Jakarta, Roboto, DM Sans, Abu Dhabi Pro, GE Dinar Two).

| Token | Source | Weights |
| --- | --- | --- |
| `font-abu` | `AbuDhabiPro-Regular.ttf` | 400 |
| `font-dinar` | `ArbFONTS-GE-Dinar-Two-Medium.otf` | 500 (Arabic public pages) |
| `font-jakarta` | `plus-jakarta-sans-wght.ttf`, SIL Open Font License | 400 through 700 |
| `font-roboto` | `roboto-400.woff2`, SIL Open Font License | 400 |
| `font-dm` | `dm-sans-400.woff2`, SIL Open Font License | 400 |
| `font-georgia` | Georgia, then Times New Roman | 400 |
| `font-freeserif` | FreeSerif, then Times New Roman | 700 for the language-switcher label |

`next/font` registers Abu Dhabi Pro and GE Dinar Two in `src/lib/fonts.js`. When `html` or a subtree has `lang="ar"`, `globals.css` assigns GE Dinar Two to the body and remaps `.font-abu`, `.font-jakarta`, `.font-roboto`, and `.font-dm` so Arabic public pages stay on Dinar without rewriting every utility class. English pages use Abu Dhabi Pro as the display face. Supplied families use `font-display: swap`. The page does not request Google Fonts at runtime.

`next/font` loads only the static Latin files used on the site (`roboto-400.woff2`, `dm-sans-400.woff2`). Unused variable masters were removed. SIL license texts remain in `src/assets/fonts/licenses`.

## Typography and spacing

Homepage sizes stay on the Figma values through arbitrary utilities, including 64px hero type, 50px practice line height, and the 1440px page width. The desktop frame is centered. Below 1440px the sections use the previous 1439, 1200, 1023, and 767 pixel breakpoints.

## Shadows

`shadow-header`, `shadow-card`, `shadow-soft`, `shadow-portrait`, `shadow-cta`, and `shadow-teal` match the previous homepage shadows.

## Components

Shared button class strings live in `src/components/website/buttonStyles.js`. Filled and outline homepage buttons use a fixed 48px border box to match the Figma control height. Filled buttons use a transparent border, zero vertical padding, and a 20px line height. The outline button uses a 2px `#BAA87A` border, a 5px radius, 20px bold type, and a 26px line height. Icons and SVG artwork use native images so their boxes stay exact. Raster artwork is also a native image for the same reason: `next/image` writes inline sizing that fights these fixed crops.

The admin workspace uses the same tokens and fonts. The page background is `cream` (`#f8f6f1`). Panels are white with `line` borders. Primary actions use `teal` (`#3f8377`). New enquiry counts, NEW status badges, locked Super Admin notes, and unsaved-change banners use `warning`. READ status badges use `info`. ARCHIVED status badges use `muted`. Active status and success toasts use `success`. Delete actions and errors use `danger`. Arabic business hours, address fields, Arabic blog and service titles, Arabic TipTap, and Arabic service textareas use `dir="rtl"`. Sidebar, top bar, cards, account menu, tables, settings form, blog/service/enquiry/account panels, and dialogs are Tailwind utilities in `src/components/admin`. There is no admin stylesheet.

## About Us page

Public About (`/about`, `/ar/about`) follows the approved Figma About Us reference (frame `2120:5882`, 1440×2866):

- Hero: full-width cinematic background (`about-hero-presence.jpg`) with ~2.5px blur, teal readability overlay, and start-side teal gradient; white headline with gold gradient accent; two frosted credential panels with geometric icons.
- Stats: overlapping white rounded container with light-gray inner cells and hairline dividers, straddling the hero/white boundary.
- Founder: two-column layout — rounded navy-framed portrait with name overlay and floating Jordan Bar badge; right column bio, light-gray quote panel, and 2×2 accreditation grid with circular geometric icons (no invented org logos).
- Consultation: full-width navy section, centered teal pill label, white/gold heading, outline + teal actions.

Keep English/Arabic copy exact from `messages.js`. Shared `SiteShell`, header, and footer stay unchanged. Founder portrait asset: `src/assets/images/about-founder.png`.

## Blog article page

Public article pages (`/blogs/[slug]`, `/ar/blogs/[slug]`) use an editorial reading layout:

- Surface: `#f7f9fb` content band with white sidebar panels and subtle borders (`rgba(1,19,32,0.08)`).
- Title: `font-abu` display sizes; metadata and body use `font-jakarta` (remapped to GE Dinar Two under `lang="ar"`).
- Accents: gold `#BBA97A` for category/eyebrow and H1 left border; teal for H2 border and links.
- TipTap article variant: comfortable ~720px measure, heading anchors for TOC, gold-bordered blockquotes when present.
- Related cards reuse the listing `BlogsCard` language. Consultation band matches the About cream CTA pattern.
- Shared Header/Footer/SiteShell remain unchanged.
