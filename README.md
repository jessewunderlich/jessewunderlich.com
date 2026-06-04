# jessewunderlich.com

My personal corner of the web — hand-styled, early-web / GeoCities aesthetic. Built with Astro so the shared layout/SEO meta lives in one place, but it ships as static HTML with zero client JS (except the giscus guestbook).

**Live:** <https://www.jesse-wunderlich.com/>

## Stack
- [Astro](https://astro.build) — static output, shared `BaseLayout`
- Hand-authored CSS (`src/styles/global.css`), no UI framework
- Guestbook: [giscus](https://giscus.app) (GitHub Discussions)
- Hosting: Vercel (auto-deploys on push to `main`) · DNS: Cloudflare

## Develop
```sh
npm install
npm run dev      # local dev server
npm run build    # static build -> dist/
npm run preview  # preview the build
```

## Structure
- `src/pages/` — one file per route (index, about, now, projects, uses, links, guestbook)
- `src/layouts/BaseLayout.astro` — head/SEO/OG meta, marquee, header, nav, footer
- `src/styles/global.css` — all styling
- `public/` — favicon, og-image, robots.txt (served as-is)

## License
Code is MIT (see `LICENSE`). Content & personal text © Jesse Wunderlich.
