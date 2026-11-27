# Karmand Website Revamp — Static Mockup (Round 2)

Interactive static mockup for **PT Karmand Mitra Andalan** (`karmandsby.com`), aligned with `revisi-karmand.md` v2 (26 Nov 2026).

Live preview (GitHub Pages): https://konekkonekko.github.io/karmand-mockup/

## Pages Included

### Public Site (Indonesian only)
- `index.html` — Beranda (Jotun-style 3-slide Hero, 2/3 + 1/3 Tentang Kami with swipeable Company Profile preview, Produk Terlaris, Stats & Partners, 1-row Portofolio)
- `catalog.html` — Daftar Produk (Jotun-style catalog cards with highlights, search, desktop category tabs / mobile category dropdown)
- `product.html` — Detail Produk (gallery, technical specs, prevention exposures, WhatsApp CTA, no Tokopedia/Shopee links, related products)
- `katalog.html` — Unduhan Katalog Digital (5 category catalog rows with PDF download buttons)
- `portfolio.html` & `portfolio-detail.html` — Portofolio statis & studi kasus proyek (3-column spec bar: Klien, Durasi, Nilai Proyek; WhatsApp & Email CTAs)
- `blogs.html` & `blog-detail.html` — Artikel, filter kategori, pencarian, dan newsletter subscription
- `404.html` — Halaman tidak ditemukan

### Admin Panel Mockup (`localStorage`-backed)
- `admin/login.html` — Login demo admin
- `admin/index.html` — Streamlined Admin CMS (`Dashboard`, `About Us`, `Home Content`, `Home Stats`, `Hero Sliders`, `Partners`, `Products` with mouse + touch drag-and-drop reordering, `Portfolios`, `Blog Posts`, `Newsletters`, `Settings` with Facebook/TikTok & 5 category PDFs + Company Profile PDF)

## Brand & Design Tokens (`css/theme.css`)
- **Palette:** 9-step Navy-to-Cyan scale (`#05374E`, `#045D6D`, `#04838D`, `#03A8AC`, `#02CECB`, `#41DAD8`, `#81E7E5`, `#C0F3F2`, `#FFFFFF`) on `#F7FDFD` page canvas.
- **Typography:** Self-hosted `Plus Jakarta Sans` (`assets/fonts/plus-jakarta-sans-latin.woff2`).
- **Assets:** Official logo variants (`assets/logo.png`, `assets/logo-white.png`). Product/project photos, PDFs, office phone, and Facebook/TikTok URLs remain placeholders until client delivery.

## Local Preview

Serve the repository root with any static HTTP server:

```bash
npx serve .
# or
python -m http.server 8080
```
