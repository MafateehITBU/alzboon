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

| Token | Source | Weights |
| --- | --- | --- |
| `font-abu` | `abu-dhabi-pro-regular.otf` and `FontsFree-Net-Abu-Dhabi-Pro-Bold.ttf` | 400 and 700 |
| `font-jakarta` | `plus-jakarta-sans-wght.ttf`, SIL Open Font License | 400 through 700 |
| `font-roboto` | `roboto-400.woff2`, SIL Open Font License | 400 |
| `font-dm` | `dm-sans-400.woff2`, SIL Open Font License | 400 |
| `font-georgia` | Georgia, then Times New Roman | 400 |
| `font-freeserif` | FreeSerif, then Times New Roman | 700 for the Arabic label |

Regular Abu Dhabi Pro is registered at CSS weight 400. Its OS/2 weight class is 500. Bold is registered at 700. All four supplied families use `font-display: swap`. The page does not request Google Fonts.

Both Abu Dhabi Pro files embed the same Tanween notice: website use requires a separate webfont license, and the foundry does not supply a standard webfont license in the file. The notice points to `d.jaser@tanweentype.me` and `www.tanweentype.me`. There is no license file beside either font. The Bold filename, `FontsFree-Net-Abu-Dhabi-Pro-Bold.ttf`, is a redistribution name and is not permission to use it. Neither weight is cleared for production. Leave both files in place for development until a webfont license is purchased and the licensed files replace these copies.

The official Roboto and DM Sans masters contain more than one variation axis. `next/font` loads the static Latin files for the weights the homepage uses. The variable masters and license texts remain in `src/assets/fonts`.

## Typography and spacing

Homepage sizes stay on the Figma values through arbitrary utilities, including 64px hero type, 50px practice line height, and the 1440px page width. The desktop frame is centered. Below 1440px the sections use the previous 1439, 1200, 1023, and 767 pixel breakpoints.

## Shadows

`shadow-header`, `shadow-card`, `shadow-soft`, `shadow-portrait`, `shadow-cta`, and `shadow-teal` match the previous homepage shadows.

## Components

Shared button class strings live in `src/components/website/buttonStyles.js`. Filled and outline homepage buttons use a fixed 48px border box to match the Figma control height. Filled buttons use a transparent border, zero vertical padding, and a 20px line height. The outline button uses a 2px `#BAA87A` border, a 5px radius, 20px bold type, and a 26px line height. Icons and SVG artwork use native images so their boxes stay exact. Raster artwork is also a native image for the same reason: `next/image` writes inline sizing that fights these fixed crops.

The admin workspace uses the same tokens and fonts. The page background is `cream` (`#f8f6f1`). Panels are white with `line` borders. Primary actions use `teal` (`#3f8377`). New enquiry counts, NEW status badges, locked Super Admin notes, and unsaved-change banners use `warning`. READ status badges use `info`. ARCHIVED status badges use `muted`. Active status and success toasts use `success`. Delete actions and errors use `danger`. Arabic business hours, address fields, Arabic blog and service titles, Arabic TipTap, and Arabic service textareas use `dir="rtl"`. Sidebar, top bar, cards, account menu, tables, settings form, blog/service/enquiry/account panels, and dialogs are Tailwind utilities in `src/components/admin`. There is no admin stylesheet.
